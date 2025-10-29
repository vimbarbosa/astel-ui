import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  createDadosCadastrais,
  getDadosCadastraisById,
  updateDadosCadastrais,
} from "../api/dadosCadastraisApi";
import type { User } from "../types/User";

interface Props {
  matriculaSistel?: number;
  onSuccess?: () => void;
}

export function CreateOrEditUserPage({ matriculaSistel, onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<User>();

  const [serverErrors, setServerErrors] = useState<string[]>([]);

  useEffect(() => {
    if (matriculaSistel) {
      getDadosCadastraisById(matriculaSistel).then((data) => reset(data));
    }
  }, [matriculaSistel, reset]);

  async function onSubmit(data: User) {
    setServerErrors([]);
    try {
      if (matriculaSistel) {
        await updateDadosCadastrais(matriculaSistel, data);
        alert("Registro atualizado com sucesso!");
      } else {
        await createDadosCadastrais(data);
        alert("Registro criado com sucesso!");
      }
      reset();
      onSuccess?.();
    } catch (err: any) {
      console.error(err);
      const msgs = err.message?.split("\n") ?? ["Erro ao salvar dados."];
      setServerErrors(msgs);
    }
  }

  return (
    <div className="form-card">
      <h2>{matriculaSistel ? "Editar Dados Cadastrais" : "Novo Cadastro"}</h2>

      {serverErrors.length > 0 && (
        <div className="error-box">
          {serverErrors.map((e, i) => (
            <p key={i} className="error-text">
              ⚠️ {e}
            </p>
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
              {...register("matriculaSistel", {
                required: "O campo Matricula Sistel é obrigatório.",
                min: { value: 1, message: "O valor deve ser maior que zero." },
              })}
              disabled={!!matriculaSistel}
            />
            {errors.matriculaSistel && (
              <p className="error-text">{errors.matriculaSistel.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>Matrícula Astel *</label>
            <input
              type="number"
              {...register("matriculaAstel", {
                required: "O campo Matricula Astel é obrigatório.",
                min: { value: 1, message: "O valor deve ser maior que zero." },
              })}
            />
            {errors.matriculaAstel && (
              <p className="error-text">{errors.matriculaAstel.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>Nome *</label>
            <input
              type="text"
              {...register("nome", {
                required: "O campo Nome é obrigatório.",
                maxLength: { value: 120, message: "Máximo de 120 caracteres." },
              })}
            />
            {errors.nome && (
              <p className="error-text">{errors.nome.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>Endereço</label>
            <input
              type="text"
              {...register("endereco", {
                maxLength: { value: 255, message: "Máximo de 255 caracteres." },
              })}
            />
            {errors.endereco && (
              <p className="error-text">{errors.endereco.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>Situação</label>
            <select {...register("situacao")}>
              <option value="">Selecione</option>
              <option value="1">Titular</option>
              <option value="2">Dependente</option>
            </select>
          </div>

          <div className="form-group">
            <label>Valor Benefício</label>
            <input
              type="number"
              step="0.01"
              {...register("valorBeneficio", {
                min: { value: 0, message: "O valor deve ser positivo." },
              })}
            />
            {errors.valorBeneficio && (
              <p className="error-text">{errors.valorBeneficio.message}</p>
            )}
          </div>
        </div>

        {/* Coluna 2 */}
        <div className="form-column">
          <div className="form-group">
            <label>Estado Civil</label>
            <input
              type="text"
              {...register("estadoCivil", {
                maxLength: { value: 50, message: "Máximo de 50 caracteres." },
              })}
            />
            {errors.estadoCivil && (
              <p className="error-text">{errors.estadoCivil.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <input
              type="text"
              {...register("telefone", {
                maxLength: { value: 20, message: "Máximo de 20 caracteres." },
              })}
            />
            {errors.telefone && (
              <p className="error-text">{errors.telefone.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>Nome da Esposa</label>
            <input
              type="text"
              {...register("nomeEsposa", {
                maxLength: { value: 120, message: "Máximo de 120 caracteres." },
              })}
            />
            {errors.nomeEsposa && (
              <p className="error-text">{errors.nomeEsposa.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>CPF</label>
            <input
              type="text"
              {...register("cpf", {
                maxLength: { value: 14, message: "Máximo de 14 caracteres." },
              })}
            />
            {errors.cpf && (
              <p className="error-text">{errors.cpf.message}</p>
            )}
          </div>

          <div className="form-group">
            <label>RG</label>
            <input
              type="text"
              {...register("rg", {
                maxLength: { value: 20, message: "Máximo de 20 caracteres." },
              })}
            />
            {errors.rg && <p className="error-text">{errors.rg.message}</p>}
          </div>

          <div className="checkbox-row">
            <label>
              <input type="checkbox" {...register("ativo")} /> Ativo
            </label>
            <label>
              <input type="checkbox" {...register("descontoFolha")} /> Desconto
              em folha
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
