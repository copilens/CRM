'use client';

import React from 'react';
import { useCRM } from '@/context/crm-context';
import { fmtKz, fmtDate, isSameYear, todayStr } from '@/lib/formatters';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';

interface FaturamentoViewProps {
  onNewDeal: () => void;
  onNewExpense: () => void;
}

export function FaturamentoView({ onNewDeal, onNewExpense }: FaturamentoViewProps) {
  const { data, deleteDeal, deleteExpense } = useCRM();

  const nowStr = todayStr();

  const yearRevenue = data.deals
    .filter((d) => isSameYear(d.data, nowStr))
    .reduce((acc, d) => acc + Number(d.valor || 0), 0);

  const yearExpenses = data.expenses
    .filter((e) => isSameYear(e.data, nowStr))
    .reduce((acc, e) => acc + Number(e.valor || 0), 0);

  const allRevenue = data.deals.reduce((acc, d) => acc + Number(d.valor || 0), 0);
  const allExpenses = data.expenses.reduce((acc, e) => acc + Number(e.valor || 0), 0);
  const netBalance = allRevenue - allExpenses;

  const sortedDeals = [...data.deals].sort((a, b) => b.data.localeCompare(a.data));
  const sortedExpenses = [...data.expenses].sort((a, b) => b.data.localeCompare(a.data));

  const getClientName = (id: string) => {
    const client = data.clients.find((c) => c.id === id);
    return client ? client.nome : '— cliente removido —';
  };

  return (
    <div className="space-y-8">
      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Receita Ano */}
        <div className="bg-[#f4f3ef] rounded-[22px] p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6f6e66]">Total faturado (ano)</span>
            <div className="h-7 w-7 rounded-full bg-[#1B1B1C] text-[#FFFFFF] flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[#14150f] block tabular-nums">
            {fmtKz(yearRevenue)}
          </span>
        </div>

        {/* Card 2: Despesas Ano */}
        <div className="bg-[#f4f3ef] rounded-[22px] p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6f6e66]">Total de despesas (ano)</span>
            <div className="h-7 w-7 rounded-full bg-[#FE88E6] text-[#1B1B1C] flex items-center justify-center">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[#14150f] block tabular-nums">
            {fmtKz(yearExpenses)}
          </span>
        </div>

        {/* Card 3: Saldo Actual Líquido */}
        <div className="bg-[#f4f3ef] rounded-[22px] p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#6f6e66]">Saldo atual líquido</span>
            <div className="h-7 w-7 rounded-full bg-white text-[#14150f] flex items-center justify-center shadow-xs">
              <Wallet className="h-4 w-4" />
            </div>
          </div>
          <span
            className={`text-2xl font-extrabold tracking-tight block tabular-nums ${
              netBalance < 0 ? 'text-[#bd453c]' : 'text-[#14150f]'
            }`}
          >
            {fmtKz(netBalance)}
          </span>
        </div>
      </div>

      {/* Negócios Fechados Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-[#14150f]">
              Negócios Fechados
            </h2>
            <p className="text-xs text-[#6f6e66]">
              Registo de faturamento e receitas comerciais
            </p>
          </div>
          <Button onClick={onNewDeal} variant="primary" size="sm">
            <Plus className="h-4 w-4" />
            <span>Registar negócio</span>
          </Button>
        </div>

        <div className="bg-[#f4f3ef] rounded-[22px] overflow-hidden">
          {sortedDeals.length === 0 ? (
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
                    <th className="py-3 px-5">Forma de pagamento</th>
                    <th className="py-3 px-5">Valor</th>
                    <th className="py-3 px-5">Data</th>
                    <th className="py-3 px-5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(14,16,10,0.05)]">
                  {sortedDeals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-[#ecece5]/60 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-[#14150f]">
                        {getClientName(deal.cliente_id)}
                      </td>
                      <td className="py-3.5 px-5 text-[#6f6e66]">{deal.descricao}</td>
                      <td className="py-3.5 px-5">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ecece5] text-[#14150f]">
                          {deal.forma_pagamento || 'Multicaixa'}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-extrabold text-[#14150f] tabular-nums">
                        {fmtKz(deal.valor)}
                      </td>
                      <td className="py-3.5 px-5 text-[#6f6e66]">{fmtDate(deal.data)}</td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Eliminar este registo de faturamento?')) {
                              deleteDeal(deal.id);
                            }
                          }}
                          className="p-1.5 rounded-xl bg-[#f8dcda] hover:bg-[#f3cac7] text-[#bd453c] transition-colors"
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

      {/* Despesas Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-[#14150f]">
              Despesas Comerciais & Operacionais
            </h2>
            <p className="text-xs text-[#6f6e66]">
              Custos associados à atividade e ferramentas
            </p>
          </div>
          <Button onClick={onNewExpense} variant="secondary" size="sm">
            <Plus className="h-4 w-4" />
            <span>Registar despesa</span>
          </Button>
        </div>

        <div className="bg-[#f4f3ef] rounded-[22px] overflow-hidden">
          {sortedExpenses.length === 0 ? (
            <div className="p-8 text-center text-[#a3a297] text-sm font-medium">
              Sem despesas registadas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[rgba(14,16,10,0.06)] text-[10.5px] uppercase font-bold text-[#a3a297] tracking-wider">
                    <th className="py-3 px-5">Descrição</th>
                    <th className="py-3 px-5">Categoria</th>
                    <th className="py-3 px-5">Valor</th>
                    <th className="py-3 px-5">Data</th>
                    <th className="py-3 px-5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[rgba(14,16,10,0.05)]">
                  {sortedExpenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-[#ecece5]/60 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-[#14150f]">
                        {expense.descricao}
                      </td>
                      <td className="py-3.5 px-5 text-[#6f6e66]">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ecece5] text-[#14150f]">
                          {expense.categoria}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-extrabold text-[#bd453c] tabular-nums">
                        {fmtKz(expense.valor)}
                      </td>
                      <td className="py-3.5 px-5 text-[#6f6e66]">{fmtDate(expense.data)}</td>
                      <td className="py-3.5 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Eliminar esta despesa?')) {
                              deleteExpense(expense.id);
                            }
                          }}
                          className="p-1.5 rounded-xl bg-[#f8dcda] hover:bg-[#f3cac7] text-[#bd453c] transition-colors"
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
