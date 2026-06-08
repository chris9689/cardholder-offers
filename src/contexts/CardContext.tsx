/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { USER } from '../config';

const CARD_TIER_STORAGE_KEY = 'cardholder.offers.tier';

function isCardType(value: string): value is CardType {
  return value === 'Standard' || value === 'Premium' || value === 'Black';
}

export type CardType = 'Standard' | 'Premium' | 'Black';

interface CardContextType {
  cardType: CardType;
  setCardType: (type: CardType) => void;
  isAgentOpen: boolean;
  setIsAgentOpen: (open: boolean) => void;
  points: number;
  setPoints: (points: number) => void;
}

const CardContext = createContext<CardContextType | undefined>(undefined);

export function CardProvider({ children }: { children: ReactNode }) {
  const [cardType, setCardType] = useState<CardType>(() => {
    if (typeof window === 'undefined') {
      return USER.defaultCardType;
    }

    const storedTier = window.localStorage.getItem(CARD_TIER_STORAGE_KEY);
    return storedTier && isCardType(storedTier) ? storedTier : USER.defaultCardType;
  });
  const [isAgentOpen, setIsAgentOpen] = useState(false);
  const [points, setPoints] = useState(USER.initialPoints);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(CARD_TIER_STORAGE_KEY, cardType);
  }, [cardType]);

  return (
    <CardContext.Provider value={{ cardType, setCardType, isAgentOpen, setIsAgentOpen, points, setPoints }}>
      {children}
    </CardContext.Provider>
  );
}

export function useCard() {
  const context = useContext(CardContext);
  if (context === undefined) {
    throw new Error('useCard must be used within a CardProvider');
  }
  return context;
}
