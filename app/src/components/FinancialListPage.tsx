import { useEffect, useState, useMemo } from "react";
import { Outlet } from "react-router-dom";
import {
  getAllDadosFinanceiros,
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
  const [newRecord, setNewRecord] = useState<DadosFinanceiros>({
    matriculaSistel: 0,
    matriculaAstel: 0,
    ano: new Date().getFullYear(),
    mes: 1,
    valorPago: 0,
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getAllDadosFinanceiros();
        setRecords(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  function validateForm(): string | null {
    if (!newRecord.matriculaSistel || newRecord.matriculaSistel <= 0)
      return "O campo Matrícula Sistel é obrigatório e deve ser maior que zero.";
    if (!newRecord.matriculaAstel || newRecord.matriculaAstel <= 0)
      return "O campo Matrícula Astel é obrigatório e deve ser maior que zero.";
    if (!newRecord.ano || newRecord.ano < 1900)
      return "Informe um ano válido.";
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
      const created = await createDadosFinanceiros(newRecord);
      setRecords((prev) => [...prev, created]);
      alert("Registro criado com sucesso!");
      setNewRecord({
        matriculaSistel: 0,
        matriculaAstel: 0,
        ano: new Date().getFullYear(),
        mes: 1,
        valorPago: 0,
      });
    } catch (err: any) {
      console.error(err);
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
      setRecords((prev) =>
        prev.filter(
          (r) =>
            !(
              r.matriculaSistel === matriculaSistel &&
              r.matriculaAstel === matriculaAstel &&
              r.ano === ano &&
              r.mes === mes
            )
        )
      );
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir registro.");
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

      <div className="toolbar">
        <input
          type="text"
          placeholder="🔍 Buscar por matrícula, ano ou mês..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <label className="import-btn">
          📁 Importar Planilha
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            style={{ display: "none" }}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              if (confirm(`Importar "${file.name}"?`)) {
                try {
                  await importDadosFinanceiros(file);
                  alert("Importação concluída!");
                  window.location.reload();
                } catch {
                  alert("Erro ao importar arquivo.");
                }
              }
            }}
          />
        </label>

        <button
          className="import-btn"
          style={{ background: "#10b981" }}
          onClick={async () => {
            try {
              const res = await fetch(
                "http://localhost:5000/api/DadosFinanceiros/export"
              );
              if (!res.ok) throw new Error("Erro ao exportar dados financeiros.");
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "dados_financeiros.csv";
              a.click();
              a.remove();
            } catch (err) {
              console.error(err);
              alert("Falha ao exportar planilha.");
            }
          }}
        >
          ⬇️ Exportar Planilha
        </button>
      </div>

      <form
        className="finance-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleAdd();
        }}
      >
        <div className="field">
          <label>Matrícula Sistel</label>
          <input
            type="number"
            placeholder="Ex: 12345"
            value={newRecord.matriculaSistel}
            onChange={(e) =>
              setNewRecord({
                ...newRecord,
                matriculaSistel: Number(e.target.value),
              })
            }
          />
        </div>

        <div className="field">
          <label>Matrícula Astel</label>
          <input
            type="number"
            placeholder="Ex: 67890"
            value={newRecord.matriculaAstel}
            onChange={(e) =>
              setNewRecord({
                ...newRecord,
                matriculaAstel: Number(e.target.value),
              })
            }
          />
        </div>

        <div className="field">
          <label>Ano</label>
          <input
            type="number"
            placeholder="Ex: 2025"
            value={newRecord.ano}
            onChange={(e) =>
              setNewRecord({ ...newRecord, ano: Number(e.target.value) })
            }
          />
        </div>

        <div className="field">
          <label>Mês</label>
          <input
            type="number"
            placeholder="1–12"
            value={newRecord.mes ?? ""}
            onChange={(e) =>
              setNewRecord({ ...newRecord, mes: Number(e.target.value) })
            }
          />
        </div>

        <div className="field">
          <label>Valor Pago (R$)</label>
          <input
            type="number"
            step="0.01"
            placeholder="Ex: 250.00"
            value={newRecord.valorPago}
            onChange={(e) =>
              setNewRecord({ ...newRecord, valorPago: Number(e.target.value) })
            }
          />
        </div>

        <button type="submit">+ Adicionar</button>
      </form>

      {filtered.length === 0 ? (
        <p>Nenhum registro encontrado.</p>
      ) : (
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
                <td>{r.mes ?? "-"}</td>
                <td>{r.valorPago?.toFixed(2) ?? "-"}</td>
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
      )}
      <Outlet />
    </div>
  );
}
