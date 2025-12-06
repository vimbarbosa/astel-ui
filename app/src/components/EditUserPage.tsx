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

    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cep: "",
    cidade: "",
    estado: "",
    tipoEndereco: "",
    correspondencia: "",
    celSkype: "",
    email: "",
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

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        value === "true"
          ? true
          : value === "false"
          ? false
          : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    await updateDadosCadastrais(form.id, form);

    setSaving(false);
    navigate("/");
  }

  return (
    <div className="App">
      <h1>✏ Editar Usuário</h1>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <form onSubmit={handleSubmit} className="form-card" style={{ maxWidth: "980px" }}>
          <h2>Informações do Usuário</h2>

          <div className="form-grid-2col">

            {/* =======================
                COLUNA 1
            ======================== */}

            <div className="form-group">
              <label>Matrícula Sistel</label>
              <input
                type="number"
                name="matriculaSistel"
                value={form.matriculaSistel}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Matrícula Astel</label>
              <input
                type="number"
                name="matriculaAstel"
                value={form.matriculaAstel}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Nome</label>
              <input
                type="text"
                name="nome"
                value={form.nome}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Endereço</label>
              <input
                type="text"
                name="endereco"
                value={form.endereco ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Logradouro</label>
              <input
                type="text"
                name="logradouro"
                value={form.logradouro ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Número</label>
              <input
                type="text"
                name="numero"
                value={form.numero ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Complemento</label>
              <input
                type="text"
                name="complemento"
                value={form.complemento ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Bairro</label>
              <input
                type="text"
                name="bairro"
                value={form.bairro ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>CEP</label>
              <input
                type="text"
                name="cep"
                value={form.cep ?? ""}
                onChange={handleChange}
              />
            </div>

            {/* =======================
                COLUNA 2
            ======================== */}

            <div className="form-group">
              <label>Cidade</label>
              <input
                type="text"
                name="cidade"
                value={form.cidade ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Estado</label>
              <input
                type="text"
                name="estado"
                value={form.estado ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Tipo Endereço</label>
              <input
                type="text"
                name="tipoEndereco"
                value={form.tipoEndereco ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Correspondência</label>
              <input
                type="text"
                name="correspondencia"
                value={form.correspondencia ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Cel/Skype</label>
              <input
                type="text"
                name="celSkype"
                value={form.celSkype ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="text"
                name="email"
                value={form.email ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Estado Civil</label>
              <input
                type="text"
                name="estadoCivil"
                value={form.estadoCivil ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Telefone</label>
              <input
                type="text"
                name="telefone"
                value={form.telefone ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Nome da Esposa</label>
              <input
                type="text"
                name="nomeEsposa"
                value={form.nomeEsposa ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>CPF</label>
              <input
                type="text"
                name="cpf"
                value={form.cpf ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>RG</label>
              <input
                type="text"
                name="rg"
                value={form.rg ?? ""}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Situação</label>
              <select
                name="situacao"
                value={form.situacao ?? ""}
                onChange={handleChange}
              >
                <option value="">Selecione</option>
                <option value="BENEFICIÁRIO">Beneficiário</option>
                <option value="PENSIONISTA">Pensionista</option>
                <option value="ATIVO">Ativo</option>
                <option value="INADIMPLENTE">Inadimplente</option>
                <option value="FALECIDO">Falecido</option>
                <option value="TITULAR">Titular</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>

            <div className="form-group">
              <label>Valor Benefício</label>
              <input
                type="number"
                step="0.01"
                name="valorBeneficio"
                value={form.valorBeneficio ?? 0}
                onChange={handleChange}
              />
            </div>

            <div className="checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="ativo"
                  checked={form.ativo ?? false}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, ativo: e.target.checked }))
                  }
                />
                Ativo
              </label>

              <label>
                <input
                  type="checkbox"
                  name="descontoFolha"
                  checked={form.descontoFolha ?? false}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, descontoFolha: e.target.checked }))
                  }
                />
                Desconto Folha
              </label>
            </div>

          </div>

          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
            style={{ marginTop: "20px" }}
          >
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="btn-secondary"
            style={{ marginTop: "20px" }}
          >
            Voltar
          </button>

        </form>
      )}
    </div>
  );
}
