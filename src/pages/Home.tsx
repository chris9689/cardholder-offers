/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowRight, ChevronLeft, ChevronRight, Diamond, MapPin, ShieldCheck, Wallet } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import SearchFilters from '../components/SearchFilters';
import OfferCard from '../components/OfferCard';
import DyOfferCard from '../components/DyOfferCard';
import CategoryCard from '../components/CategoryCard';
import CountrySelector from '../components/CountrySelector';
import { SkeletonOfferCard, SkeletonCategoryCard, SkeletonFeaturedOffer } from '../components/SkeletonCard';
import { OFFERS, CATEGORIES, CuratedCategory, rankCuratedCategories } from '../data/offers';
import { useCard } from '../contexts/CardContext';
import { USER } from '../config';
import { getCuratedHomepagePrompts } from '../config/curatedPrompts';
import { getAllProducts } from '../lib/productFeed';
import { chooseHomepageGroup, fetchUserAffinities, HomepageChoiceResult, UserAffinityProfile, chooseUserBar } from '../lib/dyServerApi';

const COUNTRY_HERO_IMAGES: Record<string, string> = {
  FRANCE: 'https://cdn.dynamicyield.com/api/8794982/images/ef16470f5fd7.webp',
  SPAIN: 'https://cdn.dynamicyield.com/api/8794982/images/b234664359c3.webp',
  ITALY: 'https://cdn.dynamicyield.com/api/8794982/images/1eeca095338b.webp',
  UNITEDSTATES: 'https://cdn.dynamicyield.com/api/8794982/images/fdc0f1380271.webp',
  UNITEDARABEMIRATES: 'https://cdn.dynamicyield.com/api/8794982/images/81cda98ab817.webp',
};

