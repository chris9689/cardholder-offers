/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowRight, ChevronLeft, ChevronRight, Diamond, MapPin, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import SearchFilters from '../components/SearchFilters';
import OfferCard from '../components/OfferCard';
import DyOfferCard from '../components/DyOfferCard';
import CategoryCard from '../components/CategoryCard';
import { OFFERS, CATEGORIES, CuratedCategory, rankCuratedCategories } from '../data/offers';
import { useCard } from '../contexts/CardContext';
import { USER } from '../config';
import { getCuratedHomepagePrompts } from '../config/curatedPrompts';
import { getAllProducts } from '../lib/productFeed';
import { chooseHomepageGroup, fetchUserAffinities, HomepageChoiceResult, UserAffinityProfile, chooseUserBar } from '../lib/dyServerApi';

const COUNTRY_HERO_IMAGES: Record<string, string> = {
  SPAIN: 'https://images.unsplash.com/photo-1525716483401-5bcbad7fc13f?auto=format&fit=crop&w=1400&q=80',
  ITALY: 'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?auto=format&fit=crop&w=1400&q=80',
  UNITEDARABEMIRATES: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1400&q=80',
};

const CITY_CODE_LABELS: Record<string, string> = {
  MAD: 'Madrid',
  BCN: 'Barcelona',
  VAL: 'Valencia',
  SEV: 'Seville',
  MIL: 'Milan',
  ROM: 'Rome',
  FLO: 'Florence',
  NAP: 'Naples',
  DXB: 'Dubai',
  AUH: 'Abu Dhabi',
};

const CATEGORY_NAME_BY_KEY = CATEGORIES.reduce<Record<string, string>>((acc, category) => {
  acc[category.offerCategory] = category.name;
  return acc;
}, {});

function normalizeKey(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickDeterministic<T>(items: T[], seed: string): T | null {
  if (items.length === 0) {
    return null;
  }

  const index = hashSeed(seed || 'guest-seed') % items.length;
  return items[index];
}

function resolveFeaturedCountry(
  availableCountries: string[],
  countryScores: Record<string, number>,
  seed: string,
): string | null {
  if (availableCountries.length === 0) {
    return null;
  }

  const normalizedScores: Record<string, number> = {};
  for (const [countryKey, score] of Object.entries(countryScores)) {
    const normalized = normalizeKey(countryKey);
    const numericScore = Number(score);
    if (normalized && Number.isFinite(numericScore)) {
      normalizedScores[normalized] = numericScore;
    }
  }

  let bestCountry: string | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const country of availableCountries) {
    const score = normalizedScores[normalizeKey(country)] ?? 0;
    if (score > bestScore) {
      bestScore = score;
      bestCountry = country;
    }
  }

  if (bestCountry && bestScore > 0) {
    return bestCountry;
  }

  return pickDeterministic([...availableCountries].sort((a, b) => a.localeCompare(b)), seed);
}

function getCityFromSku(sku: string): string {
  const cityCode = sku.split('-')[2] || '';
  return CITY_CODE_LABELS[cityCode] || cityCode || 'Local City';
}

function getCountryHeroImage(country: string, countryOffers: ReturnType<typeof getAllProducts>): string {
  return (
    COUNTRY_HERO_IMAGES[normalizeKey(country)] ||
    countryOffers[0]?.image_url ||
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1400&q=80'
  );
}

