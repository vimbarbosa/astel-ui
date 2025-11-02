import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:5000/api",
});

export interface DadosFinanceiros {
  matriculaSistel: number;
  matriculaAstel: number;
  ano: number;
  mes: number;
  valorPago: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// 🔹 GET - Registros financeiros paginados
export async function getPagedDadosFinanceiros(
  pageNumber = 1,
  pageSize = 10
): Promise<PaginatedResponse<DadosFinanceiros>> {
  const response = await http.get("/DadosFinanceiros", {
    params: { pageNumber, pageSize },
  });

  // Axios normaliza headers para lowercase
  const headers = response.headers;

  const totalCount = Number(headers["x-total-count"] ?? headers["X-Total-Count"] ?? 0);
  const totalPages = Number(headers["x-total-pages"] ?? headers["X-Total-Pages"] ?? 1);
  const currentPage = Number(headers["x-current-page"] ?? headers["X-Current-Page"] ?? pageNumber);
  const size = Number(headers["x-page-size"] ?? headers["X-Page-Size"] ?? pageSize);

  return {
    data: response.data,
    totalCount,
    totalPages,
    currentPage,
    pageSize: size,
  };
}


// 🔹 POST - Criar registro financeiro (com tratamento de erro padronizado)
export async function createDadosFinanceiros(
  payload: DadosFinanceiros
): Promise<DadosFinanceiros> {
  try {
    const { data } = await http.post("/DadosFinanceiros", payload);
    return data;
  } catch (err: any) {
    if (err.response?.data?.errors) {
      const msg = Object.values(err.response.data.errors).flat().join("\n");
      throw new Error(msg);
    }
    throw new Error("Erro ao criar registro financeiro.");
  }
}

// 🔹 DELETE - Excluir registro financeiro
export async function deleteDadosFinanceiros(
  matriculaSistel: number,
  matriculaAstel: number,
  ano: number,
  mes: number
): Promise<void> {
  await http.delete(
    `/DadosFinanceiros/${matriculaSistel}/${matriculaAstel}/${ano}/${mes}`
  );
}

// 🔹 IMPORT - Importar planilha financeira
export async function importDadosFinanceiros(file: File): Promise<void> {
  const formData = new FormData();
  formData.append("file", file);
  await http.post("/Import/importFinanceiro", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}
