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
    { sku: 'ret-001', merchant: 'Walmart', date: 'Jun 22, 2026', amount: 4.57 },
    { sku: 'phm-001', merchant: 'CVS Pharmacy', date: 'Jun 20, 2026', amount: 2.83 },
    { sku: 'gro-001', merchant: 'Costco', date: 'Jun 18, 2026', amount: 10.25 },
    { sku: 'gas-001', merchant: 'Shell Gas Station', date: 'Jun 15, 2026', amount: 5.50 },
    { sku: 'food-001', merchant: 'McDonald\'s', date: 'Jun 12, 2026', amount: 3.40 },
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
