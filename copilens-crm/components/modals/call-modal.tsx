'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '@/context/crm-context';
import { CallResult } from '@/types/crm';
import { todayStr } from '@/lib/formatters';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CallModal({ isOpen, onClose }: CallModalProps) {
  const { data, addCall } = useCRM();

  const [clienteId, setClienteId] = useState('');
  const [dataChamada, setDataChamada] = useState(todayStr());
  const [resultado, setResultado] = useState<CallResult>('Sem resposta');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (isOpen) {
      setClienteId('');
      setDataChamada(todayStr());
      setResultado('Sem resposta');
      setNotas('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await addCall({
      cliente_id: clienteId || null,
      data: dataChamada,
      resultado,
      notas: notas.trim(),
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registar Contacto / Chamada"
      description="Registe o resultado da prospecção telefónica ou contacto comercial"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="text-xs font-bold text-[#6f6e66] block mb-1">
            Cliente associado (opcional)
          </label>
          <select
            value={clienteId}
            onChange={(e) => setClienteId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl bg-[#f4f3ef] border border-[rgba(14,16,10,0.1)] text-sm text-[#14150f] focus:outline-none"
          >
            <option value="">— Sem cliente associado —</option>
            {data.clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome} {c.empresa ? `— ${c.empresa}` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-[#6f6e66] block mb-1">Data *</label>
            <Input
              type="date"
              value={dataChamada}
              onChange={(e) => setDataChamada(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#6f6e66] block mb-1">Resultado *</label>
            <select
              value={resultado}
              onChange={(e) => setResultado(e.target.value as CallResult)}
              className="w-full h-10 px-3 rounded-xl bg-[#f4f3ef] border border-[rgba(14,16,10,0.1)] text-sm text-[#14150f] focus:outline-none"
            >
              <option value="Sem resposta">Sem resposta</option>
              <option value="Interessado">Interessado</option>
              <option value="Reunião marcada">Reunião marcada</option>
              <option value="Não interessado">Não interessado</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#6f6e66] block mb-1">Resumo da conversa</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={2}
            className="w-full rounded-xl bg-[#f4f3ef] border border-[rgba(14,16,10,0.1)] p-3 text-sm text-[#14150f] placeholder:text-[#a3a297] focus:outline-none focus:bg-white"
            placeholder="Feedback recebido, próximos passos, objeções..."
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(14,16,10,0.06)]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar contacto
          </Button>
        </div>
      </form>
    </Modal>
  );
}
