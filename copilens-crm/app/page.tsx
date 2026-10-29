'use client';

import React, { useState } from 'react';
import { CRMProvider, useCRM } from '@/context/crm-context';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';
import { DashboardView } from '@/components/views/dashboard-view';
import { AgendaView } from '@/components/views/agenda-view';
import { ClientsView } from '@/components/views/clients-view';
import { PipelineView } from '@/components/views/pipeline-view';
import { FaturamentoView } from '@/components/views/faturamento-view';
import { MetasView } from '@/components/views/metas-view';
import { SettingsView } from '@/components/views/settings-view';

// Modals
import { ClientModal } from '@/components/modals/client-modal';
import { MeetingModal } from '@/components/modals/meeting-modal';
import { DealModal } from '@/components/modals/deal-modal';
import { ExpenseModal } from '@/components/modals/expense-modal';
import { CallModal } from '@/components/modals/call-modal';
import { CRMHydrationBoundary } from '@/components/crm-hydration-boundary';

import { Client, Meeting } from '@/types/crm';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

function CRMApp() {
  const { activeView, toast } = useCRM();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modals state
  const [clientModalOpen, setClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const [meetingModalOpen, setMeetingModalOpen] = useState(false);
  const [meetingToEdit, setMeetingToEdit] = useState<Meeting | null>(null);
  const [prefillClientId, setPrefillClientId] = useState<string | null>(null);

  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [callModalOpen, setCallModalOpen] = useState(false);

  // Handlers
  const handleOpenNewClient = () => {
    setClientToEdit(null);
    setClientModalOpen(true);
  };

  const handleOpenEditClient = (client: Client) => {
    setClientToEdit(client);
    setClientModalOpen(true);
  };

  const handleOpenNewMeeting = (clientId?: string) => {
    setMeetingToEdit(null);
    setPrefillClientId(clientId || null);
    setMeetingModalOpen(true);
  };

  const handleOpenEditMeeting = (meeting: Meeting) => {
    setMeetingToEdit(meeting);
    setPrefillClientId(null);
    setMeetingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60">
        <Topbar
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenQuickMeeting={() => handleOpenNewMeeting()}
        />

        <main className="flex-1 p-5 sm:p-8 max-w-7xl w-full mx-auto pb-20">
          {activeView === 'dashboard' && <DashboardView />}
          {activeView === 'agenda' && (
            <AgendaView
              onNewMeeting={handleOpenNewMeeting}
              onEditMeeting={handleOpenEditMeeting}
            />
          )}
          {activeView === 'clientes' && (
            <ClientsView
              onNewClient={handleOpenNewClient}
              onEditClient={handleOpenEditClient}
              onScheduleMeeting={handleOpenNewMeeting}
            />
          )}
          {activeView === 'pipeline' && (
            <PipelineView
              onScheduleMeeting={handleOpenNewMeeting}
              onEditClient={handleOpenEditClient}
            />
          )}
          {activeView === 'faturamento' && (
            <FaturamentoView
              onNewDeal={() => setDealModalOpen(true)}
              onNewExpense={() => setExpenseModalOpen(true)}
            />
          )}
          {activeView === 'metas' && (
            <MetasView onNewCall={() => setCallModalOpen(true)} />
          )}
          {activeView === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <ClientModal
        isOpen={clientModalOpen}
        onClose={() => setClientModalOpen(false)}
        clientToEdit={clientToEdit}
      />

      <MeetingModal
        isOpen={meetingModalOpen}
        onClose={() => setMeetingModalOpen(false)}
        meetingToEdit={meetingToEdit}
        prefillClientId={prefillClientId}
      />

      <DealModal
        isOpen={dealModalOpen}
        onClose={() => setDealModalOpen(false)}
      />

      <ExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
      />

      <CallModal
        isOpen={callModalOpen}
        onClose={() => setCallModalOpen(false)}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-[rgba(14,16,10,0.08)] px-4 py-3 flex items-center gap-3">
            {toast.type === 'error' ? (
              <AlertTriangle className="h-5 w-5 text-[#FE88E6]" />
            ) : (
              <CheckCircle2 className="h-5 w-5 text-[#1B1B1C]" />
            )}
            <span className="text-sm font-bold text-[#1B1B1C]">{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <CRMProvider>
      <CRMHydrationBoundary>
        <CRMApp />
      </CRMHydrationBoundary>
    </CRMProvider>
  );
}
