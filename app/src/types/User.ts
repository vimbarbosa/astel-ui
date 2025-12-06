export interface User {
  id: number;
  matriculaSistel: number;
  matriculaAstel: number;

  nome?: string | null;
  endereco?: string | null;
  situacao?: string | null;
  valorBeneficio?: number | null;
  estadoCivil?: string | null;

  telefone?: string | null;
  nomeEsposa?: string | null;
  cpf?: string | null;
  rg?: string | null;
  ativo?: boolean | null;
  descontoFolha?: boolean | null;

  // 🔥 NOVOS CAMPOS
  logradouro?: string | null;
  celSkype?: string | null;
  estado?: string | null;
  cidade?: string | null;
  tipoEndereco?: string | null;
  correspondencia?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  email?: string | null;
  cep?: string | null;
}
