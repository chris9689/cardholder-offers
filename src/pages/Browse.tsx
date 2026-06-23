/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Grid, List, Search, Sparkles, X } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import DyOfferCard from '../components/DyOfferCard';
import { useCard } from '../contexts/CardContext';
import { getAllProducts } from '../lib/productFeed';
import { DyRecommendationSlot, performDySearch } from '../lib/dyServerApi';

function toDisplayCategory(value: string): string {
  if (!value) {
    return 'Unknown';
  }

  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function toSlotFromFeed(product: ReturnType<typeof getAllProducts>[number]): DyRecommendationSlot {
  return {
    sku: product.sku,
    productData: {
      group_id: product.group_id,
      categories: [product.categories],
      in_stock: product.in_stock,
      name: product.name,
      url: product.url,
      image_url: product.image_url,
      logo_url: product.logo_url,
      brand: product.brand,
      card_tier: product.card_tier,
      country_code: product.country_code,
      locale: product.locale,
      language_code: product.language_code,
      offer_country: product.offer_country,
      price: Number(product.price) || 0,
    },
  };
}

export default function Browse() {
  const { cardType, userVariables } = useCard();
  const selectedTier = userVariables?.cardType ?? cardType;

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchInput, setSearchInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DyRecommendationSlot[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const tierFeedSlots = useMemo(() => {
    const feedProducts = getAllProducts();
    return feedProducts
      .filter((product) => product.in_stock && product.card_tier === selectedTier)
      .map(toSlotFromFeed);
  }, [selectedTier]);

  const categoryOptions = useMemo(() => {
    const categories = new Set<string>();
    tierFeedSlots.forEach((slot) => {
      const category = slot.productData.categories?.[0];
      if (category) {
        categories.add(category);
      }
    });

    return ['All', ...Array.from(categories).sort((a, b) => a.localeCompare(b))];
  }, [tierFeedSlots]);

  useEffect(() => {
    if (!categoryOptions.includes(activeCategory)) {
      setActiveCategory('All');
    }
  }, [activeCategory, categoryOptions]);

  const hasActiveSearch = activeQuery.trim().length > 0;
  const sourceSlots = hasActiveSearch ? searchResults ?? [] : tierFeedSlots;

  const visibleSlots = useMemo(() => {
    if (activeCategory === 'All') {
      return sourceSlots;
    }

    return sourceSlots.filter((slot) => slot.productData.categories?.[0] === activeCategory);
  }, [activeCategory, sourceSlots]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchInput.trim();

    if (!query) {
      setActiveQuery('');
      setSearchResults(null);
      return;
    }

    setIsSearching(true);
    setActiveQuery(query);

    try {
      const result = await performDySearch(query, '/offers', selectedTier, 0, 100);
      const tierScoped = result.slots.filter((slot) => {
        const slotTier = String(slot.productData.card_tier || '').toLowerCase();
        return !slotTier || slotTier === selectedTier.toLowerCase();
      });
      setSearchResults(tierScoped);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setActiveQuery('');
    setSearchResults(null);
  };

  return (
    <div className="pt-24 min-h-screen bg-surface">
      {/* Header - Reduced Height */}
      <section className="bg-white border-b border-outline-variant/10 py-12 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-max-width mx-auto">
          <span className="font-sans text-[10px] font-black text-secondary uppercase tracking-[0.4em] mb-4 block">Merchant Catalog</span>
          <h1 className="text-4xl md:text-5xl text-primary font-black mb-4 tracking-tighter uppercase not-italic">Explore Offers</h1>
          <p className="font-sans text-on-surface-variant text-base max-w-2xl font-light leading-relaxed opacity-70">
            Rewards and Offers for your {selectedTier} card.
          </p>
        </div>
      </section>

      {/* Filters and search */}
      <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-xl border-b border-outline-variant/10 shadow-sm">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-6">
          <div className="flex flex-col xl:flex-row gap-6">
            <div className="flex flex-wrap items-center gap-2.5">
              {categoryOptions.map((category) => {
                const isActive = activeCategory === category;
                return (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-4 py-2 rounded-xl border font-sans text-[10px] font-black uppercase tracking-widest transition-all ${
                      isActive
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                        : 'bg-white text-on-surface-variant border-outline-variant/20 hover:border-primary/30 hover:text-primary'
                    }`}
                  >
                    {category === 'All' ? 'All Categories' : toDisplayCategory(category)}
                  </button>
                );
              })}
            </div>

            <div className="flex-1 flex items-center gap-4">
              <form onSubmit={handleSearchSubmit} className="relative flex-1">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/30" size={18} />
                <input 
                  type="text" 
                  placeholder="Search offers by merchant, category, or intent..." 
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-16 pr-6 py-4 rounded-4xl bg-surface-container-low border-none focus:ring-2 focus:ring-primary/20 text-sm font-sans font-medium placeholder:text-on-surface-variant/30"
                />
              </form>
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
            {hasActiveSearch ? (
              <>
                Search results for <span className="text-primary font-bold">"{activeQuery}"</span>{' '}
                in <span className="text-primary font-bold">{selectedTier}</span> tier: <span className="text-primary font-bold">{visibleSlots.length}</span>
              </>
            ) : (
              <>
                Found <span className="text-primary font-bold">{visibleSlots.length}</span> {selectedTier} offers
              </>
            )}
          </p>
          <div className="flex items-center gap-3">
            {isSearching && (
              <span className="text-[10px] font-black uppercase tracking-widest text-secondary flex items-center gap-1.5">
                <Sparkles size={12} className="animate-pulse" /> Searching...
              </span>
            )}
            {hasActiveSearch && (
              <button
                onClick={clearSearch}
                className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1"
              >
                <X size={12} /> Clear search
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {visibleSlots.map((slot) => (
            <DyOfferCard key={slot.sku} slot={slot} />
          ))}
        </div>

        {visibleSlots.length === 0 && (
          <div className="py-32 text-center">
            <h3 className="font-serif text-2xl text-primary mb-4">No offers found</h3>
            <p className="font-sans text-on-surface-variant">
              {hasActiveSearch
                ? 'Try a different query or clear search to return to tier feed offers.'
                : 'No offers are currently available for this tier and category.'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
