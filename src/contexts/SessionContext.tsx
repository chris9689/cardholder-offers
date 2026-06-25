/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SavingsTransaction {
  sku: string;
  merchant: string;
  date: string;
  amount: number;
}

interface SessionContextType {
  likedOffers: Set<string>;
  toggleLike: (sku: string) => void;
  activatedOffers: Set<string>;
  activateOffer: (sku: string) => void;
  savingsTransactions: SavingsTransaction[];
  recordSaving: (transaction: SavingsTransaction) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [likedOffers, setLikedOffers] = useState<Set<string>>(new Set());
  const [activatedOffers, setActivatedOffers] = useState<Set<string>>(new Set());
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>([
    { sku: 'mkt-001', merchant: '7-Eleven', date: 'Jun 20, 2026', amount: 2.45 },
    { sku: 'rst-001', merchant: 'Le Bernardin', date: 'Jun 15, 2026', amount: 45.00 },
    { sku: 'mkt-002', merchant: 'Whole Foods', date: 'Jun 10, 2026', amount: 8.52 },
  ]);

  const toggleLike = (sku: string) => {
    setLikedOffers((prev) => {
      const next = new Set(prev);
      if (next.has(sku)) {
        next.delete(sku);
      } else {
        next.add(sku);
      }
      return next;
    });
  };

  const activateOffer = (sku: string) => {
    setActivatedOffers((prev) => {
      const next = new Set(prev);
      next.add(sku);
      return next;
    });
  };

  const recordSaving = (transaction: SavingsTransaction) => {
    setSavingsTransactions((prev) => [transaction, ...prev]);
  };

  return (
    <SessionContext.Provider value={{ likedOffers, toggleLike, activatedOffers, activateOffer, savingsTransactions, recordSaving }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
