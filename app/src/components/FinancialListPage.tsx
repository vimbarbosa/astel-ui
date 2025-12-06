import { useEffect, useState } from "react";
import {
  filtrarFinanceiro,
  deleteDadosFinanceiros,
  createDadosFinanceiros,
  getCadastroPorMatriculaAstel,
  exportarFinanceiroCSV,
  exportarFinanceiroExcel
} from "../api/dadosFinanceirosApi";

import type { DadosFinanceirosDTO } from "../api/dadosFinanceirosApi";

export default function FinancialListPage() {
  const [records, setRecords] = useState<DadosFinanceirosDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // Paginação
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filtros
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [matriculaAstel, setMatriculaAstel] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [inadimplente, setInadimplente] = useState("");

  // 🔥 Novos filtros
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");

  // Form de adição de pagamento
  const [anoInsert, setAnoInsert] = useState<number>(0);
  const [mesInsert, setMesInsert] = useState<number>(0);
  const [valorInsert, setValorInsert] = useState<number>(0);

  async function fetch() {
    setLoading(true);

    const result = await filtrarFinanceiro({
      nome: nome || undefined,
      cpf: cpf || undefined,
      matriculaAstel: matriculaAstel ? Number(matriculaAstel) : undefined,

      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
      inadimplente: inadimplente === "" ? undefined : inadimplente === "true",

      // 🔥 NOVOS FILTROS
      cidade: cidade || undefined,
      estado: estado || undefined,
      email: email || undefined,
      telefone: telefone || undefined,

      pageNumber: page,
      pageSize,
    });

    setRecords(result.data);
    setTotalPages(result.totalPages);
    setLoading(false);
  }

  useEffect(() => {
    fetch();
  }, [page]);

  function resetAndFetch() {
    setPage(1);
    fetch();
  }

  // ===============================
  // INSERIR PAGAMENTO
  // ===============================
  async function handleAddPayment() {
    if (!matriculaAstel) {
      alert("Informe a matrícula ASTEL.");
      return;
    }

    try {
      const cadastro = await getCadastroPorMatriculaAstel(Number(matriculaAstel));

      if (!cadastro) {
        alert("Nenhum cadastro encontrado para esta matrícula ASTEL.");
        return;
      }

      await createDadosFinanceiros({
        idDadosCadastrais: cadastro.id,
        ano: anoInsert,
        mes: mesInsert,
        valorPago: valorInsert,
      });

      alert("Pagamento registrado com sucesso!");
      fetch();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        alert(error.response.data.message);
        return;
      }
      alert("Erro ao registrar pagamento.");
      console.error(error);
    }
  }

  // ===============================
  // EXCLUIR REGISTRO
  // ===============================
  async function handleDelete(id: number) {
    if (!confirm("Deseja realmente excluir este lançamento?")) return;

    try {
      await deleteDadosFinanceiros(id);
      fetch();
    } catch (error: any) {
      if (error?.response?.status === 404) {
        alert("Registro já removido.");
        return;
      }
      alert("Erro ao excluir registro.");
      console.error(error);
    }
  }

  const handleExportExcel = async () => {
    try {
        const filtros = {
            dataInicio,
            dataFim,
            nome,
            cpf,
            matriculaAstel,
            inadimplente,
            cidade,
            estado,
            email,
            telefone
        };

        const blob = await exportarFinanceiroExcel(filtros);

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "financeiro_export.xlsx";
        a.click();
        window.URL.revokeObjectURL(url);
      } catch (err) {
          console.error(err);
          alert("Erro ao exportar XLSX");
      }
  };


  async function handleExportCSV() {
        try {
            const blob = await exportarFinanceiroCSV({
                nome: nome || undefined,
                cpf: cpf || undefined,
                matriculaAstel: matriculaAstel ? Number(matriculaAstel) : undefined,
                dataInicio: dataInicio || undefined,
                dataFim: dataFim || undefined,
                inadimplente: inadimplente === "" ? undefined : inadimplente === "true",

                cidade: cidade || undefined,
                estado: estado || undefined,
                email: email || undefined,
                telefone: telefone || undefined,
            });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "financeiro_export.csv";
            a.click();
            window.URL.revokeObjectURL(url);
        } catch {
            alert("Erro ao exportar CSV.");
        }
    }


  // ===============================
  // RENDER
  // ===============================
  if (loading) return <p>Carregando...</p>;

  return (
    <div className="page-container">
      <div className="App">

        {/* =======================================
              SEÇÃO: ADICIONAR PAGAMENTO
        ======================================== */}
        <div className="form-card" style={{ marginBottom: "20px", maxWidth: "1100px" }}>
          <h2>Adicionar Pagamento</h2>

          <div className="finance-form">

            <input
              type="text"
              placeholder="Matrícula ASTEL"
              value={matriculaAstel}
              onChange={(e) => setMatriculaAstel(e.target.value)}
            />

            <input type="number" placeholder="Ano" onChange={(e) => setAnoInsert(Number(e.target.value))} />
            <input type="number" placeholder="Mês" onChange={(e) => setMesInsert(Number(e.target.value))} />
            <input
              type="number"
              placeholder="Valor Pago"
              step="0.01"
              onChange={(e) => setValorInsert(Number(e.target.value))}
            />

            <button className="import-btn" onClick={handleAddPayment}>
              Adicionar
            </button>
          </div>
        </div>

        {/* =======================================
                       FILTROS
        ======================================== */}
        <div className="form-card" style={{ marginBottom: "20px", maxWidth: "1100px" }}>
          <h2>Filtros</h2>

          <div className="finance-form">

            {/* Linha 1 */}
            <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
            <input type="text" placeholder="CPF" value={cpf} onChange={(e) => setCpf(e.target.value)} />
            <input
              type="text"
              placeholder="Matrícula ASTEL"
              value={matriculaAstel}
              onChange={(e) => setMatriculaAstel(e.target.value)}
            />

            {/* Linha 2 */}
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />

            <select value={inadimplente} onChange={(e) => setInadimplente(e.target.value)}>
              <option value="">Todos</option>
              <option value="true">Inadimplente</option>
              <option value="false">Adimplente</option>
            </select>

            {/* 🔥 Novos filtros */}
                        <input type="text" placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
                        <input type="text" placeholder="Estado" value={estado} onChange={(e) => setEstado(e.target.value)} />
                        <input type="text" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input type="text" placeholder="Telefone" value={telefone} onChange={(e) => setTelefone(e.target.value)} />

                        <button onClick={resetAndFetch}>Buscar</button>

                        <button
    onClick={handleExportExcel}
    style={{
        marginLeft: "8px",
        padding: "8px 12px",
        backgroundColor: "#1d6f42",
        color: "white",
        borderRadius: "4px",
        border: "none",
        cursor: "pointer"
    }}
>
    Exportar XLSX
</button>
          </div>
        </div>

        {/* =======================================
                  TABELA DE RESULTADOS
        ======================================== */}
        <div className="form-card" style={{ maxWidth: "1600px", overflowX: "auto" }}>
          <h2>Resultados</h2>

          <table className="dados-table">

            <thead>
              <tr>
                {/* Identificação */}
                <th>ID</th>
                <th>ID Cadastro</th>
                <th>Matrícula Sistel</th>
                <th>Matrícula Astel</th>

                <th className="sticky-col sticky-header">Nome</th>
                <th>CPF</th>
                <th>RG</th>

                {/* Endereço */}
                <th>Logradouro</th>
                <th>Número</th>
                <th>Complemento</th>
                <th>Bairro</th>
                <th>Cidade</th>
                <th>Estado</th>
                <th>Tipo End.</th>
                <th>Correspondência</th>
                <th>CEP</th>

                {/* Contato */}
                <th>Telefone</th>
                <th>Cel/Skype</th>
                <th>Email</th>

                {/* Informações gerais */}
                <th>Situação</th>
                <th>Estado Civil</th>
                <th>Ativo</th>

                {/* Financeiro */}
                <th>Ano</th>
                <th>Mês</th>
                <th>Valor Pago</th>
                <th>Inadimplente?</th>

                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {records.map((r) => (
                <tr key={r.id}>
                  <td>{r.id}</td>
                  <td>{r.idDadosCadastrais}</td>
                  <td>{r.matriculaSistel}</td>
                  <td>{r.matriculaAstel}</td>

                  <td className="sticky-col sticky-cell">{r.nome}</td>
                  <td>{r.cpf}</td>
                  <td>{r.rg}</td>

                  <td>{r.logradouro}</td>
                  <td>{r.numero}</td>
                  <td>{r.complemento}</td>
                  <td>{r.bairro}</td>
                  <td>{r.cidade}</td>
                  <td>{r.estado}</td>
                  <td>{r.tipoEndereco}</td>
                  <td>{r.correspondencia}</td>
                  <td>{r.cep}</td>

                  <td>{r.telefone}</td>
                  <td>{r.celSkype}</td>
                  <td>{r.email}</td>

                  <td>{r.situacao}</td>
                  <td>{r.estadoCivil}</td>
                  <td>{r.ativo ? "Sim" : "Não"}</td>

                  <td>{r.ano}</td>
                  <td>{r.mes}</td>
                  <td>{r.valorPago?.toFixed(2)}</td>

                  <td style={{ color: r.inadimplente ? "red" : "green" }}>
                    {r.inadimplente ? "Sim" : "Não"}
                  </td>

                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(r.id)}>
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

          {/* Paginação */}
          <div className="pagination" style={{ marginTop: "20px" }}>
            <button disabled={page <= 1} onClick={() => setPage(page - 1)}>
              ◀ Anterior
            </button>

            <span>Página {page} de {totalPages}</span>

            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
              Próxima ▶
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
