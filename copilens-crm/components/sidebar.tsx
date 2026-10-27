'use client';

import React, { useRef } from 'react';
import { useCRM } from '@/context/crm-context';
import { ViewType } from '@/types/crm';
import {
  LayoutDashboard,
  Calendar,
  Users,
  GitFork,
  CreditCard,
  Target,
  Database,
  Download,
  Upload,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { data, activeView, setActiveView, exportBackup, importBackup } = useCRM();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const meetingsTodayCount = data.meetings.filter(
    (m) => m.data === todayStr && m.status !== 'cancelada'
  ).length;

  const handleNavClick = (view: ViewType) => {
    setActiveView(view);
    onClose();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importBackup(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-60 bg-white border-r border-[rgba(14,16,10,0.06)] flex flex-col p-5 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between pb-6 mb-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-[#f4f3ef] border border-[rgba(14,16,10,0.08)] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/img/5.png"
                alt="Copilens Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-[15px] tracking-tight block text-[#14150f]">
                copilens
              </span>
              <span className="font-medium text-[11px] text-[#6f6e66] block">
                Team comercial
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg text-[#6f6e66] hover:bg-[#f4f3ef]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Section: Principal */}
          <div>
            <span className="text-[10.5px] uppercase font-bold tracking-wider text-[#a3a297] px-3 mb-1.5 block">
              Principal
            </span>
            <nav className="space-y-1">
              <button
                onClick={() => handleNavClick('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                  activeView === 'dashboard'
                    ? 'bg-[#f4f3ef] text-[#14150f] font-bold'
                    : 'text-[#6f6e66] hover:bg-[#f4f3ef] hover:text-[#14150f]'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 opacity-80" />
                <span>Painel</span>
              </button>

              <button
                onClick={() => handleNavClick('agenda')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                  activeView === 'agenda'
                    ? 'bg-[#f4f3ef] text-[#14150f] font-bold'
                    : 'text-[#6f6e66] hover:bg-[#f4f3ef] hover:text-[#14150f]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 opacity-80" />
                  <span>Agenda</span>
                </div>
                {meetingsTodayCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1c1c1c] text-white">
                    {meetingsTodayCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => handleNavClick('clientes')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                  activeView === 'clientes'
                    ? 'bg-[#f4f3ef] text-[#14150f] font-bold'
                    : 'text-[#6f6e66] hover:bg-[#f4f3ef] hover:text-[#14150f]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 opacity-80" />
                  <span>Clientes</span>
                </div>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ecece5] text-[#6f6e66]">
                  {data.clients.length}
                </span>
              </button>

              <button
                onClick={() => handleNavClick('pipeline')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                  activeView === 'pipeline'
                    ? 'bg-[#f4f3ef] text-[#14150f] font-bold'
                    : 'text-[#6f6e66] hover:bg-[#f4f3ef] hover:text-[#14150f]'
                }`}
              >
                <GitFork className="h-4 w-4 opacity-80" />
                <span>Funil</span>
              </button>
            </nav>
          </div>

          {/* Section: Finanças */}
          <div>
            <span className="text-[10.5px] uppercase font-bold tracking-wider text-[#a3a297] px-3 mb-1.5 block">
              Finanças
            </span>
            <nav className="space-y-1">
              <button
                onClick={() => handleNavClick('faturamento')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                  activeView === 'faturamento'
                    ? 'bg-[#f4f3ef] text-[#14150f] font-bold'
                    : 'text-[#6f6e66] hover:bg-[#f4f3ef] hover:text-[#14150f]'
                }`}
              >
                <CreditCard className="h-4 w-4 opacity-80" />
                <span>Faturamento</span>
              </button>

              <button
                onClick={() => handleNavClick('metas')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                  activeView === 'metas'
                    ? 'bg-[#f4f3ef] text-[#14150f] font-bold'
                    : 'text-[#6f6e66] hover:bg-[#f4f3ef] hover:text-[#14150f]'
                }`}
              >
                <Target className="h-4 w-4 opacity-80" />
                <span>Metas</span>
              </button>
            </nav>
          </div>

          {/* Section: Integrações */}
          <div>
            <span className="text-[10.5px] uppercase font-bold tracking-wider text-[#a3a297] px-3 mb-1.5 block">
              Integrações
            </span>
            <nav className="space-y-1">
              <button
                onClick={() => handleNavClick('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors ${
                  activeView === 'settings'
                    ? 'bg-[#f4f3ef] text-[#14150f] font-bold'
                    : 'text-[#6f6e66] hover:bg-[#f4f3ef] hover:text-[#14150f]'
                }`}
              >
                <Database className="h-4 w-4 opacity-80" />
                <span>Supabase</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Sidebar Footer: Backup Export/Import */}
        <div className="pt-4 border-t border-[rgba(14,16,10,0.06)] space-y-1.5">
          <button
            onClick={exportBackup}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#a3a297] hover:text-[#14150f] hover:bg-[#f4f3ef] transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Exportar backup</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#a3a297] hover:text-[#14150f] hover:bg-[#f4f3ef] transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Importar backup</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
        </div>
      </aside>
    </>
  );
}
