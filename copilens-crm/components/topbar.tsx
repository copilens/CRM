'use client';

import React from 'react';
import { useCRM } from '@/context/crm-context';
import { fmtKz } from '@/lib/formatters';
import { Eye, EyeOff, Menu, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TopbarProps {
  onOpenMobileMenu: () => void;
  onOpenQuickMeeting: () => void;
}

const VIEW_HEADINGS: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Painel', subtitle: 'Visão geral do teu negócio comercial' },
  agenda: { title: 'Agenda', subtitle: 'Reuniões marcadas, realizadas e canceladas' },
  clientes: { title: 'Clientes', subtitle: 'A tua base de contactos e empresas' },
  pipeline: { title: 'Funil', subtitle: 'Acompanha cada cliente pela jornada de venda' },
  faturamento: { title: 'Faturamento', subtitle: 'Negócios fechados, despesas e saldo líquido' },
  metas: { title: 'Metas', subtitle: 'Objetivos mensais de chamadas e faturamento' },
  settings: { title: 'Base de Dados Supabase', subtitle: 'Estado da ligação, credenciais e esquema SQL' },
};

export function Topbar({ onOpenMobileMenu, onOpenQuickMeeting }: TopbarProps) {
  const { data, activeView, showBalance, toggleShowBalance, isSupabaseActive } = useCRM();

  // Calculate current net balance = total deals - total expenses
  const totalRevenue = data.deals.reduce((acc, d) => acc + Number(d.valor || 0), 0);
  const totalExpenses = data.expenses.reduce((acc, e) => acc + Number(e.valor || 0), 0);
  const netBalance = totalRevenue - totalExpenses;

  const heading = VIEW_HEADINGS[activeView] || { title: 'CRM', subtitle: '' };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between px-5 sm:px-8 py-4 bg-white">
      {/* Left: Mobile Toggle & Page Headings */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-[#f4f3ef] hover:bg-[#ecece5] text-[#14150f] transition-colors"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#14150f]">
            {heading.title}
          </h1>
        </div>
      </div>

      {/* Right: Cloud status, Saldo, Avatar, + Reunião */}
      <div className="flex items-center gap-3 sm:gap-5">
        {/* Supabase Status indicator */}
        <div
          title={isSupabaseActive ? 'Ligado ao Supabase (Nuvem)' : 'Modo Local (Offline)'}
          className={`hidden md:flex items-center rounded-full gap-1.5 px-2.5 py-1 text-[11px] font-bold ${
            isSupabaseActive
              ? 'bg-[#FE88E6] text-[#1B1B1C]'
              : 'bg-[#ecece5] text-[#6f6e66]'
          }`}
        >
          <span>{isSupabaseActive ? 'On' : 'Off'}</span>
        </div>

        {/* Saldo Actual */}
        <div className="flex items-center gap-3">
          <div className="text-right">

            <span
              className={`text-sm sm:text-lg font-bold tracking-tight tabular-nums ${
                !showBalance
                  ? 'text-[#6f6e66]'
                  : netBalance < 0
                  ? 'text-[#bd453c]'
                  : 'text-[#14150f]'
              }`}
            >
              {showBalance ? fmtKz(netBalance) : '•••••• Kz'}
            </span>
          </div>

          <button
            onClick={toggleShowBalance}
            className="p-2 rounded-full bg-[#F2F2F2] hover:bg-[#EFEFEF] text-[#6f6e66] transition-colors"
            title={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
          >
            {showBalance ? <Eye className="h-4 w-4" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
        </div>

        {/* Quick Action Button */}
        <Button onClick={onOpenQuickMeeting} variant="primary" size="sm">
          <Plus className="h-3.5 w-3.5" />
          <span>Reunião</span>
        </Button>
      </div>
    </header>
  );
}
