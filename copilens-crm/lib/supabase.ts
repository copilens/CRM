import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { CRMData, Client, Meeting, Deal, Expense, CallLog, Goals } from '@/types/crm';

const LOCAL_STORAGE_KEY = 'copilens_crm_data_v2';
const SUPABASE_CONFIG_KEY = 'copilens_supabase_config';

export function getSupabaseCredentials(): { url: string; anonKey: string } {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.url) url = parsed.url;
        if (parsed.anonKey) anonKey = parsed.anonKey;
      } catch (e) {
        console.error('Erro ao ler configuração do Supabase:', e);
      }
    }
  }

  return { url: url.trim(), anonKey: anonKey.trim() };
}

export function saveSupabaseCredentials(url: string, anonKey: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith('http') && !url.includes('seu-projeto'));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey || !url.startsWith('http') || url.includes('seu-projeto')) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey);
    } catch (err) {
      console.warn('Falha ao inicializar cliente Supabase:', err);
      return null;
    }
  }
  return supabaseInstance;
}

export function defaultCRMData(): CRMData {
  return {
    clients: [
      {
        id: 'c1',
        nome: 'Manuel António',
        empresa: 'Unitel Angola',
        setor: 'Telecomunicações',
        telefone: '+244 923 456 789',
        email: 'manuel.antonio@unitel.co.ao',
        status: 'ativo',
        stage: 'proposta',
        notas: 'Interesse em pacote corporativo anual',
      },
      {
        id: 'c2',
        nome: 'Teresa Domingos',
        empresa: 'Banco BAI',
        setor: 'Banca & Finanças',
        telefone: '+244 912 345 678',
        email: 'teresa.domingos@bai.ao',
        status: 'ativo',
        stage: 'fechado',
        notas: 'Cliente fidelizado',
      },
      {
        id: 'c3',
        nome: 'Carlos Ferreira',
        empresa: 'Luanda Tech Hub',
        setor: 'Tecnologia',
        telefone: '+244 934 112 233',
        email: 'carlos@techhub.ao',
        status: 'lead',
        stage: 'reuniao',
        notas: 'Agendou demonstração presencial',
      }
    ],
    meetings: [
      {
        id: 'm1',
        cliente_id: 'c3',
        data: new Date().toISOString().slice(0, 10),
        hora: '14:30',
        tipo: 'presencial',
        status: 'agendada',
        notas: 'Apresentação de proposta comercial no escritório',
      },
      {
        id: 'm2',
        cliente_id: 'c1',
        data: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
        hora: '10:00',
        tipo: 'online',
        status: 'agendada',
        notas: 'Alinhamento técnico via Google Meet',
      }
    ],
    deals: [
      {
        id: 'd1',
        cliente_id: 'c2',
        descricao: 'Consultoria Estratégica Trimestral',
        valor: 1850000,
        data: new Date().toISOString().slice(0, 10),
        forma_pagamento: 'Transferência',
      },
      {
        id: 'd2',
        cliente_id: 'c1',
        descricao: 'Desenvolvimento e Integração de Sistema',
        valor: 2400000,
        data: new Date(Date.now() - 15 * 86400000).toISOString().slice(0, 10),
        forma_pagamento: 'Multicaixa',
      }
    ],
    expenses: [
      {
        id: 'e1',
        descricao: 'Assinaturas de Software & Cloud',
        categoria: 'Ferramentas/Software',
        valor: 250000,
        data: new Date().toISOString().slice(0, 10),
      },
      {
        id: 'e2',
        descricao: 'Deslocações comerciais Luanda/Talatona',
        categoria: 'Transporte',
        valor: 90000,
        data: new Date().toISOString().slice(0, 10),
      }
    ],
    calls: [
      {
        id: 'cl1',
        cliente_id: 'c3',
        data: new Date().toISOString().slice(0, 10),
        resultado: 'Reunião marcada',
        notas: 'Cliente confirmou reunião para hoje',
      },
      {
        id: 'cl2',
        cliente_id: 'c1',
        data: new Date().toISOString().slice(0, 10),
        resultado: 'Interessado',
        notas: 'Revisão da proposta enviada',
      }
    ],
    goals: {
      calls_monthly: 60,
      revenue_monthly: 4500000,
    }
  };
}

export function loadLocalCRMData(): CRMData {
  if (typeof window === 'undefined') return defaultCRMData();
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const initial = defaultCRMData();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erro ao ler localStorage:', err);
    return defaultCRMData();
  }
}

export function saveLocalCRMData(data: CRMData) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }
}

export async function fetchRemoteCRMData(): Promise<CRMData | null> {
  const sb = getSupabase();
  if (!sb) return null;

  try {
    const [clientsRes, meetingsRes, dealsRes, expensesRes, callsRes, goalsRes] = await Promise.all([
      sb.from('clients').select('*').order('created_at', { ascending: false }),
      sb.from('meetings').select('*').order('data', { ascending: true }),
      sb.from('deals').select('*').order('data', { ascending: false }),
      sb.from('expenses').select('*').order('data', { ascending: false }),
      sb.from('calls').select('*').order('data', { ascending: false }),
      sb.from('goals').select('*').limit(1).maybeSingle(),
    ]);

    if (clientsRes.error) throw clientsRes.error;

    return {
      clients: (clientsRes.data || []) as Client[],
      meetings: (meetingsRes.data || []) as Meeting[],
      deals: (dealsRes.data || []) as Deal[],
      expenses: (expensesRes.data || []) as Expense[],
      calls: (callsRes.data || []) as CallLog[],
      goals: goalsRes.data
        ? {
            id: goalsRes.data.id,
            calls_monthly: goalsRes.data.calls_monthly,
            revenue_monthly: Number(goalsRes.data.revenue_monthly),
          }
        : { calls_monthly: 60, revenue_monthly: 500000 },
    };
  } catch (err) {
    console.warn('Falha ao sincronizar com Supabase:', err);
    return null;
  }
}

type SyncTable = 'clients' | 'meetings' | 'deals' | 'expenses' | 'calls' | 'goals';
type SyncPayload =
  | Client
  | Meeting
  | Deal
  | Expense
  | CallLog
  | (Goals & { id: string })
  | { id: string };

export async function syncEntityToSupabase(
  table: SyncTable,
  payload: SyncPayload,
  isDelete = false
): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  try {
    if (isDelete) {
      if (!('id' in payload) || !payload.id) return false;
      const { error } = await sb.from(table).delete().eq('id', payload.id);
      if (error) throw error;
    } else {
      const { error } = await sb.from(table).upsert(payload);
      if (error) throw error;
    }
    return true;
  } catch (err) {
    console.warn(`Erro ao sincronizar ${table} no Supabase:`, err);
    return false;
  }
}