const CITY_CODE_LABELS: Record<string, string> = {
  CHI: 'Chicago',
  MAD: 'Madrid',
  BCN: 'Barcelona',
  VAL: 'Valencia',
  SEV: 'Seville',
  PAR: 'Paris',
  LYN: 'Lyon',
  MRS: 'Marseille',
  NCE: 'Nice',
  MIL: 'Milan',
  ROM: 'Rome',
  FLO: 'Florence',
  NAP: 'Naples',
  NYC: 'New York City',
  LAX: 'Los Angeles',
  MIA: 'Miami',
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
  const { cardType, selectedCountry, userVariables, setUserVariables, isPreparingSession } = useCard();
  const { pathname } = useLocation();
  const [homepageData, setHomepageData] = useState<HomepageChoiceResult | null>(null);
  const [isLoadingHomepage, setIsLoadingHomepage] = useState(true);
  const [isLoadingUserBar, setIsLoadingUserBar] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [recsPage, setRecsPage] = useState(0);
  const [curatedCategories, setCuratedCategories] = useState<CuratedCategory[]>(CATEGORIES);
  const [affinityProfile, setAffinityProfile] = useState<UserAffinityProfile | null>(null);

  useEffect(() => {
    // Wait until any pending preset affinity has been informed after a reload,
    // otherwise recommendations would be fetched before the affinity applies.
    if (isPreparingSession) {
      return;
    }

    let isMounted = true;

    const load = async () => {
      setIsLoadingHomepage(true);
      const result = await chooseHomepageGroup(pathname, cardType);
      if (isMounted) {
        setHomepageData(result);
        setRecsPage(0);
        setIsLoadingHomepage(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [pathname, cardType, selectedCountry, isPreparingSession]);

  const PAGE_SIZE = 9;
  const slots = homepageData?.recommendations ?? [];
  const totalPages = Math.max(1, Math.ceil(slots.length / PAGE_SIZE));
  const visibleSlots = slots.slice(recsPage * PAGE_SIZE, (recsPage + 1) * PAGE_SIZE);
  const recsTitle = homepageData?.recsTitle ?? 'Your Exclusive Offers';
  const recsSubtitle = homepageData?.recsSubtitle ?? 'Personalized Picks';

  useEffect(() => {
    if (isPreparingSession) {
      return;
    }

    let isMounted = true;

    const load = async () => {
      const data = await chooseUserBar(pathname, cardType);
      if (isMounted) {
        setUserVariables(data);
        setIsLoadingUserBar(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [pathname, cardType, setUserVariables, isPreparingSession]);

  useEffect(() => {
    if (isPreparingSession) {
      return;
    }

    let isMounted = true;

    const loadRankedCategories = async () => {
      if (isMounted) {
        setIsLoadingCategories(true);
      }

      const affinityProfile = await fetchUserAffinities();
      const ranked = rankCuratedCategories(affinityProfile?.categories, affinityProfile?.uid ?? 'guest-seed');
      if (isMounted) {
        setAffinityProfile(affinityProfile);
        setCuratedCategories(ranked);
        setIsLoadingCategories(false);
      }
    };

    void loadRankedCategories();

    return () => {
      isMounted = false;
    };
  }, [cardType, isPreparingSession]);

  const displayName = userVariables?.name ?? USER.name;
  const displayCardType = userVariables?.cardType ?? cardType;
  const suggestedPrompts = getCuratedHomepagePrompts(displayCardType, 0);

  const allFeedOffers = getAllProducts().filter((offer) => offer.in_stock);
  const tierEligibleOffers = allFeedOffers.filter((offer) => offer.card_tier === displayCardType);

  const isStandard = displayCardType === 'Standard';

  const availableCountries = isStandard
    ? ['UNITEDSTATES']
    : Array.from(new Set(tierEligibleOffers.map((offer) => offer.offer_country).filter(Boolean)));
  // When a specific country is selected, the featured offers element is filtered
  // to that country. "Everywhere" falls back to the top affinity country (today's behavior).
  const hasCountrySelection =
    selectedCountry !== 'Everywhere' && availableCountries.includes(selectedCountry);
  const featuredCountry = isStandard
    ? 'UNITEDSTATES'
    : hasCountrySelection
    ? selectedCountry
    : resolveFeaturedCountry(
        availableCountries,
        affinityProfile?.countries ?? {},
        affinityProfile?.uid ?? displayName,
      );
  const featuredCountryOffers = featuredCountry
    ? tierEligibleOffers.filter((offer) => offer.offer_country === featuredCountry)
    : [];
  const featuredOffers = [...featuredCountryOffers]
    .sort((a, b) => a.brand.localeCompare(b.brand))
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
            {displayCardType} Cardholder
            </p>
          </div>
          <div className="shrink-0">
            <CountrySelector />
          </div>
        </div>
      </section>

      <Hero banner={homepageData?.heroBanner} isLoading={isLoadingHomepage} />
      
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
          {isLoadingHomepage
            ? [...Array(9)].map((_, i) => <SkeletonOfferCard key={`skeleton-${i}`} />)
            : visibleSlots.length > 0
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
            {isLoadingCategories
              ? [...Array(6)].map((_, i) => <SkeletonCategoryCard key={`skeleton-cat-${i}`} />)
              : curatedCategories.map(cat => (
                  <CategoryCard key={cat.name} {...cat} href={`/offers?category=${encodeURIComponent(cat.offerCategory)}`} />
                ))}
          </div>
        </div>
      </section>

      {/* Featured Offers */}
      <section className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop mb-24">
        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-7">
            <span className="font-sans text-xs font-bold text-secondary uppercase tracking-[0.3em] mb-3 block">Featured Offers</span>
            <h2 className="text-3xl md:text-4xl text-primary mb-3">
              {isStandard ? 'Explore Offers Nearby' : `Explore Offers In ${featuredCountry}`}
            </h2>
            <p className="font-sans text-on-surface-variant mb-8 text-base leading-relaxed font-light">
              
            </p>
            <div className="space-y-4">
              {isLoadingCategories
                ? [...Array(3)].map((_, i) => <SkeletonFeaturedOffer key={`skeleton-featured-${i}`} />)
                : featuredOffers.map((offer) => {
                const cityLabel = getCityFromSku(offer.sku);
                const categoryLabel = CATEGORY_NAME_BY_KEY[offer.categories] || offer.categories;

                return (
                  <Link
                    key={offer.sku}
                    to={`/offers/${encodeURIComponent(offer.sku)}`}
                    className="group bg-white rounded-3xl border border-outline-variant/15 p-4 md:p-5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all block"
                  >
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5">
                      <div className="h-44 sm:h-32 sm:w-52 rounded-2xl overflow-hidden shrink-0 shadow-md">
                        <img
                          src={offer.image_url}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          alt={offer.brand}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <h4 className="font-sans text-lg md:text-xl font-extrabold text-primary truncate group-hover:text-secondary transition-colors">
                            {offer.brand}
                          </h4>
                          <span className="text-[10px] font-black uppercase tracking-wider text-secondary bg-secondary/10 px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1">
                            <MapPin size={11} /> {cityLabel}
                          </span>
                        </div>
                        <p className="font-sans text-sm text-on-surface-variant leading-relaxed line-clamp-2 mb-3">
                          {offer.name}
                        </p>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70 bg-surface-container px-2.5 py-1 rounded-full">
                            {categoryLabel}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary inline-flex items-center gap-1.5">
                            View offer <ArrowRight size={11} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {featuredOffers.length === 0 && (
                <div className="bg-white rounded-3xl border border-outline-variant/15 p-8 text-center">
                  <p className="font-sans text-sm text-on-surface-variant">
                    No eligible featured offers available for your current card tier right now.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-5 relative rounded-[48px] overflow-hidden shadow-xl border-4 border-white min-h-[420px]">
            <img
              className="w-full h-full object-cover"
              alt={featuredCountry ? `${featuredCountry} featured destination` : 'Featured destination'}
              src={featuredCountryImage}
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 text-white">
              <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-3">{featuredCountry}</h3>
              
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
    </div>
  );
}
