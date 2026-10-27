-- ==========================================================
-- COPILENS CRM - ESQUEMA SUPABASE POSTGRESQL
-- Copie e cole este código no SQL Editor do seu projeto Supabase
-- ==========================================================

-- 1. Habilitar extensão para UUID se necessário
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Clientes
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

-- 3. Tabela de Reuniões / Agenda
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

-- 4. Tabela de Negócios Fechados (Faturamento)
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    cliente_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    descricao TEXT NOT NULL DEFAULT 'Trabalho fechado',
    valor NUMERIC(15, 2) NOT NULL DEFAULT 0,
    data DATE NOT NULL,
    forma_pagamento TEXT NOT NULL DEFAULT 'Multicaixa'
);

-- 5. Tabela de Despesas
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    descricao TEXT NOT NULL,
    categoria TEXT NOT NULL DEFAULT 'Ferramentas/Software',
    valor NUMERIC(15, 2) NOT NULL DEFAULT 0,
    data DATE NOT NULL
);

-- 6. Tabela de Contactos / Chamadas
CREATE TABLE IF NOT EXISTS public.calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    cliente_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    data DATE NOT NULL,
    resultado TEXT NOT NULL DEFAULT 'Sem resposta' CHECK (resultado IN ('Sem resposta', 'Interessado', 'Reunião marcada', 'Não interessado')),
    notas TEXT DEFAULT ''
);

-- 7. Tabela de Metas Mensais
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

-- 8. Configurar Políticas de Acesso RLS (Row Level Security)
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso público ou autenticado conforme preferência
CREATE POLICY "Permitir tudo aos utilizadores autenticados e anon" ON public.clients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo aos utilizadores autenticados e anon" ON public.meetings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo aos utilizadores autenticados e anon" ON public.deals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo aos utilizadores autenticados e anon" ON public.expenses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo aos utilizadores autenticados e anon" ON public.calls FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Permitir tudo aos utilizadores autenticados e anon" ON public.goals FOR ALL USING (true) WITH CHECK (true);

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_meetings_data ON public.meetings (data);
CREATE INDEX IF NOT EXISTS idx_deals_data ON public.deals (data);
CREATE INDEX IF NOT EXISTS idx_expenses_data ON public.expenses (data);
CREATE INDEX IF NOT EXISTS idx_clients_stage ON public.clients (stage);
