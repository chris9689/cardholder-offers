/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowRight, ChevronLeft, ChevronRight, Diamond, Wallet, ShieldCheck, Sparkles, Star } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import Hero from '../components/Hero';
import SearchFilters from '../components/SearchFilters';
import OfferCard from '../components/OfferCard';
import DyOfferCard from '../components/DyOfferCard';
import CategoryCard from '../components/CategoryCard';
import { OFFERS, NEAR_ME_OFFERS, CATEGORIES, getOfferRouteToken } from '../data/offers';
import { useCard } from '../contexts/CardContext';
import { USER } from '../config';
import { getCuratedHomepagePrompts } from '../config/curatedPrompts';
import { chooseHomepageGroup, HomepageChoiceResult, chooseUserBar } from '../lib/dyServerApi';

export default function Home() {
  const { cardType, points, userVariables, setUserVariables } = useCard();
  const { pathname } = useLocation();
  const [homepageData, setHomepageData] = useState<HomepageChoiceResult | null>(null);
  const [recsPage, setRecsPage] = useState(0);

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

  const displayName = userVariables?.name ?? USER.name;
  const displayCardType = userVariables?.cardType ?? cardType;
  const displayPoints = userVariables?.points ?? points;
  const suggestedPrompts = getCuratedHomepagePrompts(displayCardType, displayPoints);

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
            {CATEGORIES.map(cat => (
              <CategoryCard key={cat.name} {...cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Near You Section */}
      <section className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop mb-24">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <span className="font-sans text-xs font-bold text-secondary uppercase tracking-[0.3em] mb-3 block">Geographic Curations</span>
            <h2 className="text-3xl md:text-4xl text-primary mb-4">Near You</h2>
            <p className="font-sans text-on-surface-variant mb-8 text-base leading-relaxed font-light">
              Discover exclusive rewards within 5 miles of your location.
            </p>
            <div className="flex flex-col gap-4">
              {NEAR_ME_OFFERS.slice(0, 2).map(offer => (
                <Link key={offer.id} to={`/offers/${getOfferRouteToken(offer)}`} className="bg-white p-5 rounded-3xl flex items-center gap-5 border border-outline-variant/10 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-md">
                    <img src={offer.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={offer.merchant} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-sans text-base font-extrabold text-primary group-hover:text-secondary transition-colors mb-0.5">{offer.merchant}</h4>
                    <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest mb-1.5 opacity-50">{offer.category} • {offer.distance}</p>
                    <span className="text-secondary font-sans text-xs font-black uppercase tracking-widest bg-secondary/5 px-2 py-0.5 rounded">{offer.rewardValue} Reward</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-7 relative h-[400px] rounded-[48px] overflow-hidden shadow-xl border-4 border-white">
            <img 
              className="w-full h-full object-cover grayscale opacity-60 contrast-125" 
              alt="Manhattan Map"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMn82K5MOdulnro8vQvxpvOyWX6s_MelY5PZc5UIsdVVXgtBopLv8lO0y5AeqLpWp07275FBQLoeo2Dg62Vux_1GwC_UvZwIS_cE-KOjx-e0RE-Md8wr0fuDy85xw8dUVLK1HevPXIP5mXz3RAlt6T_NoGjYqsSaB2h2sHHZEFaWYnyFK-_236i5v949rvEVY31Cgq9R6i7i2n7RYuT7lo7foXZSPA9pDzkbsnxHtp4SyuoDl6uTAQBBfV9_9y9VWsVONzg-G_bok" 
            />
            <div className="absolute inset-0 bg-linear-to-tr from-surface/40 via-transparent to-transparent flex items-center justify-center">
              <motion.div 
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 border border-outline-variant/10"
              >
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
                <span className="font-sans text-sm font-black text-primary uppercase tracking-widest">You are here</span>
              </motion.div>
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
