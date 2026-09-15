/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { X, Fingerprint, BarChart3, Sparkles, Layers, ChevronRight } from 'lucide-react';
import { CardType } from '../contexts/CardContext';
import {
  fetchUserAffinityAttributes,
  chooseHomepageGroup,
  DyRecommendationSlot,
} from '../lib/dyServerApi';

interface AffinityProfileOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  cardType: CardType;
}

type TabKey = 'top' | 'recs' | 'full';

type AttributeMap = Record<string, Record<string, number>>;

// Distinct colors per known attribute; unknown attributes fall back in order.
const ATTR_META: Record<string, { label: string; color: string }> = {
  offer_country: { label: 'Offer Country', color: '#7c3aed' },
  categories: { label: 'Categories', color: '#0d9488' },
  brand: { label: 'Brand', color: '#e11d48' },
};
const FALLBACK_COLORS = ['#775a19', '#2563eb', '#db2777', '#059669', '#9333ea', '#ea580c'];

function prettify(value: string): string {
  return value
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function attrMeta(attr: string, index: number): { label: string; color: string } {
  return ATTR_META[attr] ?? { label: prettify(attr), color: FALLBACK_COLORS[index % FALLBACK_COLORS.length] };
}

export default function AffinityProfileOverlay({ isOpen, onClose, cardType }: AffinityProfileOverlayProps) {
  const [attributes, setAttributes] = useState<AttributeMap | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('top');
  const [recs, setRecs] = useState<DyRecommendationSlot[]>([]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    let mounted = true;
    setIsLoading(true);
    setActiveTab('top');

    void fetchUserAffinityAttributes().then((result) => {
      if (!mounted) {
        return;
      }
      if (result && Object.keys(result.attributes).length > 0) {
        setAttributes(result.attributes);
        setUid(result.uid);
      } else {
        setAttributes({});
        setUid(null);
      }
      setIsLoading(false);
    });

    void chooseHomepageGroup('/', cardType, { page_type: 'affinity' }).then((result) => {
      if (mounted) {
        setRecs(result.recommendations ?? []);
      }
    });

    return () => {
      mounted = false;
    };
  }, [isOpen, cardType]);

  const orderedAttributes = useMemo(() => {
    if (!attributes) {
      return [] as Array<[string, Record<string, number>]>;
    }
    const priority = ['offer_country', 'categories', 'brand'];
    return Object.entries(attributes).sort(
      (a, b) => (priority.indexOf(a[0]) + 100 * (priority.indexOf(a[0]) < 0 ? 1 : 0)) -
        (priority.indexOf(b[0]) + 100 * (priority.indexOf(b[0]) < 0 ? 1 : 0)),
    );
  }, [attributes]);

  const colorByAttr = useMemo(() => {
    const map: Record<string, string> = {};
    orderedAttributes.forEach(([attr], i) => {
      map[attr] = attrMeta(attr, i).color;
    });
    return map;
  }, [orderedAttributes]);

  const bubbles = useMemo(() => {
    const items: Array<{ attr: string; value: string; score: number }> = [];
    orderedAttributes.forEach(([attr, values]) => {
      Object.entries(values)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .forEach(([value, score]) => items.push({ attr, value, score }));
    });
    return items.sort((a, b) => b.score - a.score).slice(0, 8);
  }, [orderedAttributes]);

  const maxBubbleScore = Math.max(1, ...bubbles.map((b) => b.score));

  const tabs: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
    { key: 'top', label: 'Top Values', icon: <Sparkles size={13} /> },
    { key: 'recs', label: 'Recommendations', icon: <Layers size={13} /> },
    { key: 'full', label: 'Full Score', icon: <BarChart3 size={13} /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-full sm:w-115 bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-5 border-b border-outline-variant/10 shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-black text-primary tracking-tight flex items-center gap-2">
                    <Fingerprint size={20} className="text-secondary" /> Your Affinity Profile
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="w-9 h-9 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors shrink-0"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mt-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${
                      activeTab === tab.key
                        ? 'bg-primary text-white'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                  <Fingerprint size={40} className="text-outline-variant animate-pulse" />
                  <p className="text-sm font-bold text-on-surface-variant/60 uppercase tracking-widest">
                    Reading your signals…
                  </p>
                </div>
              ) : (
                <>
                  {/* Legend */}
                  {activeTab !== 'recs' && (
                    <div className="flex flex-wrap gap-4 mb-8">
                      {orderedAttributes.map(([attr], i) => (
                        <div key={attr} className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-md"
                            style={{ backgroundColor: attrMeta(attr, i).color }}
                          />
                          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
                            {attrMeta(attr, i).label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === 'top' && (
                    <div className="flex flex-wrap items-center justify-center gap-4 py-4">
                      {bubbles.length === 0 ? (
                        <EmptyState />
                      ) : (
                        bubbles.map(({ attr, value, score }) => {
                          const size = 88 + (score / maxBubbleScore) * 84;
                          return (
                            <motion.div
                              key={`${attr}-${value}`}
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ type: 'spring', damping: 16, stiffness: 220 }}
                              className="rounded-full flex items-center justify-center text-center shadow-lg p-3"
                              style={{ width: size, height: size, backgroundColor: colorByAttr[attr] }}
                            >
                              <span className="text-white font-black uppercase tracking-tight leading-tight text-[13px] wrap-break-word">
                                {value}
                              </span>
                            </motion.div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {activeTab === 'full' && (
                    <div className="space-y-8">
                      {orderedAttributes.length === 0 ? (
                        <EmptyState />
                      ) : (
                        orderedAttributes.map(([attr, values], i) => {
                          const color = attrMeta(attr, i).color;
                          const entries = Object.entries(values).sort((a, b) => b[1] - a[1]);
                          const max = Math.max(1, ...entries.map(([, s]) => s));
                          return (
                            <div key={attr}>
                              <div className="flex items-center gap-2 mb-3">
                                <span className="w-3 h-3 rounded-md" style={{ backgroundColor: color }} />
                                <h3 className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">
                                  {attrMeta(attr, i).label}
                                </h3>
                              </div>
                              <div className="space-y-2.5">
                                {entries.map(([value, score]) => (
                                  <div key={value}>
                                    <div className="flex justify-between items-baseline mb-1">
                                      <span className="text-sm font-bold text-on-surface truncate pr-3">{value}</span>
                                      <span className="text-[11px] font-black text-on-surface-variant/60 tabular-nums shrink-0">
                                        {score.toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="h-2 rounded-full bg-surface-container overflow-hidden">
                                      <div
                                        className="h-full rounded-full"
                                        style={{ width: `${(score / max) * 100}%`, backgroundColor: color }}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {activeTab === 'recs' && (
                    <div className="divide-y divide-outline-variant/10">
                      {recs.length === 0 ? (
                        <EmptyState message="No personalized recommendations available for this session yet." />
                      ) : (
                        recs.slice(0, 6).map((slot) => (
                          <AffinityRecRow key={slot.slotId || slot.sku} slot={slot} />
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-outline-variant/10 shrink-0">
              <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest truncate">
                {uid ? `Session · ${uid}` : 'New session'}
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function EmptyState({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 w-full">
      <Sparkles size={36} className="text-outline-variant" />
      <p className="text-sm font-bold text-on-surface-variant/60 max-w-xs">
        {message ?? 'Your affinity profile is currently empty. Browse offers to start building your affinity scores.'}
      </p>
    </div>
  );
}

function AffinityRecRow({ slot }: { slot: DyRecommendationSlot }) {
  const { productData, sku } = slot;
  const brand = productData.brand ?? sku;

  return (
    <Link
      to={`/offers/${encodeURIComponent(sku)}`}
      className="py-4 flex items-center justify-between gap-4 hover:bg-surface-container-low transition-colors group"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white border border-outline-variant/10 flex items-center justify-center shrink-0">
          {productData.image_url ? (
            <img src={productData.image_url} alt={brand} className="w-full h-full object-cover" />
          ) : productData.logo_url ? (
            <img src={productData.logo_url} alt={brand} className="w-full h-full object-contain p-1" />
          ) : (
            <span className="font-black text-primary text-sm">{brand.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="font-sans font-black text-primary text-sm md:text-base leading-tight line-clamp-2">
            {productData.name}
          </h3>
          <p className="font-sans text-[11px] font-bold text-on-surface-variant/50 uppercase tracking-[0.15em] mt-1 truncate">
            {brand}
          </p>
        </div>
      </div>
      <ChevronRight size={18} className="text-outline-variant group-hover:text-primary transition-colors shrink-0" />
    </Link>
  );
}
