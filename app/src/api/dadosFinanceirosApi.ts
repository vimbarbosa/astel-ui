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
  descontoFolha?: boolean;
  formaPagamento?: string | null;

  situacao?: string | null;
  estadoCivil?: string | null;
  ativo?: boolean;

  inadimplente?: boolean;

  // Campos agregados retornados pela API
  somaValorPago?: number;
  totalRegistros?: number;
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
  formapagamento?: string;

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

  if (params.formapagamento) query.append("formapagamento", params.formapagamento);

  if (params.cidade) query.append("cidade", params.cidade);
  if (params.estado) query.append("estado", params.estado);
  if (params.email) query.append("email", params.email);
  if (params.telefone) query.append("telefone", params.telefone);

  query.append("pageNumber", params.pageNumber?.toString() ?? "1");
  query.append("pageSize", params.pageSize?.toString() ?? "10");

  const response = await http.get(`/DadosFinanceiros/filtrar?${query.toString()}`);

  // somaValorPago e totalRegistros agora vêm dentro do objeto data (primeiro registro ou em qualquer registro)
  let somaValorPago = 0;
  let totalRegistros = Number(response.headers["x-total-count"] ?? 0);
  
  if (response.data && Array.isArray(response.data) && response.data.length > 0) {
    // Procurar os campos somaValorPago e totalRegistros no primeiro registro ou em qualquer registro
    const primeiroRegistro = response.data[0] as any;
    
    if (primeiroRegistro && typeof primeiroRegistro.somaValorPago === 'number') {
      somaValorPago = primeiroRegistro.somaValorPago;
    } else {
      // Tentar encontrar em qualquer registro do array
      const registroComSoma = response.data.find((r: any) => r.somaValorPago != null);
      if (registroComSoma && typeof registroComSoma.somaValorPago === 'number') {
        somaValorPago = registroComSoma.somaValorPago;
      }
    }
    
    if (primeiroRegistro && typeof primeiroRegistro.totalRegistros === 'number') {
      totalRegistros = primeiroRegistro.totalRegistros;
    } else {
      // Tentar encontrar em qualquer registro do array
      const registroComTotal = response.data.find((r: any) => r.totalRegistros != null);
      if (registroComTotal && typeof registroComTotal.totalRegistros === 'number') {
        totalRegistros = registroComTotal.totalRegistros;
      }
    }
  }

  return {
    data: response.data,
    totalCount: totalRegistros,
    totalPages: Number(response.headers["x-total-pages"] ?? 1),
    currentPage: Number(response.headers["x-current-page"] ?? 1),
    pageSize: Number(response.headers["x-page-size"] ?? 10),
    somaValorPago: somaValorPago,
  };
}

/**
 * EXPORTAÇÃO CSV
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

/**
 * Mapeamento de nomes de colunas do frontend (camelCase) para API (PascalCase)
 */
const columnNameMap: Record<string, string> = {
  id: "Id",
  idDadosCadastrais: "IdCadastro",
  matriculaSistel: "MatriculaSistel",
  matriculaAstel: "MatriculaAstel",
  nome: "Nome",
  cpf: "CPF",
  rg: "RG",
  logradouro: "Logradouro",
  numero: "Numero",
  complemento: "Complemento",
  bairro: "Bairro",
  cidade: "Cidade",
  estado: "Estado",
  tipoEndereco: "TipoEndereco",
  correspondencia: "Correspondencia",
  cep: "CEP",
  telefone: "Telefone",
  celSkype: "CelSkype",
  email: "Email",
  formaPagamento: "FormaPagamento",
  descontoFolha: "DescontoFolha",
  situacao: "Situacao",
  estadoCivil: "EstadoCivil",
  ativo: "Ativo",
  ano: "Ano",
  mes: "Mes",
  valorPago: "ValorPago",
  inadimplente: "Inadimplente"
};

/**
 * EXPORTAÇÃO XLSX — COM SUPORTE A COLUNAS SELECIONADAS
 */
