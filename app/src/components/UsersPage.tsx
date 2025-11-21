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
  const [matriculaAstel, setMatriculaAstel] = useState("");

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
      matriculaAstel: matriculaAstel ? Number(matriculaAstel) : undefined,
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

  async function handleDelete(matriculaSistel: number) {
    if (!confirm("Deseja realmente excluir este registro?")) return;

    await deleteDadosCadastrais(matriculaSistel);
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

          <input
            type="text"
            placeholder="Matrícula ASTEL"
            value={matriculaAstel}
            onChange={(e) => setMatriculaAstel(e.target.value)}
          />

          <button onClick={resetAndFetch}>Buscar</button>
        </div>
      </div>

      {/* GRID */}
      <div className="form-card" style={{ maxWidth: "1100px", overflowX: "auto" }}>
        <h2>Resultados</h2>

        {loading ? (
          <p>Carregando...</p>
        ) : records.length === 0 ? (
          <p>Nenhum registro encontrado.</p>
        ) : (
          <>
            <table className="dados-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Matrícula Sistel</th>
                  <th>Matrícula Astel</th>
                  <th className="sticky-col sticky-header">Nome</th>
                  <th>CPF</th>
                  <th>RG</th>
                  <th>Endereço</th>
                  <th>Estado Civil</th>
                  <th>Situação</th>
                  <th>Telefone</th>
                  <th>Nome Esposa</th>
                  <th>Valor Benefício</th>
                  <th>Ativo</th>
                  <th>Desconto Folha</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {records.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.matriculaSistel}</td>
                    <td>{u.matriculaAstel}</td>
                    <td className="sticky-col sticky-cell">{u.nome}</td>
                    <td>{u.cpf}</td>
                    <td>{u.rg}</td>
                    <td>{u.endereco}</td>
                    <td>{u.estadoCivil}</td>
                    <td>{u.situacao}</td>
                    <td>{u.telefone}</td>
                    <td>{u.nomeEsposa}</td>
                    <td>{u.valorBeneficio}</td>
                    <td>{u.ativo ? "Sim" : "Não"}</td>
                    <td>{u.descontoFolha ? "Sim" : "Não"}</td>

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
