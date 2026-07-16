/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Inspector — right-hand personalization panel. Every lever visibly re-drives
 * generation so a presenter can tell the "same content, personalized
 * differently" story live.
 */

import React from 'react';
import { RefreshCw, Sun, Moon } from 'lucide-react';
import { useChannelStudio } from '../ChannelStudioProvider';
import { SEGMENTS } from '../segments/segmentRegistry';
import { getFeedCountries } from '../../../lib/productFeed';
import type { CardType } from '../../../contexts/CardContext';
import type { DeviceTheme } from '../types';

const TIERS: CardType[] = ['Standard', 'Premium', 'Black'];
const FALLBACK_COUNTRIES = ['United States', 'France', 'Italy', 'United Arab Emirates', 'Japan'];
// Prefer the countries that actually back real offers in the products feed.
const feedCountries = getFeedCountries();
const COUNTRIES = feedCountries.length > 0 ? feedCountries : FALLBACK_COUNTRIES;

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2.5">{children}</div>;
}

export default function Inspector() {
  const { config, updateConfig, regenerate, contextSnapshot } = useChannelStudio();
  const activeSegment = SEGMENTS.find((segment) => segment.id === config.segmentId);

  return (
    <div className="h-full flex flex-col overflow-y-auto p-5" style={{ width: 288 }}>
      <div className="text-[13px] font-black uppercase tracking-widest text-white mb-1">Personalization</div>
      {contextSnapshot && (
        <div className="text-[11px] text-white/40 mb-5">
          Source: {contextSnapshot.pageLabel} • {contextSnapshot.products.length} products
        </div>
      )}

      {/* Card tier */}
      <SectionLabel>Card Tier</SectionLabel>
      <div className="grid grid-cols-3 gap-1.5 mb-6">
        {TIERS.map((tier) => (
          <button
            key={tier}
            onClick={() => updateConfig({ tier })}
            className={`rounded-xl py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
              config.tier === tier ? 'bg-white text-black shadow' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {tier}
          </button>
        ))}
      </div>

      {/* Segment */}
      <SectionLabel>Segment</SectionLabel>
      <select
        value={config.segmentId}
        onChange={(event) => updateConfig({ segmentId: event.target.value })}
        className="w-full rounded-xl bg-white/10 text-white text-[13px] font-semibold px-3 py-2.5 outline-none border border-white/10 focus:border-white/30"
      >
        {SEGMENTS.map((segment) => (
          <option key={segment.id} value={segment.id} className="text-black">
            {segment.label}
          </option>
        ))}
      </select>
      {activeSegment?.description ? (
        <p className="text-[10px] text-white/35 mt-2 mb-6 leading-relaxed">{activeSegment.description}</p>
      ) : (
        <div className="mb-6" />
      )}

      {/* Locale / country */}
      <SectionLabel>Locale</SectionLabel>
      <select
        value={config.country}
        onChange={(event) => updateConfig({ country: event.target.value })}
        className="w-full rounded-xl bg-white/10 text-white text-[13px] font-semibold px-3 py-2.5 mb-6 outline-none border border-white/10 focus:border-white/30"
      >
        {COUNTRIES.map((country) => (
          <option key={country} value={country} className="text-black">
            {country}
          </option>
        ))}
      </select>

      {/* Device theme */}
      <SectionLabel>Device Theme</SectionLabel>
      <div className="grid grid-cols-2 gap-1.5 mb-6">
        {(['light', 'dark'] as DeviceTheme[]).map((theme) => (
          <button
            key={theme}
            onClick={() => updateConfig({ theme })}
            className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-[11px] font-bold uppercase tracking-wider transition-all ${
              config.theme === theme ? 'bg-white text-black shadow' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {theme === 'light' ? <Sun size={14} /> : <Moon size={14} />}
            {theme}
          </button>
        ))}
      </div>

      {/* Sender name */}
      <SectionLabel>Sender Name</SectionLabel>
      <input
        value={config.senderName}
        onChange={(event) => updateConfig({ senderName: event.target.value })}
        className="w-full rounded-xl bg-white/10 text-white text-[13px] font-semibold px-3 py-2.5 mb-6 outline-none border border-white/10 focus:border-white/30"
        placeholder="Sender name"
      />

      <div className="flex-1" />

      {/* Variants / regenerate */}
      <button
        onClick={regenerate}
        className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white text-black py-3.5 text-[12px] font-black uppercase tracking-widest hover:bg-white/90 active:scale-[0.98] transition-all"
      >
        <RefreshCw size={15} strokeWidth={2.5} />
        New Variant
      </button>
      <p className="text-[10px] text-white/35 text-center mt-2.5 leading-relaxed">
        Generates a fresh variant using the current personalization inputs.
      </p>
    </div>
  );
}
