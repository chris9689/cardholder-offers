/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ChannelStudioProvider — dedicated, isolated state for the Channel Studio.
 *
 * Deliberately separate from CardContext so the feature stays removable and
 * never triggers re-renders in the host app. It READS CardContext for sensible
 * defaults on open, then keeps its own local config the user can tweak without
 * mutating the real app.
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router-dom';
import { useCard, COUNTRY_EVERYWHERE } from '../../contexts/CardContext';
import { USER } from '../../config';
import { collectContext } from './content/contextCollector';
import { getProvider } from './content/ContentProvider';
import { getSegment, DEFAULT_SEGMENT_ID } from './segments/segmentRegistry';
import { getFeedCountries } from '../../lib/productFeed';
import type {
  ChannelContent,
  ChannelId,
  GenerationContext,
  StudioConfig,
  StudioStatus,
} from './types';

interface ChannelResult {
  status: StudioStatus;
  content: ChannelContent | null;
}

type DeviceMode = 'single' | 'compare';

/**
 * Representative persona per card tier. Switching the tier lever swaps the
 * recipient so the personalization connection (tier → real cardholder) is
 * visible in every channel. Backend-configurable in a real deployment.
 */
const TIER_PERSONAS: Record<string, { name: string; points: number }> = {
  Standard: { name: 'Daniel Carter', points: 42800 },
  Premium: { name: 'Michael Sterling', points: 125400 },
  Black: { name: 'Sophia Laurent', points: 486200 },
};

interface ChannelStudioContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  activeChannel: ChannelId;
  setActiveChannel: (channel: ChannelId) => void;
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
  config: StudioConfig;
  updateConfig: (patch: Partial<StudioConfig>) => void;
  variantIndex: number;
  regenerate: () => void;
  results: Record<ChannelId, ChannelResult>;
  contextSnapshot: GenerationContext | null;
}

const emptyResults = {
  push: { status: 'idle', content: null },
  email: { status: 'idle', content: null },
} as Record<ChannelId, ChannelResult>;

const ChannelStudioContext = createContext<ChannelStudioContextValue | undefined>(undefined);

export function ChannelStudioProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { cardType, selectedCountry, points, userVariables } = useCard();

  const [isOpen, setIsOpen] = useState(false);
  const [activeChannel, setActiveChannel] = useState<ChannelId>('push');
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('single');
  const [variantIndex, setVariantIndex] = useState(0);
  const [contextSnapshot, setContextSnapshot] = useState<GenerationContext | null>(null);
  const [results, setResults] = useState<Record<ChannelId, ChannelResult>>(emptyResults);

  const displayName = userVariables?.name ?? USER.name;
  const displayTier = userVariables?.cardType ?? cardType;

  // Default the locale to a country actually backed by real offers in the feed
  // so the initial preview surfaces genuine offers.
  const feedCountries = getFeedCountries();
  const defaultCountry =
    selectedCountry !== COUNTRY_EVERYWHERE && selectedCountry
      ? selectedCountry
      : feedCountries[0] ?? 'United States';

  const [config, setConfig] = useState<StudioConfig>({
    tier: displayTier,
    country: defaultCountry,
    theme: 'dark',
    senderName: 'Spending Offers',
    segmentId: DEFAULT_SEGMENT_ID,
  });

  const generationToken = useRef(0);

  const buildContext = useCallback(
    (base: GenerationContext): GenerationContext => {
      const persona = TIER_PERSONAS[config.tier];
      const name = persona?.name ?? base.user.name;
      const firstName = name.split(' ')[0] || name;
      return {
        ...base,
        user: {
          ...base.user,
          name,
          firstName,
          cardType: config.tier,
          country: config.country,
        },
      };
    },
    [config.tier, config.country],
  );

  const generate = useCallback(
    async (channel: ChannelId, base: GenerationContext, variant: number) => {
      const token = generationToken.current;
      setResults((prev) => ({ ...prev, [channel]: { status: 'loading', content: null } }));
      try {
        const provider = getProvider();
        const content = await provider.generate({
          channel,
          context: buildContext(base),
          variant,
          senderName: config.senderName,
          segment: getSegment(config.segmentId),
        });
        if (token !== generationToken.current) {
          return;
        }
        setResults((prev) => ({ ...prev, [channel]: { status: 'ready', content } }));
      } catch {
        if (token !== generationToken.current) {
          return;
        }
        setResults((prev) => ({ ...prev, [channel]: { status: 'error', content: null } }));
      }
    },
    [buildContext, config.senderName, config.segmentId],
  );

  const visibleChannels = useMemo<ChannelId[]>(
    () => (deviceMode === 'compare' ? ['push', 'email'] : [activeChannel]),
    [deviceMode, activeChannel],
  );

  // (Re)generate whenever the open studio's inputs change.
  useEffect(() => {
    if (!isOpen || !contextSnapshot) {
      return;
    }
    for (const channel of visibleChannels) {
      void generate(channel, contextSnapshot, variantIndex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, contextSnapshot, visibleChannels, variantIndex, config.tier, config.country, config.senderName, config.segmentId]);

  const open = useCallback(() => {
    const snapshot = collectContext({
      pathname,
      userName: displayName,
      cardType: config.tier,
      points: userVariables?.points ?? points,
      country: config.country,
    });
    generationToken.current += 1;
    setResults(emptyResults);
    setContextSnapshot(snapshot);
    setIsOpen(true);
  }, [pathname, displayName, config.tier, config.country, points, userVariables]);

  // Re-collect the offer pool whenever the tier or country affinity changes
  // while open, so the previewed offers (not just the copy) reflect the lever.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const snapshot = collectContext({
      pathname,
      userName: displayName,
      cardType: config.tier,
      points: userVariables?.points ?? points,
      country: config.country,
    });
    setContextSnapshot(snapshot);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.tier, config.country, pathname]);

  const close = useCallback(() => {
    generationToken.current += 1;
    setIsOpen(false);
  }, []);

  const updateConfig = useCallback((patch: Partial<StudioConfig>) => {
    generationToken.current += 1;
    setConfig((prev) => ({ ...prev, ...patch }));
  }, []);

  const regenerate = useCallback(() => {
    generationToken.current += 1;
    setVariantIndex((prev) => prev + 1);
  }, []);

  // Lock body scroll while the studio is open; always cleaned up on close.
  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') {
      return;
    }
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // ESC closes the studio.
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  const value = useMemo<ChannelStudioContextValue>(
    () => ({
      isOpen,
      open,
      close,
      activeChannel,
      setActiveChannel,
      deviceMode,
      setDeviceMode,
      config,
      updateConfig,
      variantIndex,
      regenerate,
      results,
      contextSnapshot,
    }),
    [isOpen, open, close, activeChannel, deviceMode, config, updateConfig, variantIndex, regenerate, results, contextSnapshot],
  );

  return <ChannelStudioContext.Provider value={value}>{children}</ChannelStudioContext.Provider>;
}

export function useChannelStudio(): ChannelStudioContextValue {
  const context = useContext(ChannelStudioContext);
  if (!context) {
    throw new Error('useChannelStudio must be used within a ChannelStudioProvider');
  }
  return context;
}
