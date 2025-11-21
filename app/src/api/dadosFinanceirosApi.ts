import { http } from "./httpClient";

/* ---------------------------------------------------
   DTOs
----------------------------------------------------*/

export interface DadosFinanceirosDTO {
  id: number;
  ano: number;
  mes: number;
  valorPago: number;

  idDadosCadastrais: number;
  matriculaSistel: number | null;
  matriculaAstel: number | null;

  nome: string;
  cpf: string;
  rg: string;
  endereco: string;
  estadoCivil: string;
  telefone: string;
  situacao: string;
  ativo: boolean | null;

  inadimplente: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

/* ---------------------------------------------------
   GET FILTRAR
----------------------------------------------------*/

export async function filtrarFinanceiro(params: {
  dataInicio?: string;
  dataFim?: string;
  nome?: string;
  cpf?: string;
  matriculaAstel?: number;
  inadimplente?: boolean;
  pageNumber?: number;
  pageSize?: number;
}): Promise<PaginatedResult<DadosFinanceirosDTO>> {
  const response = await http.get("/DadosFinanceiros/filtrar", { params });

  return {
    data: response.data,
    totalCount: Number(response.headers["x-total-count"] ?? 0),
    totalPages: Number(response.headers["x-total-pages"] ?? 1),
    page: Number(response.headers["x-page-number"] ?? 1),
    pageSize: Number(response.headers["x-page-size"] ?? 10),
  };
}

/* ---------------------------------------------------
   CRUD
----------------------------------------------------*/

export async function deleteDadosFinanceiros(id: number) {
  await http.delete(`/DadosFinanceiros/${id}`);
}

export async function createDadosFinanceiros(payload: {
  idDadosCadastrais: number;
  ano: number;
  mes: number;
  valorPago: number;
}) {
  return await http.post("/DadosFinanceiros", payload);
}

/* ---------------------------------------------------
   BUSCA CADASTRO POR MATRÍCULA ASTEL
----------------------------------------------------*/

export async function getCadastroPorMatriculaAstel(
  matriculaAstel: number
): Promise<any | null> {
  const response = await http.get("/DadosCadastrais", {
    params: { matriculaAstel },
  });

  return response.data.length > 0 ? response.data[0] : null;
}
