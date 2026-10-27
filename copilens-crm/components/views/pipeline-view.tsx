'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { FunnelStage, Client } from '@/types/crm';
import { ChevronLeft, ChevronRight, Calendar, Building2 } from 'lucide-react';

const STAGES: { key: FunnelStage; label: string }[] = [
  { key: 'lead', label: 'Lead' },
  { key: 'contato', label: 'Em contacto' },
  { key: 'reuniao', label: 'Reunião agendada' },
  { key: 'proposta', label: 'Proposta enviada' },
  { key: 'fechado', label: 'Fechado' },
  { key: 'perdido', label: 'Perdido' },
];

interface PipelineViewProps {
  onScheduleMeeting: (clientId: string) => void;
  onEditClient: (client: Client) => void;
}

export function PipelineView({ onScheduleMeeting, onEditClient }: PipelineViewProps) {
  const { data, updateClientStage } = useCRM();
  const [draggingClientId, setDraggingClientId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const handleDragStart = (id: string) => {
    setDraggingClientId(id);
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (stage: FunnelStage) => {
    if (draggingClientId) {
      updateClientStage(draggingClientId, stage);
    }
    setDraggingClientId(null);
    setDragOverStage(null);
  };

  const moveStage = (client: Client, direction: 'prev' | 'next') => {
    const currentIndex = STAGES.findIndex((s) => s.key === (client.stage || 'lead'));
    const newIndex =
      direction === 'next'
        ? Math.min(currentIndex + 1, STAGES.length - 1)
        : Math.max(currentIndex - 1, 0);

    if (newIndex !== currentIndex) {
      updateClientStage(client.id, STAGES[newIndex].key);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold tracking-tight text-[#14150f]">
            Funil de Vendas Interativo
          </h2>
          <p className="text-xs text-[#6f6e66]">
            Arrasta os cartões entre as colunas ou usa as setas para avançar as oportunidades.
          </p>
        </div>
      </div>

      {/* Kanban Board Horizontal Scroll */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
        {STAGES.map((stage) => {
          const clientsInStage = data.clients.filter(
            (c) => (c.stage || 'lead') === stage.key
          );
          const isOver = dragOverStage === stage.key;

          return (
            <div
              key={stage.key}
              onDragOver={(e) => handleDragOver(e, stage.key)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(stage.key)}
              className={`w-72 flex-shrink-0 rounded-[22px] bg-[#f4f3ef] flex flex-col max-h-[75vh] transition-all border ${
                isOver
                  ? 'border-[#6ec93f] bg-[#e3e2da] shadow-md ring-2 ring-[#6ec93f]/20'
                  : 'border-transparent'
              }`}
            >
              {/* Column Head */}
              <div className="p-4 flex items-center justify-between border-b border-[rgba(14,16,10,0.06)]">
                <span className="text-xs uppercase font-extrabold tracking-wider text-[#14150f]">
                  {stage.label}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-white text-[#14150f] shadow-xs">
                  {clientsInStage.length}
                </span>
              </div>

              {/* Column Body */}
              <div className="p-3 overflow-y-auto space-y-2.5 flex-1 min-h-[140px]">
                {clientsInStage.length === 0 ? (
                  <div className="h-full flex items-center justify-center p-6 text-center text-xs text-[#a3a297] font-medium border-2 border-dashed border-[rgba(14,16,10,0.06)] rounded-xl">
                    Sem leads nesta etapa
                  </div>
                ) : (
                  clientsInStage.map((client) => {
                    const isDragging = draggingClientId === client.id;
                    const stageIdx = STAGES.findIndex((s) => s.key === stage.key);

                    return (
                      <div
                        key={client.id}
                        draggable
                        onDragStart={() => handleDragStart(client.id)}
                        onDragEnd={() => setDraggingClientId(null)}
                        className={`bg-white rounded-xl p-3.5 shadow-xs border border-[rgba(14,16,10,0.06)] cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
                          isDragging ? 'opacity-40 scale-95' : 'opacity-100'
                        }`}
                      >
                        <div
                          onClick={() => onEditClient(client)}
                          className="font-bold text-sm text-[#14150f] hover:text-[#1f8a4c] transition-colors cursor-pointer"
                        >
                          {client.nome}
                        </div>

                        {client.empresa && (
                          <div className="text-xs text-[#6f6e66] flex items-center gap-1 mt-1">
                            <Building2 className="h-3 w-3" />
                            <span className="truncate">{client.empresa}</span>
                            {client.setor && (
                              <span className="text-[#a3a297]">· {client.setor}</span>
                            )}
                          </div>
                        )}

                        {client.notas && (
                          <p className="text-[11px] text-[#a3a297] mt-1.5 line-clamp-2">
                            {client.notas}
                          </p>
                        )}

                        {/* Actions & Move buttons */}
                        <div className="mt-3 pt-2.5 border-t border-[rgba(14,16,10,0.05)] flex items-center justify-between gap-1">
                          <button
                            type="button"
                            onClick={() => onScheduleMeeting(client.id)}
                            title="Agendar reunião com esta oportunidade"
                            className="p-1 rounded-lg text-[#6f6e66] hover:bg-[#f4f3ef] hover:text-[#14150f] transition-colors text-[11px] font-bold flex items-center gap-1"
                          >
                            <Calendar className="h-3 w-3" />
                            <span>Reunião</span>
                          </button>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={stageIdx === 0}
                              onClick={() => moveStage(client, 'prev')}
                              title="Mover para a etapa anterior"
                              className="h-6 w-6 rounded-md bg-[#ecece5] hover:bg-[#e3e2da] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-[#14150f] text-xs font-bold transition-colors"
                            >
                              <ChevronLeft className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              disabled={stageIdx === STAGES.length - 1}
                              onClick={() => moveStage(client, 'next')}
                              title="Avançar para a próxima etapa"
                              className="h-6 w-6 rounded-md bg-[#ecece5] hover:bg-[#e3e2da] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-[#14150f] text-xs font-bold transition-colors"
                            >
                              <ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
