/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Filter, Grid, List, Search, MapPin, Tag, CheckCircle, Navigation, ChevronDown } from 'lucide-react';
import React, { useState } from 'react';
import OfferCard from '../components/OfferCard';
import { OFFERS } from '../data/offers';
import { motion, AnimatePresence } from 'motion/react';

export default function Browse() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeDestination, setActiveDestination] = useState('Global');
  const [activeStatus, setActiveStatus] = useState('Available');
  const [isNearMe, setIsNearMe] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const categories = ['All', 'Dining', 'Travel', 'Shopping', 'Wellness', 'Experiences', 'Events'];
  const destinations = ['Global', 'New York', 'London', 'Paris', 'Tokyo', 'Singapore'];
  const statuses = ['All', 'Available', 'Used', 'Expired'];

  const filteredOffers = OFFERS.filter(o => {
    const matchesCategory = activeCategory === 'All' || o.category === activeCategory;
    const matchesSearch = o.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.merchant.toLowerCase().includes(searchQuery.toLowerCase());
    // Destination and Status logic is mocked for now as per data availability but UI matches
    return matchesCategory && matchesSearch;
  });

  const toggleDropdown = (name: string) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <div className="pt-24 min-h-screen bg-surface">
      {/* Header - Reduced Height */}
      <section className="bg-white border-b border-outline-variant/10 py-12 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-max-width mx-auto">
          <span className="font-sans text-[10px] font-black text-secondary uppercase tracking-[0.4em] mb-4 block">Merchant Catalog</span>
          <h1 className="text-4xl md:text-5xl text-primary font-black mb-4 tracking-tighter uppercase not-italic">Explore Offers</h1>
          <p className="font-sans text-on-surface-variant text-base max-w-2xl font-light leading-relaxed opacity-70">
            A curated selection of luxury partner rewards and lifestyle benefits, exclusively for cardholders.
          </p>
        </div>
      </section>

      {/* Redesigned Filters Bar */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-6">
          <div className="flex flex-col xl:flex-row gap-6">
            
            {/* Dropdown Group */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Destination Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => toggleDropdown('destination')}
                  className="flex items-center gap-3 px-6 py-3 bg-surface-container rounded-2xl border border-outline-variant/10 hover:border-primary/30 transition-all font-sans text-[10px] font-black uppercase tracking-widest text-primary"
                >
                  <MapPin size={14} className="text-secondary" />
                  <span>{activeDestination}</span>
                  <ChevronDown size={14} className={`transition-transform ${openDropdown === 'destination' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openDropdown === 'destination' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-outline-variant/10 overflow-hidden py-2 z-50"
                    >
                      {destinations.map(dest => (
                        <button 
                          key={dest}
                          onClick={() => { setActiveDestination(dest); setOpenDropdown(null); }}
                          className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-surface-container transition-colors"
                        >
                          {dest}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Category Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => toggleDropdown('category')}
                  className="flex items-center gap-3 px-6 py-3 bg-surface-container rounded-2xl border border-outline-variant/10 hover:border-primary/30 transition-all font-sans text-[10px] font-black uppercase tracking-widest text-primary"
                >
                  <Tag size={14} className="text-secondary" />
                  <span>{activeCategory}</span>
                  <ChevronDown size={14} className={`transition-transform ${openDropdown === 'category' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openDropdown === 'category' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-outline-variant/10 overflow-hidden py-2 z-50"
                    >
                      {categories.map(cat => (
                        <button 
                          key={cat}
                          onClick={() => { setActiveCategory(cat); setOpenDropdown(null); }}
                          className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-surface-container transition-colors"
                        >
                          {cat}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Status Dropdown */}
              <div className="relative">
                <button 
                  onClick={() => toggleDropdown('status')}
                  className="flex items-center gap-3 px-6 py-3 bg-surface-container rounded-2xl border border-outline-variant/10 hover:border-primary/30 transition-all font-sans text-[10px] font-black uppercase tracking-widest text-primary"
                >
                  <CheckCircle size={14} className="text-secondary" />
                  <span>{activeStatus}</span>
                  <ChevronDown size={14} className={`transition-transform ${openDropdown === 'status' ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {openDropdown === 'status' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-outline-variant/10 overflow-hidden py-2 z-50"
                    >
                      {statuses.map(s => (
                        <button 
                          key={s}
                          onClick={() => { setActiveStatus(s); setOpenDropdown(null); }}
                          className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-surface-container transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="w-px h-8 bg-outline-variant/20 mx-2 hidden md:block" />

              {/* Near Me Toggle */}
              <button 
                onClick={() => setIsNearMe(!isNearMe)}
                className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all font-sans text-[10px] font-black uppercase tracking-widest ${
                  isNearMe 
                  ? 'bg-primary text-white border-primary shadow-xl shadow-primary/20 scale-105' 
                  : 'bg-white text-on-surface-variant border-outline-variant/20 hover:border-primary/30'
                }`}
              >
                <Navigation size={14} className={isNearMe ? 'text-white' : 'text-secondary'} />
                Near Me
              </button>
            </div>

            {/* Search and Layout Group */}
            <div className="flex-1 flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/30" size={18} />
                <input 
                  type="text" 
                  placeholder="Search catalog by name, merchant or reward..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-16 pr-6 py-4 rounded-[32px] bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-sm font-sans font-medium placeholder:text-on-surface-variant/30"
                />
              </div>
              <div className="flex border border-outline-variant/10 rounded-2xl overflow-hidden shadow-sm">
                 <button className="p-4 bg-primary text-white"><Grid size={20} /></button>
                 <button className="p-4 bg-white text-on-surface-variant hover:bg-surface-container"><List size={20} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <section className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-16">
        <div className="flex justify-between items-center mb-10">
          <p className="font-sans text-sm text-on-surface-variant font-medium">
            Showing <span className="text-primary font-bold">{filteredOffers.length}</span> results for <span className="text-primary font-bold">"{activeCategory}"</span>
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Sort by:</span>
            <select className="bg-transparent border-none focus:ring-0 text-sm font-bold text-primary cursor-pointer hover:text-secondary transition-colors">
              <option>Newest</option>
              <option>Reward Value</option>
              <option>Distance</option>
              <option>Expiring Soon</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredOffers.map(offer => (
            <OfferCard key={offer.id} offer={offer} />
          ))}
        </div>

        {filteredOffers.length === 0 && (
          <div className="py-32 text-center">
            <h3 className="font-serif text-2xl text-primary mb-4">No offers found</h3>
            <p className="font-sans text-on-surface-variant">Try adjusting your filters or search query.</p>
          </div>
        )}

        <div className="mt-24 flex justify-center">
          <button className="font-sans text-xs font-bold text-primary border-2 border-primary px-12 py-4 rounded-full uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
            Load More Offers
          </button>
        </div>
      </section>
    </div>
  );
}
