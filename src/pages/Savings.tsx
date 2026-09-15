/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, TrendingUp, ArrowUpRight, Sparkles, ChevronRight, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSession } from '../contexts/SessionContext';
import { useCard, CardType } from '../contexts/CardContext';
import { getAllProducts, getProductBySku, ProductFeedItem } from '../lib/productFeed';
import { chooseSavingsRecommendations, DyRecommendationSlot } from '../lib/dyServerApi';

interface RedeemedOffer {
  sku: string;
  merchant: string;
  title: string;
  date: string;
  amount: number;
}

// Minimal shape the list row needs; satisfied by both the product feed and
// the DY recommendation slots.
interface RowOffer {
  sku: string;
  name: string;
  brand: string;
  logo_url?: string;
  image_url?: string;
}

function slotToRowOffer(slot: DyRecommendationSlot): RowOffer {
  return {
    sku: slot.sku,
    name: slot.productData.name,
    brand: slot.productData.brand ?? slot.sku,
    logo_url: slot.productData.logo_url,
    image_url: slot.productData.image_url,
  };
}

// Mocked redeemed offers per tier. The sum of `amount` drives the total money
// saved figure so the math on this page always reconciles.
const REDEEMED_OFFERS_MOCKS: Record<CardType, RedeemedOffer[]> = {
  Standard: [
    { sku: 'ret-001', merchant: 'Walmart', title: '10% cashback on groceries', date: 'Jun 22, 2026', amount: 4.57 },
    { sku: 'phm-001', merchant: 'CVS Pharmacy', title: '10% back on health & beauty', date: 'Jun 20, 2026', amount: 2.83 },
    { sku: 'gro-001', merchant: 'Costco', title: '$10 off a $100 shop', date: 'Jun 18, 2026', amount: 10.25 },
    { sku: 'gas-001', merchant: 'Shell Gas Station', title: '5% back at the pump', date: 'Jun 15, 2026', amount: 5.50 },
    { sku: 'food-001', merchant: "McDonald's", title: 'Buy one meal, save 20%', date: 'Jun 12, 2026', amount: 3.40 },
  ],
  Premium: [
    { sku: 'hot-001', merchant: 'Marriott Hotel', title: '10% back on stays', date: 'Jun 20, 2026', amount: 38.55 },
    { sku: 'air-001', merchant: 'Delta Airlines', title: '$40 flight credit', date: 'Jun 16, 2026', amount: 42.58 },
    { sku: 'rst-001', merchant: "Ruth's Chris Steakhouse", title: '15% off dinner', date: 'Jun 12, 2026', amount: 18.99 },
    { sku: 'spa-001', merchant: 'Canyon Ranch Spa', title: '20% off wellness day', date: 'Jun 08, 2026', amount: 50.25 },
    { sku: 'res-001', merchant: 'The Ritz-Carlton', title: 'Complimentary upgrade credit', date: 'Jun 04, 2026', amount: 89.50 },
    { sku: 'car-001', merchant: 'Premium Car Rental', title: '25% off weekend rental', date: 'May 31, 2026', amount: 62.37 },
  ],
  Black: [
    { sku: 'hyp-001', merchant: 'Park Hyatt Resort', title: '10% back on suite stays', date: 'Jun 21, 2026', amount: 89.50 },
    { sku: 'air-001', merchant: 'United First Class', title: '$95 travel credit', date: 'Jun 18, 2026', amount: 95.00 },
    { sku: 'spa-001', merchant: 'Luxury Spa & Wellness', title: '20% off spa retreat', date: 'Jun 14, 2026', amount: 68.05 },
    { sku: 'con-001', merchant: 'Concierge Services', title: 'Priority concierge credit', date: 'Jun 10, 2026', amount: 125.75 },
    { sku: 'res-001', merchant: 'Nobu Restaurants', title: '15% off tasting menu', date: 'Jun 06, 2026', amount: 187.50 },
    { sku: 'trav-001', merchant: 'Private Travel Club', title: 'Exclusive travel credit', date: 'Jun 01, 2026', amount: 225.00 },
    { sku: 'exp-001', merchant: 'Exclusive Events', title: 'VIP access rebate', date: 'May 28, 2026', amount: 289.70 },
  ],
};

