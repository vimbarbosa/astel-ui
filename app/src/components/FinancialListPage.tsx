import { useEffect, useState, useRef } from "react";
import {
  filtrarFinanceiro,
  deleteDadosFinanceiros,
  createDadosFinanceiros,
  updateDadosFinanceiros,
  getCadastroPorMatriculaAstel,
  exportarFinanceiroCSV,
  exportarFinanceiroExcel,
  importSistel,
  getHistoricoPagamentoPorUsuario,
  getImportacoes,
  getDadosFinanceirosPorCadastro,
  type HistoricoPagamentoDTO,
  type ImportacaoDTO
} from "../api/dadosFinanceirosApi";

import { autocompleteDadosCadastrais, type AutocompleteItem } from "../api/dadosCadastraisApi";

import type { DadosFinanceirosDTO } from "../api/dadosFinanceirosApi";

export default function FinancialListPage() {

  // ===============================
  // ESTADOS PRINCIPAIS
  // ===============================
  const [records, setRecords] = useState<DadosFinanceirosDTO[]>([]);
  const [groupedRecords, setGroupedRecords] = useState<Map<number, DadosFinanceirosDTO[]>>(new Map());
  const [loading, setLoading] = useState(true);
  
  // Modal de histórico
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedMatriculaAstel, setSelectedMatriculaAstel] = useState<number | null>(null);
  const [selectedIdDadosCadastrais, setSelectedIdDadosCadastrais] = useState<number | null>(null);
  const [historyRecords, setHistoryRecords] = useState<HistoricoPagamentoDTO[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Modal de edição de pagamento
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HistoricoPagamentoDTO | null>(null);
  const [editAno, setEditAno] = useState<number>(0);
  const [editMes, setEditMes] = useState<number>(0);
  const [editValorPago, setEditValorPago] = useState<number>(0);
  const [editDataPagamento, setEditDataPagamento] = useState<string>("");
  const [editLoading, setEditLoading] = useState(false);

  // Paginação
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [somaValorPago, setSomaValorPago] = useState<number>(0);

  // Filtros
  const [nome, setNome] = useState("");
  const [sugestoesFiltro, setSugestoesFiltro] = useState<AutocompleteItem[]>([]);
  const [showSuggestionsFiltro, setShowSuggestionsFiltro] = useState(false);
  const autocompleteFiltroRef = useRef<HTMLDivElement>(null);
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [inadimplente, setInadimplente] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");

  // Inserção de pagamento
  const [nomeInsert, setNomeInsert] = useState("");
  const [sugestoes, setSugestoes] = useState<AutocompleteItem[]>([]);
  const [cadastroSelecionado, setCadastroSelecionado] = useState<AutocompleteItem | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const [anoInsert, setAnoInsert] = useState<number>(0);
  const [mesInsert, setMesInsert] = useState<number>(0);
  const [valorInsert, setValorInsert] = useState<number>(0);
  const [dataPagamentoInsert, setDataPagamentoInsert] = useState<string>("");

  // Importação em massa
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal de histórico de importações
  const [showImportacoesModal, setShowImportacoesModal] = useState(false);
  const [importacoes, setImportacoes] = useState<ImportacaoDTO[]>([]);
  const [importacoesLoading, setImportacoesLoading] = useState(false);
  const [filtroNomeArquivo, setFiltroNomeArquivo] = useState("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

  // Modal de registro de pagamentos
  const [showRegistroPagamentosModal, setShowRegistroPagamentosModal] = useState(false);
  const [registroPagamentos, setRegistroPagamentos] = useState<HistoricoPagamentoDTO[]>([]);
  const [registroPagamentosLoading, setRegistroPagamentosLoading] = useState(false);
  const [filtroNomeRegistro, setFiltroNomeRegistro] = useState("");
  const [sugestoesRegistro, setSugestoesRegistro] = useState<AutocompleteItem[]>([]);
  const [showSuggestionsRegistro, setShowSuggestionsRegistro] = useState(false);
  const [cadastroSelecionadoRegistro, setCadastroSelecionadoRegistro] = useState<AutocompleteItem | null>(null);
  const autocompleteRegistroRef = useRef<HTMLDivElement>(null);
  const [filtroDataInicioRegistro, setFiltroDataInicioRegistro] = useState("");
  const [filtroDataFimRegistro, setFiltroDataFimRegistro] = useState("");

  // ===============================
  // CHECKBOX PARA COLUNAS
  // ===============================

  const allColumns = [
    "matriculaSistel",
    "matriculaAstel",
    "nome",
    "formaPagamento",
    "cpf",
    "rg",
    "logradouro",
    "numero",
    "complemento",
    "bairro",
    "cidade",
    "estado",
    "tipoEndereco",
    "correspondencia",
    "cep",
    "telefone",
    "celSkype",
    "email",
    "situacao",
    "estadoCivil",
    "ativo",
    "ano",
    "mes",
    "valorPago",
    "data_Pagamento",
    "inadimplente"
  ];

  const [selectedColumns, setSelectedColumns] = useState<string[]>(allColumns);

  // Colunas para exportação Excel
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportColumns, setExportColumns] = useState<string[]>(allColumns);

  // Mapeamento de nomes de colunas para exibição
  const columnDisplayNames: Record<string, string> = {
    matriculaSistel: "Matrícula Sistel",
    matriculaAstel: "Matrícula Astel",
    nome: "Nome",
    cpf: "CPF",
    rg: "RG",
    logradouro: "Logradouro",
    numero: "Número",
    complemento: "Complemento",
    bairro: "Bairro",
    cidade: "Cidade",
    estado: "Estado",
    tipoEndereco: "Tipo Endereço",
    correspondencia: "Correspondência",
    cep: "CEP",
    telefone: "Telefone",
    celSkype: "Cel/Skype",
    email: "Email",
    formaPagamento: "Forma de Pagamento",
    situacao: "Situação",
    estadoCivil: "Estado Civil",
    ativo: "Ativo",
    ano: "Ano",
    mes: "Mês",
    valorPago: "Valor Pago",
    data_Pagamento: "Data Pagamento",
    inadimplente: "Inadimplente"
  };

  function toggleColumn(col: string) {
    setSelectedColumns(prev =>
      prev.includes(col)
        ? prev.filter(c => c !== col)
        : [...prev, col]
    );
  }

  function toggleExportColumn(col: string) {
    setExportColumns(prev =>
      prev.includes(col)
        ? prev.filter(c => c !== col)
        : [...prev, col]
    );
  }

  function handleSelectAllExport() {
    if (exportColumns.length === allColumns.length) {
      setExportColumns([]);
    } else {
      setExportColumns([...allColumns]);
    }
  }

  // ===============================
  // BUSCA
  // ===============================
  async function fetch() {
    setLoading(true);

    const result = await filtrarFinanceiro({
      nome: nome || undefined,

      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
      inadimplente: inadimplente === "" ? undefined : inadimplente === "true",
      formapagamento: formaPagamento || undefined,

      pageNumber: page,
      pageSize,
    });

    setRecords(result.data);
    
    // Agrupar registros por matrícula ASTEL
    const grouped = new Map<number, DadosFinanceirosDTO[]>();
    result.data.forEach((record) => {
      if (record.matriculaAstel) {
        const matricula = record.matriculaAstel;
        if (!grouped.has(matricula)) {
          grouped.set(matricula, []);
        }
        grouped.get(matricula)!.push(record);
      }
    });
    setGroupedRecords(grouped);
    
    setTotalPages(result.totalPages);
    
    // Extrair totalRegistros e somaValorPago do primeiro registro se disponível
    let totalRegistros = result.totalCount || 0;
    let soma = result.somaValorPago || 0;
    
    if (result.data && result.data.length > 0) {
      const primeiroRegistro = result.data[0] as any;
      if (primeiroRegistro && typeof primeiroRegistro.totalRegistros === 'number') {
        totalRegistros = primeiroRegistro.totalRegistros;
      }
      if (primeiroRegistro && typeof primeiroRegistro.somaValorPago === 'number') {
        soma = primeiroRegistro.somaValorPago;
      }
    }
    
    setTotalCount(totalRegistros);
    setSomaValorPago(soma);
    setLoading(false);
  }

  useEffect(() => {
    fetch();
  }, [page, pageSize]);

  // Quando o pageSize mudar, resetar para a primeira página
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  function resetAndFetch() {
    setPage(1);
    fetch();
  }

  // Função auxiliar para buscar com nome específico
  async function fetchWithNome(nomeToSearch: string) {
    setLoading(true);
    setPage(1);

    const result = await filtrarFinanceiro({
      nome: nomeToSearch || undefined,

      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
      inadimplente: inadimplente === "" ? undefined : inadimplente === "true",
      formapagamento: formaPagamento || undefined,

      pageNumber: 1,
      pageSize,
    });

    setRecords(result.data);
    
    // Agrupar registros por matrícula ASTEL
    const grouped = new Map<number, DadosFinanceirosDTO[]>();
    result.data.forEach((record) => {
      if (record.matriculaAstel) {
        const matricula = record.matriculaAstel;
        if (!grouped.has(matricula)) {
          grouped.set(matricula, []);
        }
        grouped.get(matricula)!.push(record);
      }
    });
    setGroupedRecords(grouped);
    
    setTotalPages(result.totalPages);
    
    // Extrair totalRegistros e somaValorPago do primeiro registro se disponível
    let totalRegistros = result.totalCount || 0;
    let soma = result.somaValorPago || 0;
    
    if (result.data && result.data.length > 0) {
      const primeiroRegistro = result.data[0] as any;
      if (primeiroRegistro && typeof primeiroRegistro.totalRegistros === 'number') {
        totalRegistros = primeiroRegistro.totalRegistros;
      }
      if (primeiroRegistro && typeof primeiroRegistro.somaValorPago === 'number') {
        soma = primeiroRegistro.somaValorPago;
      }
    }
    
    setTotalCount(totalRegistros);
    setSomaValorPago(soma);
    setLoading(false);
  }

  // ===============================
  // LIMPAR FILTROS
  // ===============================
  function handleClearFilters() {
    setNome("");
    setSugestoesFiltro([]);
    setShowSuggestionsFiltro(false);
    setDataInicio("");
    setDataFim("");
    setInadimplente("");
    setFormaPagamento("");
    resetAndFetch();
  }

  // ===============================
  // AUTCOMPLETE - ADICIONAR PAGAMENTO
  // ===============================
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (autocompleteFiltroRef.current && !autocompleteFiltroRef.current.contains(event.target as Node)) {
        setShowSuggestionsFiltro(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleNomeChange(value: string) {
    setNomeInsert(value);
    setCadastroSelecionado(null);

    if (value.length >= 2) {
      try {
        const results = await autocompleteDadosCadastrais(value, 10);
        setSugestoes(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Erro ao buscar autocomplete:", error);
        setSugestoes([]);
      }
    } else {
      setSugestoes([]);
      setShowSuggestions(false);
    }
  }

  function handleSelectSuggestion(item: AutocompleteItem) {
    setNomeInsert(item.nome);
    setCadastroSelecionado(item);
    setShowSuggestions(false);
  }

  // ===============================
  // AUTCOMPLETE - FILTROS
  // ===============================
  async function handleNomeFiltroChange(value: string) {
    setNome(value);

    if (value.length >= 2) {
      try {
        const results = await autocompleteDadosCadastrais(value, 10);
        setSugestoesFiltro(results);
        setShowSuggestionsFiltro(true);
      } catch (error) {
        console.error("Erro ao buscar autocomplete:", error);
        setSugestoesFiltro([]);
      }
    } else {
      setSugestoesFiltro([]);
      setShowSuggestionsFiltro(false);
    }
  }

  function handleSelectSuggestionFiltro(item: AutocompleteItem) {
    setNome(item.nome);
    setShowSuggestionsFiltro(false);
    // Executar busca automaticamente com o nome selecionado
    fetchWithNome(item.nome);
  }

  // ===============================
  // INSERIR PAGAMENTO
  // ===============================
  async function handleAddPayment() {
    if (!cadastroSelecionado) {
      alert("Selecione um nome da lista.");
      return;
    }

    if (!anoInsert || !mesInsert || !valorInsert) {
      alert("Preencha todos os campos: Ano, Mês e Valor Pago.");
        return;
      }

    try {
      const payload: {
        idDadosCadastrais: number;
        ano: number;
        mes: number;
        valorPago: number;
        data_Pagamento?: string;
      } = {
        idDadosCadastrais: cadastroSelecionado.id,
        ano: anoInsert,
        mes: mesInsert,
        valorPago: valorInsert,
      };

      // Adicionar data_Pagamento se fornecida
      if (dataPagamentoInsert) {
        // Converter data para formato ISO 8601 (yyyy-MM-ddTHH:mm:ss)
        const data = new Date(dataPagamentoInsert);
        if (!isNaN(data.getTime())) {
          payload.data_Pagamento = data.toISOString();
        }
      }

      await createDadosFinanceiros(payload);

      alert("Pagamento registrado com sucesso!");
      
      // Limpar campos
      setNomeInsert("");
      setCadastroSelecionado(null);
      setAnoInsert(0);
      setMesInsert(0);
      setValorInsert(0);
      setDataPagamentoInsert("");
      
      fetch();
    } catch (error: any) {
      if (error?.response?.status === 409) {
        alert(error.response.data.message);
        return;
      }
      alert("Erro ao registrar pagamento.");
      console.error(error);
    }
  }

  // ===============================
  // IMPORTAR EM MASSA
  // ===============================
  async function handleImportMass() {
    if (!importFile) {
      alert("Selecione um arquivo Excel para importar.");
      return;
    }

    // Validar extensão do arquivo
    const fileName = importFile.name.toLowerCase();
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      alert("Por favor, selecione um arquivo Excel (.xlsx ou .xls).");
      return;
    }

    setImportLoading(true);

    try {
      const result = await importSistel(importFile);
      alert(result.message);
      
      // Limpar arquivo selecionado
      setImportFile(null);
      
      // Resetar o input de arquivo
      const fileInput = document.getElementById("importFileInput") as HTMLInputElement;
      if (fileInput) {
        fileInput.value = "";
      }
      
      // Recarregar dados
      fetch();
    } catch (error: any) {
      alert(error.message || "Erro ao importar arquivo.");
      console.error(error);
    } finally {
      setImportLoading(false);
    }
  }

  // ===============================
  // HISTÓRICO DE IMPORTAÇÕES
  // ===============================
  async function handleOpenImportacoesModal() {
    setShowImportacoesModal(true);
    await handleBuscarImportacoes();
  }

  async function handleBuscarImportacoes() {
    setImportacoesLoading(true);
    setImportacoes([]);

    try {
      const params: {
        nomeArquivo?: string;
        dataInicio?: string;
        dataFim?: string;
      } = {};

      if (filtroNomeArquivo.trim()) {
        params.nomeArquivo = filtroNomeArquivo.trim();
      }
      if (filtroDataInicio) {
        params.dataInicio = filtroDataInicio;
      }
      if (filtroDataFim) {
        params.dataFim = filtroDataFim;
      }

      const result = await getImportacoes(params);
      setImportacoes(result);
    } catch (error: any) {
      console.error("Erro ao buscar importações:", error);
      alert(error.message || "Erro ao buscar histórico de importações.");
    } finally {
      setImportacoesLoading(false);
    }
  }

  function handleLimparFiltrosImportacoes() {
    setFiltroNomeArquivo("");
    setFiltroDataInicio("");
    setFiltroDataFim("");
    handleBuscarImportacoes();
  }

  // ===============================
  // REGISTRO DE PAGAMENTOS
  // ===============================
  async function handleOpenRegistroPagamentosModal() {
    setShowRegistroPagamentosModal(true);
    // Limpar dados ao abrir
    setFiltroNomeRegistro("");
    setCadastroSelecionadoRegistro(null);
    setFiltroDataInicioRegistro("");
    setFiltroDataFimRegistro("");
    
    // Carregar últimos 100 registros ao abrir (sem parâmetros)
    await handleBuscarRegistroPagamentos();
  }

  async function handleNomeRegistroChange(value: string) {
    setFiltroNomeRegistro(value);
    setCadastroSelecionadoRegistro(null);

    if (value.length >= 2) {
      try {
        const results = await autocompleteDadosCadastrais(value, 10);
        setSugestoesRegistro(results);
        setShowSuggestionsRegistro(true);
      } catch (error) {
        console.error("Erro ao buscar autocomplete:", error);
        setSugestoesRegistro([]);
      }
    } else {
      setSugestoesRegistro([]);
      setShowSuggestionsRegistro(false);
    }
  }

  function handleSelectSuggestionRegistro(item: AutocompleteItem) {
    setFiltroNomeRegistro(item.nome);
    setCadastroSelecionadoRegistro(item);
    setShowSuggestionsRegistro(false);
  }

  async function handleBuscarRegistroPagamentos() {
    setRegistroPagamentosLoading(true);
    setRegistroPagamentos([]);

    try {
      const params: {
        idDadosCadastrais?: number;
        dataInicio?: string;
        dataFim?: string;
      } = {};

      // Se houver cadastro selecionado, adicionar ao filtro
      if (cadastroSelecionadoRegistro) {
        params.idDadosCadastrais = cadastroSelecionadoRegistro.id;
      }

      if (filtroDataInicioRegistro) {
        params.dataInicio = filtroDataInicioRegistro;
      }
      if (filtroDataFimRegistro) {
        params.dataFim = filtroDataFimRegistro;
      }

      // Chamar API - se todos os parâmetros forem nulos, retorna últimos 100 registros
      const result = await getDadosFinanceirosPorCadastro(params);
      const resultArray = Array.isArray(result) ? result : [];
      setRegistroPagamentos(resultArray);
    } catch (error: any) {
      console.error("Erro ao buscar registro de pagamentos:", error);
      alert(error.message || "Erro ao buscar registro de pagamentos.");
      setRegistroPagamentos([]);
    } finally {
      setRegistroPagamentosLoading(false);
    }
  }

  async function handleLimparFiltrosRegistroPagamentos() {
    setFiltroNomeRegistro("");
    setCadastroSelecionadoRegistro(null);
    setFiltroDataInicioRegistro("");
    setFiltroDataFimRegistro("");
    // Buscar últimos 100 registros após limpar filtros
    await handleBuscarRegistroPagamentos();
  }

  // ===============================
  // VER HISTÓRICO
  // ===============================
  async function handleViewHistory(matriculaAstel: number) {
    // matriculaAstel é o mesmo que idDadosCadastrais
    if (!matriculaAstel) {
      alert("Matrícula ASTEL não encontrada.");
      return;
    }

    setSelectedMatriculaAstel(matriculaAstel);
    setSelectedIdDadosCadastrais(matriculaAstel);
    setShowHistoryModal(true);
    setHistoryLoading(true);
    setHistoryRecords([]);

    try {
      // Buscar histórico usando o novo endpoint - matriculaAstel = idDadosCadastrais
      const historico = await getHistoricoPagamentoPorUsuario(matriculaAstel);
      // Garantir que o array está definido (mesmo que vazio)
      const historicoArray = Array.isArray(historico) ? historico : [];
      setHistoryRecords(historicoArray);
      setHistoryLoading(false);
    } catch (error: any) {
      console.error("Erro ao buscar histórico:", error);
      alert(error.message || "Erro ao buscar histórico.");
      setHistoryRecords([]);
      setHistoryLoading(false);
    }
  }

  // ===============================
  // EXCLUIR REGISTRO
  // ===============================
  async function handleDelete(id: number) {
    if (!confirm("Deseja realmente excluir este lançamento?")) return;

    try {
      await deleteDadosFinanceiros(id);
      fetch();
    } catch (error: any) {
      if (error?.response?.status === 404) {
        alert("Registro já removido.");
        return;
      }
      alert("Erro ao excluir registro.");
      console.error(error);
    }
  }

  // ===============================
  // EDITAR REGISTRO DO HISTÓRICO
  // ===============================
  function handleOpenEditModal(record: HistoricoPagamentoDTO) {
    setEditingRecord(record);
    setEditAno(record.ano || 0);
    setEditMes(record.mes || 0);
    setEditValorPago(record.valorPago || 0);
    
    // Converter data_Pagamento para formato datetime-local se existir
    if (record.data_Pagamento) {
      const data = new Date(record.data_Pagamento);
      if (!isNaN(data.getTime())) {
        // Formato: YYYY-MM-DDTHH:mm
        const year = data.getFullYear();
        const month = String(data.getMonth() + 1).padStart(2, '0');
        const day = String(data.getDate()).padStart(2, '0');
        const hours = String(data.getHours()).padStart(2, '0');
        const minutes = String(data.getMinutes()).padStart(2, '0');
        setEditDataPagamento(`${year}-${month}-${day}T${hours}:${minutes}`);
      } else {
        setEditDataPagamento("");
      }
    } else {
      setEditDataPagamento("");
    }
    
    setShowEditModal(true);
  }

  async function handleSaveEdit() {
    if (!editingRecord || !selectedIdDadosCadastrais) {
      alert("Erro: registro não encontrado.");
      return;
    }

    if (!editAno || !editMes || !editValorPago) {
      alert("Preencha todos os campos obrigatórios: Ano, Mês e Valor Pago.");
      return;
    }

    // Verificar se ano ou mês foram alterados
    const anoAlterado = editingRecord.ano !== editAno;
    const mesAlterado = editingRecord.mes !== editMes;
    
    if (anoAlterado || mesAlterado) {
      const confirmMsg = anoAlterado && mesAlterado 
        ? `Atenção: Você está alterando o Ano (${editingRecord.ano} → ${editAno}) e o Mês (${editingRecord.mes} → ${editMes}). Isso pode causar problemas se a chave primária for composta. Deseja continuar?`
        : anoAlterado
        ? `Atenção: Você está alterando o Ano (${editingRecord.ano} → ${editAno}). Isso pode causar problemas se a chave primária for composta. Deseja continuar?`
        : `Atenção: Você está alterando o Mês (${editingRecord.mes} → ${editMes}). Isso pode causar problemas se a chave primária for composta. Deseja continuar?`;
      
      if (!confirm(confirmMsg)) {
        return;
      }
    }

    setEditLoading(true);

    try {
      const payload: {
        idDadosCadastrais: number;
        ano: number;
        mes: number;
        valorPago: number;
        data_Pagamento?: string;
      } = {
        idDadosCadastrais: selectedIdDadosCadastrais,
        ano: editAno,
        mes: editMes,
        valorPago: editValorPago,
      };

      // Adicionar data_Pagamento se fornecida
      if (editDataPagamento) {
        const data = new Date(editDataPagamento);
        if (!isNaN(data.getTime())) {
          payload.data_Pagamento = data.toISOString();
        }
      }

      // Construir o ID com os novos valores de ano e mês
      // O ID é uma chave composta: idDadosCadastrais + ano + mês
      // Exemplo: 20000000058420261 = 200000000584 (idDadosCadastrais) + 2026 (ano) + 1 (mês)
      // O mês não precisa de padding (não é 01, é apenas 1)
      const novoId = `${selectedIdDadosCadastrais}${editAno}${editMes}`;
      
      console.log("Atualizando registro:", {
        idOriginal: editingRecord.id,
        novoId: novoId,
        idDadosCadastrais: selectedIdDadosCadastrais,
        ano: editAno,
        mes: editMes,
        payload: payload
      });
      
      await updateDadosFinanceiros(novoId, payload);

      alert("Pagamento atualizado com sucesso!");
      
      // Fechar modal de edição
      setShowEditModal(false);
      setEditingRecord(null);
      
      // Recarregar histórico
      setHistoryLoading(true);
      const historico = await getHistoricoPagamentoPorUsuario(selectedIdDadosCadastrais);
      const historicoArray = Array.isArray(historico) ? historico : [];
      setHistoryRecords(historicoArray);
      
      // Recarregar lista principal
      fetch();
    } catch (error: any) {
      console.error("Erro ao atualizar registro:", error);
      const errorMessage = error.message || "Erro ao atualizar registro.";
      
      // Mensagem mais específica para erro de concorrência
      if (errorMessage.includes("concorrência") || errorMessage.includes("concurrency")) {
        alert("Erro: O registro pode ter sido modificado ou excluído por outro usuário. Por favor, recarregue o histórico e tente novamente.");
      } else {
        alert(errorMessage);
      }
    } finally {
      setEditLoading(false);
      setHistoryLoading(false);
    }
  }

  // ===============================
  // EXCLUIR REGISTRO DO HISTÓRICO
  // ===============================
  async function handleDeleteFromHistory(record: HistoricoPagamentoDTO) {
    if (!confirm("Deseja realmente excluir este lançamento?")) return;

    if (!selectedIdDadosCadastrais) {
      alert("ID de cadastro não encontrado.");
      return;
    }

    // Construir o ID correto: idDadosCadastrais + ano + mês
    // Exemplo: 20000000058420261 = 200000000584 (idDadosCadastrais) + 2026 (ano) + 1 (mês)
    if (!record.ano || !record.mes) {
      alert("Erro: Ano ou mês não encontrado no registro.");
      return;
    }

    const idCorreto = `${record.idDadosCadastrais}${record.ano}${record.mes}`;
    console.log("Excluindo registro:", {
      idOriginal: record.id,
      idCorreto: idCorreto,
      idDadosCadastrais: record.idDadosCadastrais,
      ano: record.ano,
      mes: record.mes
    });

    try {
      await deleteDadosFinanceiros(idCorreto);
      
      // Recarregar histórico após exclusão
      setHistoryLoading(true);
      const historico = await getHistoricoPagamentoPorUsuario(selectedIdDadosCadastrais);
      const historicoArray = Array.isArray(historico) ? historico : [];
      setHistoryRecords(historicoArray);
      
      // Recarregar lista principal
      fetch();
    } catch (error: any) {
      if (error?.response?.status === 404) {
        alert("Registro já removido.");
        // Recarregar histórico mesmo assim
        if (selectedIdDadosCadastrais) {
          try {
            const historico = await getHistoricoPagamentoPorUsuario(selectedIdDadosCadastrais);
            const historicoArray = Array.isArray(historico) ? historico : [];
            setHistoryRecords(historicoArray);
          } catch (e) {
            console.error("Erro ao recarregar histórico:", e);
            setHistoryRecords([]);
          }
        }
      } else {
        alert("Erro ao excluir registro.");
        console.error(error);
      }
    } finally {
      setHistoryLoading(false);
    }
  }

  // ===============================
  // EXPORTAÇÃO XLSX
  // ===============================
  const handleOpenExportModal = () => {
    // Sempre inicializar com todas as colunas disponíveis (incluindo ano, mes e valorPago)
    setExportColumns([...allColumns]);
    setShowExportModal(true);
  };

  // ===============================
  // IMPRESSÃO
  // ===============================
  const handlePrint = () => {
    try {
      // Criar HTML para impressão
      const printWindow = window.open("", "_blank", "width=800,height=600");
      if (!printWindow || printWindow.closed || typeof printWindow.closed === "undefined") {
        // Fallback: usar window.print() diretamente na página atual
        alert("Não foi possível abrir a janela de impressão. Tentando imprimir a página atual...");
        window.print();
        return;
      }

      // Gerar cabeçalho da tabela
      const tableHeaders = `
        <tr>
          <th>Matrícula Sistel</th>
          <th>Matrícula Astel</th>
          <th>Nome</th>
          <th>Forma de Pagamento</th>
          <th>CPF</th>
          <th>RG</th>
          <th>Logradouro</th>
          <th>Número</th>
          <th>Complemento</th>
          <th>Bairro</th>
          <th>Cidade</th>
          <th>Estado</th>
          <th>Tipo End.</th>
          <th>Correspondência</th>
          <th>CEP</th>
          <th>Telefone</th>
          <th>Cel/Skype</th>
          <th>Email</th>
          <th>Situação</th>
          <th>Estado Civil</th>
          <th>Ativo</th>
          <th>Ano</th>
          <th>Mês</th>
          <th>Valor Pago</th>
          <th>Data Pagamento</th>
          <th>Inadimplente?</th>
        </tr>
      `;

      // Gerar linhas da tabela - exibir todos os registros
      const tableRows = records
        .map((record) => {
          const dataPagamento = record.data_Pagamento 
            ? new Date(record.data_Pagamento).toLocaleString("pt-BR")
            : "-";
          
          return `
            <tr>
              <td>${record.matriculaSistel || ""}</td>
              <td>${record.matriculaAstel || ""}</td>
              <td>${record.nome || ""}</td>
              <td>${record.formaPagamento || "-"}</td>
              <td>${record.cpf || ""}</td>
              <td>${record.rg || ""}</td>
              <td>${record.logradouro || ""}</td>
              <td>${record.numero || ""}</td>
              <td>${record.complemento || ""}</td>
              <td>${record.bairro || ""}</td>
              <td>${record.cidade || ""}</td>
              <td>${record.estado || ""}</td>
              <td>${record.tipoEndereco || ""}</td>
              <td>${record.correspondencia || ""}</td>
              <td>${record.cep || ""}</td>
              <td>${record.telefone || ""}</td>
              <td>${record.celSkype || ""}</td>
              <td>${record.email || ""}</td>
              <td>${record.situacao || ""}</td>
              <td>${record.estadoCivil || ""}</td>
              <td>${record.ativo ? "Sim" : "Não"}</td>
              <td>${record.ano ?? "-"}</td>
              <td>${record.mes ?? "-"}</td>
              <td>${record.valorPago != null 
                ? record.valorPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                : "-"}</td>
              <td>${dataPagamento}</td>
              <td>${record.inadimplente ? "Sim" : "Não"}</td>
            </tr>
          `;
        })
        .join("");

      // HTML completo com estilos para impressão
      const printContent = `
        <!DOCTYPE html>
        <html lang="pt-BR">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Relatório Financeiro</title>
            <style>
              @media print {
                @page {
                  margin: 1cm;
                  size: A4 landscape;
                }
                body {
                  margin: 0;
                  padding: 0;
                }
                .no-print {
                  display: none;
                }
              }
              body {
                font-family: Arial, Helvetica, sans-serif;
                font-size: 10px;
                margin: 20px;
                color: #000;
              }
              h1 {
                text-align: center;
                margin-bottom: 20px;
                font-size: 18px;
                color: #000;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
                page-break-inside: auto;
              }
              tr {
                page-break-inside: avoid;
                page-break-after: auto;
              }
              th, td {
                border: 1px solid #ddd;
                padding: 6px;
                text-align: left;
                word-wrap: break-word;
              }
              th {
                background-color: #f2f2f2;
                font-weight: bold;
                font-size: 9px;
                color: #000;
              }
              td {
                font-size: 9px;
                color: #000;
              }
              .footer {
                margin-top: 20px;
                text-align: right;
                font-size: 10px;
              }
              .total {
                font-weight: bold;
                margin-top: 10px;
                font-size: 11px;
              }
            </style>
          </head>
          <body>
            <h1>Relatório Financeiro</h1>
            <div style="margin-bottom: 10px; font-size: 10px;">
              <strong>Data de impressão:</strong> ${new Date().toLocaleString("pt-BR")}
            </div>
            <div style="margin-bottom: 10px; font-size: 10px;">
              <strong>Total de registros:</strong> ${records.length}
            </div>
            <table>
              <thead>
                ${tableHeaders}
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
            <div class="total">
              <strong>Total de Pagamentos:</strong> ${somaValorPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </div>
            <div class="footer">
              Página ${page} de ${totalPages}
            </div>
          </body>
        </html>
      `;

      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Aguardar o carregamento completo antes de imprimir
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          // Fechar a janela após um tempo (alguns navegadores não fecham automaticamente)
          setTimeout(() => {
            if (!printWindow.closed) {
              printWindow.close();
            }
          }, 500);
        }, 100);
      };
      
      // Fallback caso onload não funcione
      setTimeout(() => {
        if (printWindow.document.readyState === "complete") {
          printWindow.focus();
          printWindow.print();
          setTimeout(() => {
            if (!printWindow.closed) {
              printWindow.close();
            }
          }, 500);
        }
      }, 300);
    } catch (error) {
      console.error("Erro ao imprimir:", error);
      alert("Erro ao abrir a janela de impressão. Tentando imprimir a página atual...");
      window.print();
    }
  };

  const handleConfirmExport = async () => {
    if (exportColumns.length === 0) {
      alert("Selecione pelo menos uma coluna para exportar.");
      return;
    }

    setShowExportModal(false);

    try {
      const filtros = {
        dataInicio,
        dataFim,
        nome,
        inadimplente,
        formapagamento: formaPagamento,
        colunas: exportColumns
      };

      const blob = await exportarFinanceiroExcel(filtros);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "financeiro_export.xlsx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Erro ao exportar XLSX");
    }
  };


  // ===============================
  // RENDER
  // ===============================
  if (loading) return <p>Carregando...</p>;

  return (
    <div className="page-container">
      <div className="App">

        {/* =======================================
                  ADICIONAR PAGAMENTO
        ======================================== */}
        <div className="form-card" style={{ marginBottom: "20px", maxWidth: "1100px" }}>
          <h2>Adicionar Pagamento</h2>

          <div className="finance-form" style={{ position: "relative" }}>
            <div ref={autocompleteRef} style={{ position: "relative", width: "100%" }}>
            <input
              type="text"
                placeholder="Nome"
                value={nomeInsert}
                onChange={(e) => handleNomeChange(e.target.value)}
                onFocus={() => {
                  if (sugestoes.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
                style={{ width: "100%" }}
              />
              
              {showSuggestions && sugestoes.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1000,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                  }}
                >
                  {sugestoes.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectSuggestion(item)}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        borderBottom: "1px solid #eee"
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f0f0";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                    >
                      <div style={{ fontWeight: "bold" }}>{item.nome}</div>
                      {item.matriculaAstel && (
                        <div style={{ fontSize: "0.85em", color: "#666" }}>
                          Matrícula: {item.matriculaAstel}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <input 
              type="number" 
              placeholder="Ano" 
              value={anoInsert || ""}
              onChange={(e) => setAnoInsert(Number(e.target.value))} 
            />
            <input 
              type="number" 
              placeholder="Mês" 
              value={mesInsert || ""}
              onChange={(e) => setMesInsert(Number(e.target.value))} 
            />
            <input
              type="number"
              placeholder="Valor Pago"
              step="0.01"
              value={valorInsert || ""}
              onChange={(e) => setValorInsert(Number(e.target.value))}
            />
            <input
              type="datetime-local"
              placeholder="Data Pagamento"
              value={dataPagamentoInsert}
              onChange={(e) => setDataPagamentoInsert(e.target.value)}
            />

            <button className="import-btn" onClick={handleAddPayment}>
              Adicionar
            </button>
          </div>

          {/* Importação em Massa */}
          <div style={{ 
            marginTop: "20px", 
            paddingTop: "20px", 
            borderTop: "1px solid #eee",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#333" }}>
              Importar em Massa
            </h3>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
              {/* Input file oculto */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImportFile(e.target.files[0]);
                  }
                }}
                style={{
                  display: "none"
                }}
                disabled={importLoading}
              />
              
              {/* Botão customizado para escolher arquivo */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={importLoading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: importLoading ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: importLoading ? "not-allowed" : "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}
              >
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ flexShrink: 0 }}
                >
                  <path 
                    d="M8 2L3 7H6V12H10V7H13L8 2Z" 
                    fill="currentColor"
                  />
                  <path 
                    d="M2 13H14V14H2V13Z" 
                    fill="currentColor"
                  />
                </svg>
                Escolher Arquivo
              </button>

              <button
                onClick={handleImportMass}
                disabled={importLoading || !importFile}
                style={{
                  padding: "10px 20px",
                  backgroundColor: importLoading || !importFile ? "#ccc" : "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: importLoading || !importFile ? "not-allowed" : "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  whiteSpace: "nowrap"
                }}
              >
                {importLoading ? "Importando..." : "Importar em Massa"}
              </button>

              <button
                onClick={handleOpenImportacoesModal}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#17a2b8",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  whiteSpace: "nowrap"
                }}
              >
                Histórico de Importações
              </button>

              <button
                onClick={handleOpenRegistroPagamentosModal}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6f42c1",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  whiteSpace: "nowrap"
                }}
              >
                Registro de Pagamentos
              </button>
            </div>
            {importFile && (
              <div style={{ 
                fontSize: "14px", 
                color: "#28a745",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                backgroundColor: "#f0f9f4",
                borderRadius: "4px",
                border: "1px solid #c3e6cb"
              }}>
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 16 16" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    d="M8 0L10.59 2.59L14 0V4H10.59L8 1.41L5.41 4H2V0L5.41 2.59L8 0Z" 
                    fill="#28a745"
                  />
                  <path 
                    d="M2 6H14V16H2V6Z" 
                    fill="#28a745"
                  />
                </svg>
                <span>
                  Arquivo selecionado: <strong>{importFile.name}</strong> 
                  ({(importFile.size / 1024).toFixed(2)} KB)
                </span>
                <button
                  onClick={() => {
                    setImportFile(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  style={{
                    marginLeft: "auto",
                    background: "none",
                    border: "none",
                    color: "#dc3545",
                    cursor: "pointer",
                    fontSize: "18px",
                    padding: "0 4px",
                    lineHeight: "1"
                  }}
                  title="Remover arquivo"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =======================================
                       FILTROS
        ======================================== */}
        <div className="form-card" style={{ marginBottom: "20px", maxWidth: "1400px" }}>
          <h2>Filtros</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Identificação */}
            <div>
              <h3 style={{ marginBottom: "12px", fontSize: "14px", fontWeight: "600", color: "#333" }}>
                Identificação
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
                <div ref={autocompleteFiltroRef} style={{ position: "relative" }}>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "500", color: "#555" }}>
                    Nome
                  </label>
                  <input 
                    type="text" 
                    placeholder="Digite o nome..." 
                    value={nome} 
                    onChange={(e) => handleNomeFiltroChange(e.target.value)}
                    onFocus={() => {
                      if (sugestoesFiltro.length > 0) {
                        setShowSuggestionsFiltro(true);
                      }
                    }}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  />
                  
                  {showSuggestionsFiltro && sugestoesFiltro.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 1000,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        marginTop: "4px"
                      }}
                    >
                      {sugestoesFiltro.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectSuggestionFiltro(item)}
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            borderBottom: "1px solid #eee"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f0f0f0";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "white";
                          }}
                        >
                          <div style={{ fontWeight: "bold" }}>{item.nome}</div>
                          {item.matriculaAstel && (
                            <div style={{ fontSize: "0.85em", color: "#666" }}>
                              Matrícula: {item.matriculaAstel}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Período */}
            <div>
              <h3 style={{ marginBottom: "12px", fontSize: "14px", fontWeight: "600", color: "#333" }}>
                Período
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "500", color: "#555" }}>
                    Período de
                  </label>
                  <input 
                    type="date" 
                    value={dataInicio} 
                    onChange={(e) => setDataInicio(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "500", color: "#555" }}>
                    a
                  </label>
                  <input 
                    type="date" 
                    value={dataFim} 
                    onChange={(e) => setDataFim(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  />
                </div>
              </div>
            </div>

            {/* Status Financeiro */}
            <div>
              <h3 style={{ marginBottom: "12px", fontSize: "14px", fontWeight: "600", color: "#333" }}>
                Status Financeiro
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "500", color: "#555" }}>
                    Situação de Pagamento
                  </label>
                  <select 
                    value={inadimplente} 
                    onChange={(e) => setInadimplente(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  >
              <option value="">Todos</option>
              <option value="true">Inadimplente</option>
              <option value="false">Adimplente</option>
            </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "500", color: "#555" }}>
                    Forma de Pagamento
                  </label>
                  <select 
                    value={formaPagamento} 
                    onChange={(e) => setFormaPagamento(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  >
                    <option value="">Todos</option>
                    <option value="DEPOSITO MENSAL">DEPOSITO MENSAL</option>
                    <option value="FOLHA SISTEL MENSAL">FOLHA SISTEL MENSAL</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ações */}
            <div style={{ display: "flex", gap: "12px", paddingTop: "8px", borderTop: "1px solid #eee" }}>
            <button
                onClick={resetAndFetch}
              style={{
                  padding: "10px 20px",
                  backgroundColor: "#007bff",
                  color: "white",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px"
                }}
              >
                Buscar
              </button>

              <button
                onClick={handleClearFilters}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px"
                }}
              >
                Limpar Filtros
              </button>

              <button
                onClick={handleOpenExportModal}
                style={{
                  padding: "10px 20px",
                backgroundColor: "#1d6f42",
                color: "white",
                borderRadius: "4px",
                border: "none",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px"
              }}
            >
              Exportar XLSX
            </button>

              <button
                onClick={handlePrint}
                type="button"
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  borderRadius: "4px",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  minWidth: "100px",
                  display: "inline-block",
                  verticalAlign: "middle"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#5a6268";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#6c757d";
                }}
              >
                Imprimir
              </button>
            </div>
          </div>
        </div>

        {/* =======================================
                  TABELA DE RESULTADOS
        ======================================== */}
        <div className="form-card" style={{ maxWidth: "1600px", overflowX: "auto" }}>
          <h2>Resultados</h2>

          <table className="dados-table">

            <thead>
              <tr>
                <th>Matrícula Sistel</th>
                <th>Matrícula Astel</th>
                <th className="sticky-col sticky-header">Nome</th>
                <th>Forma de Pagamento</th>
                <th>CPF</th>
                <th>RG</th>
                <th>Logradouro</th>
                <th>Número</th>
                <th>Complemento</th>
                <th>Bairro</th>
                <th>Cidade</th>
                <th>Estado</th>
                <th>Tipo End.</th>
                <th>Correspondência</th>
                <th>CEP</th>
                <th>Telefone</th>
                <th>Cel/Skype</th>
                <th>Email</th>
                <th>Situação</th>
                <th>Estado Civil</th>
                <th>Ativo</th>
                <th>Ano</th>
                <th>Mês</th>
                <th>Valor Pago</th>
                <th>Data Pagamento</th>
                <th>Inadimplente?</th>

                <th>Ações</th>
              </tr>
            </thead>

            <tbody>
              {records.map((record, index) => {
                // Contar quantos registros têm a mesma matrícula ASTEL para o histórico
                const matriculaAstel = record.matriculaAstel;
                const count = matriculaAstel ? (groupedRecords.get(matriculaAstel)?.length || 1) : 1;
                
                return (
                  <tr key={record.id || index}>
                    <td>{record.matriculaSistel}</td>
                    <td>{record.matriculaAstel}</td>
                    <td className="sticky-col sticky-cell">{record.nome}</td>
                    <td>{record.formaPagamento || "-"}</td>
                    <td>{record.cpf}</td>
                    <td>{record.rg}</td>
                    <td>{record.logradouro}</td>
                    <td>{record.numero}</td>
                    <td>{record.complemento}</td>
                    <td>{record.bairro}</td>
                    <td>{record.cidade}</td>
                    <td>{record.estado}</td>
                    <td>{record.tipoEndereco}</td>
                    <td>{record.correspondencia}</td>
                    <td>{record.cep}</td>
                    <td>{record.telefone}</td>
                    <td>{record.celSkype}</td>
                    <td>{record.email}</td>
                    <td>{record.situacao}</td>
                    <td>{record.estadoCivil}</td>
                    <td>{record.ativo ? "Sim" : "Não"}</td>
                    <td>{record.ano ?? "-"}</td>
                    <td>{record.mes ?? "-"}</td>
                    <td>
                      {record.valorPago != null 
                        ? record.valorPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                        : "-"}
                    </td>
                    <td>
                      {record.data_Pagamento 
                        ? new Date(record.data_Pagamento).toLocaleString("pt-BR")
                        : "-"}
                    </td>
                    <td style={{ color: record.inadimplente ? "red" : "green" }}>
                      {record.inadimplente ? "Sim" : "Não"}
                    </td>

                    <td>
                      {matriculaAstel && (
                        <button
                          onClick={() => handleViewHistory(matriculaAstel)}
                          style={{
                            padding: "8px 16px",
                            backgroundColor: "#17a2b8",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: "500"
                          }}
                          title={`Ver histórico (${count} registro${count > 1 ? 's' : ''})`}
                        >
                          Ver Histórico {count > 1 && `(${count})`}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>

          </table>

          {/* Paginação */}
          <div className="pagination" style={{ 
            marginTop: "20px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <button 
                disabled={page <= 1} 
                onClick={() => setPage(page - 1)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: page <= 1 ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: page <= 1 ? "not-allowed" : "pointer",
                  fontSize: "14px"
                }}
              >
                ◀ Anterior
              </button>

              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                Página {page} de {totalPages}
              </span>

              <button 
                disabled={page >= totalPages} 
                onClick={() => setPage(page + 1)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: page >= totalPages ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: page >= totalPages ? "not-allowed" : "pointer",
                  fontSize: "14px"
                }}
              >
                Próxima ▶
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                gap: "8px",
                padding: "8px 16px",
                backgroundColor: "#f8f9fa",
                borderRadius: "4px",
                border: "1px solid #dee2e6"
              }}>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#666" }}>
                  Total de Registros:
                </span>
                <span style={{ fontSize: "16px", fontWeight: "600", color: "#333" }}>
                  {totalCount.toLocaleString("pt-BR")}
                </span>
                <span style={{ fontSize: "14px", fontWeight: "500", color: "#666", marginLeft: "16px" }}>
                  Total de Pagamentos:
                </span>
                <span style={{ fontSize: "16px", fontWeight: "600", color: "#28a745" }}>
                  {somaValorPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500" }}>
                  Itens por página:
                </label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  style={{
                    padding: "6px 12px",
                    borderRadius: "4px",
                    border: "1px solid #ddd",
                    fontSize: "14px",
                    cursor: "pointer"
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={1000}>1000</option>
                </select>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Modal de Seleção de Colunas para Exportação */}
      {showExportModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000
          }}
          onClick={() => setShowExportModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginTop: 0, marginBottom: "20px", fontSize: "20px", fontWeight: "600" }}>
              Selecionar Colunas para Exportação
            </h2>

            <div style={{ marginBottom: "16px" }}>
              <button
                onClick={handleSelectAllExport}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                {exportColumns.length === allColumns.length ? "Desmarcar Todas" : "Selecionar Todas"}
              </button>
              <span style={{ marginLeft: "12px", fontSize: "14px", color: "#666" }}>
                {exportColumns.length} de {allColumns.length} colunas selecionadas
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "12px",
                marginBottom: "24px",
                maxHeight: "400px",
                overflowY: "auto",
                padding: "8px",
                border: "1px solid #eee",
                borderRadius: "4px"
              }}
            >
              {allColumns.map((col) => (
                <label
                  key={col}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "4px",
                    transition: "background-color 0.2s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f5f5f5";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <input
                    type="checkbox"
                    checked={exportColumns.includes(col)}
                    onChange={() => toggleExportColumn(col)}
                    style={{ marginRight: "8px", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "14px" }}>{columnDisplayNames[col] || col}</span>
                </label>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => setShowExportModal(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px"
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmExport}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#1d6f42",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px"
                }}
              >
                Exportar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Histórico */}
      {showHistoryModal && selectedMatriculaAstel && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000
          }}
          onClick={() => setShowHistoryModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              maxWidth: "900px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
                Histórico de Pagamentos {selectedMatriculaAstel && `- Matrícula ASTEL: ${selectedMatriculaAstel}`}
              </h2>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                  padding: "0",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ×
              </button>
            </div>

            {historyLoading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Carregando histórico...</p>
              </div>
            ) : !historyRecords || historyRecords.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Não há pagamentos.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "14px" }}>ID</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "14px" }}>Ano</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "14px" }}>Mês</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "14px" }}>Valor Pago</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "14px" }}>Data Pagamento</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "14px" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
                    {historyRecords.map((record) => {
                      // Construir o ID correto para exibição: idDadosCadastrais + ano + mês
                      const idCorreto = record.ano && record.mes 
                        ? `${record.idDadosCadastrais}${record.ano}${record.mes}`
                        : record.id;
                      
                      return (
                        <tr key={record.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                          <td style={{ padding: "12px", fontSize: "14px" }}>{idCorreto}</td>
                          <td style={{ padding: "12px", fontSize: "14px" }}>{record.ano ?? "-"}</td>
                          <td style={{ padding: "12px", fontSize: "14px" }}>{record.mes ?? "-"}</td>
                          <td style={{ padding: "12px", fontSize: "14px" }}>
                            {record.valorPago != null 
                              ? record.valorPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                              : "R$ 0,00"}
                      </td>
                          <td style={{ padding: "12px", fontSize: "14px" }}>
                            {record.data_Pagamento 
                              ? new Date(record.data_Pagamento).toLocaleString("pt-BR")
                              : "-"}
                          </td>
                          <td style={{ padding: "12px" }}>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                onClick={() => handleOpenEditModal(record)}
                                style={{ 
                                  fontSize: "12px", 
                                  padding: "6px 12px",
                                  backgroundColor: "#007bff",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer"
                                }}
                              >
                                Editar
                              </button>
                              <button
                                className="delete-btn"
                                onClick={() => handleDeleteFromHistory(record)}
                                style={{ fontSize: "12px", padding: "6px 12px" }}
                              >
                                Excluir
                              </button>
                            </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: "#f8f9fa", borderTop: "2px solid #dee2e6", fontWeight: "600" }}>
                      <td style={{ padding: "12px", fontSize: "14px", textAlign: "right" }} colSpan={4}>
                        <strong>Total:</strong>
                      </td>
                      <td style={{ padding: "12px", fontSize: "16px", color: "#28a745" }}>
                        <strong>
                          {historyRecords
                            .reduce((sum, record) => sum + (record.valorPago ?? 0), 0)
                            .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </strong>
                      </td>
                      <td style={{ padding: "12px" }}></td>
                    </tr>
                  </tfoot>
          </table>
              </div>
            )}

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowHistoryModal(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px"
                }}
              >
                Fechar
            </button>
          </div>
          </div>
        </div>
      )}

      {/* Modal de Edição de Pagamento */}
      {showEditModal && editingRecord && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10001
          }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
                Editar Pagamento
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                  padding: "0",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500", color: "#555" }}>
                  Ano *
                </label>
                <input
                  type="number"
                  value={editAno || ""}
                  onChange={(e) => setEditAno(Number(e.target.value))}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500", color: "#555" }}>
                  Mês *
                </label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={editMes || ""}
                  onChange={(e) => setEditMes(Number(e.target.value))}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500", color: "#555" }}>
                  Valor Pago *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editValorPago || ""}
                  onChange={(e) => setEditValorPago(Number(e.target.value))}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500", color: "#555" }}>
                  Data Pagamento
                </label>
                <input
                  type="datetime-local"
                  value={editDataPagamento}
                  onChange={(e) => setEditDataPagamento(e.target.value)}
                  style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                />
              </div>
            </div>

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: editLoading ? "not-allowed" : "pointer",
                  fontWeight: "500",
                  fontSize: "14px",
                  opacity: editLoading ? 0.6 : 1
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={editLoading}
                style={{
                  padding: "10px 20px",
                  backgroundColor: editLoading ? "#ccc" : "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: editLoading ? "not-allowed" : "pointer",
                  fontWeight: "500",
                  fontSize: "14px"
                }}
              >
                {editLoading ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Histórico de Importações */}
      {showImportacoesModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000
          }}
          onClick={() => setShowImportacoesModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              maxWidth: "1000px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
                Histórico de Importações
              </h2>
              <button
                onClick={() => setShowImportacoesModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                  padding: "0",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ×
              </button>
            </div>

            {/* Filtros */}
            <div style={{ 
              marginBottom: "20px", 
              padding: "16px", 
              backgroundColor: "#f8f9fa", 
              borderRadius: "4px",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "500", color: "#555" }}>
                    Nome do Arquivo
                  </label>
                  <input
                    type="text"
                    placeholder="Filtrar por nome..."
                    value={filtroNomeArquivo}
                    onChange={(e) => setFiltroNomeArquivo(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "500", color: "#555" }}>
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={filtroDataInicio}
                    onChange={(e) => setFiltroDataInicio(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "500", color: "#555" }}>
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={filtroDataFim}
                    onChange={(e) => setFiltroDataFim(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleBuscarImportacoes}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "14px"
                  }}
                >
                  Buscar
                </button>
                <button
                  onClick={handleLimparFiltrosImportacoes}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "14px"
                  }}
                >
                  Limpar Filtros
                </button>
              </div>
            </div>

            {/* Tabela de Importações */}
            {importacoesLoading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Carregando importações...</p>
              </div>
            ) : importacoes.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Não há importações.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "14px" }}>ID</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "14px" }}>Arquivo</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "14px" }}>Data de Importação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importacoes.map((importacao) => (
                      <tr key={importacao.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                        <td style={{ padding: "12px", fontSize: "14px" }}>{importacao.id}</td>
                        <td style={{ padding: "12px", fontSize: "14px" }}>{importacao.arquivo}</td>
                        <td style={{ padding: "12px", fontSize: "14px" }}>
                          {importacao.importadoEm 
                            ? new Date(importacao.importadoEm).toLocaleString("pt-BR")
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowImportacoesModal(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px"
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Registro de Pagamentos */}
      {showRegistroPagamentosModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10000
          }}
          onClick={() => setShowRegistroPagamentosModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "24px",
              maxWidth: "1000px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "600" }}>
                Registro de Pagamentos
              </h2>
              <button
                onClick={() => setShowRegistroPagamentosModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                  padding: "0",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                ×
              </button>
            </div>

            {/* Filtros */}
            <div style={{ 
              marginBottom: "20px", 
              padding: "16px", 
              backgroundColor: "#f8f9fa", 
              borderRadius: "4px",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
                <div ref={autocompleteRegistroRef} style={{ position: "relative" }}>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "500", color: "#555" }}>
                    Nome
                  </label>
                  <input
                    type="text"
                    placeholder="Digite o nome..."
                    value={filtroNomeRegistro}
                    onChange={(e) => handleNomeRegistroChange(e.target.value)}
                    onFocus={() => {
                      if (sugestoesRegistro.length > 0) {
                        setShowSuggestionsRegistro(true);
                      }
                    }}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  />
                  
                  {showSuggestionsRegistro && sugestoesRegistro.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        right: 0,
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 1000,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        marginTop: "4px"
                      }}
                    >
                      {sugestoesRegistro.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectSuggestionRegistro(item)}
                          style={{
                            padding: "8px 12px",
                            cursor: "pointer",
                            borderBottom: "1px solid #eee"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f0f0f0";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "white";
                          }}
                        >
                          <div style={{ fontWeight: "bold" }}>{item.nome}</div>
                          {item.matriculaAstel && (
                            <div style={{ fontSize: "0.85em", color: "#666" }}>
                              Matrícula: {item.matriculaAstel}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "500", color: "#555" }}>
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={filtroDataInicioRegistro}
                    onChange={(e) => setFiltroDataInicioRegistro(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", fontWeight: "500", color: "#555" }}>
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={filtroDataFimRegistro}
                    onChange={(e) => setFiltroDataFimRegistro(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ddd" }}
                  />
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  onClick={handleBuscarRegistroPagamentos}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "14px"
                  }}
                >
                  Buscar
                </button>
                <button
                  onClick={handleLimparFiltrosRegistroPagamentos}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "500",
                    fontSize: "14px"
                  }}
                >
                  Limpar Filtros
                </button>
              </div>
            </div>

            {/* Tabela de Registros */}
            {registroPagamentosLoading ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Carregando registros...</p>
              </div>
            ) : !registroPagamentos || registroPagamentos.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <p>Não há registros de pagamentos.</p>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "14px" }}>ID</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "14px" }}>Nome</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "14px" }}>Ano</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "14px" }}>Mês</th>
                      <th style={{ padding: "12px", textAlign: "left", fontWeight: "600", fontSize: "14px" }}>Valor Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registroPagamentos.map((registro) => (
                      <tr key={registro.id} style={{ borderBottom: "1px solid #dee2e6" }}>
                        <td style={{ padding: "12px", fontSize: "14px" }}>{registro.id}</td>
                        <td style={{ padding: "12px", fontSize: "14px" }}>{registro.nome ?? "-"}</td>
                        <td style={{ padding: "12px", fontSize: "14px" }}>{registro.ano ?? "-"}</td>
                        <td style={{ padding: "12px", fontSize: "14px" }}>{registro.mes ?? "-"}</td>
                        <td style={{ padding: "12px", fontSize: "14px" }}>
                          {registro.valorPago != null 
                            ? registro.valorPago.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                            : "R$ 0,00"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: "#f8f9fa", borderTop: "2px solid #dee2e6", fontWeight: "600" }}>
                      <td style={{ padding: "12px", fontSize: "14px", textAlign: "right" }} colSpan={4}>
                        <strong>Total:</strong>
                      </td>
                      <td style={{ padding: "12px", fontSize: "16px", color: "#28a745" }}>
                        <strong>
                          {registroPagamentos
                            .reduce((sum, registro) => sum + (registro.valorPago ?? 0), 0)
                            .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </strong>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setShowRegistroPagamentosModal(false)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                  fontSize: "14px"
                }}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