export async function exportarFinanceiroExcel(filtros: {
  dataInicio?: string;
  dataFim?: string;
  nome?: string;
  cpf?: string;
  matriculaAstel?: string | number | null;
  inadimplente?: string | boolean;
  formapagamento?: string;
  cidade?: string;
  estado?: string;
  email?: string;
  telefone?: string;

  colunas: string[]; // Nomes das colunas em camelCase (frontend)
}) {
  const params = new URLSearchParams();

  // Adicionar filtros
  if (filtros.dataInicio) params.append("dataInicio", filtros.dataInicio);
  if (filtros.dataFim) params.append("dataFim", filtros.dataFim);
  if (filtros.nome) params.append("nome", filtros.nome);
  if (filtros.cpf) params.append("cpf", filtros.cpf);
  
  if (filtros.matriculaAstel) {
    const matricula = typeof filtros.matriculaAstel === "string" 
      ? Number(filtros.matriculaAstel) 
      : filtros.matriculaAstel;
    if (!isNaN(matricula) && matricula > 0) {
      params.append("matriculaAstel", matricula.toString());
    }
  }

  if (filtros.inadimplente !== undefined && filtros.inadimplente !== null && filtros.inadimplente !== "") {
    const inadimplenteValue = typeof filtros.inadimplente === "boolean" 
      ? filtros.inadimplente 
      : filtros.inadimplente === "true";
    params.append("inadimplente", inadimplenteValue ? "true" : "false");
  }

  if (filtros.formapagamento) params.append("formapagamento", filtros.formapagamento);

  if (filtros.cidade) params.append("cidade", filtros.cidade);
  if (filtros.estado) params.append("estado", filtros.estado);
  if (filtros.email) params.append("email", filtros.email);
  if (filtros.telefone) params.append("telefone", filtros.telefone);

  // Adicionar colunas (convertendo para PascalCase e usando "columns" como nome do parâmetro)
  if (filtros.colunas && filtros.colunas.length > 0) {
    filtros.colunas.forEach(col => {
      const apiColumnName = columnNameMap[col] || col;
      params.append("columns", apiColumnName);
    });
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const url = `${baseUrl}/api/DadosFinanceiros/export/excel/xlsx?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
  });

  if (!response.ok) {
    throw new Error("Falha ao exportar XLSX");
  }

  const blob = await response.blob();
  return blob;
}

/**
 * GERAR MODELO DE IMPORTAÇÃO
 */
export async function gerarModeloImportacao(filtros: {
  dataInicio?: string;
  dataFim?: string;
  nome?: string;
  cpf?: string;
  matriculaAstel?: string | number | null;
  inadimplente?: string | boolean;
  formapagamento?: string;
  cidade?: string;
  estado?: string;
  email?: string;
  telefone?: string;
}) {
  const params = new URLSearchParams();

  // Adicionar filtros
  if (filtros.dataInicio) params.append("dataInicio", filtros.dataInicio);
  if (filtros.dataFim) params.append("dataFim", filtros.dataFim);
  if (filtros.nome) params.append("nome", filtros.nome);
  if (filtros.cpf) params.append("cpf", filtros.cpf);
  
  if (filtros.matriculaAstel) {
    const matricula = typeof filtros.matriculaAstel === "string" 
      ? Number(filtros.matriculaAstel) 
      : filtros.matriculaAstel;
    if (!isNaN(matricula) && matricula > 0) {
      params.append("matriculaAstel", matricula.toString());
    }
  }

  if (filtros.inadimplente !== undefined && filtros.inadimplente !== null && filtros.inadimplente !== "") {
    const inadimplenteValue = typeof filtros.inadimplente === "boolean" 
      ? filtros.inadimplente 
      : filtros.inadimplente === "true";
    params.append("inadimplente", inadimplenteValue ? "true" : "false");
  }

  if (filtros.formapagamento) params.append("formapagamento", filtros.formapagamento);

  if (filtros.cidade) params.append("cidade", filtros.cidade);
  if (filtros.estado) params.append("estado", filtros.estado);
  if (filtros.email) params.append("email", filtros.email);
  if (filtros.telefone) params.append("telefone", filtros.telefone);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const url = `${baseUrl}/api/DadosFinanceiros/gerar-modelo-importacao?${params.toString()}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    }
  });

  if (!response.ok) {
    throw new Error("Falha ao gerar modelo de importação");
  }

  const blob = await response.blob();
  return blob;
}

