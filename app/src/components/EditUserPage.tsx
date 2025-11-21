import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getDadosCadastraisById,
  updateDadosCadastrais,
} from "../api/dadosCadastraisApi";
import type { User } from "../types/User";

export function EditUserPage() {
  const { matricula } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<User>({
    id: 0,
    matriculaSistel: 0,
    matriculaAstel: 0,
    nome: "",
    endereco: "",
    situacao: "",
    valorBeneficio: 0,
    estadoCivil: "",
    telefone: "",
    nomeEsposa: "",
    cpf: "",
    rg: "",
    ativo: false,
    descontoFolha: false,
  });

  async function loadData() {
    setLoading(true);
    const data = await getDadosCadastraisById(Number(matricula));
    setForm(data);
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [matricula]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        value === "true" ? true :
        value === "false" ? false :
        value
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    await updateDadosCadastrais(form.matriculaSistel, form);

    setSaving(false);
    navigate("/usuarios"); // ou a rota da sua lista
  }

  return (
    <div className="App">
      <h1>✏ Editar Usuário</h1>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <form onSubmit={handleSubmit} className="form-card" style={{ maxWidth: "900px" }}>
          <h2>Informações do Usuário</h2>

          <div className="finance-form">

            <input
              type="text"
              name="matriculaSistel"
              value={form.matriculaSistel}
              onChange={handleChange}
              placeholder="Matrícula Sistel"
            />

            <input
              type="text"
              name="matriculaAstel"
              value={form.matriculaAstel}
              onChange={handleChange}
              placeholder="Matrícula Astel"
            />

            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              placeholder="Nome"
            />

            <input
              type="text"
              name="cpf"
              value={form.cpf}
              onChange={handleChange}
              placeholder="CPF"
            />

            <input
              type="text"
              name="rg"
              value={form.rg}
              onChange={handleChange}
              placeholder="RG"
            />

            <input
              type="text"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              placeholder="Telefone"
            />

            <input
              type="text"
              name="endereco"
              value={form.endereco}
              onChange={handleChange}
              placeholder="Endereço"
            />

            <input
              type="text"
              name="estadoCivil"
              value={form.estadoCivil}
              onChange={handleChange}
              placeholder="Estado Civil"
            />

            <input
              type="text"
              name="nomeEsposa"
              value={form.nomeEsposa ?? ""}
              onChange={handleChange}
              placeholder="Nome da Esposa"
            />

            <input
              type="number"
              name="valorBeneficio"
              value={form.valorBeneficio}
              onChange={handleChange}
              placeholder="Valor Benefício"
            />

            <select
              name="situacao"
              value={form.situacao}
              onChange={handleChange}
            >
              <option value="">Situação</option>
              <option value="ATIVO">Ativo</option>
              <option value="FALECIDO">Falecido</option>
              <option value="DESATIVADO">Desativado</option>
            </select>

            <select
              name="ativo"
              value={form.ativo ? "true" : "false"}
              onChange={handleChange}
            >
              <option value="true">Ativo: Sim</option>
              <option value="false">Ativo: Não</option>
            </select>

            <select
              name="descontoFolha"
              value={form.descontoFolha ? "true" : "false"}
              onChange={handleChange}
            >
              <option value="true">Desconto Folha: Sim</option>
              <option value="false">Desconto Folha: Não</option>
            </select>

            <button
              type="submit"
              disabled={saving}
              style={{
                background: "#22c55e",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                marginTop: "15px",
              }}
            >
              {saving ? "Salvando..." : "Salvar Alterações"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/usuarios")}
              style={{
                background: "#6b7280",
                color: "white",
                border: "none",
                padding: "8px 12px",
                borderRadius: "6px",
                cursor: "pointer",
                marginTop: "15px",
              }}
            >
              Voltar
            </button>

          </div>
        </form>
      )}
    </div>
  );
}
