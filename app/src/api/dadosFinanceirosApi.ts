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

// 🔹 GET - Todos os registros financeiros
export async function getAllDadosFinanceiros(): Promise<DadosFinanceiros[]> {
  const { data } = await http.get("/DadosFinanceiros");
  return data;
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
