export interface Feriado {
  codigo: string;
  nome: string;
  data: string;
  abrangencia: 'Nacional' | 'Estadual';
  uf: string | null;
  fundamentoLegal: string;
  dataOriginal: string | null;
  transferido: boolean;
  situacaoData: string;
}

export interface AlertaCalendario {
  codigo: string;
  data: string;
  codigosEventos: string[];
  descricao: string;
}

export interface CalendarioFeriados {
  ano: number;
  uf: string | null;
  ufs: string[];
  escopo: string;
  cobertura: string;
  total: number;
  feriados: Feriado[];
  limitacoes: string[];
  alertas: AlertaCalendario[];
}

export type FiltroFeriado = 'todos' | 'nacionais' | 'estaduais';