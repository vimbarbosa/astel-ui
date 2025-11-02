import { useEffect, useState, useMemo } from "react";
import { Outlet } from "react-router-dom";
import {
  getPagedDadosFinanceiros,
  createDadosFinanceiros,
  deleteDadosFinanceiros,
  importDadosFinanceiros,
  type DadosFinanceiros,
} from "../api/dadosFinanceirosApi";

export default function FinancialListPage() {
  const [records, setRecords] = useState<DadosFinanceiros[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [newRecord, setNewRecord] = useState<DadosFinanceiros>({
    matriculaSistel: 0,
    matriculaAstel: 0,
    ano: new Date().getFullYear(),
    mes: 1,
    valorPago: 0,
  });

  async function fetchData() {
    setLoading(true);
    try {
      const result = await getPagedDadosFinanceiros(page, pageSize);
      setRecords(result.data);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, [page]);

  function validateForm(): string | null {
    if (!newRecord.matriculaSistel || newRecord.matriculaSistel <= 0)
      return "O campo Matrícula Sistel é obrigatório e deve ser maior que zero.";
    if (!newRecord.matriculaAstel || newRecord.matriculaAstel <= 0)
      return "O campo Matrícula Astel é obrigatório e deve ser maior que zero.";
    if (!newRecord.ano || newRecord.ano < 1900) return "Informe um ano válido.";
    if (!newRecord.mes || newRecord.mes < 1 || newRecord.mes > 12)
      return "O campo Mês deve estar entre 1 e 12.";
    if (newRecord.valorPago <= 0)
      return "O campo Valor Pago é obrigatório e deve ser maior que zero.";
    return null;
  }

  async function handleAdd() {
    const validationMsg = validateForm();
    if (validationMsg) {
      setValidationError(validationMsg);
      return;
    }

    setValidationError(null);
    try {
      await createDadosFinanceiros(newRecord);
      alert("Registro criado com sucesso!");
      fetchData();
    } catch (err: any) {
      setValidationError(err.message);
    }
  }

  async function handleDelete(
    matriculaSistel: number,
    matriculaAstel: number,
    ano: number,
    mes: number
  ) {
    if (!confirm(`Excluir o registro de ${ano}/${mes}?`)) return;

    try {
      await deleteDadosFinanceiros(matriculaSistel, matriculaAstel, ano, mes);
      fetchData();
    } catch {
      alert("Erro ao excluir registro.");
    }
  }

  // 🔹 Importação
  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importDadosFinanceiros(file);
      alert("Importação concluída com sucesso!");
      fetchData();
    } catch (err: any) {
      alert("Erro ao importar: " + err.message);
    }
  }

  // 🔹 Exportação
  function handleExport() {
    try {
      const csv = [
        ["Matrícula Sistel", "Matrícula Astel", "Ano", "Mês", "Valor Pago (R$)"],
        ...records.map((r) => [
          r.matriculaSistel,
          r.matriculaAstel,
          r.ano,
          r.mes,
          r.valorPago.toFixed(2),
        ]),
      ]
        .map((row) => row.join(";"))
        .join("\n");

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "dados_financeiros.csv";
      link.click();
    } catch {
      alert("Erro ao exportar registros.");
    }
  }

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return records;
    return records.filter(
      (r) =>
        r.matriculaSistel.toString().includes(term) ||
        r.matriculaAstel.toString().includes(term) ||
        r.ano.toString().includes(term) ||
        (r.mes?.toString() ?? "").includes(term)
    );
  }, [records, search]);

  if (loading) return <p>Carregando dados financeiros...</p>;
  if (error) return <p style={{ color: "red" }}>Erro: {error}</p>;

  return (
    <div className="App">
      <h1>📊 Dados Financeiros</h1>

      {validationError && (
        <div className="error-box">
          {validationError.split("\n").map((msg, i) => (
            <p key={i}>⚠️ {msg}</p>
          ))}
        </div>
      )}

      {/* 🔹 Toolbar */}
      <div className="toolbar">
        <input
          type="text"
          placeholder="🔍 Buscar por matrícula, ano ou mês..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button onClick={() => setPage(1)}>🔄 Atualizar</button>

        <label className="import-btn">
          📁 Importar
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            style={{ display: "none" }}
            onChange={handleImport}
          />
        </label>

        <button className="export-btn" onClick={handleExport}>
          ⬇️ Exportar
        </button>
      </div>

      {/* 🔹 Tabela */}
      {filtered.length === 0 ? (
        <p>Nenhum registro encontrado.</p>
      ) : (
        <>
          <table className="finance-table">
            <thead>
              <tr>
                <th>Matrícula Sistel</th>
                <th>Matrícula Astel</th>
                <th>Ano</th>
                <th>Mês</th>
                <th>Valor Pago (R$)</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr
                  key={`${r.matriculaSistel}-${r.matriculaAstel}-${r.ano}-${r.mes}`}
                >
                  <td>{r.matriculaSistel}</td>
                  <td>{r.matriculaAstel}</td>
                  <td>{r.ano}</td>
                  <td>{r.mes}</td>
                  <td>{r.valorPago?.toFixed(2)}</td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() =>
                        handleDelete(
                          r.matriculaSistel,
                          r.matriculaAstel,
                          r.ano,
                          r.mes
                        )
                      }
                    >
                      🗑️ Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* 🔹 Paginação */}
          <div className="pagination">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ◀ Página anterior
            </button>
            <span>
              Página {page} de {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima página ▶
            </button>
          </div>
        </>
      )}

      <Outlet />
    </div>
  );
}
