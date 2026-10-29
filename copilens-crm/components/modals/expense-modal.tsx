'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { ExpenseCategory } from '@/types/crm';
import { todayStr } from '@/lib/formatters';
import { Modal } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExpenseModal({ isOpen, onClose }: ExpenseModalProps) {
  if (!isOpen) return null;

  return <ExpenseModalForm onClose={onClose} />;
}

function ExpenseModalForm({ onClose }: Pick<ExpenseModalProps, 'onClose'>) {
  const { addExpense } = useCRM();

  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState<ExpenseCategory>('Ferramentas/Software');
  const [valor, setValor] = useState('');
  const [dataDespesa, setDataDespesa] = useState(todayStr());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valNum = parseFloat(valor);
    if (!descricao.trim() || !valNum || valNum <= 0) return;

    await addExpense({
      descricao: descricao.trim(),
      categoria,
      valor: valNum,
      data: dataDespesa,
    });

    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Registar Despesa"
      description="Insira custos e despesas operacionais para dedução no saldo líquido"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="text-xs font-bold text-[#6f6e66] block mb-1">
            Descrição da despesa *
          </label>
          <Input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Assinatura Google Workspace, Transporte..."
            required
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs font-bold text-[#6f6e66] block mb-1">Categoria</label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as ExpenseCategory)}
            className="w-full h-10 px-3 rounded-xl bg-[#f4f3ef] border border-[rgba(14,16,10,0.1)] text-sm text-[#14150f] focus:outline-none"
          >
            <option value="Ferramentas/Software">Ferramentas / Software</option>
            <option value="Transporte">Transporte / Deslocações</option>
            <option value="Marketing">Marketing & Publicidade</option>
            <option value="Impostos">Impostos & Taxas</option>
            <option value="Outro">Outro</option>
          </select>
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
              placeholder="Ex: 50000"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#6f6e66] block mb-1">Data *</label>
            <Input
              type="date"
              value={dataDespesa}
              onChange={(e) => setDataDespesa(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(14,16,10,0.06)]">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar despesa
          </Button>
        </div>
      </form>
    </Modal>
  );
}
