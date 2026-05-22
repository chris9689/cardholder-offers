/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowLeft, Send, Check, AlertCircle, ShoppingBag, MapPin, Tag, Wallet, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCard } from '../contexts/CardContext';
import { OFFERS, NEAR_ME_OFFERS } from '../data/offers';
import OfferCard from '../components/OfferCard';

interface RedeemableReward {
  id: string;
  merchant: string;
  title: string;
  pointsCost: number;
  description: string;
  image: string;
  category: string;
}

const REDEEMABLE_REWARDS: RedeemableReward[] = [
  {
    id: 'rew-1',
    merchant: 'Rosewood Hotels',
    title: 'Rosewood 3-Nights Upgraded Suite Package',
    pointsCost: 80000,
    description: 'Redeem 80,000 points to upgrade your upcoming Rosewood stay to a premier corner suite with double balcony and chef breakfast.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnELv-4vlZn71mauZObgjDiJ9VbZbHafAOxDw-_7Ps5Ed4R2P17BRfhU7IUDOBmk8YXitzzX06Jq1y5sA0rLBbmIn7qyQIwStE57G6N8j35o2iYt-1tXMmxyo8hIin7dPMG5dNe4yL4cDxVV-BFOnUcM95Hsm_r7DeKv6PFatw7tl33OM_hxPzJ4recDPm8GoBRur_YllDW7AMk3uWQUWroemwnC9wF0bHf3JKmbbW5QmsmDfPtMFfBkJ-h8hmMQwVVjddPE3UIT8',
    category: 'Travel'
  },
  {
    id: 'rew-2',
    merchant: 'Le Bernardin',
    title: 'Priority Window Table VIP Tasting Experience',
    pointsCost: 15000,
    description: 'Redeem 15,000 points for a guaranteed window table reservation, chef\'s signature digestif course, and private kitchen preview.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpjQVRBhy9ZR9WryL458Yt1KUsSsk1_A8SkKpI_pRGf4nKAo47SQQlFL0TLL37cJa0eZ_8rs0Zrp7MW49cXpMFh7_h5-C4cXaestNMQvDOupmH9gXMmwOjWiJEb-QWVqMEdAknMYnos9G2xHPRSz_7FppIpQE0gaNSeXK00_HMubJA2lD0dHmZrX0C38GHh1aL5whtiMqPhcd697b4l2G7Ahsf9D6hCRRirBbmATwCsWD0aNo44c74q1zofnyVkTftGhQ_ieTyzFc',
    category: 'Dining'
  },
  {
    id: 'rew-3',
    merchant: 'Bergdorf Goodman',
    title: 'Bergdorf Goodman $500 Premium Reward Credit',
    pointsCost: 50000,
    description: 'Redeem 50,000 points for an instant $500 balance statement credit applicable to any purchase exceeding $1,000.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6qfGG-A3i9xtOkH2nL977rhXQsXeaJnbm5yGL7KimgJQndYo1eKJW5QnT1WcabMvXO1CwbUEs7bhCVCSPILY-T4LJnnZ1BlA5_yxgNEcxvEqJlIdU2kj8l4ZRiHIW0H-XqB-4iF9epwR_Hp1LMm0kMkg8IxGEt51lk8qlsHIjil7mZcJGybz3l0YoXt6ZOquRP7IfqB72zeLmd8tpH-iCLBPkZmjwOsgcTs4k3bq_kcXoO0djq8QGff6rss0QLyh7w1j0hsswwhE',
    category: 'Shopping'
  },
  {
    id: 'rew-4',
    merchant: 'Disney+',
    title: 'Annual Disney+ Premium Family Streaming Pass',
    pointsCost: 10000,
    description: 'Redeem 10,000 points for 1 Full Year coverage of Disney+ Premium 4K family streaming package.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADJCnd_FcdpvAVZJt0ufni542sPmqRjFVL1OhldwmayzjCHGV7HoOHZ2YpzqaaDEUkTWyCSk9wU3OLuzwpRuFK0L-8Tm9VrKUE_rypiZaf8QzyP0zdXkQF_Z3OaRF5SQUzzex28qLN6JroUt9LBrJzO1Sj-a_UsTX5PjQITCooN0gUEPHClPRPUXSVlA2woHH9uwb1RPk7sq-1mKhW9P6s83WO0o2M1DskuUyKsUzlNI4Qi5GQ39utgGYxcPIznPX9vsE6TlxIClk',
    category: 'Experiences'
  },
  {
    id: 'rew-5',
    merchant: 'Mandarin Oriental',
    title: 'Luxurious Mandarin Oriental Spa Sanctuary Day',
    pointsCost: 45000,
    description: 'Redeem 45,000 points for a luxurious 90-minute massage session, thermal steam-room access, and signature tea treatment program.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAARzv5ulB41iCER3Aark93TRtzLFgnokdSQgvxZDKEyiozj5IY0V29papucTUJ-65iBAtclqkSpThLuJNzITutan_rMgztzmUZ9RZLIpM32U-fieCDH5ANNXK05eqz5A7SqMjfN8LI5T5zNMhcS-GlMa-NWCqt2oeQdnNDXSI3__6qCOo0r3HmhBo6KzgCGcHI9QVhATWAWk-dhpU1rVGl2XEdBQsf2FjQnraevvug4LM3XUJgxxGXXrnjlVd5g3RToWtfknoDC-I',
    category: 'Wellness'
  }
];

