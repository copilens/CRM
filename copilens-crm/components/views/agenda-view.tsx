'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { fmtDate, capitalize, todayStr } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Meeting, MeetingStatus } from '@/types/crm';
import {
  Calendar,
  Search,
  Plus,
  Check,
  X,
  Edit2,
  Trash2,
  MoreVertical,
  Clock,
} from 'lucide-react';

interface AgendaViewProps {
  onNewMeeting: (prefillClientId?: string) => void;
  onEditMeeting: (meeting: Meeting) => void;
}

export function AgendaView({ onNewMeeting, onEditMeeting }: AgendaViewProps) {
  const { data, setMeetingStatus, deleteMeeting } = useCRM();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [rangeFilter, setRangeFilter] = useState<'upcoming' | 'all' | 'past'>('upcoming');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const nowStr = todayStr();

  const getClientName = (id: string) => {
    const client = data.clients.find((c) => c.id === id);
    return client ? client.nome : '— cliente removido —';
  };

  // Filter meetings
  let filtered = [...data.meetings];

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter((m) => getClientName(m.cliente_id).toLowerCase().includes(q));
  }

  if (statusFilter) {
    filtered = filtered.filter((m) => m.status === statusFilter);
  }

  if (rangeFilter === 'upcoming') {
    filtered = filtered.filter((m) => m.data >= nowStr);
  } else if (rangeFilter === 'past') {
    filtered = filtered.filter((m) => m.data < nowStr);
  }

  // Sort by date and time
  filtered.sort((a, b) => (a.data + a.hora).localeCompare(b.data + b.hora));

  // Group by date
  const grouped: Record<string, Meeting[]> = {};
  filtered.forEach((m) => {
    if (!grouped[m.data]) grouped[m.data] = [];
    grouped[m.data].push(m);
  });
  const days = Object.keys(grouped);

  const toggleMenu = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6" onClick={() => setActiveMenuId(null)}>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#a3a297]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por cliente..."
              className="pl-9 rounded-full h-9 bg-[#f4f3ef]"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-full text-xs font-semibold bg-[#f4f3ef] border border-[rgba(14,16,10,0.1)] text-[#14150f] focus:outline-none"
          >
            <option value="">Todos os estados</option>
            <option value="agendada">Agendada</option>
            <option value="realizada">Realizada</option>
            <option value="remarcada">Remarcada</option>
            <option value="cancelada">Cancelada</option>
          </select>

          {/* Range Filter */}
          <select
            value={rangeFilter}
            onChange={(e) => setRangeFilter(e.target.value as any)}
            className="h-9 px-3 rounded-full text-xs font-semibold bg-[#f4f3ef] border border-[rgba(14,16,10,0.1)] text-[#14150f] focus:outline-none"
          >
            <option value="upcoming">Próximas</option>
            <option value="all">Todas as datas</option>
            <option value="past">Passadas</option>
          </select>
        </div>

        <Button onClick={() => onNewMeeting()} variant="primary" size="sm">
          <Plus className="h-4 w-4" />
          <span>Nova reunião</span>
        </Button>
      </div>

      {/* Agenda Grouped List */}
      {days.length === 0 ? (
        <div className="bg-[#f4f3ef] rounded-[22px] p-12 text-center text-[#a3a297]">
          <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-medium">Nenhuma reunião encontrada para estes filtros.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {days.map((day) => {
            const isToday = day === nowStr;
            const items = grouped[day];

            return (
              <div key={day} className="space-y-2">
                {/* Day Header */}
                <div className="flex items-center gap-2 px-1">
                  <span className="text-xs uppercase font-extrabold tracking-wider text-[#a3a297]">
                    {fmtDate(day)}
                  </span>
                  {isToday && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#1c1c1c] text-white">
                      Hoje
                    </span>
                  )}
                </div>

                {/* Day items */}
                <div className="space-y-2">
                  {items.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-[#f4f3ef] hover:bg-[#ecece5] transition-colors relative"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0 pr-4">
                        <div className="flex items-center gap-1.5 font-extrabold text-sm sm:text-base text-[#14150f] w-20 flex-shrink-0">
                          <Clock className="h-3.5 w-3.5 text-[#6f6e66]" />
                          <span>{m.hora}</span>
                        </div>

                        <div className="min-w-0">
                          <span className="font-bold text-sm text-[#14150f] block truncate">
                            {getClientName(m.cliente_id)}
                          </span>
                          <span className="text-xs text-[#6f6e66] block truncate">
                            {capitalize(m.tipo)}
                            {m.notas ? ` · ${m.notas}` : ''}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Badge variant={m.status as any}>{capitalize(m.status)}</Badge>

                        {/* Dropdown Menu */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => toggleMenu(m.id, e)}
                            className="p-1.5 rounded-xl bg-[#ecece5] hover:bg-[#e3e2da] text-[#6f6e66] transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {activeMenuId === m.id && (
                            <div className="absolute right-0 top-full mt-1.5 w-44 rounded-2xl bg-white shadow-xl border border-[rgba(14,16,10,0.08)] py-1.5 z-30">
                              {m.status === 'agendada' && (
                                <button
                                  type="button"
                                  onClick={() => setMeetingStatus(m.id, 'realizada')}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#254a0e] hover:bg-[#dff6bc]/50 transition-colors"
                                >
                                  <Check className="h-3.5 w-3.5 text-[#6ec93f]" />
                                  <span>Marcar realizada</span>
                                </button>
                              )}

                              {m.status !== 'cancelada' && (
                                <button
                                  type="button"
                                  onClick={() => setMeetingStatus(m.id, 'cancelada')}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#bd453c] hover:bg-[#f8dcda]/50 transition-colors"
                                >
                                  <X className="h-3.5 w-3.5 text-[#bd453c]" />
                                  <span>Cancelar reunião</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => onEditMeeting(m)}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#14150f] hover:bg-[#f4f3ef] transition-colors"
                              >
                                <Edit2 className="h-3.5 w-3.5 text-[#6f6e66]" />
                                <span>Editar</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm('Tem a certeza que deseja eliminar esta reunião?')) {
                                    deleteMeeting(m.id);
                                  }
                                }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-[#bd453c] hover:bg-[#f8dcda]/50 transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-[#bd453c]" />
                                <span>Eliminar</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
