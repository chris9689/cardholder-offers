/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, MapPin, Sparkles, Filter, ChevronLeft, ArrowRight, Grid, List } from 'lucide-react';
import { motion } from 'motion/react';
import { OFFERS, NEAR_ME_OFFERS } from '../data/offers';
import OfferCard from '../components/OfferCard';
import { useCard } from '../contexts/CardContext';

const ALL_BOUTIQUE_BENEFITS = [...OFFERS, ...NEAR_ME_OFFERS];

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawQuery = searchParams.get('q') || '';
  const [inputVal, setInputVal] = useState(rawQuery);
  const { setIsAgentOpen } = useCard();

  // Filter items matching query
  const query = rawQuery.trim().toLowerCase();
  const results = ALL_BOUTIQUE_BENEFITS.filter(offer => {
    if (!query) return true;
    return (
      offer.merchant.toLowerCase().includes(query) ||
      offer.title.toLowerCase().includes(query) ||
      offer.description.toLowerCase().includes(query) ||
      offer.category.toLowerCase().includes(query)
    );
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: inputVal });
  };

  return (
    <div className="pt-24 min-h-screen bg-surface">
      {/* Header Bar */}
      <section className="bg-white border-b border-outline-variant/10 py-16 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-max-width mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-secondary mb-6 hover:text-primary transition-colors">
            <ChevronLeft size={14} /> Back to curated home
          </Link>
          
          <span className="font-sans text-[10px] font-black text-secondary uppercase tracking-[0.4em] mb-4 block">Card Benefits Search</span>
          <h1 className="text-4xl md:text-5xl text-primary font-black mb-4 tracking-tighter uppercase not-italic">
            Search Results
          </h1>
          <p className="font-sans text-on-surface-variant text-base max-w-2xl font-light leading-relaxed opacity-70">
            {rawQuery ? (
              <span>Showing offers matching &ldquo;<span className="text-primary font-bold">{rawQuery}</span>&rdquo;.</span>
            ) : (
              <span>Explore all available offers and benefits.</span>
            )}
          </p>

          {/* Search Bar Input */}
          <form onSubmit={handleSearchSubmit} className="mt-8 flex items-center bg-surface-container/50 px-6 py-4 rounded-2xl md:rounded-3xl border border-outline-variant/10 w-full max-w-2xl shadow-sm focus-within:border-primary/20 focus-within:ring-2 focus-within:ring-primary/5 transition-all">
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

      {/* Main Results Container */}
      <section className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <div className="flex justify-between items-center mb-8 border-b border-outline-variant/10 pb-4">
          <span className="font-sans text-[10px] font-black uppercase tracking-widest text-secondary bg-secondary/5 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Sparkles size={12} className="text-secondary" />
            {results.length} {results.length === 1 ? 'offer' : 'offers'} found
          </span>
          
          <div className="flex items-center gap-4">
            <Link to="/offers" className="font-sans text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors">
              Reset Filters
            </Link>
          </div>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((offer, idx) => (
              <motion.div
                key={offer.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05, ease: 'easeOut' }}
              >
                <OfferCard offer={offer} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/50 border border-dashed border-outline-variant/30 rounded-4xl max-w-xl mx-auto px-8">
            <div className="w-16 h-16 rounded-full bg-surface-container mx-auto flex items-center justify-center text-on-surface-variant mb-6">
              <Sparkles size={28} className="opacity-45" />
            </div>
            <h4 className="text-lg font-black uppercase text-primary mb-2">No matching benefits found</h4>
            <p className="font-sans text-xs text-on-surface-variant leading-relaxed opacity-70 mb-8">
              We couldn&rsquo;t find any rewards matching &ldquo;{rawQuery}&rdquo;. Try using terms like &ldquo;hotel&rdquo;, &ldquo;dining&rdquo;, &ldquo;credit&rdquo;, or &ldquo;cashback&rdquo;. Or consult with our AI Assistant for tailored benefits!
            </p>
            <button 
              onClick={() => setIsAgentOpen(true)}
              className="bg-primary text-white hover:bg-secondary px-6 py-3.5 rounded-xl font-sans text-[10px] font-black uppercase tracking-wider transition-all shadow-md"
            >
              Ask AI Assistant for advice
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