export default function CuratedResults() {
  const [searchParams] = useSearchParams();
  const rawPrompt = searchParams.get('prompt') || 'General Card Rewards Recommendation';
  const { points, setPoints, cardType } = useCard();

  const [notification, setNotification] = useState<{ type: 'success' | 'resubmit' | 'error'; message: string } | null>(null);
  const [inputVal, setInputVal] = useState('');
  const sliderRef = useRef<HTMLDivElement>(null);

  const scrollSlider = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 340; // Card width + layout gaps
      sliderRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Dynamic analysis based on selected prompt keyword
  const promptLower = rawPrompt.toLowerCase();
  
  let targetedCategory = 'All Categories';
  if (promptLower.includes('hotel') || promptLower.includes('stay') || promptLower.includes('travel')) {
    targetedCategory = 'Travel';
  } else if (promptLower.includes('dining') || promptLower.includes('michelin') || promptLower.includes('food') || promptLower.includes('restaurant')) {
    targetedCategory = 'Dining';
  } else if (promptLower.includes('points') || promptLower.includes('balance') || promptLower.includes('redeem')) {
    targetedCategory = 'Points';
  }

  let bannerTitle = "Curated Spending Benefits";
  let bannerSub = "Mastercard Offers";
  let bgImage = "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1200&q=80";
  
  if (targetedCategory === "Travel") {
    bannerTitle = "Your Holiday Starts Now";
    bannerSub = "Mastercard Offers";
    bgImage = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
  } else if (targetedCategory === "Dining") {
    bannerTitle = "An Exquisite Culinary Journey";
    bannerSub = "Mastercard Offers";
    bgImage = "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80";
  } else if (targetedCategory === "Points") {
    bannerTitle = "Maximize Your Value";
    bannerSub = "Mastercard Offers";
    bgImage = "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1200&q=80";
  }

  // Filter regular offers for the recommendation widget based on dynamic category
  const recommendedOffers = OFFERS.filter(offer => {
    if (targetedCategory === 'All Categories') return true;
    if (targetedCategory === 'Points') return offer.rewardType === 'cashback' || offer.rewardType === 'credit';
    return offer.category === targetedCategory;
  });

  // Filter point redeemable offers so that they reflect matches or general affordability
  const affordablePointsOffers = REDEEMABLE_REWARDS.filter(rew => {
    // If specific recommendation, place match first or display affordable items
    if (targetedCategory === 'Travel') {
      return rew.category === 'Travel' || rew.pointsCost <= points;
    }
    if (targetedCategory === 'Dining') {
      return rew.category === 'Dining' || rew.pointsCost <= points;
    }
    return rew.pointsCost <= points;
  });

  const handleRedeem = (reward: RedeemableReward) => {
    if (points >= reward.pointsCost) {
      setPoints(points - reward.pointsCost);
      setNotification({
        type: 'success',
        message: `Successfully redeemed ${reward.title}! ${reward.pointsCost.toLocaleString()} points were deducted. An email voucher has been sent to your account.`
      });
      setTimeout(() => setNotification(null), 5000);
    } else {
      setNotification({
        type: 'error',
        message: `Insufficient points balance! You need ${(reward.pointsCost - points).toLocaleString()} more points to redeem this offer.`
      });
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleCustomPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      window.location.search = `?prompt=${encodeURIComponent(inputVal.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest pt-28 pb-20">
      
      {/* Back Button & Top Navigation Breadcrumb */}
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-secondary font-sans text-xs font-black uppercase tracking-widest transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
      </div>

      {/* Main Teaser Banner */}
      <section className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop mb-12">
        <div className="relative overflow-hidden rounded-[32px] md:rounded-[40px] bg-primary p-8 md:p-12 text-white shadow-xl border border-outline-variant/10 min-h-[300px] flex items-center">
          {/* Cover background image */}
          <div className="absolute inset-0">
            <img 
              src={bgImage} 
              alt={bannerTitle} 
              className="w-full h-full object-cover opacity-50 mix-blend-overlay"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-transparent" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8 w-full">
            <div className="max-w-2xl">
              <span className="font-sans text-[10px] font-black text-secondary uppercase tracking-[0.4em] mb-3 block">
                {bannerSub}
              </span>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-white leading-tight">
                {bannerTitle}
              </h2>
            </div>
            
            {/* Live Point Balance Indicator */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 text-left md:text-right self-stretch flex flex-col justify-between md:min-w-[260px]">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-secondary/80 block mb-1">Your Spending Balance</span>
                <p className="text-2xl md:text-3xl font-black font-mono leading-none text-white tracking-tight">
                  {points.toLocaleString()}
                </p>
                <span className="text-[10px] font-semibold text-white/60 uppercase tracking-widest block mt-1">Mastercard Points</span>
              </div>
              <div className="border-t border-white/10 mt-4 pt-3 text-left md:text-right">
                <p className="text-[9px] font-bold uppercase tracking-wider text-white/70">
                  Tier Eligibility status: <span className="text-secondary font-black">{cardType} Card</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Quick Re-Prompt Input Area */}
      <section className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop mb-16">
        <form onSubmit={handleCustomPromptSubmit} className="bg-white rounded-2xl md:rounded-3xl border border-outline-variant/10 p-4 shadow-md flex items-center justify-between gap-4 max-w-4xl mx-auto group focus-within:border-secondary transition-all">
          <div className="flex items-center gap-3.5 flex-1 pl-2">
            <Sparkles size={18} className="text-secondary" />
            <input 
              type="text" 
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Tell me what you are looking for..."
              className="bg-transparent border-none focus:ring-0 text-xs md:text-sm font-sans w-full text-primary placeholder:text-on-surface-variant/40 placeholder:italic font-medium uppercase tracking-tight"
            />
          </div>
          <button 
            type="submit" 
            className="bg-primary text-white hover:bg-secondary px-5 py-3 rounded-xl font-sans text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shrink-0"
          >
            Ask the Agent <Send size={12} />
          </button>
        </form>
      </section>

      {/* Notification Toast Alert */}
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop mb-8">
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4.5 rounded-2xl flex items-start gap-3.5 border shadow-md ${
                notification.type === 'success' 
                  ? 'bg-green-500/10 border-green-500/20 text-green-800' 
                  : 'bg-red-500/10 border-red-500/20 text-red-800'
              }`}
            >
              {notification.type === 'success' ? <Check size={20} className="shrink-0 text-green-600 mt-0.5" /> : <AlertCircle size={20} className="shrink-0 text-red-600 mt-0.5" />}
              <div>
                <h4 className="font-sans text-xs font-black uppercase tracking-widest mb-0.5">
                  {notification.type === 'success' ? 'Redemption Successful' : 'Insufficient Balance'}
                </h4>
                <p className="font-sans text-xs opacity-90 leading-relaxed font-semibold">
                  {notification.message}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop grid lg:grid-cols-12 gap-12">
        
        {/* Recommendation Widget for Personalised Offers (Specific Category) */}
        <div className="lg:col-span-12 min-w-0 w-full overflow-hidden">
          <div className="mb-8 border-b border-outline-variant/10 pb-5 flex items-center justify-between gap-4">
            <h3 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tight">
              Recommended Offers
            </h3>
            {/* Horizontal Slider Left/Right Scroll Arrows */}
            <div className="flex gap-2">
              <button 
                type="button"
                onClick={() => scrollSlider('left')}
                className="w-10 h-10 rounded-full border border-outline-variant/10 bg-white text-primary hover:text-secondary flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95 shrink-0"
                aria-label="Previous Offer"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                type="button"
                onClick={() => scrollSlider('right')}
                className="w-10 h-10 rounded-full border border-outline-variant/10 bg-white text-primary hover:text-secondary flex items-center justify-center shadow-sm hover:shadow-md transition-all active:scale-95 shrink-0"
                aria-label="Next Offer"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {recommendedOffers.length > 0 ? (
            <div className="relative w-full overflow-hidden">
              <div 
                ref={sliderRef}
                className="flex flex-row overflow-x-auto gap-4 md:gap-8 pb-6 snap-x snap-mandatory hide-scrollbar w-full scroll-smooth"
              >
                {recommendedOffers.map(offer => (
                  <div key={offer.id} className="w-[280px] sm:w-[320px] md:w-[360px] shrink-0 snap-start">
                    <OfferCard offer={offer} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center border border-outline-variant/10 shadow-sm max-w-lg mx-auto w-full">
              <ShoppingBag size={48} className="text-secondary mx-auto mb-4 opacity-70" />
              <h4 className="text-lg font-black uppercase text-primary mb-2">No Specific Merchant matches</h4>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed opacity-70">
                We did not find any specific rewards under &ldquo;{targetedCategory}&rdquo;. Try re-prompting with standard keywords like hotel, dining, or shopping.
              </p>
            </div>
          )}
        </div>

        {/* Curation Widget: Offers Redeemable with User points balance */}
        <div className="lg:col-span-12 mt-12 min-w-0 w-full overflow-hidden">
          <div className="mb-8 border-b border-outline-variant/10 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-2xl md:text-3xl font-black text-primary uppercase tracking-tight">
              Redeem instantly with your points balance
            </h3>
            <div className="font-sans text-xs text-on-surface-variant font-light">
              Click any package below to convert your Mastercard {points.toLocaleString()} points balance instantly.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            {affordablePointsOffers.map((reward) => {
              const displayAffordable = points >= reward.pointsCost;
              return (
                <div 
                  key={reward.id}
                  className="bg-white rounded-3xl overflow-hidden border border-outline-variant/10 shadow-sm hover:shadow-xl hover:border-secondary/20 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="h-44 sm:h-56 relative overflow-hidden">
                    <img 
                      src={reward.image} 
                      alt={reward.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-primary text-white text-[10.5px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full flex items-center gap-1">
                      <Wallet size={12} className="text-secondary" />
                      {reward.pointsCost.toLocaleString()} Points
                    </div>
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-primary text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl shadow-sm">
                      {reward.category}
                    </div>
                  </div>

                  <div className="p-4 sm:p-6 flex flex-col justify-between flex-1 gap-4">
                    <div>
                      <span className="font-sans text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest block mb-1">
                        {reward.merchant}
                      </span>
                      <h4 className="text-lg font-black uppercase text-primary tracking-tight mb-2 group-hover:text-secondary transition-colors">
                        {reward.title}
                      </h4>
                      <p className="font-sans text-xs text-on-surface-variant opacity-70 leading-relaxed font-medium">
                        {reward.description}
                      </p>
                    </div>

                    <div className="border-t border-outline-variant/10 pt-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Trophy size={14} className="text-secondary shrink-0" />
                        <span className="font-sans text-[10.5px] font-black text-secondary uppercase tracking-wider text-left">
                          Instant Redemption Eligible
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleRedeem(reward)}
                        className={`w-full sm:w-auto px-5 py-3 rounded-xl font-sans text-[10px] font-black uppercase tracking-widest transition-all ${
                          displayAffordable 
                            ? 'bg-[#775a19] text-white hover:bg-primary shadow-md hover:translate-y-[-1px]' 
                            : 'bg-surface-container-high text-on-surface-variant/40 cursor-not-allowed border border-outline-variant/10'
                        }`}
                      >
                        {displayAffordable ? 'Redeem Offer' : 'Insufficient Points'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
