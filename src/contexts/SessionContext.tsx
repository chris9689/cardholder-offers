/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { trackProductView } from '../lib/dyServerApi';

export interface SavingsTransaction {
  sku: string;
  merchant: string;
  date: string;
  amount: number;
}

const STORAGE_KEYS = {
  liked: 'cardholder.offers.likedOffers',
  activated: 'cardholder.offers.activatedOffers',
  savings: 'cardholder.offers.savingsTransactions',
} as const;

const DEFAULT_SAVINGS: SavingsTransaction[] = [
  { sku: 'ret-001', merchant: 'Walmart', date: 'Jun 22, 2026', amount: 4.57 },
  { sku: 'phm-001', merchant: 'CVS Pharmacy', date: 'Jun 20, 2026', amount: 2.83 },
  { sku: 'gro-001', merchant: 'Costco', date: 'Jun 18, 2026', amount: 10.25 },
  { sku: 'gas-001', merchant: 'Shell Gas Station', date: 'Jun 15, 2026', amount: 5.50 },
  { sku: 'food-001', merchant: 'McDonald\'s', date: 'Jun 12, 2026', amount: 3.40 },
];

function loadStringSet(key: string): Set<string> {
  if (typeof window === 'undefined') {
    return new Set();
  }
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? new Set(parsed.filter((v): v is string => typeof v === 'string')) : new Set();
  } catch {
    return new Set();
  }
}

function loadSavings(): SavingsTransaction[] {
  if (typeof window === 'undefined') {
    return DEFAULT_SAVINGS;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.savings);
    if (!raw) {
      return DEFAULT_SAVINGS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_SAVINGS;
  } catch {
    return DEFAULT_SAVINGS;
  }
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

// Clears persisted session data so a fresh session (e.g. tier change) starts
// with no activated/liked offers or savings history.
export function clearStoredSession(): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEYS.liked);
  window.localStorage.removeItem(STORAGE_KEYS.activated);
  window.localStorage.removeItem(STORAGE_KEYS.savings);
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [likedOffers, setLikedOffers] = useState<Set<string>>(() => loadStringSet(STORAGE_KEYS.liked));
  const [activatedOffers, setActivatedOffers] = useState<Set<string>>(() => loadStringSet(STORAGE_KEYS.activated));
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>(() => loadSavings());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.liked, JSON.stringify([...likedOffers]));
  }, [likedOffers]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.activated, JSON.stringify([...activatedOffers]));
  }, [activatedOffers]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEYS.savings, JSON.stringify(savingsTransactions));
  }, [savingsTransactions]);

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
    // Fire a DY product-view only the first time a SKU is activated.
    if (!activatedOffers.has(sku)) {
      void trackProductView(sku);
    }
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
