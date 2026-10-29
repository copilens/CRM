'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { fmtKz, fmtDate, isSameMonth, todayStr } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Target, Plus, Trash2, PhoneCall } from 'lucide-react';

interface MetasViewProps {
  onNewCall: () => void;
}

export function MetasView({ onNewCall }: MetasViewProps) {
  const { data, updateGoals, deleteCall } = useCRM();

  const [callsGoalInput, setCallsGoalInput] = useState(
    String(data.goals.calls_monthly || 60)
  );
  const [revGoalInput, setRevGoalInput] = useState(
    String(data.goals.revenue_monthly || 500000)
  );

  const nowStr = todayStr();

  const callsThisMonth =
    data.calls.filter((c) => isSameMonth(c.data, nowStr)).length +
    data.meetings.filter((m) => isSameMonth(m.data, nowStr) && m.status === 'realizada').length;

  const monthRevenue = data.deals
    .filter((d) => isSameMonth(d.data, nowStr))
    .reduce((acc, d) => acc + Number(d.valor || 0), 0);

  const callsGoal = data.goals.calls_monthly || 60;
  const revGoal = Number(data.goals.revenue_monthly) || 500000;

  const callsPct = Math.min(100, Math.round((callsThisMonth / (callsGoal || 1)) * 100));
  const revPct = Math.min(100, Math.round((monthRevenue / (revGoal || 1)) * 100));

  const sortedCalls = [...data.calls].sort((a, b) => b.data.localeCompare(a.data));

  const getClientName = (id?: string | null) => {
    if (!id) return '— Sem cliente associado —';
    const client = data.clients.find((c) => c.id === id);
    return client ? client.nome : '— cliente removido —';
  };

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    updateGoals({
      calls_monthly: parseInt(callsGoalInput) || 0,
      revenue_monthly: parseFloat(revGoalInput) || 0,
    });
  };

  return (
    <div className="space-y-8">
      {/* 2-Column: Definition of goals & Current progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Definition Form Card */}
        <div className="bg-[#f4f3ef] rounded-[22px] p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-[#14150f]" />
            <h3 className="font-extrabold text-base text-[#14150f]">
              Definir Metas Mensais
            </h3>
          </div>

          <form onSubmit={handleSaveGoals} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#6f6e66] block mb-1">
                Meta de contactos / chamadas por mês
              </label>
              <Input
                type="number"
                min="0"
                value={callsGoalInput}
                onChange={(e) => setCallsGoalInput(e.target.value)}
                className="bg-white"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#6f6e66] block mb-1">
                Meta de faturamento por mês (Kz)
              </label>
              <Input
                type="number"
                min="0"
                step="1000"
                value={revGoalInput}
                onChange={(e) => setRevGoalInput(e.target.value)}
                className="bg-white"
                required
              />
            </div>

            <Button type="submit" variant="primary" size="sm">
              Guardar metas
            </Button>
          </form>
        </div>

        {/* Progress Visualizer Card */}
        <div className="bg-[#f4f3ef] rounded-[22px] p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-[#14150f] mb-4">
              Progresso Este Mês
            </h3>

            {/* Calls Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-[#6f6e66]">Contactos / chamadas realizadas</span>
                <span className="text-[#14150f] font-extrabold">{callsPct}%</span>
              </div>
              <div className="text-xl font-extrabold text-[#14150f] mb-1.5 tabular-nums">
                {callsThisMonth} / {callsGoal}
              </div>
              <div className="h-2.5 w-full bg-[#ecece5] rounded-full overflow-hidden">
                <div
                  style={{ width: `${callsPct}%` }}
                  className="h-full bg-[#FE88E6] rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Revenue Progress */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="text-[#6f6e66]">Faturamento atingido</span>
                <span className="text-[#14150f] font-extrabold">{revPct}%</span>
              </div>
              <div className="text-xl font-extrabold text-[#14150f] mb-1.5 tabular-nums">
                {fmtKz(monthRevenue)} / {fmtKz(revGoal)}
              </div>
              <div className="h-2.5 w-full bg-[#ecece5] rounded-full overflow-hidden">
                <div
                  style={{ width: `${revPct}%` }}
                  className="h-full bg-[#FE88E6] rounded-full transition-all duration-500"
                />
              </div>
            </div>
          </div>

          <p className="mt-4 text-xs text-[#a3a297] border-t border-[rgba(14,16,10,0.06)] pt-3">
            O progresso inclui tanto as chamadas diretas como reuniões marcadas e realizadas.
          </p>
        </div>
      </div>

      {/* Registo de Chamadas / Contactos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-[#14150f]">
              Registo de Contactos & Prospecção
            </h2>
            <p className="text-xs text-[#6f6e66]">
              Acompanhamento diário de chamadas para atingir o objetivo
            </p>
          </div>
          <Button onClick={onNewCall} variant="primary" size="sm">
            <Plus className="h-4 w-4" />
            <span>Registar contacto</span>
          </Button>
        </div>

        <div className="bg-[#f4f3ef] rounded-[22px] overflow-hidden">
          {sortedCalls.length === 0 ? (
            <div className="p-8 text-center text-[#a3a297] text-sm font-medium">
              <PhoneCall className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Nenhum contacto registado ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[rgba(14,16,10,0.06)] text-[10.5px] uppercase font-bold text-[#a3a297] tracking-wider">
                    <th className="py-3 px-5">Data</th>
                    <th className="py-3 px-5">Cliente</th>
                    <th className="py-3 px-5">Resultado</th>
                    <th className="py-3 px-5">Notas</th>
                    <th className="py-3 px-5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(14,16,10,0.05)]">
                  {sortedCalls.map((call) => (
                    <tr key={call.id} className="hover:bg-[#ecece5]/60 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-[#14150f]">
                        {fmtDate(call.data)}
                      </td>
                      <td className="py-3.5 px-5 text-[#14150f] font-medium">
                        {getClientName(call.cliente_id)}
                      </td>
                      <td className="py-3.5 px-5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            call.resultado === 'Reunião marcada'
                              ? 'bg-[#FE88E6] text-[#1B1B1C]'
                              : call.resultado === 'Interessado'
                              ? 'bg-[#e2e8f5] text-[#41577f]'
                              : 'bg-[#ecece5] text-[#6f6e66]'
                          }`}
                        >
                          {call.resultado}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-[#6f6e66]">
                        {call.notas || <span className="text-[#a3a297]">—</span>}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Eliminar este registo de contacto?')) {
                              deleteCall(call.id);
                            }
                          }}
                          className="p-1.5 rounded-xl bg-[#1B1B1C] hover:bg-[#1B1B1C]/95 text-white transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
