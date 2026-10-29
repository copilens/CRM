'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { PaymentMethod } from '@/types/crm';
import { todayStr } from '@/lib/formatters';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface DealModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DealModal({ isOpen, onClose }: DealModalProps) {
  if (!isOpen) return null;

  return <DealModalForm onClose={onClose} />;
}

function DealModalForm({ onClose }: Pick<DealModalProps, 'onClose'>) {
  const { data, addDeal } = useCRM();

  const [clienteId, setClienteId] = useState(data.clients[0]?.id || '');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [dataFecho, setDataFecho] = useState(todayStr());
  const [formaPagamento, setFormaPagamento] = useState<PaymentMethod>('Multicaixa');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valNum = parseFloat(valor);
    if (!clienteId || !valNum || valNum <= 0) return;

    await addDeal({
      cliente_id: clienteId,
      descricao: descricao.trim() || 'Trabalho fechado',
      valor: valNum,
      data: dataFecho,
      forma_pagamento: formaPagamento,
    });

    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Registar Negócio Fechado"
      description="Insira os dados da venda para atualizar o faturamento e o funil de clientes"
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

        <div>
          <label className="text-xs font-bold text-[#6f6e66] block mb-1">
            Descrição do trabalho / serviço *
          </label>
          <Input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Consultoria mensal, Website institucional..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-[#6f6e66] block mb-1">Valor (Kz) *</label>
            <Input
              type="number"
              min="0"
              step="500"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="Ex: 1500000"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#6f6e66] block mb-1">Data do fecho *</label>
            <Input
              type="date"
              value={dataFecho}
              onChange={(e) => setDataFecho(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-[#6f6e66] block mb-1">
            Forma de Pagamento
          </label>
          <select
            value={formaPagamento}
            onChange={(e) => setFormaPagamento(e.target.value as PaymentMethod)}
            className="w-full h-10 px-3 rounded-xl bg-[#f4f3ef] border border-[rgba(14,16,10,0.1)] text-sm text-[#14150f] focus:outline-none"
          >
            <option value="Multicaixa">Multicaixa / TPA</option>
            <option value="Transferência">Transferência Bancária</option>
            <option value="Numerário">Numerário / Dinheiro vivo</option>
            <option value="Outro">Outro</option>
          </select>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(14,16,10,0.06)]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={data.clients.length === 0}>
            Registar negócio
          </Button>
        </div>
      </form>
    </Modal>
  );
}
