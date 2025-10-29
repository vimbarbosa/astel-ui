import { useEffect, useState } from "react";
import { getAllDadosCadastrais, getDadosCadastraisById } from "../api/dadosCadastraisApi";
import type { User } from "../types/User";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    getAllDadosCadastrais().then(setUsers);
  }, []);

  const filtered = users.filter((u) => {
    const t = search.toLowerCase().trim();
    if (!t) return true;
    return (
      String(u.matriculaSistel).includes(t) ||
      (u.nome ?? "").toLowerCase().includes(t) ||
      (u.cpf ?? "").toLowerCase().includes(t)
    );
  });

  async function openDetails(matriculaSistel: number) {
    const user = await getDadosCadastraisById(matriculaSistel);
    setSelectedUser(user);
    setShowModal(true);
  }

  return (
    <div className="App">
      <h1>👤 Dados Cadastrais</h1>

      <div className="toolbar">
        <input
          type="text"
          placeholder="🔍 Buscar por nome, CPF ou matrícula..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className="import-btn"
          style={{ background: "#10b981" }}
          onClick={async () => {
            try {
              const res = await fetch("http://localhost:5000/api/DadosFinanceiros/export-cadastrais");
              if (!res.ok) throw new Error("Erro ao exportar dados cadastrais.");
              const blob = await res.blob();
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "dados_cadastrais.csv";
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

      {filtered.length === 0 ? (
        <p>Nenhum registro encontrado.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Matrícula Sistel</th>
              <th>Nome</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.matriculaSistel}>
                <td>{u.matriculaSistel}</td>
                <td>{u.nome ?? "-"}</td>
                <td>{u.cpf ?? "-"}</td>
                <td>{u.telefone ?? "-"}</td>
                <td>
                  <button
                    style={{
                      background: "#3b82f6",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                    onClick={() => openDetails(u.matriculaSistel)}
                  >
                    🔍 Ver detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* MODAL DE DETALHES */}
      {showModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>📋 Detalhes do Usuário</h2>
            <table className="details-table">
              <tbody>
                <tr><th>Matrícula Sistel:</th><td>{selectedUser.matriculaSistel}</td></tr>
                <tr><th>Matrícula Astel:</th><td>{selectedUser.matriculaAstel}</td></tr>
                <tr><th>Nome:</th><td>{selectedUser.nome}</td></tr>
                <tr><th>Endereço:</th><td>{selectedUser.endereco ?? "-"}</td></tr>
                <tr><th>Situação:</th><td>{selectedUser.situacao ?? "-"}</td></tr>
                <tr><th>Valor Benefício:</th><td>{selectedUser.valorBeneficio ?? "-"}</td></tr>
                <tr><th>Estado Civil:</th><td>{selectedUser.estadoCivil ?? "-"}</td></tr>
                <tr><th>Telefone:</th><td>{selectedUser.telefone ?? "-"}</td></tr>
                <tr><th>Nome da Esposa:</th><td>{selectedUser.nomeEsposa ?? "-"}</td></tr>
                <tr><th>CPF:</th><td>{selectedUser.cpf ?? "-"}</td></tr>
                <tr><th>RG:</th><td>{selectedUser.rg ?? "-"}</td></tr>
                <tr><th>Ativo:</th><td>{selectedUser.ativo ? "Sim" : "Não"}</td></tr>
                <tr><th>Desconto em Folha:</th><td>{selectedUser.descontoFolha ? "Sim" : "Não"}</td></tr>
              </tbody>
            </table>
            <div className="modal-actions">
              <button onClick={() => setShowModal(false)}>Fechar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
