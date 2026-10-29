'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import { capitalize } from '@/lib/formatters';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Client, ClientStatus } from '@/types/crm';
import {
  Users,
  Search,
  Plus,
  Calendar,
  Edit2,
  Trash2,
  Building2,
  Phone,
  Mail,
} from 'lucide-react';

interface ClientsViewProps {
  onNewClient: () => void;
  onEditClient: (client: Client) => void;
  onScheduleMeeting: (clientId: string) => void;
}

export function ClientsView({ onNewClient, onEditClient, onScheduleMeeting }: ClientsViewProps) {
  const { data, deleteClient } = useCRM();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClientStatus | ''>('');

  let filtered = [...data.clients];

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.nome.toLowerCase().includes(q) ||
        (c.empresa && c.empresa.toLowerCase().includes(q)) ||
        (c.setor && c.setor.toLowerCase().includes(q)) ||
        (c.telefone && c.telefone.toLowerCase().includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }

  if (statusFilter) {
    filtered = filtered.filter((c) => c.status === statusFilter);
  }

  filtered.sort((a, b) => a.nome.localeCompare(b.nome));

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Eliminar o cliente "${name}"? Os históricos de negócios e reuniões associados serão mantidos.`)) {
      deleteClient(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#a3a297]" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar cliente, empresa ou setor..."
              className="pl-9 rounded-full h-9 bg-[#f4f3ef]"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ClientStatus | '')}
            className="h-9 px-3 rounded-full text-xs font-semibold bg-[#f4f3ef] border border-[rgba(14,16,10,0.1)] text-[#14150f] focus:outline-none"
          >
            <option value="">Todos os estados</option>
            <option value="lead">Lead</option>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        <Button onClick={onNewClient} variant="primary" size="sm">
          <Plus className="h-4 w-4" />
          <span>Novo cliente</span>
        </Button>
      </div>

      {/* Table Container */}
      <div className="bg-[#f4f3ef] rounded-[22px] overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-[#a3a297]">
            <Users className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium">Nenhum cliente encontrado.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[rgba(14,16,10,0.06)] text-[10.5px] uppercase font-bold text-[#a3a297] tracking-wider">
                  <th className="py-3 px-5">Nome</th>
                  <th className="py-3 px-5">Empresa</th>
                  <th className="py-3 px-5">Setor</th>
                  <th className="py-3 px-5">Contacto</th>
                  <th className="py-3 px-5">Estado</th>
                  <th className="py-3 px-5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(14,16,10,0.05)]">
                {filtered.map((client) => (
                  <tr key={client.id} className="hover:bg-[#ecece5]/60 transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-[#14150f]">{client.nome}</div>
                      {client.email && (
                        <div className="text-xs text-[#6f6e66] flex items-center gap-1 mt-0.5">
                          <Mail className="h-3 w-3" />
                          <span>{client.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-[#14150f]">
                      {client.empresa ? (
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-[#6f6e66]" />
                          <span>{client.empresa}</span>
                        </div>
                      ) : (
                        <span className="text-[#a3a297]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-[#6f6e66]">
                      {client.setor || <span className="text-[#a3a297]">—</span>}
                    </td>
                    <td className="py-3.5 px-5 text-[#14150f]">
                      {client.telefone ? (
                        <div className="flex items-center gap-1.5 font-medium">
                          <Phone className="h-3.5 w-3.5 text-[#6f6e66]" />
                          <span>{client.telefone}</span>
                        </div>
                      ) : (
                        <span className="text-[#a3a297]">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <Badge variant={client.status}>{capitalize(client.status)}</Badge>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onScheduleMeeting(client.id)}
                          title="Agendar reunião"
                          className="p-1.5 rounded-xl bg-[#ecece5] hover:bg-[#e3e2da] text-[#6f6e66] hover:text-[#14150f] transition-colors"
                        >
                          <Calendar className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditClient(client)}
                          title="Editar cliente"
                          className="p-1.5 rounded-xl bg-[#ecece5] hover:bg-[#e3e2da] text-[#6f6e66] hover:text-[#14150f] transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(client.id, client.nome)}
                          title="Eliminar cliente"
                          className="p-1.5 rounded-xl bg-[#f8dcda] hover:bg-[#f3cac7] text-[#bd453c] transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
