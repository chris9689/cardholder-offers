import React from 'react';
import { Heart, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { DyRecommendationSlot } from '../lib/dyServerApi';

interface DyOfferCardProps {
  slot: DyRecommendationSlot;
}

const DyOfferCard: React.FC<DyOfferCardProps> = ({ slot }) => {
  const { productData, sku } = slot;
  const category = productData.categories?.[0] ?? '';
  const brand = productData.brand ?? sku;
  const offerPath = `/offers/${encodeURIComponent(sku)}`;

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
        <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-on-surface-variant hover:text-red-500 transition-colors shadow-sm">
          <Heart size={18} />
        </button>
      </div>

      <div className="p-5 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
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
            <span className="font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider truncate max-w-[100px]">
              {brand}
            </span>
          </div>
          {category && (
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary-fixed/30 px-2 py-0.5 rounded shrink-0">
              {category}
            </span>
          )}
        </div>

        <h3 className="font-sans text-base font-black text-primary leading-tight h-12 line-clamp-2 uppercase tracking-tight">
          {productData.name}
        </h3>

        <div className="mt-4 flex items-center justify-between border-t border-outline-variant/10 pt-4">
          <Link
            to={offerPath}
            className="text-secondary font-sans text-sm font-bold hover:underline underline-offset-4 decoration-2"
          >
            Activate Offer
          </Link>
          <Link to={offerPath} className="text-on-surface-variant hover:text-primary transition-colors">
            <ExternalLink size={18} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default DyOfferCard;
