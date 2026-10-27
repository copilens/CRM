'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  CRMData,
  Client,
  Meeting,
  Deal,
  Expense,
  CallLog,
  Goals,
  ViewType,
  FunnelStage,
  MeetingStatus
} from '@/types/crm';
import {
  loadLocalCRMData,
  saveLocalCRMData,
  fetchRemoteCRMData,
  syncEntityToSupabase,
  isSupabaseConfigured,
  getSupabase
} from '@/lib/supabase';

interface CRMContextType {
  data: CRMData;
  loading: boolean;
  isSupabaseActive: boolean;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  showBalance: boolean;
  toggleShowBalance: () => void;
  addOrUpdateClient: (client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  updateClientStage: (id: string, stage: FunnelStage) => Promise<void>;
  addOrUpdateMeeting: (meeting: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  setMeetingStatus: (id: string, status: MeetingStatus) => Promise<void>;
  addDeal: (deal: Omit<Deal, 'id'> & { id?: string }) => Promise<void>;
  deleteDeal: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id'> & { id?: string }) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addCall: (call: Omit<CallLog, 'id'> & { id?: string }) => Promise<void>;
  deleteCall: (id: string) => Promise<void>;
  updateGoals: (goals: Goals) => Promise<void>;
  exportBackup: () => void;
  importBackup: (fileContent: string) => boolean;
  syncWithSupabase: () => Promise<void>;
  toast: { message: string; type: 'success' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

const CRMContext = createContext<CRMContextType | null>(null);

export function CRMProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<CRMData>(() => loadLocalCRMData());
  const [loading, setLoading] = useState(true);
  const [isSupabaseActive, setIsSupabaseActive] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [showBalance, setShowBalance] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  const toggleShowBalance = useCallback(() => {
    setShowBalance((prev) => !prev);
  }, []);

  const syncWithSupabase = useCallback(async () => {
    if (isSupabaseConfigured()) {
      setIsSupabaseActive(true);
      const remote = await fetchRemoteCRMData();
      if (remote && remote.clients.length >= 0) {
        setData(remote);
        saveLocalCRMData(remote);
      }
    } else {
      setIsSupabaseActive(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const local = loadLocalCRMData();
      setData(local);
      await syncWithSupabase();
      setLoading(false);
    };
    init();
  }, [syncWithSupabase]);

  // Save changes to local and Supabase
  const updateDataAndSync = useCallback((updater: (prev: CRMData) => CRMData) => {
    setData((prev) => {
      const next = updater(prev);
      saveLocalCRMData(next);
      return next;
    });
  }, []);

  // CLIENTS
  const addOrUpdateClient = async (clientData: Partial<Client>) => {
    const isEditing = Boolean(clientData.id);
    const id = clientData.id || crypto.randomUUID();
    const newClient: Client = {
      id,
      nome: clientData.nome || 'Sem nome',
      empresa: clientData.empresa || '',
      setor: clientData.setor || '',
      telefone: clientData.telefone || '',
      email: clientData.email || '',
      status: clientData.status || 'lead',
      stage: clientData.stage || 'lead',
      notas: clientData.notas || '',
      created_at: clientData.created_at || new Date().toISOString(),
    };

    updateDataAndSync((prev) => {
      const exists = prev.clients.some((c) => c.id === id);
      const clients = exists
        ? prev.clients.map((c) => (c.id === id ? newClient : c))
        : [newClient, ...prev.clients];
      return { ...prev, clients };
    });

    showToast(isEditing ? 'Cliente atualizado com sucesso' : 'Novo cliente cadastrado');
    await syncEntityToSupabase('clients', newClient);
  };

  const deleteClient = async (id: string) => {
    updateDataAndSync((prev) => ({
      ...prev,
      clients: prev.clients.filter((c) => c.id !== id),
    }));
    showToast('Cliente removido');
    await syncEntityToSupabase('clients', { id }, true);
  };

  const updateClientStage = async (id: string, stage: FunnelStage) => {
    let updatedClient: Client | undefined;
    updateDataAndSync((prev) => {
      const clients = prev.clients.map((c) => {
        if (c.id === id) {
          updatedClient = { ...c, stage };
          return updatedClient;
        }
        return c;
      });
      return { ...prev, clients };
    });

    if (updatedClient) {
      showToast(`Estágio alterado para "${stage}"`);
      await syncEntityToSupabase('clients', updatedClient);
    }
  };

  // MEETINGS
  const addOrUpdateMeeting = async (meetingData: Partial<Meeting>) => {
    const isEditing = Boolean(meetingData.id);
    const id = meetingData.id || crypto.randomUUID();
    const newMeeting: Meeting = {
      id,
      cliente_id: meetingData.cliente_id || '',
      data: meetingData.data || new Date().toISOString().slice(0, 10),
      hora: meetingData.hora || '09:00',
      tipo: meetingData.tipo || 'presencial',
      status: meetingData.status || 'agendada',
      notas: meetingData.notas || '',
      created_at: meetingData.created_at || new Date().toISOString(),
    };

    updateDataAndSync((prev) => {
      const exists = prev.meetings.some((m) => m.id === id);
      const meetings = exists
        ? prev.meetings.map((m) => (m.id === id ? newMeeting : m))
        : [...prev.meetings, newMeeting];
      return { ...prev, meetings };
    });

    showToast(isEditing ? 'Reunião atualizada' : 'Reunião agendada');
    await syncEntityToSupabase('meetings', newMeeting);
  };

  const deleteMeeting = async (id: string) => {
    updateDataAndSync((prev) => ({
      ...prev,
      meetings: prev.meetings.filter((m) => m.id !== id),
    }));
    showToast('Reunião eliminada');
    await syncEntityToSupabase('meetings', { id }, true);
  };

  const setMeetingStatus = async (id: string, status: MeetingStatus) => {
    let updated: Meeting | undefined;
    updateDataAndSync((prev) => {
      const meetings = prev.meetings.map((m) => {
        if (m.id === id) {
          updated = { ...m, status };
          return updated;
        }
        return m;
      });
      return { ...prev, meetings };
    });

    if (updated) {
      showToast(status === 'cancelada' ? 'Reunião cancelada' : 'Estado atualizado');
      await syncEntityToSupabase('meetings', updated);
    }
  };

  // DEALS
  const addDeal = async (dealData: Omit<Deal, 'id'> & { id?: string }) => {
    const id = dealData.id || crypto.randomUUID();
    const newDeal: Deal = {
      ...dealData,
      id,
      created_at: dealData.created_at || new Date().toISOString(),
    };

    updateDataAndSync((prev) => {
      // Also advance client stage to 'fechado' if not already
      const clients = prev.clients.map((c) => (c.id === newDeal.cliente_id ? { ...c, stage: 'fechado' as FunnelStage } : c));
      return {
        ...prev,
        deals: [newDeal, ...prev.deals],
        clients,
      };
    });

    showToast('Negócio registado com sucesso');
    await syncEntityToSupabase('deals', newDeal);
  };

  const deleteDeal = async (id: string) => {
    updateDataAndSync((prev) => ({
      ...prev,
      deals: prev.deals.filter((d) => d.id !== id),
    }));
    showToast('Negócio removido');
    await syncEntityToSupabase('deals', { id }, true);
  };

  // EXPENSES
  const addExpense = async (expenseData: Omit<Expense, 'id'> & { id?: string }) => {
    const id = expenseData.id || crypto.randomUUID();
    const newExpense: Expense = {
      ...expenseData,
      id,
      created_at: expenseData.created_at || new Date().toISOString(),
    };

    updateDataAndSync((prev) => ({
      ...prev,
      expenses: [newExpense, ...prev.expenses],
    }));

    showToast('Despesa registada');
    await syncEntityToSupabase('expenses', newExpense);
  };

  const deleteExpense = async (id: string) => {
    updateDataAndSync((prev) => ({
      ...prev,
      expenses: prev.expenses.filter((e) => e.id !== id),
    }));
    showToast('Despesa removida');
    await syncEntityToSupabase('expenses', { id }, true);
  };

  // CALLS
  const addCall = async (callData: Omit<CallLog, 'id'> & { id?: string }) => {
    const id = callData.id || crypto.randomUUID();
    const newCall: CallLog = {
      ...callData,
      id,
      created_at: callData.created_at || new Date().toISOString(),
    };

    updateDataAndSync((prev) => ({
      ...prev,
      calls: [newCall, ...prev.calls],
    }));

    showToast('Contacto registado');
    await syncEntityToSupabase('calls', newCall);
  };

  const deleteCall = async (id: string) => {
    updateDataAndSync((prev) => ({
      ...prev,
      calls: prev.calls.filter((c) => c.id !== id),
    }));
    showToast('Contacto removido');
    await syncEntityToSupabase('calls', { id }, true);
  };

  // GOALS
  const updateGoals = async (goals: Goals) => {
    updateDataAndSync((prev) => ({
      ...prev,
      goals,
    }));
    showToast('Metas mensais guardadas');
    await syncEntityToSupabase('goals', goals);
  };

  // EXPORT / IMPORT
  const exportBackup = () => {
    const dateStr = new Date().toISOString().slice(0, 10);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `copilens-crm-backup-${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exportado com sucesso');
  };

  const importBackup = (fileContent: string) => {
    try {
      const parsed = JSON.parse(fileContent);
      if (!parsed || typeof parsed !== 'object') throw new Error('Formato inválido');
      const validated: CRMData = {
        clients: Array.isArray(parsed.clients) ? parsed.clients : [],
        meetings: Array.isArray(parsed.meetings) ? parsed.meetings : [],
        deals: Array.isArray(parsed.deals) ? parsed.deals : [],
        expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
        calls: Array.isArray(parsed.calls) ? parsed.calls : [],
        goals: parsed.goals || { calls_monthly: 60, revenue_monthly: 500000 },
      };
      setData(validated);
      saveLocalCRMData(validated);
      showToast('Backup importado com sucesso!');
      return true;
    } catch (err) {
      console.error(err);
      showToast('Ficheiro de backup inválido', 'error');
      return false;
    }
  };

  return (
    <CRMContext.Provider
      value={{
        data,
        loading,
        isSupabaseActive,
        activeView,
        setActiveView,
        showBalance,
        toggleShowBalance,
        addOrUpdateClient,
        deleteClient,
        updateClientStage,
        addOrUpdateMeeting,
        deleteMeeting,
        setMeetingStatus,
        addDeal,
        deleteDeal,
        addExpense,
        deleteExpense,
        addCall,
        deleteCall,
        updateGoals,
        exportBackup,
        importBackup,
        syncWithSupabase,
        toast,
        showToast,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM deve ser usado dentro de um CRMProvider');
  }
  return context;
}
