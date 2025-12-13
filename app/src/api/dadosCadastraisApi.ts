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

    situacao: payload.situacao?.trim() || null,
    valorBeneficio: payload.valorBeneficio ? Number(payload.valorBeneficio) : null,

    // 🔥 NOVOS CAMPOS
    logradouro: payload.logradouro?.trim() || null,
    celSkype: payload.celSkype?.trim() || null,
    estado: payload.estado?.trim() || null,
    cidade: payload.cidade?.trim() || null,
    tipoEndereco: payload.tipoEndereco?.trim() || null,
    correspondencia: payload.correspondencia?.trim() || null,
    numero: payload.numero?.trim() || null,
    complemento: payload.complemento?.trim() || null,
    bairro: payload.bairro?.trim() || null,
    email: payload.email?.trim() || null,
    cep: payload.cep?.trim() || null,
    formaPagamento: payload.formaPagamento?.trim() || null,
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
export async function updateDadosCadastrais(id: number, payload: User) {
  const cleaned = cleanPayload(payload);

  const res = await fetch(`http://localhost:5000/api/DadosCadastrais/${id}`, {
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

export async function getDadosCadastraisById(id: number): Promise<User> {
  const { data } = await http.get<User>(`/DadosCadastrais/${id}`);
  return data;
}

export async function deleteDadosCadastrais(id: number): Promise<void> {
  await http.delete(`/DadosCadastrais/${id}`);
}

export async function importDadosCadastrais(file: File): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await http.post("/Import/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

// 🔎 Novo método — Filtro paginado para Dados Cadastrais
export async function filtrarDadosCadastrais(params: {
  nome?: string;
  cpf?: string;
  matriculaAstel?: number;
  formapagamento?: string;
  ativo?: boolean;
  pageNumber?: number;
  pageSize?: number;
}) {
  const query = new URLSearchParams();

  if (params.nome) query.append("nome", params.nome);
  if (params.cpf) query.append("cpf", params.cpf);
  if (params.matriculaAstel)
    query.append("matriculaAstel", params.matriculaAstel.toString());
  if (params.formapagamento) query.append("formapagamento", params.formapagamento);
  if (params.ativo !== undefined)
    query.append("ativo", params.ativo ? "true" : "false");

  query.append("pageNumber", params.pageNumber?.toString() ?? "1");
  query.append("pageSize", params.pageSize?.toString() ?? "10");

  const response = await http.get(`/DadosCadastrais?${query.toString()}`);

  return {
    data: response.data,
    totalCount: Number(response.headers["x-total-count"] ?? 0),
    totalPages: Number(response.headers["x-total-pages"] ?? 1),
    currentPage: Number(response.headers["x-current-page"] ?? 1),
    pageSize: Number(response.headers["x-page-size"] ?? 10),
  };
}

/**
 * Autocomplete de nomes para busca
 */
export interface AutocompleteItem {
  id: number;
  nome: string;
  matriculaAstel: number | null;
}

export async function autocompleteDadosCadastrais(
  termo: string,
  limit: number = 10
): Promise<AutocompleteItem[]> {
  const query = new URLSearchParams();
  if (termo) query.append("termo", termo);
  if (limit) query.append("limit", limit.toString());

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const response = await fetch(
    `${baseUrl}/api/DadosCadastrais/autocomplete?${query.toString()}`
  );

  if (!response.ok) {
    throw new Error("Erro ao buscar autocomplete");
  }

  return await response.json();
}