/**
 * IMPORTAR FINANCEIRO EXCEL
 */
export async function importFinanceiroExcel(file: File): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const response = await fetch(`${baseUrl}/api/Import/importFinanceiroExcel`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Erro ao importar arquivo." }));
    throw new Error(errorData.message || "Erro ao importar arquivo.");
  }

  return await response.json();
}

/**
 * IMPORTAR FINANCEIRO EXCEL USANDO MATRÍCULA SISTEL
 * Usa Matrícula Sistel para buscar IdDadosCadastrais e extrai mês/ano do campo DATA_PAGAMENTO
 */
export async function importSistel(file: File): Promise<{ message: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const response = await fetch(`${baseUrl}/api/Import/importSistel`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: "Erro ao importar arquivo." }));
    throw new Error(errorData.message || "Erro ao importar arquivo.");
  }

  return await response.json();
}

/**
 * Interface para o histórico de pagamentos
 */
export interface HistoricoPagamentoDTO {
  id: number;
  idDadosCadastrais: number;
  ano: number | null;
  mes: number | null;
  valorPago: number | null;
}

/**
 * Buscar histórico de pagamentos por ID do cadastro
 * GET /api/DadosFinanceiros/historico/{idDadosCadastrais}
 */
export async function getHistoricoPagamentoPorUsuario(
  idDadosCadastrais: number
): Promise<HistoricoPagamentoDTO[]> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const response = await fetch(
    `${baseUrl}/api/DadosFinanceiros/historico/${idDadosCadastrais}`,
    {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    }
  );

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("ID de cadastro inválido.");
    }
    throw new Error(`Erro ao buscar histórico: ${response.status}`);
  }

  return await response.json();
}

/**
 * Interface para o histórico de importações
 */
export interface ImportacaoDTO {
  id: number;
  arquivo: string;
  importadoEm: string | null;
}

/**
 * Buscar histórico de importações
 * GET /api/Import/importacoes
 */
export async function getImportacoes(params?: {
  nomeArquivo?: string;
  dataInicio?: string;
  dataFim?: string;
}): Promise<ImportacaoDTO[]> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const queryParams = new URLSearchParams();

  if (params?.nomeArquivo) {
    queryParams.append("nomeArquivo", params.nomeArquivo);
  }
  if (params?.dataInicio) {
    queryParams.append("dataInicio", params.dataInicio);
  }
  if (params?.dataFim) {
    queryParams.append("dataFim", params.dataFim);
  }

  const url = `${baseUrl}/api/Import/importacoes${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar importações: ${response.status}`);
  }

  return await response.json();
}

/**
 * Buscar dados financeiros por cadastro
 * GET /api/DadosFinanceiros/por-cadastro
 * Quando todos os parâmetros são nulos, retorna os últimos 100 registros
 */
export async function getDadosFinanceirosPorCadastro(params?: {
  idDadosCadastrais?: number;
  dataInicio?: string;
  dataFim?: string;
}): Promise<HistoricoPagamentoDTO[]> {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const queryParams = new URLSearchParams();

  if (params?.idDadosCadastrais) {
    queryParams.append("idDadosCadastrais", params.idDadosCadastrais.toString());
  }
  if (params?.dataInicio) {
    queryParams.append("dataInicio", params.dataInicio);
  }
  if (params?.dataFim) {
    queryParams.append("dataFim", params.dataFim);
  }

  const url = `${baseUrl}/api/DadosFinanceiros/por-cadastro${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Parâmetros inválidos.");
    }
    throw new Error(`Erro ao buscar dados financeiros: ${response.status}`);
  }

  return await response.json();
}