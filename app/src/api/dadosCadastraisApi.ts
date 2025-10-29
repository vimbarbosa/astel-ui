import { http } from "./httpClient";
import type { User } from "../types/User";

/**
 * Converte campos vazios para null e remove espaços extras
 */
function cleanPayload(payload: User): User {
  return {
    ...payload,
    nome: payload.nome?.trim() || "",
    endereco: payload.endereco?.trim() || "",
    estadoCivil: payload.estadoCivil?.trim() || "",
    telefone: payload.telefone?.trim() || "",
    nomeEsposa: payload.nomeEsposa?.trim() || "",
    cpf: payload.cpf?.trim() || "",
    rg: payload.rg?.trim() || "",
    situacao: payload.situacao ? Number(payload.situacao) : null,
    valorBeneficio: payload.valorBeneficio ? Number(payload.valorBeneficio) : null,
  };
}


/**
 * Trata erros de validação da API (FluentValidation)
 */
async function handleValidationErrors(res: Response) {
  let msg = "Erro ao salvar dados.";
  try {
    const body = await res.json();
    if (body?.errors) {
      msg = Object.values(body.errors).flat().join("\n");
    } else if (body?.message) {
      msg = body.message;
    }
  } catch {
    // fallback
  }
  throw new Error(msg);
}

/**
 * Cria novo registro de Dados Cadastrais
 */
export async function createDadosCadastrais(payload: User): Promise<User> {
  const cleaned = cleanPayload(payload);

  const res = await fetch("http://localhost:5000/api/DadosCadastrais", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleaned),
  });

  if (!res.ok) await handleValidationErrors(res);
  return await res.json();
}

/**
 * Atualiza registro existente
 */
export async function updateDadosCadastrais(matriculaSistel: number, payload: User): Promise<void> {
  const cleaned = cleanPayload(payload);

  const res = await fetch(`http://localhost:5000/api/DadosCadastrais/${matriculaSistel}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cleaned),
  });

  if (!res.ok) await handleValidationErrors(res);
}

/**
 * Outras operações (mantidas)
 */
export async function getAllDadosCadastrais(): Promise<User[]> {
  const { data } = await http.get<User[]>("/DadosCadastrais");
  return data;
}

export async function getDadosCadastraisById(matriculaSistel: number): Promise<User> {
  const { data } = await http.get<User>(`/DadosCadastrais/${matriculaSistel}`);
  return data;
}

export async function deleteDadosCadastrais(matriculaSistel: number): Promise<void> {
  await http.delete(`/DadosCadastrais/${matriculaSistel}`);
}

export async function importDadosCadastrais(file: File): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await http.post("/Import/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
