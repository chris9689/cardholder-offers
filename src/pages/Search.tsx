/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Sparkles, ArrowRight, ChevronLeft, ChevronDown, ChevronUp, X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DyOfferCard from '../components/DyOfferCard';
import { performDySearch, DySearchFacet, DySearchResult } from '../lib/dyServerApi';
import { useCard } from '../contexts/CardContext';

const PAGE_SIZE = 25;
const FACET_PREVIEW_COUNT = 6;

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function FacetPanel({
  facets,
  activeFilters,
  onToggle,
  onClear,
}: {
  facets: DySearchFacet[];
  activeFilters: Record<string, string[]>;
  onToggle: (column: string, value: string) => void;
  onClear: () => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showAllValues, setShowAllValues] = useState<Record<string, boolean>>({});
  const hasActive = Object.values(activeFilters).some((v) => v.length > 0);

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="bg-white rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-outline-variant/10">
          <span className="font-sans text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
            <SlidersHorizontal size={13} /> Filters
          </span>
          {hasActive && (
            <button
              onClick={onClear}
              className="text-[10px] font-black uppercase tracking-wider text-secondary hover:text-primary transition-colors flex items-center gap-1"
            >
              <X size={11} /> Clear all
            </button>
          )}
        </div>

        {facets.map((facet) => {
          const isOpen = expanded[facet.column] !== false;
          const isShowingAllValues = showAllValues[facet.column] === true;
          const active = activeFilters[facet.column] ?? [];
          const visibleValues = isShowingAllValues
            ? facet.values
            : facet.values.filter((value, index) => index < FACET_PREVIEW_COUNT || active.includes(value.name));
          const canToggleShowAll = facet.values.length > FACET_PREVIEW_COUNT;

          return (
            <div key={facet.column} className="border-b border-outline-variant/10 last:border-b-0">
              <button
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-surface-container/40 transition-colors"
                onClick={() => setExpanded((prev) => ({ ...prev, [facet.column]: !isOpen }))}
              >
                <span className="font-sans text-xs font-black uppercase tracking-wider text-on-surface-variant">
                  {facet.displayName}
                  {active.length > 0 && (
                    <span className="ml-2 bg-secondary text-white text-[9px] px-1.5 py-0.5 rounded-full font-black">
                      {active.length}
                    </span>
                  )}
                </span>
                {isOpen ? <ChevronUp size={13} className="text-on-surface-variant" /> : <ChevronDown size={13} className="text-on-surface-variant" />}
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 flex flex-col gap-2">
                      {visibleValues.map((v) => {
                        const checked = active.includes(v.name);
                        return (
                          <label key={v.name} className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => onToggle(facet.column, v.name)}
                              className="accent-black w-3.5 h-3.5 rounded shrink-0"
                            />
                            <span className="font-sans text-xs text-on-surface-variant group-hover:text-primary transition-colors capitalize truncate">
                              {capitalize(v.name)}
                            </span>
                            <span className="ml-auto font-sans text-[10px] text-on-surface-variant/50 shrink-0">
                              {v.count}
                            </span>
                          </label>
                        );
                      })}
                      {canToggleShowAll && (
                        <button
                          type="button"
                          onClick={() =>
                            setShowAllValues((prev) => ({
                              ...prev,
                              [facet.column]: !isShowingAllValues,
                            }))
                          }
                          className="mt-1 text-left font-sans text-[10px] font-black uppercase tracking-wider text-secondary hover:text-primary transition-colors"
                        >
                          {isShowingAllValues ? 'Show less' : `Show more (${facet.values.length - FACET_PREVIEW_COUNT})`}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </aside>
  );
}

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawQuery = searchParams.get('q') || '';
  const [inputVal, setInputVal] = useState(rawQuery);
  const { cardType, setIsAgentOpen } = useCard();
  const [result, setResult] = useState<DySearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const runSearch = useCallback(
    async (query: string, newOffset: number, filters: Record<string, string[]>) => {
      if (!query.trim()) {
        setResult(null);
        return;
      }
      setLoading(true);
      try {
        const data = await performDySearch(query, '/search', cardType, newOffset, PAGE_SIZE, filters);
        if (newOffset === 0) {
          setResult(data);
        } else {
          setResult((prev) =>
            prev
              ? { ...data, slots: [...prev.slots, ...data.slots], facets: prev.facets }
              : data,
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [cardType],
  );

  useEffect(() => {
    setOffset(0);
    setActiveFilters({});
    setInputVal(rawQuery);
    runSearch(rawQuery, 0, {});
  }, [rawQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(inputVal.trim() ? { q: inputVal.trim() } : {});
  };

  const handleToggleFilter = (column: string, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[column] ?? [];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      const updated = { ...prev, [column]: next };
      setOffset(0);
      runSearch(rawQuery, 0, updated);
      return updated;
    });
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setOffset(0);
    runSearch(rawQuery, 0, {});
  };

  const handleLoadMore = () => {
    const newOffset = offset + PAGE_SIZE;
    setOffset(newOffset);
    runSearch(rawQuery, newOffset, activeFilters);
  };

  const slots = result?.slots ?? [];
  const facets = result?.facets ?? [];
  const totalNumResults = result?.totalNumResults ?? 0;
  const hasMore = slots.length < totalNumResults;

  return (
    <div className="pt-24 min-h-screen bg-surface">
      {/* Header */}
      <section className="bg-white border-b border-outline-variant/10 py-16 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-max-width mx-auto">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-secondary mb-6 hover:text-primary transition-colors"
          >
            <ChevronLeft size={14} /> Back to home
          </Link>

          <span className="font-sans text-[10px] font-black text-secondary uppercase tracking-[0.4em] mb-4 block">
            Spending Offers Search
          </span>
          <h1 className="text-4xl md:text-5xl text-primary font-black mb-4 tracking-tighter uppercase not-italic">
            Search Results
          </h1>
          <p className="font-sans text-on-surface-variant text-base max-w-2xl font-light leading-relaxed opacity-70">
            {rawQuery ? (
              <span>
                Showing offers matching &ldquo;<span className="text-primary font-bold">{rawQuery}</span>&rdquo;.
              </span>
            ) : (
              <span>Explore all available offers and benefits.</span>
            )}
          </p>

          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 flex items-center bg-surface-container/50 px-6 py-4 rounded-2xl md:rounded-3xl border border-outline-variant/10 w-full max-w-2xl shadow-sm focus-within:border-primary/20 focus-within:ring-2 focus-within:ring-primary/5 transition-all"
          >
            <Search className="text-on-surface-variant mr-4 shrink-0" size={20} />
            <input
              className="bg-transparent border-none focus:ring-0 text-base w-full p-0 font-sans font-bold placeholder:text-on-surface-variant/30 text-primary"
              placeholder="Search offers, merchants, or categories..."
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
            />
            <button
              type="submit"
              className="ml-4 bg-primary text-white hover:bg-secondary px-6 py-2.5 rounded-xl font-sans text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-1.5"
            >
              <span>Search</span>
              <ArrowRight size={12} />
            </button>
          </form>
        </div>
      </section>

      {/* Main */}
      <section className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-12">
        {rawQuery && (
          <div className="flex justify-between items-center mb-8 border-b border-outline-variant/10 pb-4">
            <span className="font-sans text-[10px] font-black uppercase tracking-widest text-secondary bg-secondary/5 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
              <Sparkles size={12} className="text-secondary" />
              {loading && slots.length === 0 ? 'Searching…' : `${totalNumResults} offer${totalNumResults !== 1 ? 's' : ''} found`}
            </span>

            {facets.length > 0 && (
              <button
                className="md:hidden font-sans text-[10px] font-black uppercase tracking-wider text-primary flex items-center gap-1.5 border border-outline-variant/20 px-4 py-2 rounded-xl"
                onClick={() => setMobileFiltersOpen((v) => !v)}
              >
                <SlidersHorizontal size={12} /> Filters
              </button>
            )}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {facets.length > 0 && (
            <>
              <div className="hidden md:block">
                <FacetPanel
                  facets={facets}
                  activeFilters={activeFilters}
                  onToggle={handleToggleFilter}
                  onClear={handleClearFilters}
                />
              </div>
              <AnimatePresence>
                {mobileFiltersOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="md:hidden w-full"
                  >
                    <FacetPanel
                      facets={facets}
                      activeFilters={activeFilters}
                      onToggle={handleToggleFilter}
                      onClear={handleClearFilters}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          <div className="flex-1 min-w-0">
            {loading && slots.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-outline-variant/20 h-64 animate-pulse" />
                ))}
              </div>
            ) : slots.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {slots.map((slot, idx) => (
                    <motion.div
                      key={`${slot.sku}-${idx}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: Math.min(idx, 8) * 0.05, ease: 'easeOut' }}
                    >
                      <DyOfferCard slot={slot} />
                    </motion.div>
                  ))}
                </div>

                {hasMore && (
                  <div className="mt-12 flex justify-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="bg-primary text-white hover:bg-secondary disabled:opacity-50 px-10 py-3.5 rounded-xl font-sans text-[10px] font-black uppercase tracking-widest transition-all shadow-md"
                    >
                      {loading ? 'Loading…' : `Load More (${totalNumResults - slots.length} remaining)`}
                    </button>
                  </div>
                )}
              </>
            ) : rawQuery ? (
              <div className="text-center py-20 bg-white/50 border border-dashed border-outline-variant/30 rounded-4xl max-w-xl mx-auto px-8">
                <div className="w-16 h-16 rounded-full bg-surface-container mx-auto flex items-center justify-center text-on-surface-variant mb-6">
                  <Sparkles size={28} className="opacity-45" />
                </div>
                <h4 className="text-lg font-black uppercase text-primary mb-2">No matching benefits found</h4>
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed opacity-70 mb-8">
                  We couldn&rsquo;t find any rewards matching &ldquo;{rawQuery}&rdquo;. Try using terms like &ldquo;hotel&rdquo;,
                  &ldquo;dining&rdquo;, &ldquo;credit&rdquo;, or &ldquo;cashback&rdquo;. Or consult with our AI Assistant for tailored
                  benefits!
                </p>
                <button
                  onClick={() => setIsAgentOpen(true)}
                  className="bg-primary text-white hover:bg-secondary px-6 py-3.5 rounded-xl font-sans text-[10px] font-black uppercase tracking-wider transition-all shadow-md"
                >
                  Ask AI Assistant for advice
                </button>
              </div>
            ) : (
              <div className="text-center py-20 text-on-surface-variant opacity-50">
                <Search size={40} className="mx-auto mb-4" />
                <p className="font-sans text-sm font-bold uppercase tracking-wider">Enter a search term to find offers</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
