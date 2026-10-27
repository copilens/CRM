'use client';

import React, { useState, useEffect } from 'react';
import { useCRM } from '@/context/crm-context';
import { Client, ClientStatus, FunnelStage } from '@/types/crm';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: Client | null;
}

export function ClientModal({ isOpen, onClose, clientToEdit }: ClientModalProps) {
  const { addOrUpdateClient } = useCRM();

  const [nome, setNome] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [setor, setSetor] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<ClientStatus>('lead');
  const [stage, setStage] = useState<FunnelStage>('lead');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    if (clientToEdit) {
      setNome(clientToEdit.nome || '');
      setEmpresa(clientToEdit.empresa || '');
      setSetor(clientToEdit.setor || '');
      setTelefone(clientToEdit.telefone || '');
      setEmail(clientToEdit.email || '');
      setStatus(clientToEdit.status || 'lead');
      setStage(clientToEdit.stage || 'lead');
      setNotas(clientToEdit.notas || '');
    } else {
      setNome('');
      setEmpresa('');
      setSetor('');
      setTelefone('');
      setEmail('');
      setStatus('lead');
      setStage('lead');
      setNotas('');
    }
  }, [clientToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;

    await addOrUpdateClient({
      id: clientToEdit?.id,
      nome: nome.trim(),
      empresa: empresa.trim(),
      setor: setor.trim(),
      telefone: telefone.trim(),
      email: email.trim(),
      status,
      stage,
      notas: notas.trim(),
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={clientToEdit ? 'Editar Cliente' : 'Novo Cliente'}
      description="Preencha as informações do cliente ou empresa parceira"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="text-xs font-bold text-[#6f6e66] block mb-1">Nome completo *</label>
          <Input
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Ex: Manuel António"
            required
            autoFocus
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-[#6f6e66] block mb-1">Empresa</label>
            <Input
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
              placeholder="Ex: Unitel Angola"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#6f6e66] block mb-1">Setor</label>
            <Input
              value={setor}
              onChange={(e) => setSetor(e.target.value)}
              placeholder="Ex: Telecomunicações"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-[#6f6e66] block mb-1">Telefone</label>
            <Input
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              placeholder="+244 9xx xxx xxx"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-[#6f6e66] block mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemplo@empresa.ao"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-[#6f6e66] block mb-1">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ClientStatus)}
              className="w-full h-10 px-3 rounded-xl bg-[#f4f3ef] border border-[rgba(14,16,10,0.1)] text-sm text-[#14150f] focus:outline-none"
            >
              <option value="lead">Lead</option>
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-[#6f6e66] block mb-1">Etapa no Funil</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as FunnelStage)}
              className="w-full h-10 px-3 rounded-xl bg-[#f4f3ef] border border-[rgba(14,16,10,0.1)] text-sm text-[#14150f] focus:outline-none"
            >
              <option value="lead">Lead</option>
              <option value="contato">Em contacto</option>
              <option value="reuniao">Reunião agendada</option>
              <option value="proposta">Proposta enviada</option>
              <option value="fechado">Fechado</option>
              <option value="perdido">Perdido</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#6f6e66] block mb-1">Notas adicionais</label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            rows={2}
            className="w-full rounded-xl bg-[#f4f3ef] border border-[rgba(14,16,10,0.1)] p-3 text-sm text-[#14150f] placeholder:text-[#a3a297] focus:outline-none focus:bg-white"
            placeholder="Detalhes sobre a conversa, necessidades do cliente..."
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(14,16,10,0.06)]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar cliente
          </Button>
        </div>
      </form>
    </Modal>
  );
}
