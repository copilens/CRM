'use client';

import React from 'react';
import { useCRM } from '@/context/crm-context';

export function CRMHydrationBoundary({ children }: { children: React.ReactNode }) {
  const { loading } = useCRM();

  if (loading) {
    return (
      <main
        className="flex min-h-screen items-center justify-center bg-white text-sm text-[#6f6e66]"
        role="status"
      >
        A carregar o CRM...
      </main>
    );
  }

  return children;
}
