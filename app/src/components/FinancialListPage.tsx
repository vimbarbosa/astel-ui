import { useEffect, useState } from "react";
import {
  filtrarFinanceiro,
  deleteDadosFinanceiros,
  createDadosFinanceiros,
  getCadastroPorMatriculaAstel,
  type DadosFinanceirosDTO,
} from "../api/dadosFinanceirosApi";

export default function FinancialListPage() {
  const [records, setRecords] = useState<DadosFinanceirosDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Filtros
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [matriculaAstel, setMatriculaAstel] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [inadimplente, setInadimplente] = useState<string>("");

  // Inserção
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
      inadimplente:
        inadimplente === "" ? undefined : inadimplente === "true",
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

  // -------------------------------
  //      ADICIONAR PAGAMENTO
  // -------------------------------
  async function handleAddPayment() {
    try {
      if (!matriculaAstel) {
        alert("Informe a matrícula ASTEL.");
        return;
      }

      const cadastro = await getCadastroPorMatriculaAstel(
        Number(matriculaAstel)
      );

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

      alert("Pagamento adicionado com sucesso!");
      fetch();
    } catch (error: any) {
      // ERRO AMIGÁVEL
      if (error?.response?.status === 409) {
        alert(error.response.data.message);
        return;
      }

      alert("Erro ao cadastrar pagamento.");
      console.error(error);
    }
  }

  // -------------------------------
  //      EXCLUIR REGISTRO
  // -------------------------------
  async function handleDelete(id: number) {
    if (!confirm("Excluir este registro?")) return;

    try {
      await deleteDadosFinanceiros(id);
      fetch();
    } catch (error: any) {
      if (error?.response?.status === 404) {
        alert("Registro não encontrado ou já removido.");
        return;
      }

      alert("Erro ao excluir registro.");
      console.error(error);
    }
  }

  if (loading) return <p>Carregando...</p>;

  return (
    <div className="page-container">
      <div className="App">

        {/* ADICIONAR PAGAMENTO */}
        <div className="form-card" style={{ marginBottom: "20px", maxWidth: "1100px" }}>
          <h2>Adicionar Pagamento</h2>

          <div className="finance-form">
            <input
              type="text"
              placeholder="Matrícula ASTEL"
              value={matriculaAstel}
              onChange={(e) => setMatriculaAstel(e.target.value)}
            />

            <input
              type="number"
              placeholder="Ano"
              onChange={(e) => setAnoInsert(Number(e.target.value))}
            />

            <input
              type="number"
              placeholder="Mês"
              onChange={(e) => setMesInsert(Number(e.target.value))}
            />

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

        {/* FILTROS */}
        <div className="form-card" style={{ marginBottom: "20px", maxWidth: "1100px" }}>
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

            <input
              type="text"
              placeholder="Matrícula ASTEL"
              value={matriculaAstel}
              onChange={(e) => setMatriculaAstel(e.target.value)}
            />

            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />

            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />

            <select
              value={inadimplente}
              onChange={(e) => setInadimplente(e.target.value)}
            >
              <option value="">Todos</option>
              <option value="true">Inadimplente</option>
              <option value="false">Adimplente</option>
            </select>

            <button onClick={fetch}>Buscar</button>
          </div>
        </div>

        {/* GRID COMPLETA */}
        <div className="form-card" style={{ maxWidth: "1100px", overflowX: "auto" }}>
          <h2>Resultados</h2>

          <table className="dados-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>ID Dados Cadastrais</th>
                <th>Matrícula Sistel</th>
                <th>Matrícula Astel</th>

                <th className="sticky-col sticky-header">Nome</th>
                <th>CPF</th>
                <th>RG</th>

                <th>Endereço</th>
                <th>Estado Civil</th>
                <th>Situação</th>
                <th>Telefone</th>
                <th>Ativo</th>

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

                  <td>{r.endereco}</td>
                  <td>{r.estadoCivil}</td>
                  <td>{r.situacao}</td>
                  <td>{r.telefone}</td>
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

          {/* PAGINAÇÃO */}
          <div className="pagination" style={{ marginTop: "20px" }}>
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ◀ Anterior
            </button>

            <span>
              Página {page} de {totalPages}
            </span>

            <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Próxima ▶
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