export default function Home() {
  const { cardType, points, userVariables, setUserVariables } = useCard();
  const { pathname } = useLocation();
  const [homepageData, setHomepageData] = useState<HomepageChoiceResult | null>(null);
  const [recsPage, setRecsPage] = useState(0);
  const [curatedCategories, setCuratedCategories] = useState<CuratedCategory[]>(CATEGORIES);
  const [affinityProfile, setAffinityProfile] = useState<UserAffinityProfile | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const result = await chooseHomepageGroup(pathname, cardType);
      if (isMounted) {
        setHomepageData(result);
        setRecsPage(0);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [pathname, cardType]);

  const PAGE_SIZE = 9;
  const slots = homepageData?.recommendations ?? [];
  const totalPages = Math.max(1, Math.ceil(slots.length / PAGE_SIZE));
  const visibleSlots = slots.slice(recsPage * PAGE_SIZE, (recsPage + 1) * PAGE_SIZE);
  const recsTitle = homepageData?.recsTitle ?? 'Your Exclusive Offers';
  const recsSubtitle = homepageData?.recsSubtitle ?? 'Personalized Picks';

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const data = await chooseUserBar(pathname, cardType);
      if (isMounted) {
        setUserVariables(data);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [pathname, cardType, setUserVariables]);

  useEffect(() => {
    let isMounted = true;

    const loadRankedCategories = async () => {
      const affinityProfile = await fetchUserAffinities();
      const ranked = rankCuratedCategories(affinityProfile?.categories, affinityProfile?.uid ?? 'guest-seed');
      if (isMounted) {
        setAffinityProfile(affinityProfile);
        setCuratedCategories(ranked);
      }
    };

    void loadRankedCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const displayName = userVariables?.name ?? USER.name;
  const displayCardType = userVariables?.cardType ?? cardType;
  const displayPoints = userVariables?.points ?? points;
  const suggestedPrompts = getCuratedHomepagePrompts(displayCardType, displayPoints);

  const allFeedOffers = getAllProducts().filter((offer) => offer.in_stock);
  const availableCountries = Array.from(new Set(allFeedOffers.map((offer) => offer.offer_country).filter(Boolean)));
  const featuredCountry = resolveFeaturedCountry(
    availableCountries,
    affinityProfile?.countries ?? {},
    affinityProfile?.uid ?? displayName,
  );
  const featuredCountryOffers = featuredCountry
    ? allFeedOffers.filter((offer) => offer.offer_country === featuredCountry)
    : [];
  const featuredCountryTierOffers = featuredCountryOffers.filter((offer) => offer.card_tier === displayCardType);
  const featuredOfferPool = featuredCountryTierOffers.length >= 2 ? featuredCountryTierOffers : featuredCountryOffers;
  const featuredOffers = [...featuredOfferPool]
    .sort((a, b) => Number(b.min_spend) - Number(a.min_spend))
    .slice(0, 3);
  const featuredCountryImage = getCountryHeroImage(featuredCountry || '', featuredCountryOffers);

  return (
    <div className="flex flex-col w-full pt-16">
      {/* User Info Bar - Moved above Hero */}
      <section className="bg-white border-b border-outline-variant/10 py-4">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-8">
            <div className="bg-primary text-white px-4 py-1.5 rounded-full flex items-center gap-2">
              <h2 className="font-sans text-[10px] font-black tracking-[0.2em] uppercase">Welcome, {displayName}</h2>
            </div>
            <div className="hidden md:block w-px h-3 bg-outline-variant/30" />
            <p className="font-sans text-[10px] font-black text-on-surface-variant flex items-center gap-2 uppercase tracking-[0.2em]">
              <span className={`w-2 h-2 rounded-full ${displayCardType === 'Black' ? 'bg-primary shadow-[0_0_8px_rgba(0,0,0,0.3)]' : displayCardType === 'Premium' ? 'bg-secondary' : 'bg-outline'}`} />
              {displayCardType} Status • {displayPoints.toLocaleString()} Points
            </p>
          </div>
          <Link to="/offers" className="flex items-center gap-1.5 text-secondary font-sans text-[10px] font-black uppercase tracking-[0.2em] group">
            Explore Offers
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </section>

      <Hero banner={homepageData?.heroBanner} />
      
      <div className="px-margin-mobile md:px-margin-desktop mb-20 pt-24 max-w-5xl mx-auto w-full">
        <SearchFilters />
        
        {/* Suggested Searches / Prompts */}
        <div className="mt-6 flex flex-col md:flex-row items-stretch md:items-center justify-start gap-2 w-full md:pl-[90px]">
          {suggestedPrompts.map((prompt) => (
            <Link
              key={prompt.id}
              to={`/curated?prompt=${encodeURIComponent(prompt.text)}`}
              className="inline-flex items-center justify-center md:justify-start gap-1.5 bg-white text-primary border border-outline-variant/10 hover:border-secondary hover:bg-secondary/5 px-4 py-3 md:py-2.5 rounded-xl font-sans text-[10px] font-black uppercase tracking-wider transition-all shadow-sm text-center md:text-left"
            >
              {prompt.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Exclusive Offers Section */}
      <section className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop mb-24">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="font-sans text-xs font-bold text-secondary uppercase tracking-[0.3em] mb-3 block">{recsSubtitle}</span>
            <h2 className="text-3xl md:text-4xl text-primary">{recsTitle}</h2>
          </div>
          {totalPages > 1 && (
            <div className="hidden md:flex gap-3 items-center">
              <button
                onClick={() => setRecsPage((p) => Math.max(0, p - 1))}
                disabled={recsPage === 0}
                className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-white hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="font-sans text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                {recsPage + 1} / {totalPages}
              </span>
              <button
                onClick={() => setRecsPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={recsPage === totalPages - 1}
                className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant hover:bg-white hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleSlots.length > 0
            ? visibleSlots.map((slot) => (
                <DyOfferCard key={slot.sku} slot={slot} />
              ))
            : OFFERS.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
        </div>

        {/* Mobile pagination */}
        {totalPages > 1 && (
          <div className="flex md:hidden justify-center gap-4 mt-8">
            <button
              onClick={() => setRecsPage((p) => Math.max(0, p - 1))}
              disabled={recsPage === 0}
              className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="flex items-center font-sans text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
              {recsPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => setRecsPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={recsPage === totalPages - 1}
              className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center text-on-surface-variant disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </section>

      {/* Curated Categories - Moved above Near You */}
      <section className="bg-surface-container py-20 border-y border-outline-variant/10 mb-24">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex flex-col md:flex-row justify-between items-baseline gap-4 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl text-primary mb-3">Curated Categories</h2>
              <p className="font-sans text-on-surface-variant text-base font-light">Tailored benefits across every pillar of your lifestyle.</p>
            </div>
            <Link to="/offers" className="font-sans text-xs font-bold text-primary border-b-2 border-primary pb-1 uppercase tracking-widest hover:text-secondary hover:border-secondary transition-all">
              Explore All
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-8">
            {curatedCategories.map(cat => (
              <CategoryCard key={cat.name} {...cat} href={`/offers?category=${encodeURIComponent(cat.offerCategory)}`} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Country Offers */}
      <section className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop mb-24">
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-6">
            <span className="font-sans text-xs font-bold text-secondary uppercase tracking-[0.3em] mb-3 block">Featured Offers</span>
            <h2 className="text-3xl md:text-4xl text-primary mb-3">
              {featuredCountry ? `${featuredCountry} Highlights` : 'Country Highlights'}
            </h2>
            <p className="font-sans text-on-surface-variant mb-8 text-base leading-relaxed font-light">
              Personalized by top country affinity. Explore standout offers and city-specific picks.
            </p>
            <div className="space-y-4">
              {featuredOffers.map((offer) => {
                const cityLabel = getCityFromSku(offer.sku);
                const categoryLabel = CATEGORY_NAME_BY_KEY[offer.categories] || offer.categories;

                return (
                  <Link
                    key={offer.sku}
                    to={`/offers/${encodeURIComponent(offer.sku)}`}
                    className="group bg-white rounded-3xl border border-outline-variant/15 p-4 md:p-5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all block"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-md">
                        <img
                          src={offer.image_url}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          alt={offer.brand}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-1">
                          <h4 className="font-sans text-base font-extrabold text-primary truncate group-hover:text-secondary transition-colors">
                            {offer.brand}
                          </h4>
                          <span className="text-[10px] font-black uppercase tracking-wider text-secondary bg-secondary/10 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                            <MapPin size={11} /> {cityLabel}
                          </span>
                        </div>
                        <p className="font-sans text-xs text-on-surface-variant leading-relaxed line-clamp-2 mb-2">
                          {offer.name}
                        </p>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70">
                            {categoryLabel}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                            Min spend {offer.min_spend}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {featuredOffers.length === 0 && (
                <div className="bg-white rounded-3xl border border-outline-variant/15 p-8 text-center">
                  <p className="font-sans text-sm text-on-surface-variant">No featured offers available right now.</p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-6 relative rounded-[48px] overflow-hidden shadow-xl border-4 border-white min-h-[420px]">
            <img
              className="w-full h-full object-cover"
              alt={featuredCountry ? `${featuredCountry} featured destination` : 'Featured destination'}
              src={featuredCountryImage}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 text-white">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-2 mb-4"
              >
                <Sparkles size={14} />
                <span className="font-sans text-[10px] font-black uppercase tracking-wider">Top Country Affinity</span>
              </motion.div>
              <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-3">
                {featuredCountry || 'Featured Country'}
              </h3>
              <p className="font-sans text-sm md:text-base text-white/85 max-w-md leading-relaxed mb-6">
                Handpicked offers from your strongest country preference, with city-based highlights and curated premium value.
              </p>
              <Link
                to="/offers"
                className="inline-flex items-center gap-2 bg-white text-primary hover:bg-secondary hover:text-white px-5 py-3 rounded-xl font-sans text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Browse All Offers <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-20 text-center">
        <span className="font-sans text-xs font-bold text-secondary uppercase tracking-[0.4em] mb-5 block">The Premier Philosophy</span>
        <h2 className="text-4xl md:text-7xl mb-10 max-w-4xl mx-auto leading-[0.95] font-black uppercase tracking-tighter not-italic">
          More than a card. <br /> A world of ease.
        </h2>
        
        <div className="grid md:grid-cols-3 gap-16 mt-20">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-secondary-fixed/30 flex items-center justify-center text-secondary mb-6 shadow-sm">
              <Diamond size={32} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-wide mb-3">Elite Perks</h3>
            <p className="font-sans text-on-surface-variant text-sm leading-loose font-medium opacity-60 max-w-[280px]">
              As a {cardType} member, you gain access to private airport lounges and luxury hotel upgrades.
            </p>
          </div>
          <div className="flex flex-col items-center">
             <div className="w-16 h-16 rounded-2xl bg-secondary-fixed/30 flex items-center justify-center text-secondary mb-6 shadow-sm">
              <Wallet size={32} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-wide mb-3">Intelligent Earning</h3>
            <p className="font-sans text-on-surface-variant text-sm leading-loose font-medium opacity-60 max-w-[280px]">
              Earn 5x points on all travel and dining. Your points never expire and transfer instantly.
            </p>
          </div>
          <div className="flex flex-col items-center">
             <div className="w-16 h-16 rounded-2xl bg-secondary-fixed/30 flex items-center justify-center text-secondary mb-6 shadow-sm">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-wide mb-3">Total Security</h3>
            <p className="font-sans text-on-surface-variant text-sm leading-loose font-medium opacity-60 max-w-[280px]">
              Advanced fraud protection and purchase insurance mean you can shop with total confidence.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-24 bg-primary-container rounded-[64px] p-10 md:p-20 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 w-96 h-96 bg-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-2000" />
          <div className="relative z-10 flex flex-col items-center">
            <h3 className="text-4xl md:text-7xl mb-6 leading-[0.9] font-black uppercase tracking-tighter not-italic">Unrivaled <br /> Experience.</h3>
            <p className="font-sans text-base md:text-lg opacity-60 max-w-xl mb-10 font-medium leading-relaxed">
              Discover why 98% of our members choose to stay with us for a lifetime.
            </p>
            <button className="bg-secondary text-white px-12 py-5 rounded-full font-sans text-xs font-black uppercase tracking-[0.2em] hover:bg-secondary/80 hover:scale-105 active:scale-95 transition-all shadow-[0_20px_50px_rgba(119,90,25,0.4)] flex items-center gap-3">
              Join the Elite
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
