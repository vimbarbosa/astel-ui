import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import {
  filtrarDadosCadastrais,
  deleteDadosCadastrais,
  autocompleteDadosCadastrais,
  type AutocompleteItem,
} from "../api/dadosCadastraisApi";
import { exportarFinanceiroExcel } from "../api/dadosFinanceirosApi";
import type { User } from "../types/User";
import { useNavigate } from "react-router-dom";

export function UsersPage() {
  const [records, setRecords] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [ativo, setAtivo] = useState("");

  // Colunas para exportação Excel (dados cadastrais)
  const allColumns = [
    "matriculaSistel",
    "matriculaAstel",
    "nome",
    "cpf",
    "rg",
    "logradouro",
    "numero",
    "complemento",
    "bairro",
    "cep",
    "cidade",
    "estado",
    "tipoEndereco",
    "correspondencia",
    "telefone",
    "celSkype",
    "email",
    "situacao",
    "estadoCivil",
    "nomeEsposa",
    "valorBeneficio",
    "ativo",
    "formaPagamento",
    "tipoVinculo",
  ];

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportColumns, setExportColumns] = useState<string[]>(allColumns);

  const columnDisplayNames: Record<string, string> = {
    matriculaSistel: "Matrícula Sistel",
    matriculaAstel: "Matrícula Astel",
    nome: "Nome",
    cpf: "CPF",
    rg: "RG",
    logradouro: "Logradouro",
    numero: "Número",
    complemento: "Complemento",
    bairro: "Bairro",
    cep: "CEP",
    cidade: "Cidade",
    estado: "Estado",
    tipoEndereco: "Tipo Endereço",
    correspondencia: "Correspondência",
    telefone: "Telefone",
    celSkype: "Cel/Skype",
    email: "Email",
    situacao: "Status",
    estadoCivil: "Estado Civil",
    nomeEsposa: "Nome Esposa",
    valorBeneficio: "Valor Benefício",
    ativo: "Ativo",
    formaPagamento: "Forma de Pagamento",
    tipoVinculo: "Tipo Vínculo",
  };

  // autocomplete nome
  const [sugestoesFiltro, setSugestoesFiltro] = useState<AutocompleteItem[]>([]);
  const [showSuggestionsFiltro, setShowSuggestionsFiltro] = useState(false);
  const autocompleteFiltroRef = useRef<HTMLDivElement | null>(null);
  const [dropdownRect, setDropdownRect] = useState<{ top: number; left: number; width: number } | null>(null);

  // paginação
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const navigate = useNavigate();

  async function fetch() {
    setLoading(true);

    const res = await filtrarDadosCadastrais({
      nome: nome || undefined,
      cidade: cidade || undefined,
      estado: estado || undefined,
      formapagamento: formaPagamento || undefined,
      ativo: ativo === "" ? undefined : ativo === "true",
      pageNumber: page,
      pageSize,
    });

    setRecords(res.data);
    setTotalPages(res.totalPages);
    setTotalCount(res.totalCount ?? 0);
    setLoading(false);
  }

  // posição do dropdown (portal) e atualizar ao rolar/redimensionar
  useEffect(() => {
    if (!showSuggestionsFiltro || !autocompleteFiltroRef.current) {
      setDropdownRect(null);
      return;
    }
    function updateRect() {
      if (autocompleteFiltroRef.current) {
        const rect = autocompleteFiltroRef.current.getBoundingClientRect();
        setDropdownRect({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }
    }
    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [showSuggestionsFiltro, sugestoesFiltro]);

  // fechar autocomplete ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        autocompleteFiltroRef.current &&
        !autocompleteFiltroRef.current.contains(event.target as Node)
      ) {
        const target = event.target as HTMLElement;
        if (!target.closest("[data-autocomplete-dropdown]")) {
          setShowSuggestionsFiltro(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetch();
  }, [page, pageSize]);

  // Quando o pageSize mudar, resetar para a primeira página
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  function resetAndFetch() {
    setPage(1);
    fetch();
  }

  function toggleExportColumn(col: string) {
    setExportColumns((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  }

  function handleSelectAllExport() {
    if (exportColumns.length === allColumns.length) {
      setExportColumns([]);
    } else {
      setExportColumns([...allColumns]);
    }
  }

  function handleOpenExportModal() {
    setExportColumns([...allColumns]);
    setShowExportModal(true);
  }

  const handleConfirmExport = async () => {
    if (exportColumns.length === 0) {
      alert("Selecione pelo menos uma coluna para exportar.");
      return;
    }

    setShowExportModal(false);

    try {
      const filtros = {
        nome,
        cidade,
        estado,
        formapagamento: formaPagamento,
        colunas: exportColumns,
      };

      const blob = await exportarFinanceiroExcel(filtros);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "dados_cadastrais_export.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Erro ao exportar XLSX");
    }
  };

  // busca específica usando nome selecionado no autocomplete
  async function fetchWithNome(nomeToSearch: string) {
    setLoading(true);
    setPage(1);

    const res = await filtrarDadosCadastrais({
      nome: nomeToSearch || undefined,
      cidade: cidade || undefined,
      estado: estado || undefined,
      formapagamento: formaPagamento || undefined,
      ativo: ativo === "" ? undefined : ativo === "true",
      pageNumber: 1,
      pageSize,
    });

    setRecords(res.data);
    setTotalPages(res.totalPages);
    setTotalCount(res.totalCount ?? 0);
    setLoading(false);
  }

  async function handleNomeFiltroChange(value: string) {
    setNome(value);

    if (value.length >= 2) {
      try {
        const results = await autocompleteDadosCadastrais(value, 10);
        setSugestoesFiltro(results);
        setShowSuggestionsFiltro(true);
      } catch (error) {
        console.error("Erro ao buscar autocomplete:", error);
        setSugestoesFiltro([]);
      }
    } else {
      setSugestoesFiltro([]);
      setShowSuggestionsFiltro(false);
    }
  }

  function handleSelectSuggestionFiltro(item: AutocompleteItem) {
    setNome(item.nome);
    setShowSuggestionsFiltro(false);
    fetchWithNome(item.nome);
  }

  async function handleDelete(id: number) {
    if (!confirm("Deseja realmente excluir este registro?")) return;
    await deleteDadosCadastrais(id);
    fetch();
  }

  function handleEdit(id: number) {
    navigate(`/editar/${id}`);
  }

  return (
    <div className="App">
      <h1>👤 Dados Cadastrais</h1>

      {/* FILTROS */}
      <div className="form-card" style={{ maxWidth: "1100px", marginBottom: "20px" }}>
        <h2>Filtros</h2>

        <div className="finance-form">
          <div ref={autocompleteFiltroRef} style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => handleNomeFiltroChange(e.target.value)}
              onFocus={() => {
                if (sugestoesFiltro.length > 0) {
                  setShowSuggestionsFiltro(true);
                }
              }}
              style={{ width: "100%" }}
            />

            {showSuggestionsFiltro &&
              sugestoesFiltro.length > 0 &&
              dropdownRect &&
              createPortal(
                <div
                  data-autocomplete-dropdown
                  style={{
                    position: "fixed",
                    top: dropdownRect.top,
                    left: dropdownRect.left,
                    width: dropdownRect.width,
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 99999,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  }}
                >
                  {sugestoesFiltro.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectSuggestionFiltro(item)}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        borderBottom: "1px solid #eee",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f0f0";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                    >
                      <div style={{ fontWeight: "bold" }}>{item.nome}</div>
                      {item.matriculaAstel && (
                        <div style={{ fontSize: "0.85em", color: "#666" }}>
                          Matrícula: {item.matriculaAstel}
                        </div>
                      )}
                    </div>
                  ))}
                </div>,
                document.body
              )}
          </div>

          <input
            type="text"
            placeholder="Cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
          />

          <input
            type="text"
            placeholder="Estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
          />

          <select 
            value={formaPagamento} 
            onChange={(e) => setFormaPagamento(e.target.value)}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
          >
            <option value="">Todas as Formas</option>
            <option value="DEPOSITO MENSAL">DEPOSITO MENSAL</option>
            <option value="BOLETO TRIMESTRAL">BOLETO TRIMESTRAL</option>
            <option value="FOLHA SISTEL MENSAL">FOLHA SISTEL MENSAL</option>
          </select>

          <select 
            value={ativo} 
            onChange={(e) => setAtivo(e.target.value)}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
          >
            <option value="">Todos</option>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>

          <button onClick={resetAndFetch}>Buscar</button>

          <button
            onClick={handleOpenExportModal}
            style={{
              padding: "10px 20px",
              backgroundColor: "#1d6f42",
              color: "white",
              borderRadius: "4px",
              border: "none",
              cursor: "pointer",
              fontWeight: "500",
              fontSize: "14px",
            }}
          >
            Exportar XLSX
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="form-card" style={{ maxWidth: "1400px", overflowX: "auto" }}>
        <h2>Resultados</h2>

        {loading ? (
          <p>Carregando...</p>
        ) : records.length === 0 ? (
          <p>Nenhum registro encontrado.</p>
        ) : (
          <>
            <table className="dados-table" style={{ minWidth: "1600px" }}>
              <thead>
                <tr>
                  <th>Matrícula Sistel</th>
                  <th>Matrícula Astel</th>
                  <th className="sticky-col sticky-header">Nome</th>
                  <th>CPF</th>
                  <th>RG</th>

                  {/* CAMPOS DE ENDEREÇO NOVOS */}
                  <th>Logradouro</th>
                  <th>Número</th>
                  <th>Complemento</th>
                  <th>Bairro</th>
                  <th>CEP</th>
                  <th>Cidade</th>
                  <th>Estado</th>
                  <th>Tipo Endereço</th>
                  <th>Correspondência</th>

                  {/* CONTATO */}
                  <th>Telefone</th>
                  <th>Cel/Skype</th>
                  <th>Email</th>

                  {/* OUTROS */}
                  <th>Status</th>
                  <th>Estado Civil</th>
                  <th>Nome Esposa</th>
                  <th>Valor Benefício</th>
                  <th>Ativo</th>
                  <th>Forma de Pagamento</th>
                  <th>Tipo Vínculo</th>

                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {records.map((u) => (
                  <tr key={u.id}>
                    <td>{u.matriculaSistel}</td>
                    <td>{u.matriculaAstel}</td>

                    <td className="sticky-col sticky-cell">{u.nome}</td>

                    <td>{u.cpf}</td>
                    <td>{u.rg}</td>

                    {/* NOVOS CAMPOS */}
                    <td>{u.logradouro}</td>
                    <td>{u.numero}</td>
                    <td>{u.complemento}</td>
                    <td>{u.bairro}</td>
                    <td>{u.cep}</td>
                    <td>{u.cidade}</td>
                    <td>{u.estado}</td>
                    <td>{u.tipoEndereco}</td>
                    <td>{u.correspondencia}</td>

                    <td>{u.telefone}</td>
                    <td>{u.celSkype}</td>
                    <td>{u.email}</td>

                    <td>{u.situacao}</td>
                    <td>{u.estadoCivil}</td>
                    <td>{u.nomeEsposa}</td>
                    <td>{u.valorBeneficio}</td>
                    <td>{u.ativo ? "Sim" : "Não"}</td>
                    <td>{u.formaPagamento || "-"}</td>
                    <td>{u.tipoVinculo || "-"}</td>

                    <td>
                      <button
                        style={{
                          background: "#3b82f6",
                          color: "white",
                          border: "none",
                          padding: "4px 8px",
                          marginRight: "6px",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleEdit(u.id)}
                      >
                        Editar
                      </button>

                      <button
                        style={{
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          padding: "4px 8px",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                        onClick={() => handleDelete(u.id)}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* PAGINAÇÃO */}
            <div
              className="pagination"
              style={{
                marginTop: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  ◀ Anterior
                </button>

                <span>Página {page} de {totalPages}</span>

                <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Próxima ▶
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 16px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "4px",
                    border: "1px solid #dee2e6",
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: "500", color: "#666" }}>
                    Total de Registros:
                  </span>
                  <span style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>
                    {totalCount.toLocaleString("pt-BR")}
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label style={{ fontSize: "14px", fontWeight: "500" }}>
                    Itens por página:
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      fontSize: "14px",
                      cursor: "pointer",
                    }}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                    <option value={1000}>1000</option>
                  </select>
                </div>
              </div>
            </div>

          </>
        )}
      </div>

      {/* Modal de Seleção de Colunas para Exportação */}
      {showExportModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000,
          }}
          onClick={() => setShowExportModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                marginTop: 0,
                marginBottom: "20px",
                fontSize: "20px",
                fontWeight: "600",
              }}
            >
              Selecionar Colunas para Exportação
            </h2>

            <div style={{ marginBottom: "16px" }}>
              <button
                onClick={handleSelectAllExport}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                {exportColumns.length === allColumns.length
                  ? "Desmarcar Todas"
                  : "Selecionar Todas"}
              </button>
              <span style={{ marginLeft: "12px", fontSize: "14px", color: "#666" }}>
                {exportColumns.length} de {allColumns.length} colunas selecionadas
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "12px",
                marginBottom: "24px",
                maxHeight: "400px",
                overflowY: "auto",
                padding: "8px",
                border: "1px solid #eee",
                borderRadius: "4px",
              }}
            >
              {allColumns.map((col) => (
                <label
                  key={col}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "4px",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <input
                    type="checkbox"
                    checked={exportColumns.includes(col)}
                    onChange={() => toggleExportColumn(col)}
                    style={{ marginRight: "8px", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "14px" }}>
                    {columnDisplayNames[col] || col}
                  </span>
                </label>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => setShowExportModal(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmExport}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#1d6f42",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                }}
              >
                Exportar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
