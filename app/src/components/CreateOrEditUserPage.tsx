import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";

import {
  createDadosCadastrais,
  getDadosCadastraisById,
  updateDadosCadastrais,
} from "../api/dadosCadastraisApi";

import type { User } from "../types/User";

export function CreateOrEditUserPage() {
  const { id } = useParams();
  const registroId = id ? Number(id) : undefined;

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<User>();

  const [serverErrors, setServerErrors] = useState<string[]>([]);

  useEffect(() => {
    if (registroId) {
      getDadosCadastraisById(registroId).then((data) => {
        reset({
          ...data,
          situacao: data.situacao ?? "",
          dataObto: data.dataObto ? String(data.dataObto).split("T")[0] : "",
          dataInadimplencia: data.dataInadimplencia ? String(data.dataInadimplencia).split("T")[0] : "",
          dataPedidoDesligamento: data.dataPedidoDesligamento ? String(data.dataPedidoDesligamento).split("T")[0] : "",
        });
      });
    }
  }, [registroId, reset]);

  async function onSubmit(data: User) {
    setServerErrors([]);
    data.situacao = data.situacao ?? "";

    try {
      if (registroId) {
        await updateDadosCadastrais(registroId, data);
        alert("Registro atualizado com sucesso!");
      } else {
        await createDadosCadastrais(data);
        alert("Registro criado com sucesso!");
      }

      navigate("/");
    } catch (err: any) {
      const msgs = err.message?.split("\n") ?? ["Erro ao salvar dados."];
      setServerErrors(msgs);
    }
  }

  return (
    <div className="form-card">
      <h2>{registroId ? "Editar Dados Cadastrais" : "Novo Cadastro"}</h2>

      {serverErrors.length > 0 && (
        <div className="error-box">
          {serverErrors.map((e, i) => (
            <p key={i} className="error-text">⚠️ {e}</p>
          ))}
        </div>
      )}

      <form className="form-grid" onSubmit={handleSubmit(onSubmit)}>
        
        {/* =======================
            COLUNA 1
        ======================== */}
        <div className="form-column">

          <div className="form-group">
            <label>Matrícula Sistel *</label>
            <input
              type="number"
              {...register("matriculaSistel", { required: "Campo obrigatório." })}
            />
          </div>

          <div className="form-group">
            <label>Matrícula Astel *</label>
            <input
              type="number"
              {...register("matriculaAstel", { required: "Campo obrigatório." })}
            />
          </div>

          <div className="form-group">
            <label>Nome *</label>
            <input
              type="text"
              {...register("nome", { required: "Campo obrigatório." })}
            />
          </div>

          <div className="form-group">
            <label>Endereço</label>
            <input type="text" {...register("endereco")} />
          </div>

          <div className="form-group">
            <label>Logradouro</label>
            <input type="text" {...register("logradouro")} />
          </div>

          <div className="form-group">
            <label>Número</label>
            <input type="text" {...register("numero")} />
          </div>

          <div className="form-group">
            <label>Complemento</label>
            <input type="text" {...register("complemento")} />
          </div>

          <div className="form-group">
            <label>Bairro</label>
            <input type="text" {...register("bairro")} />
          </div>

          <div className="form-group">
            <label>CEP</label>
            <input type="text" {...register("cep")} />
          </div>

        </div>

        {/* =======================
            COLUNA 2
        ======================== */}
        <div className="form-column">

          <div className="form-group">
            <label>Cidade</label>
            <input type="text" {...register("cidade")} />
          </div>

          <div className="form-group">
            <label>Estado</label>
            <input type="text" {...register("estado")} />
          </div>

          <div className="form-group">
            <label>Tipo Endereço</label>
            <input type="text" {...register("tipoEndereco")} />
          </div>

          <div className="form-group">
            <label>Correspondência</label>
            <input type="text" {...register("correspondencia")} />
          </div>

          <div className="form-group">
            <label>Cel/Skype</label>
            <input type="text" {...register("celSkype")} />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="text" {...register("email")} />
          </div>

          <div className="form-group">
            <label>Estado Civil</label>
            <input type="text" {...register("estadoCivil")} />
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <input type="text" {...register("telefone")} />
          </div>

          <div className="form-group">
            <label>Nome da Esposa</label>
            <input type="text" {...register("nomeEsposa")} />
          </div>

          <div className="form-group">
            <label>CPF</label>
            <input type="text" {...register("cpf")} />
          </div>

          <div className="form-group">
            <label>RG</label>
            <input type="text" {...register("rg")} />
          </div>

          <div className="form-group">
            <label>Status</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="radio"
                  value="ATIVO"
                  checked={(watch("situacao") ?? "") === "ATIVO"}
                  onChange={(e) => setValue("situacao", e.target.value)}
                />
                <span>Ativo</span>
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="radio"
                  value="FALECIDO"
                  checked={(watch("situacao") ?? "") === "FALECIDO"}
                  onChange={(e) => setValue("situacao", e.target.value)}
                />
                <span>Inativo por óbito</span>
                <input
                  type="date"
                  {...register("dataObto")}
                  style={{ maxWidth: "170px" }}
                  disabled={(watch("situacao") ?? "") !== "FALECIDO"}
                />
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="radio"
                  value="INADIMPLENTE"
                  checked={(watch("situacao") ?? "") === "INADIMPLENTE"}
                  onChange={(e) => setValue("situacao", e.target.value)}
                />
                <span>Inativo por inadimplência</span>
                <input
                  type="date"
                  {...register("dataInadimplencia")}
                  style={{ maxWidth: "170px" }}
                  disabled={(watch("situacao") ?? "") !== "INADIMPLENTE"}
                />
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="radio"
                  value="INATIVO"
                  checked={(watch("situacao") ?? "") === "INATIVO"}
                  onChange={(e) => setValue("situacao", e.target.value)}
                />
                <span>Inativo a pedido</span>
                <input
                  type="date"
                  {...register("dataPedidoDesligamento")}
                  style={{ maxWidth: "170px" }}
                  disabled={(watch("situacao") ?? "") !== "INATIVO"}
                />
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Valor Benefício</label>
            <input type="number" step="0.01" {...register("valorBeneficio")} />
          </div>

          <div className="form-group">
            <label>Forma de Pagamento</label>
            <select
              value={watch("formaPagamento") ?? ""}
              onChange={(e) => setValue("formaPagamento", e.target.value)}
              {...register("formaPagamento")}
            >
              <option value="">Selecione</option>
              <option value="DEPOSITO MENSAL">DEPOSITO MENSAL</option>
              <option value="FOLHA SISTEL MENSAL">FOLHA SISTEL MENSAL</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tipo Vínculo</label>
            <select
              value={watch("tipoVinculo") ?? ""}
              onChange={(e) => setValue("tipoVinculo", e.target.value)}
              {...register("tipoVinculo")}
            >
              <option value="">Selecione</option>
              <option value="BENEFICIARIO">BENEFICIARIO</option>
              <option value="PENSIONISTA">PENSIONISTA</option>
              <option value="TITULAR">TITULAR</option>
            </select>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>

            <button type="button" onClick={() => navigate("/")}>
              Voltar
            </button>
          </div>

        </div>
      </form>
    </div>
  );
}
