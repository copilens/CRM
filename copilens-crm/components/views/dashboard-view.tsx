'use client';

import React from 'react';
import { useCRM } from '@/context/crm-context';
import { fmtKz, fmtDate, startOfWeek, isSameMonth, isSameYear, capitalize } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FunnelStage } from '@/types/crm';
import {
  CreditCard,
  TrendingUp,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';

const STAGES: { key: FunnelStage; label: string }[] = [
  { key: 'lead', label: 'Lead' },
  { key: 'contato', label: 'Em contacto' },
  { key: 'reuniao', label: 'Reunião agendada' },
  { key: 'proposta', label: 'Proposta enviada' },
  { key: 'fechado', label: 'Fechado' },
  { key: 'perdido', label: 'Perdido' },
];

export function DashboardView() {
  const { data, setActiveView } = useCRM();

  const now = new Date();
  const nowStr = now.toISOString().slice(0, 10);
  const weekStartStr = startOfWeek(now).toISOString().slice(0, 10);

  // Revenue metrics
  const weekTotal = data.deals
    .filter((d) => d.data >= weekStartStr && d.data <= nowStr)
    .reduce((acc, d) => acc + Number(d.valor || 0), 0);

  const monthTotal = data.deals
    .filter((d) => isSameMonth(d.data, nowStr))
    .reduce((acc, d) => acc + Number(d.valor || 0), 0);

  const yearTotal = data.deals
    .filter((d) => isSameYear(d.data, nowStr))
    .reduce((acc, d) => acc + Number(d.valor || 0), 0);

  // Delta calculation: month vs previous month
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthKey = prevMonthDate.toISOString().slice(0, 7);
  const prevMonthTotal = data.deals
    .filter((d) => d.data.slice(0, 7) === prevMonthKey)
    .reduce((acc, d) => acc + Number(d.valor || 0), 0);

  let deltaPct: number | null = null;
  if (prevMonthTotal > 0) {
    deltaPct = ((monthTotal - prevMonthTotal) / prevMonthTotal) * 100;
  }

  // Meetings today
  const todaysMeetings = data.meetings.filter(
    (m) => m.data === nowStr && m.status !== 'cancelada'
  );

  // Goals progress
  const callsThisMonth =
    data.calls.filter((c) => isSameMonth(c.data, nowStr)).length +
    data.meetings.filter((m) => isSameMonth(m.data, nowStr) && m.status === 'realizada').length;

  const callsGoal = data.goals.calls_monthly || 60;
  const revGoal = Number(data.goals.revenue_monthly) || 500000;

  const callsPct = Math.min(100, Math.round((callsThisMonth / callsGoal) * 100));
  const revPct = Math.min(100, Math.round((monthTotal / revGoal) * 100));

  // Upcoming meetings (next 5)
  const upcomingMeetings = data.meetings
    .filter((m) => m.data >= nowStr && m.status !== 'cancelada')
    .sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora))
    .slice(0, 5);

  // Recent deals (latest 5)
  const recentDeals = [...data.deals]
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 5);

  // 6 months historical data calculation
  const monthsData: { label: string; value: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const label = capitalize(d.toLocaleDateString('pt-PT', { month: 'short' }));
    const val = data.deals
      .filter((deal) => deal.data.slice(0, 7) === key)
      .reduce((acc, deal) => acc + Number(deal.valor || 0), 0);
    monthsData.push({ label, value: val });
  }
  const total6Months = monthsData.reduce((acc, m) => acc + m.value, 0);
  const maxMonthValue = Math.max(...monthsData.map((m) => m.value), 100000);

  // Funnel counts per stage
  const stageCounts: Record<string, number> = {};
  STAGES.forEach((s) => (stageCounts[s.key] = 0));
  data.clients.forEach((c) => {
    const st = c.stage || 'lead';
    stageCounts[st] = (stageCounts[st] || 0) + 1;
  });

  const getClientName = (id: string) => {
    const client = data.clients.find((c) => c.id === id);
    return client ? client.nome : '— cliente removido —';
  };

  return (
    <div className="space-y-6">
      {/* Signature Pipeline Funnel Rail */}
      <div className="bg-[#1c1c1c] text-white rounded-[22px] p-5 sm:p-6 overflow-x-auto shadow-sm">
        <div className="flex items-center justify-between min-w-[620px] gap-2">
          {STAGES.map((stage, idx) => {
            const count = stageCounts[stage.key] || 0;
            const isFilled = count > 0;
            return (
              <React.Fragment key={stage.key}>
                <div
                  onClick={() => setActiveView('pipeline')}
                  className="flex flex-col items-center gap-1.5 min-w-[90px] cursor-pointer group"
                >
                  <div
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      isFilled
                        ? 'bg-[#6ec93f] ring-4 ring-[#6ec93f]/20 scale-110'
                        : 'bg-[#a3a297] border border-[#6f6e66]'
                    }`}
                  />
                  <span className="font-extrabold text-2xl tracking-tight text-white group-hover:text-[#9be86a] transition-colors">
                    {count}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#a3a297] text-center">
                    {stage.label}
                  </span>
                </div>

                {idx < STAGES.length - 1 && (
                  <div className="flex-1 h-[1px] bg-[rgba(255,255,255,0.15)] -mt-6" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* KPI 4-Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-[#f4f3ef] rounded-[22px] p-5 hover:bg-[#ecece5] transition-colors">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#14150f] mb-3 shadow-xs">
            <CreditCard className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-[#6f6e66] block mb-1">
            Faturado esta semana
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-[#14150f] block tabular-nums">
            {fmtKz(weekTotal)}
          </span>
        </div>

        {/* KPI 2 */}
        <div className="bg-[#f4f3ef] rounded-[22px] p-5 hover:bg-[#ecece5] transition-colors">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#14150f] mb-3 shadow-xs">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-[#6f6e66] block mb-1">
            Faturado este mês
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-[#14150f] block tabular-nums">
            {fmtKz(monthTotal)}
          </span>
          <div className="mt-2 text-[11.5px] text-[#6f6e66] flex items-center gap-1.5">
            {deltaPct !== null ? (
              <span
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                  deltaPct >= 0 ? 'bg-[#dff6bc] text-[#254a0e]' : 'bg-[#f8dcda] text-[#bd453c]'
                }`}
              >
                {deltaPct >= 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(deltaPct).toFixed(1)}%
              </span>
            ) : monthTotal > 0 ? (
              <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-[#dff6bc] text-[#254a0e]">
                Novo
              </span>
            ) : null}
            <span>vs mês anterior</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-[#f4f3ef] rounded-[22px] p-5 hover:bg-[#ecece5] transition-colors">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#14150f] mb-3 shadow-xs">
            <Layers className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-[#6f6e66] block mb-1">
            Faturado este ano
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-[#14150f] block tabular-nums">
            {fmtKz(yearTotal)}
          </span>
        </div>

        {/* KPI 4 */}
        <div className="bg-[#f4f3ef] rounded-[22px] p-5 hover:bg-[#ecece5] transition-colors">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#14150f] mb-3 shadow-xs">
            <Calendar className="h-5 w-5" />
          </div>
          <span className="text-xs font-bold text-[#6f6e66] block mb-1">
            Reuniões hoje
          </span>
          <span className="text-2xl font-extrabold tracking-tight text-[#14150f] block">
            {todaysMeetings.length}
          </span>
          <p className="mt-2 text-[11.5px] text-[#6f6e66] truncate">
            {todaysMeetings.length
              ? todaysMeetings.map((m) => m.hora).sort().join(', ')
              : 'Sem reuniões marcadas para hoje'}
          </p>
        </div>
      </div>

      {/* 2-Column Section: Revenue Bar Chart & Goals Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Chart Card */}
        <div className="lg:col-span-2 bg-[#f4f3ef] rounded-[22px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#6f6e66]">
                Faturamento — últimos 6 meses
              </span>
              <button
                onClick={() => setActiveView('faturamento')}
                className="text-xs font-bold text-[#14150f] hover:underline inline-flex items-center gap-1"
              >
                Ver detalhes <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="text-2xl font-extrabold tracking-tight text-[#14150f] mt-1">
              {fmtKz(total6Months)}
            </div>
          </div>

          {/* Clean Custom Bar Chart Component */}
          <div className="mt-6 pt-4 border-t border-[rgba(14,16,10,0.06)]">
            <div className="flex items-end justify-between gap-3 h-48 sm:h-52 px-2">
              {monthsData.map((m, i) => {
                const heightPct = Math.max(
                  6,
                  Math.round((m.value / (maxMonthValue || 1)) * 100)
                );
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <span className="text-[10px] font-bold text-[#6f6e66] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {fmtKz(m.value)}
                    </span>
                    <div className="w-full max-w-[42px] bg-[#ecece5] rounded-xl h-full flex items-end overflow-hidden">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full rounded-xl transition-all duration-500 ${
                          i === monthsData.length - 1
                            ? 'bg-[#1f8a4c] hover:bg-[#186e3c]'
                            : 'bg-[#6ec93f] hover:bg-[#5db332]'
                        }`}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#6f6e66] group-hover:text-[#14150f]">
                      {m.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Goals Progress Card */}
        <div className="bg-[#f4f3ef] rounded-[22px] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-[#14150f]">Metas deste mês</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setActiveView('metas')}
                className="text-xs h-7 px-2"
              >
                Ajustar
              </Button>
            </div>

            {/* Goal 1: Calls */}
            <div className="mb-6">
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-[#6f6e66]">Contactos / chamadas</span>
                <span className="text-[#14150f]">
                  {callsThisMonth} / {callsGoal} ({callsPct}%)
                </span>
              </div>
              <div className="h-2.5 w-full bg-[#ecece5] rounded-full overflow-hidden">
                <div
                  style={{ width: `${callsPct}%` }}
                  className="h-full bg-[#6ec93f] rounded-full transition-all duration-500"
                />
              </div>
            </div>

            {/* Goal 2: Revenue */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                <span className="text-[#6f6e66]">Faturamento mensal</span>
                <span className="text-[#14150f]">{revPct}%</span>
              </div>
              <div className="text-sm font-extrabold text-[#14150f] mb-1.5">
                {fmtKz(monthTotal)} / {fmtKz(revGoal)}
              </div>
              <div className="h-2.5 w-full bg-[#ecece5] rounded-full overflow-hidden">
                <div
                  style={{ width: `${revPct}%` }}
                  className="h-full bg-[#1f8a4c] rounded-full transition-all duration-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[rgba(14,16,10,0.06)] flex items-center justify-between">
            <span className="text-xs text-[#6f6e66]">
              {callsPct >= 100 && revPct >= 100
                ? '🎉 Todas as metas mensais atingidas!'
                : `${callsGoal - callsThisMonth > 0 ? callsGoal - callsThisMonth : 0} chamadas restantes para a meta`}
            </span>
          </div>
        </div>
      </div>

      {/* Upcoming Meetings Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-extrabold tracking-tight text-[#14150f]">
            Próximas reuniões
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveView('agenda')}
          >
            Ver agenda completa
          </Button>
        </div>

        {upcomingMeetings.length === 0 ? (
          <div className="bg-[#f4f3ef] rounded-[22px] p-8 text-center text-[#a3a297]">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Sem reuniões futuras agendadas.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingMeetings.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#f4f3ef] hover:bg-[#ecece5] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="font-extrabold text-sm sm:text-base text-[#14150f] w-14">
                    {m.hora}
                  </span>
                  <div>
                    <span className="font-bold text-sm text-[#14150f] block">
                      {getClientName(m.cliente_id)}
                    </span>
                    <span className="text-xs text-[#6f6e66]">
                      {fmtDate(m.data)} · {capitalize(m.tipo)}
                      {m.notas ? ` — ${m.notas}` : ''}
                    </span>
                  </div>
                </div>

                <Badge variant={m.status as any}>{capitalize(m.status)}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Deals Table Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-extrabold tracking-tight text-[#14150f]">
            Negócios recentes fechados
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setActiveView('faturamento')}
          >
            Ver todos
          </Button>
        </div>

        <div className="bg-[#f4f3ef] rounded-[22px] overflow-hidden">
          {recentDeals.length === 0 ? (
            <div className="p-8 text-center text-[#a3a297] text-sm font-medium">
              Ainda sem negócios registados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[rgba(14,16,10,0.06)] text-[10.5px] uppercase font-bold text-[#a3a297] tracking-wider">
                    <th className="py-3 px-5">Cliente</th>
                    <th className="py-3 px-5">Descrição</th>
                    <th className="py-3 px-5">Valor</th>
                    <th className="py-3 px-5">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(14,16,10,0.05)]">
                  {recentDeals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-[#ecece5]/60 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-[#14150f]">
                        {getClientName(deal.cliente_id)}
                      </td>
                      <td className="py-3.5 px-5 text-[#6f6e66]">{deal.descricao}</td>
                      <td className="py-3.5 px-5 font-extrabold text-[#14150f] tabular-nums">
                        {fmtKz(deal.valor)}
                      </td>
                      <td className="py-3.5 px-5 text-[#6f6e66]">{fmtDate(deal.data)}</td>
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
