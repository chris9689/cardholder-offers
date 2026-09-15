import React, { useState } from 'react';
import { Heart, Plus, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { DyRecommendationSlot } from '../lib/dyServerApi';
import { getProductBySku } from '../lib/productFeed';
import { useSession } from '../contexts/SessionContext';

interface DyOfferCardProps {
  slot: DyRecommendationSlot;
  variant?: 'grid' | 'list';
}

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Plausible cashback so activating a recommendation posts to Savings, matching
// the map pin / savings-page activation.
function deriveSaving(sku: string, name: string): number {
  const product = getProductBySku(sku);
  const pctMatch = name.match(/(\d+)\s*%/);
  const minSpend = product ? Number.parseFloat(product.min_spend) || 0 : 0;
  if (pctMatch && minSpend > 0) {
    const pct = Number.parseInt(pctMatch[1], 10);
    return Math.round(pct * minSpend) / 100;
  }
  return Math.round((5 + (hashSeed(sku) % 20)) * 100) / 100;
}

const DyOfferCard: React.FC<DyOfferCardProps> = ({ slot, variant = 'grid' }) => {
  const { productData, sku } = slot;
  const category = productData.categories?.[0] ?? '';
  const brand = productData.brand ?? sku;
  const offerPath = `/offers/${encodeURIComponent(sku)}`;
  const { likedOffers, toggleLike, activatedOffers, activateOffer, recordSaving } = useSession();
  const isLiked = likedOffers.has(sku);
  const isActivated = activatedOffers.has(sku);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(sku);
  };

  const handleActivate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (activatedOffers.has(sku)) {
      return;
    }
    activateOffer(sku);
    recordSaving({
      sku,
      merchant: brand,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: deriveSaving(sku, productData.name),
    });
  };

  if (variant === 'list') {
    return (
      <motion.div
        whileHover={{ x: 4 }}
        className="bg-white rounded-xl overflow-hidden border border-outline-variant/30 group shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col sm:flex-row"
      >
        <div className="h-48 sm:h-auto sm:w-64 sm:shrink-0 relative overflow-hidden">
          {productData.image_url ? (
            <img
              alt={brand}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              src={productData.image_url}
            />
          ) : (
            <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
              {productData.logo_url && (
                <img
                  alt={brand}
                  className="h-16 w-auto object-contain"
                  src={productData.logo_url}
                />
              )}
            </div>
          )}
          <motion.button
            onClick={handleHeartClick}
            whileScale={{ scale: 1.15 }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-on-surface-variant transition-colors shadow-sm"
          >
            <Heart
              size={18}
              className={isLiked ? 'fill-red-500 text-red-500' : 'hover:text-red-500'}
            />
          </motion.button>
        </div>

        <div className="p-5 flex flex-col gap-2 flex-1 min-w-0">
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {productData.logo_url ? (
                <div className="w-6 h-6 rounded bg-surface-container-high flex items-center justify-center border border-outline-variant/20 overflow-hidden shrink-0">
                  <img
                    alt={brand}
                    className="w-full h-full object-contain"
                    src={productData.logo_url}
                  />
                </div>
              ) : (
                <div className="w-6 h-6 rounded bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-primary border border-outline-variant/20">
                  {brand.slice(0, 2).toUpperCase()}
                </div>
              )}
              <span className="font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider truncate">
                {brand}
              </span>
            </div>
            {category && (
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary-fixed/30 px-2 py-0.5 rounded max-w-full sm:max-w-[45%] truncate whitespace-nowrap shrink-0">
                {category}
              </span>
            )}
          </div>

          <h3 className="font-sans text-base md:text-lg font-black text-primary leading-tight line-clamp-2 uppercase tracking-tight">
            {productData.name}
          </h3>

          <div className="mt-auto pt-4 flex items-center justify-between gap-3 border-t border-outline-variant/10">
            <Link
              to={offerPath}
              className="font-sans text-sm font-bold text-secondary hover:underline underline-offset-4 decoration-2"
            >
              See Details
            </Link>
            <button
              type="button"
              onClick={handleActivate}
              disabled={isActivated}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 font-sans text-[11px] font-black uppercase tracking-widest transition-all ${
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
                  <Plus size={14} /> Activate offer
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white rounded-xl overflow-hidden border border-outline-variant/30 group shadow-sm hover:shadow-xl transition-all duration-500"
    >
      <div className="h-48 relative overflow-hidden">
        {productData.image_url ? (
          <img
            alt={brand}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            src={productData.image_url}
          />
        ) : (
          <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
            {productData.logo_url && (
              <img
                alt={brand}
                className="h-16 w-auto object-contain"
                src={productData.logo_url}
              />
            )}
          </div>
        )}
        <motion.button
          onClick={handleHeartClick}
          whileScale={{ scale: 1.15 }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-on-surface-variant transition-colors shadow-sm"
        >
          <Heart
            size={18}
            className={isLiked ? 'fill-red-500 text-red-500' : 'hover:text-red-500'}
          />
        </motion.button>
      </div>

      <div className="p-5 flex flex-col gap-2">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {productData.logo_url ? (
              <div className="w-6 h-6 rounded bg-surface-container-high flex items-center justify-center border border-outline-variant/20 overflow-hidden shrink-0">
                <img
                  alt={brand}
                  className="w-full h-full object-contain"
                  src={productData.logo_url}
                />
              </div>
            ) : (
              <div className="w-6 h-6 rounded bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-primary border border-outline-variant/20">
                {brand.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider truncate">
              {brand}
            </span>
          </div>
          {category && (
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary-fixed/30 px-2 py-0.5 rounded max-w-full sm:max-w-[45%] truncate whitespace-nowrap shrink-0">
              {category}
            </span>
          )}
        </div>

        <h3 className="font-sans text-base font-black text-primary leading-tight h-12 line-clamp-2 uppercase tracking-tight">
          {productData.name}
        </h3>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-outline-variant/10 pt-4">
          <Link
            to={offerPath}
            className="font-sans text-sm font-bold text-secondary hover:underline underline-offset-4 decoration-2"
          >
            See Details
          </Link>
          <button
            type="button"
            onClick={handleActivate}
            disabled={isActivated}
            className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 font-sans text-[11px] font-black uppercase tracking-widest transition-all ${
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
                <Plus size={14} /> Activate offer
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DyOfferCard;
