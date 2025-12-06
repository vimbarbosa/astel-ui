import { http } from "./httpClient";

/**
 * Tipagem do DTO retornado pela API
 */
export interface DadosFinanceirosDTO {
  id: number;
  idDadosCadastrais: number;
  ano: number;
  mes: number;
  valorPago: number | null;

  // 🔥 CAMPOS DO CADASTRO
  matriculaSistel?: number | null;
  matriculaAstel?: number | null;
  nome?: string;
  cpf?: string;
  rg?: string;

  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
  tipoEndereco?: string | null;
  correspondencia?: string | null;
  cep?: string | null;

  telefone?: string | null;
  celSkype?: string | null;
  email?: string | null;

  situacao?: string | null;
  estadoCivil?: string | null;
  ativo?: boolean;

  inadimplente?: boolean;
}

/**
 * TRATA ERROS DE VALIDAÇÃO
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
  } catch {}
  throw new Error(msg);
}

/**
 * Criar novo lançamento financeiro
 */
export async function createDadosFinanceiros(payload: {
  idDadosCadastrais: number;
  ano: number;
  mes: number;
  valorPago: number;
}) {
  const res = await fetch("http://localhost:5000/api/DadosFinanceiros", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) await handleValidationErrors(res);
}

/**
 * Excluir
 */
export async function deleteDadosFinanceiros(id: number) {
  await http.delete(`/DadosFinanceiros/${id}`);
}

/**
 * Buscar cadastro pelo número ASTEL
 */
export async function getCadastroPorMatriculaAstel(
  matriculaAstel: number
): Promise<any | null> {
  const response = await http.get("/DadosCadastrais", {
    params: { matriculaAstel },
  });

  return response.data.length > 0 ? response.data[0] : null;
}

/**
 * FILTRO COM PAGINAÇÃO
 */
export async function filtrarFinanceiro(params: {
  nome?: string;
  cpf?: string;
  matriculaAstel?: number;

  dataInicio?: string;
  dataFim?: string;
  inadimplente?: boolean;

  cidade?: string;
  estado?: string;
  email?: string;
  telefone?: string;

  pageNumber?: number;
  pageSize?: number;
}) {
  const query = new URLSearchParams();

  if (params.nome) query.append("nome", params.nome);
  if (params.cpf) query.append("cpf", params.cpf);
  if (params.matriculaAstel) query.append("matriculaAstel", params.matriculaAstel.toString());

  if (params.dataInicio) query.append("dataInicio", params.dataInicio);
  if (params.dataFim) query.append("dataFim", params.dataFim);

  if (params.inadimplente !== undefined)
    query.append("inadimplente", params.inadimplente ? "true" : "false");

  if (params.cidade) query.append("cidade", params.cidade);
  if (params.estado) query.append("estado", params.estado);
  if (params.email) query.append("email", params.email);
  if (params.telefone) query.append("telefone", params.telefone);

  query.append("pageNumber", params.pageNumber?.toString() ?? "1");
  query.append("pageSize", params.pageSize?.toString() ?? "10");

  const response = await http.get(`/DadosFinanceiros/filtrar?${query.toString()}`);

  return {
    data: response.data,
    totalCount: Number(response.headers["x-total-count"] ?? 0),
    totalPages: Number(response.headers["x-total-pages"] ?? 1),
    currentPage: Number(response.headers["x-current-page"] ?? 1),
    pageSize: Number(response.headers["x-page-size"] ?? 10),
  };
}

/**
 * NOVO ENDPOINT — EXPORTAÇÃO CSV (SEM PAGINAÇÃO)
 */
export async function exportarFinanceiroCSV(params: {
  nome?: string;
  cpf?: string;
  matriculaAstel?: number;

  dataInicio?: string;
  dataFim?: string;
  inadimplente?: boolean;

  cidade?: string;
  estado?: string;
  email?: string;
  telefone?: string;
}) {
  const query = new URLSearchParams();

  if (params.nome) query.append("nome", params.nome);
  if (params.cpf) query.append("cpf", params.cpf);
  if (params.matriculaAstel) query.append("matriculaAstel", params.matriculaAstel.toString());

  if (params.dataInicio) query.append("dataInicio", params.dataInicio);
  if (params.dataFim) query.append("dataFim", params.dataFim);

  if (params.inadimplente !== undefined)
    query.append("inadimplente", params.inadimplente ? "true" : "false");

  if (params.cidade) query.append("cidade", params.cidade);
  if (params.estado) query.append("estado", params.estado);
  if (params.email) query.append("email", params.email);
  if (params.telefone) query.append("telefone", params.telefone);

  const url = `${import.meta.env.VITE_API_BASE_URL}/api/DadosFinanceiros/export/csv?${query.toString()}`;

  const res = await fetch(url);

  if (!res.ok) throw new Error("Erro ao exportar CSV.");

  return await res.blob(); 
}

export async function exportarFinanceiroExcel(filtros: any) {
    const params = new URLSearchParams();

    Object.keys(filtros).forEach(key => {
        const value = filtros[key];
        if (value !== null && value !== undefined && value !== "") {
            params.append(key, value);
        }
    });

    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/DadosFinanceiros/export/excel/xlsx?${params.toString()}`, {
        method: "GET"
    });

    if (!response.ok) {
        throw new Error("Falha ao exportar XLSX");
    }

    const blob = await response.blob();
    return blob;
}

