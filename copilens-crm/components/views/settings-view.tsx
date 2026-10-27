'use client';

import React, { useState } from 'react';
import { useCRM } from '@/context/crm-context';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  fetchRemoteCRMData
} from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Database, Check, Copy, RefreshCw, ExternalLink, ShieldCheck, AlertCircle } from 'lucide-react';

const SUPABASE_SQL_SCRIPT = `-- ==========================================================
-- COPILENS CRM - ESQUEMA SUPABASE POSTGRESQL
-- Copie e cole este código no SQL Editor do seu projeto Supabase
-- ==========================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Clientes
CREATE TABLE IF NOT EXISTS public.clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    nome TEXT NOT NULL,
    empresa TEXT DEFAULT '',
    setor TEXT DEFAULT '',
    telefone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'ativo', 'inativo')),
    stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'contato', 'reuniao', 'proposta', 'fechado', 'perdido')),
    notas TEXT DEFAULT ''
);

-- 2. Reuniões / Agenda
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    cliente_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    data DATE NOT NULL,
    hora TEXT NOT NULL DEFAULT '09:00',
    tipo TEXT NOT NULL DEFAULT 'presencial' CHECK (tipo IN ('presencial', 'online', 'chamada')),
    status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'realizada', 'remarcada', 'cancelada')),
    notas TEXT DEFAULT ''
);

-- 3. Negócios Fechados (Faturamento)
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    cliente_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    descricao TEXT NOT NULL DEFAULT 'Trabalho fechado',
    valor NUMERIC(15, 2) NOT NULL DEFAULT 0,
    data DATE NOT NULL,
    forma_pagamento TEXT NOT NULL DEFAULT 'Multicaixa'
);

-- 4. Despesas
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    descricao TEXT NOT NULL,
    categoria TEXT NOT NULL DEFAULT 'Ferramentas/Software',
    valor NUMERIC(15, 2) NOT NULL DEFAULT 0,
    data DATE NOT NULL
);

-- 5. Contactos / Chamadas
CREATE TABLE IF NOT EXISTS public.calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    cliente_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    data DATE NOT NULL,
    resultado TEXT NOT NULL DEFAULT 'Sem resposta' CHECK (resultado IN ('Sem resposta', 'Interessado', 'Reunião marcada', 'Não interessado')),
    notas TEXT DEFAULT ''
);

-- 6. Metas Mensais
CREATE TABLE IF NOT EXISTS public.goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    calls_monthly INTEGER NOT NULL DEFAULT 60,
    revenue_monthly NUMERIC(15, 2) NOT NULL DEFAULT 500000
);

-- Inserir meta padrão se não existir
INSERT INTO public.goals (calls_monthly, revenue_monthly)
SELECT 60, 500000
WHERE NOT EXISTS (SELECT 1 FROM public.goals);

-- RLS
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir tudo aos utilizadores" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo aos utilizadores" ON public.meetings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo aos utilizadores" ON public.deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo aos utilizadores" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo aos utilizadores" ON public.calls FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo aos utilizadores" ON public.goals FOR ALL USING (true) WITH CHECK (true);
`;

export function SettingsView() {
  const { isSupabaseActive, syncWithSupabase, showToast } = useCRM();

  const [url, setUrl] = useState(() => getSupabaseCredentials().url);
  const [anonKey, setAnonKey] = useState(() => getSupabaseCredentials().anonKey);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSaveAndTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setTesting(true);

    try {
      saveSupabaseCredentials(url, anonKey);
      await syncWithSupabase();
      const testData = await fetchRemoteCRMData();
      if (testData) {
        showToast('Ligação com Supabase estabelecida com sucesso!');
      } else {
        showToast('Credenciais guardadas, mas a tabela no Supabase pode necessitar do script SQL.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Erro ao testar ligação com o Supabase', 'error');
    } finally {
      setTesting(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopied(true);
    showToast('Esquema SQL copiado para a área de transferência!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Status banner */}
      <div
        className={`p-5 rounded-[22px] flex items-start gap-3.5 border ${
          isSupabaseActive
            ? 'bg-[#dff6bc]/40 border-[#6ec93f]/30 text-[#254a0e]'
            : 'bg-[#f4f3ef] border-[rgba(14,16,10,0.08)] text-[#14150f]'
        }`}
      >
        {isSupabaseActive ? (
          <ShieldCheck className="h-6 w-6 text-[#1f8a4c] flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="h-6 w-6 text-[#a8631f] flex-shrink-0 mt-0.5" />
        )}
        <div className="space-y-1">
          <h4 className="font-extrabold text-sm">
            {isSupabaseActive
              ? 'Supabase Conectado e Operacional'
              : 'Modo Local Ativo (Offline Fallback)'}
          </h4>
          <p className="text-xs text-[#6f6e66] leading-relaxed">
            {isSupabaseActive
              ? 'Todos os seus dados (clientes, reuniões, faturamento, despesas e metas) estão sincronizados diretamente com a sua base de dados PostgreSQL no Supabase.'
              : 'A aplicação está a funcionar com armazenamento seguro no navegador (localStorage). Para sincronizar na nuvem e partilhar com a equipa, configure as credenciais abaixo.'}
          </p>
        </div>
      </div>

      {/* Supabase Credentials Form */}
      <div className="bg-[#f4f3ef] rounded-[22px] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-[#14150f]" />
            <h3 className="font-extrabold text-base text-[#14150f]">
              Credenciais do Projeto Supabase
            </h3>
          </div>
          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#14150f] hover:underline flex items-center gap-1"
          >
            Abrir Supabase Dashboard <ExternalLink className="h-3 w-3" />
          </a>
        </div>

        <form onSubmit={handleSaveAndTest} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#6f6e66] block mb-1">
              Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
            </label>
            <Input
              type="url"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="bg-white"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-[#6f6e66] block mb-1">
              Project Anon / Public Key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
            </label>
            <Input
              type="text"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="bg-white font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary" disabled={testing}>
              <RefreshCw className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
              <span>{testing ? 'A testar ligação...' : 'Guardar e Testar Ligação'}</span>
            </Button>
          </div>
        </form>
      </div>

      {/* SQL Script / Schema Section */}
      <div className="bg-[#f4f3ef] rounded-[22px] p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-extrabold text-base text-[#14150f]">
              Script SQL de Criação de Tabelas
            </h3>
            <p className="text-xs text-[#6f6e66]">
              Execute este script no <strong>SQL Editor</strong> do seu projeto Supabase para criar as 6 tabelas e permissões RLS.
            </p>
          </div>
          <Button onClick={handleCopySql} variant="secondary" size="sm">
            {copied ? <Check className="h-4 w-4 text-[#1f8a4c]" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar SQL'}</span>
          </Button>
        </div>

        <div className="relative rounded-xl overflow-hidden bg-[#1c1c1c] text-white p-4 font-mono text-xs leading-relaxed max-h-72 overflow-y-auto">
          <pre>{SUPABASE_SQL_SCRIPT}</pre>
        </div>
      </div>
    </div>
  );
}
