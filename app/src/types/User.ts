export interface User {
  matriculaSistel: number;        // int64
  matriculaAstel: number;         // int64
  nome?: string | null;
  endereco?: string | null;
  situacao?: number | null;       // 1 - Titular, 2 - Dependente
  valorBeneficio?: number | null;
  estadoCivil?: string | null;
  telefone?: string | null;
  nomeEsposa?: string | null;
  cpf?: string | null;
  rg?: string | null;
  ativo?: boolean | null;
  descontoFolha?: boolean | null;
}
