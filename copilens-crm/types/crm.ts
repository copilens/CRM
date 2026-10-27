export type ClientStatus = 'lead' | 'ativo' | 'inativo';
export type FunnelStage = 'lead' | 'contato' | 'reuniao' | 'proposta' | 'fechado' | 'perdido';

export interface Client {
  id: string;
  created_at?: string;
  nome: string;
  empresa: string;
  setor: string;
  telefone: string;
  email: string;
  status: ClientStatus;
  stage: FunnelStage;
  notas: string;
}

export type MeetingType = 'presencial' | 'online' | 'chamada';
export type MeetingStatus = 'agendada' | 'realizada' | 'remarcada' | 'cancelada';

export interface Meeting {
  id: string;
  created_at?: string;
  cliente_id: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:MM
  tipo: MeetingType;
  status: MeetingStatus;
  notas: string;
}

export type PaymentMethod = 'Multicaixa' | 'Transferência' | 'Numerário' | 'Outro';

export interface Deal {
  id: string;
  created_at?: string;
  cliente_id: string;
  descricao: string;
  valor: number;
  data: string; // YYYY-MM-DD
  forma_pagamento: PaymentMethod;
}

export type ExpenseCategory = 'Ferramentas/Software' | 'Transporte' | 'Marketing' | 'Impostos' | 'Outro';

export interface Expense {
  id: string;
  created_at?: string;
  descricao: string;
  categoria: ExpenseCategory;
  valor: number;
  data: string; // YYYY-MM-DD
}

export type CallResult = 'Sem resposta' | 'Interessado' | 'Reunião marcada' | 'Não interessado';

export interface CallLog {
  id: string;
  created_at?: string;
  cliente_id?: string | null;
  data: string; // YYYY-MM-DD
  resultado: CallResult;
  notas: string;
}

export interface Goals {
  id?: string;
  calls_monthly: number;
  revenue_monthly: number;
}

export interface CRMData {
  clients: Client[];
  meetings: Meeting[];
  deals: Deal[];
  expenses: Expense[];
  calls: CallLog[];
  goals: Goals;
}

export type ViewType = 'dashboard' | 'agenda' | 'clientes' | 'pipeline' | 'faturamento' | 'metas' | 'settings';
