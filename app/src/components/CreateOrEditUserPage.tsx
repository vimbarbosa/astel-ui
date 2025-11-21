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

        {/* Coluna 1 */}
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

          {/* SELECT DE SITUAÇÃO — CORRIGIDO */}
          <div className="form-group">
            <label>Situação</label>
            <select
              value={watch("situacao") ?? ""}
              onChange={(e) => setValue("situacao", e.target.value)}
              {...register("situacao")}     // 🔥 NÃO É MAIS REQUIRED
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
            <input type="number" step="0.01" {...register("valorBeneficio")} />
          </div>
        </div>

        {/* Coluna 2 */}
        <div className="form-column">

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

          <div className="checkbox-row">
            <label>
              <input type="checkbox" {...register("ativo")} /> Ativo
            </label>
            <label>
              <input type="checkbox" {...register("descontoFolha")} /> Desconto Folha
            </label>
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
