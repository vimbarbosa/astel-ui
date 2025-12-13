import { useEffect, useState } from "react";
import { filtrarDadosCadastrais, deleteDadosCadastrais } from "../api/dadosCadastraisApi";
import type { User } from "../types/User";
import { useNavigate } from "react-router-dom";

export function UsersPage() {
  const [records, setRecords] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [ativo, setAtivo] = useState("");

  // paginação
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  async function fetch() {
    setLoading(true);

    const res = await filtrarDadosCadastrais({
      nome: nome || undefined,
      cpf: cpf || undefined,
      formapagamento: formaPagamento || undefined,
      ativo: ativo === "" ? undefined : ativo === "true",
      pageNumber: page,
      pageSize,
    });

    setRecords(res.data);
    setTotalPages(res.totalPages);
    setLoading(false);
  }

  useEffect(() => {
    fetch();
  }, [page]);

  function resetAndFetch() {
    setPage(1);
    fetch();
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
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />

          <input
            type="text"
            placeholder="CPF"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
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
                  <th>Situação</th>
                  <th>Estado Civil</th>
                  <th>Nome Esposa</th>
                  <th>Valor Benefício</th>
                  <th>Ativo</th>
                  <th>Forma de Pagamento</th>

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
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ◀ Anterior
              </button>

              <span>Página {page} de {totalPages}</span>

              <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Próxima ▶
              </button>
            </div>

          </>
        )}
      </div>
    </div>
  );
}
