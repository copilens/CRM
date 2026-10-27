'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '@/context/crm-context';
import { Meeting, MeetingType, MeetingStatus } from '@/types/crm';
import { todayStr } from '@/lib/formatters';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingToEdit?: Meeting | null;
  prefillClientId?: string | null;
}

export function MeetingModal({
  isOpen,
  onClose,
  meetingToEdit,
  prefillClientId,
}: MeetingModalProps) {
  const { data, addOrUpdateMeeting } = useCRM();

  const [clienteId, setClienteId] = useState('');
  const [dataReuniao, setDataReuniao] = useState(todayStr());
  const [hora, setHora] = useState('09:00');
  const [tipo, setTipo] = useState<MeetingType>('presencial');
  const [status, setStatus] = useState<MeetingStatus>('agendada');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (meetingToEdit) {
      setClienteId(meetingToEdit.cliente_id || '');
      setDataReuniao(meetingToEdit.data || todayStr());
      setHora(meetingToEdit.hora || '09:00');
      setTipo(meetingToEdit.tipo || 'presencial');
      setStatus(meetingToEdit.status || 'agendada');
      setNotas(meetingToEdit.notas || '');
    } else {
      setClienteId(prefillClientId || data.clients[0]?.id || '');
      setDataReuniao(todayStr());
      setHora('09:00');
      setTipo('presencial');
      setStatus('agendada');
      setNotas('');
    }
  }, [meetingToEdit, prefillClientId, data.clients, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clienteId || !dataReuniao) return;

    await addOrUpdateMeeting({
      id: meetingToEdit?.id,
      cliente_id: clienteId,
      data: dataReuniao,
      hora,
      tipo,
      status,
      notas: notas.trim(),
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={meetingToEdit ? 'Editar Reunião' : 'Nova Reunião'}
      description="Marque compromissos e reuniões comerciais com clientes"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="text-xs font-bold text-[#6f6e66] block mb-1">Cliente *</label>
          {data.clients.length === 0 ? (
            <p className="text-xs text-[#bd453c] font-bold">
              Cadastre pelo menos um cliente primeiro.
            </p>
          ) : (
            <select
              value={clienteId}
              onChange={(e) => setClienteId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-[#f4f3ef] border border-[rgba(14,16,10,0.1)] text-sm text-[#14150f] focus:outline-none"
              required
            >
              {data.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome} {c.empresa ? `— ${c.empresa}` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-[#6f6e66] block mb-1">Data *</label>
            <Input
              type="date"
              value={dataReuniao}
              onChange={(e) => setDataReuniao(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#6f6e66] block mb-1">Hora *</label>
            <Input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-[#6f6e66] block mb-1">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as MeetingType)}
              className="w-full h-10 px-3 rounded-xl bg-[#f4f3ef] border border-[rgba(14,16,10,0.1)] text-sm text-[#14150f] focus:outline-none"
            >
              <option value="presencial">Presencial</option>
              <option value="online">Online</option>
              <option value="chamada">Chamada</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#6f6e66] block mb-1">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as MeetingStatus)}
              className="w-full h-10 px-3 rounded-xl bg-[#f4f3ef] border border-[rgba(14,16,10,0.1)] text-sm text-[#14150f] focus:outline-none"
            >
              <option value="agendada">Agendada</option>
              <option value="realizada">Realizada</option>
              <option value="remarcada">Remarcada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#6f6e66] block mb-1">Pauta / Notas</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={2}
            className="w-full rounded-xl bg-[#f4f3ef] border border-[rgba(14,16,10,0.1)] p-3 text-sm text-[#14150f] placeholder:text-[#a3a297] focus:outline-none focus:bg-white"
            placeholder="Localização, link do Meet ou pontos a discutir..."
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(14,16,10,0.06)]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={data.clients.length === 0}>
            Guardar reunião
          </Button>
        </div>
      </form>
    </Modal>
  );
}