type TabKey = 'ready' | 'redeemed';

function initials(text: string): string {
  return text.slice(0, 2).toUpperCase();
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Derive a plausible cashback amount so activating a recommendation posts to
// Savings, mirroring the map quick-view activation.
function deriveSaving(offer: RowOffer): number {
  const product = getProductBySku(offer.sku);
  const pctMatch = offer.name.match(/(\d+)\s*%/);
  const minSpend = product ? Number.parseFloat(product.min_spend) || 0 : 0;
  if (pctMatch && minSpend > 0) {
    const pct = Number.parseInt(pctMatch[1], 10);
    return Math.round(pct * minSpend) / 100;
  }
  return Math.round((5 + (hashSeed(offer.sku) % 20)) * 100) / 100;
}

export default function Savings() {
  const navigate = useNavigate();
  const { activatedOffers } = useSession();
  const { cardType, userVariables } = useCard();
  const [activeTab, setActiveTab] = useState<TabKey>('ready');

  const displayTier = userVariables?.cardType ?? cardType;

  const redeemedOffers = REDEEMED_OFFERS_MOCKS[displayTier] ?? REDEEMED_OFFERS_MOCKS.Standard;
  const totalSaved = redeemedOffers.reduce((sum, o) => sum + o.amount, 0);
  const weeklySaved = redeemedOffers.slice(0, 2).reduce((sum, o) => sum + o.amount, 0);

  // Activated ("ready to use") offers resolved against the product feed.
  const readyOffers = useMemo<ProductFeedItem[]>(() => {
    return Array.from(activatedOffers)
      .map((sku) => getProductBySku(sku))
      .filter((p): p is ProductFeedItem => Boolean(p));
  }, [activatedOffers]);

  const hasReadyOffers = readyOffers.length > 0;

  // When the user already has activated offers, surface additional offers to
  // activate via the same DY recommendation widget used on the offer detail page.
  const [activateRecs, setActivateRecs] = useState<DyRecommendationSlot[]>([]);
  useEffect(() => {
    if (!hasReadyOffers) {
      setActivateRecs([]);
      return;
    }
    let mounted = true;
    const activatedSkus = readyOffers.map((offer) => offer.sku);
    void chooseSavingsRecommendations(displayTier, activatedSkus).then((result) => {
      if (mounted) {
        setActivateRecs(result.recommendations);
      }
    });
    return () => {
      mounted = false;
    };
  }, [hasReadyOffers, readyOffers, displayTier]);

  // Recommendations shown when nothing has been activated yet.
  const recommendations = useMemo<ProductFeedItem[]>(() => {
    const all = getAllProducts();
    const tierMatched = all.filter((p) => p.card_tier === displayTier && p.in_stock);
    const pool = tierMatched.length > 0 ? tierMatched : all;
    return pool.slice(0, 5);
  }, [displayTier]);

  const redeemedCount = redeemedOffers.length;
  const readyCount = readyOffers.length;

  return (
    <div className="pt-24 min-h-screen bg-surface">
      {/* Header */}
      <section className="bg-white border-b border-outline-variant/10 py-16 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-max-width mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-secondary mb-6 hover:text-primary transition-colors"
          >
            <ChevronLeft size={14} /> Back
          </button>

          <span className="font-sans text-[10px] font-black text-secondary uppercase tracking-[0.4em] mb-4 block">
            Dashboard
          </span>
          <h1 className="text-4xl md:text-5xl text-primary font-black mb-4 tracking-tighter uppercase not-italic">
            Savings Overview
          </h1>
          <p className="font-sans text-on-surface-variant text-base max-w-2xl font-light leading-relaxed opacity-70">
            Track all the money you've saved by activating offers with your {displayTier} card.
          </p>
        </div>
      </section>

      {/* Total Money Saved */}
      <section className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-4xl p-10 md:p-12 shadow-sm border border-outline-variant/10"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <h2 className="text-5xl md:text-6xl font-black text-primary tracking-tight">
                ${totalSaved.toFixed(2)}
              </h2>
              <div className="flex items-center gap-3 mt-3">
                <span className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">
                  Total money saved
                </span>
                <span className="w-1 h-1 rounded-full bg-outline-variant" />
                <span className="text-sm font-black text-green-600">
                  +${weeklySaved.toFixed(2)} this week
                </span>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center shadow-sm shrink-0">
              <TrendingUp size={26} className="text-green-600" />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Offers Element with Tabs */}
      <section className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <div className="bg-white rounded-4xl shadow-sm border border-outline-variant/10 overflow-hidden">
          {/* Tab Switcher */}
          <div className="grid grid-cols-2 border-b border-outline-variant/10">
            <button
              onClick={() => setActiveTab('ready')}
              className={`relative px-8 py-8 text-left transition-all duration-300 ${
                activeTab === 'ready'
                  ? 'bg-white'
                  : 'bg-surface-container hover:bg-surface-container-high'
              }`}
            >
              <span className={`block text-4xl font-black transition-colors ${activeTab === 'ready' ? 'text-primary' : 'text-on-surface-variant/40'}`}>{readyCount}</span>
              <span className={`block text-xs font-bold uppercase tracking-widest mt-1 transition-colors ${activeTab === 'ready' ? 'text-secondary' : 'text-on-surface-variant/40'}`}>
                Ready to Use
              </span>
              {activeTab === 'ready' && (
                <motion.div
                  layoutId="savings-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-secondary"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('redeemed')}
              className={`relative px-8 py-8 text-left transition-all duration-300 ${
                activeTab === 'redeemed'
                  ? 'bg-white'
                  : 'bg-surface-container hover:bg-surface-container-high'
              }`}
            >
              <span className={`block text-4xl font-black transition-colors ${activeTab === 'redeemed' ? 'text-primary' : 'text-on-surface-variant/40'}`}>{redeemedCount}</span>
              <span className={`block text-xs font-bold uppercase tracking-widest mt-1 transition-colors ${activeTab === 'redeemed' ? 'text-secondary' : 'text-on-surface-variant/40'}`}>
                Offers Redeemed
              </span>
              {activeTab === 'redeemed' && (
                <motion.div
                  layoutId="savings-tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-secondary"
                />
              )}
            </button>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'ready' ? (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {hasReadyOffers ? (
                  <div>
                    <div className="divide-y divide-outline-variant/10">
                      {readyOffers.map((offer, index) => (
                        <ReadyOfferRow key={`${offer.sku}-${index}`} offer={offer} index={index} />
                      ))}
                    </div>
                    {activateRecs.length > 0 && (
                      <>
                        <div className="px-8 pt-8 pb-2 flex items-center gap-2 border-t border-outline-variant/10">
                          <Sparkles size={16} className="text-secondary" />
                          <span className="text-[11px] font-black text-secondary uppercase tracking-[0.3em]">
                            Explore offers to activate now
                          </span>
                        </div>
                        <div className="divide-y divide-outline-variant/10">
                          {activateRecs.map((slot, index) => (
                            <ReadyOfferRow
                              key={slot.slotId || slot.sku}
                              offer={slotToRowOffer(slot)}
                              index={index}
                              isRecommendation
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div>
                    {/* Empty state message */}
                    <div className="px-8 py-10 border-b border-outline-variant/10">
                      <h3 className="text-xl font-black text-primary">No offers activated yet</h3>
                      <p className="text-sm text-on-surface-variant mt-1 font-light">
                        Activate offers to have them ready to use here.
                      </p>
                    </div>
                    {/* Recommendations */}
                    <div className="px-8 pt-8 pb-2 flex items-center gap-2">
                      <Sparkles size={16} className="text-secondary" />
                      <span className="text-[11px] font-black text-secondary uppercase tracking-[0.3em]">
                        Recommended for you
                      </span>
                    </div>
                    <div className="divide-y divide-outline-variant/10">
                      {recommendations.map((offer, index) => (
                        <ReadyOfferRow key={`${offer.sku}-${index}`} offer={offer} index={index} isRecommendation />
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="redeemed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="divide-y divide-outline-variant/10"
              >
                {redeemedOffers.map((offer, index) => (
                  <motion.div
                    key={`${offer.sku}-${index}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="p-6 md:p-8 flex items-center justify-between gap-6 hover:bg-surface-container-low transition-colors"
                  >
                    <div className="flex items-center gap-5 min-w-0">
                      <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-secondary/20 to-secondary/5 flex items-center justify-center font-black text-primary text-base shadow-inner border border-secondary/10 shrink-0">
                        {initials(offer.merchant)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-sans font-black text-primary text-base md:text-lg truncate">
                          {offer.title}
                        </h3>
                        <p className="font-sans text-[11px] font-bold text-on-surface-variant/50 uppercase tracking-[0.15em] mt-1">
                          {offer.merchant} · {offer.date}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-sans font-black text-green-600 text-xl">
                        ${offer.amount.toFixed(2)}
                      </p>
                      <p className="font-sans text-[10px] font-black text-on-surface-variant/50 uppercase tracking-widest">
                        Saved
                      </p>
                    </div>
                  </motion.div>
                ))}
                {/* Totals row keeps the math transparent */}
                <div className="p-6 md:p-8 flex items-center justify-between bg-surface-container-low/40">
                  <span className="text-xs font-black text-on-surface-variant uppercase tracking-widest">
                    Total saved from {redeemedCount} redeemed offer{redeemedCount !== 1 ? 's' : ''}
                  </span>
                  <span className="font-sans font-black text-green-600 text-xl">
                    ${totalSaved.toFixed(2)}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-linear-to-r from-primary to-primary/90 rounded-4xl p-12 text-center border border-secondary/20 shadow-2xl shadow-primary/10"
        >
          <h3 className="text-3xl font-black text-white mb-3">Ready for More Savings?</h3>
          <p className="text-white/90 font-light mb-8 text-lg max-w-2xl mx-auto">
            Explore thousands of offers tailored to your {displayTier} card and unlock even more value from your purchases.
          </p>
          <Link
            to="/offers"
            className="inline-flex items-center gap-2 bg-white text-primary px-8 py-4 rounded-2xl font-sans text-base font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            View All Offers
            <ArrowUpRight size={18} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
}

function ReadyOfferRow({
  offer,
  index,
  isRecommendation = false,
}: {
  offer: RowOffer;
  index: number;
  isRecommendation?: boolean;
}) {
  const offerPath = `/offers/${encodeURIComponent(offer.sku)}`;
  const { activatedOffers, activateOffer, recordSaving } = useSession();
  const isActivated = activatedOffers.has(offer.sku);

  const handleActivate = () => {
    if (activatedOffers.has(offer.sku)) {
      return;
    }
    activateOffer(offer.sku);
    recordSaving({
      sku: offer.sku,
      merchant: offer.brand,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: deriveSaving(offer),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <div className="p-6 md:p-8 flex items-center justify-between gap-6 hover:bg-surface-container-low transition-colors group">
        <Link to={offerPath} className="flex items-center gap-5 min-w-0 flex-1">
          <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white border border-outline-variant/10 flex items-center justify-center shrink-0">
            {offer.logo_url ? (
              <img src={offer.logo_url} alt={offer.brand} className="w-full h-full object-contain" />
            ) : (
              <span className="font-black text-primary text-sm">{initials(offer.brand)}</span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-sans font-black text-primary text-base md:text-lg truncate">
              {offer.name}
            </h3>
            <p className="font-sans text-[11px] font-bold text-on-surface-variant/50 uppercase tracking-[0.15em] mt-1">
              {offer.brand}
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-4 shrink-0">
          {isRecommendation ? (
            <button
              type="button"
              onClick={handleActivate}
              disabled={isActivated}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 font-sans text-[11px] font-black uppercase tracking-widest transition-all ${
                isActivated
                  ? 'bg-green-600 text-white cursor-default'
                  : 'bg-primary text-white hover:bg-primary/90 active:scale-95'
              }`}
            >
              {isActivated ? (
                <>
                  <Check size={14} /> Activated
                </>
              ) : (
                <>
                  <Plus size={14} /> Activate
                </>
              )}
            </button>
          ) : (
            <>
              <span className="hidden sm:inline text-[10px] font-black text-green-600 uppercase tracking-widest">
                Ready
              </span>
              <ChevronRight size={18} className="text-outline-variant group-hover:text-primary transition-colors" />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
