/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { USER, AFFINITY_PRESETS } from '../config';
import { resetDySession, informAffinityPreset, establishFreshDyid } from '../lib/dyServerApi';

const CARD_TIER_STORAGE_KEY = 'cardholder.offers.tier';
const USER_VARIABLES_STORAGE_KEY = 'cardholder.offers.userVariables';

function isCardType(value: string): value is CardType {
  return value === 'Standard' || value === 'Premium' || value === 'Black';
}

export type CardType = 'Standard' | 'Premium' | 'Black';

export interface UserVariables {
  name: string;
  cardType: CardType;
  points: number;
}

function parseStoredUserVariables(raw: string | null): UserVariables | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<UserVariables>;
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    if (typeof parsed.name !== 'string' || !isCardType(String(parsed.cardType)) || typeof parsed.points !== 'number') {
      return null;
    }

    return {
      name: parsed.name,
      cardType: parsed.cardType,
      points: parsed.points,
    };
  } catch {
    return null;
  }
}

interface CardContextType {
  cardType: CardType;
  setCardType: (type: CardType) => void;
  isAgentOpen: boolean;
  setIsAgentOpen: (open: boolean) => void;
  points: number;
  setPoints: (points: number) => void;
  userVariables: UserVariables | null;
  setUserVariables: (value: UserVariables | null) => void;
  showAffinityModal: boolean;
  pendingCardType: CardType | null;
  handleCardTypePending: (type: CardType) => void;
  confirmCardTypeChange: (usePreset: boolean) => Promise<void>;
  cancelCardTypeChange: () => void;
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
  const [userVariables, setUserVariables] = useState<UserVariables | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    return parseStoredUserVariables(window.localStorage.getItem(USER_VARIABLES_STORAGE_KEY));
  });
  const [showAffinityModal, setShowAffinityModal] = useState(false);
  const [pendingCardType, setPendingCardType] = useState<CardType | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(CARD_TIER_STORAGE_KEY, cardType);
  }, [cardType]);

  useEffect(() => {
    setUserVariables((prev) => {
      if (!prev || prev.cardType === cardType) {
        return prev;
      }

      return {
        ...prev,
        cardType,
      };
    });
  }, [cardType]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!userVariables) {
      window.localStorage.removeItem(USER_VARIABLES_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(USER_VARIABLES_STORAGE_KEY, JSON.stringify(userVariables));
  }, [userVariables]);

  const handleCardTypePending = (newType: CardType) => {
    if (newType !== cardType) {
      setPendingCardType(newType);
      setShowAffinityModal(true);
    }
  };

  const cancelCardTypeChange = () => {
    setShowAffinityModal(false);
    setPendingCardType(null);
  };

  const confirmCardTypeChange = async (usePreset: boolean) => {
    if (!pendingCardType) return;

    const nextCardType = pendingCardType;

    try {
      // Always reset DY session to get a fresh dyid for the new tier demo
      resetDySession();

      // Persist the pending tier immediately
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(CARD_TIER_STORAGE_KEY, nextCardType);
      }

      // For "Start Fresh" mode: reload to clear all state and DY script cache
      if (!usePreset && typeof window !== 'undefined') {
        setShowAffinityModal(false);
        setPendingCardType(null);
        window.location.reload();
        return;
      }

      // For "Start with Preset" mode: 
      // 1. Reset dyid, then call a choose endpoint to get a fresh dyid from DY
      // 2. Send affinity preset data with the fresh dyid (passed explicitly)
      // 3. Give DY time to register the affinity before choose calls fire
      if (usePreset) {
        // Small delay to ensure cookies are cleared
        await new Promise((resolve) => setTimeout(resolve, 50));

        // Call choose endpoint and extract the fresh dyid directly from the response
        const freshDyid = await establishFreshDyid('/', nextCardType);

        // Send affinity preset data with the fresh dyid passed explicitly
        const presetData = AFFINITY_PRESETS[nextCardType];
        await informAffinityPreset(presetData, freshDyid ?? undefined);

        // Wait for DY to process and register the affinity event before
        // triggering the choose calls in Home component
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      setCardType(nextCardType);
    } catch (error) {
      console.error('Error during card type change:', error);
    } finally {
      // Close modal
      setShowAffinityModal(false);
      setPendingCardType(null);
    }
  };

  return (
    <CardContext.Provider
      value={{
        cardType,
        setCardType,
        isAgentOpen,
        setIsAgentOpen,
        points,
        setPoints,
        userVariables,
        setUserVariables,
        showAffinityModal,
        pendingCardType,
        handleCardTypePending,
        confirmCardTypeChange,
        cancelCardTypeChange,
      }}
    >
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
