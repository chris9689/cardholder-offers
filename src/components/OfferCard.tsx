/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, ExternalLink, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Offer } from '../data/offers';

interface OfferCardProps {
  offer: Offer;
}

const OfferCard: React.FC<OfferCardProps> = ({ offer }) => {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-white rounded-xl overflow-hidden border border-outline-variant/30 group shadow-sm hover:shadow-xl transition-all duration-500"
    >
      <div className="h-48 relative overflow-hidden">
        <img 
          alt={offer.merchant} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
          src={offer.image} 
        />
        <button 
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-on-surface-variant hover:text-red-500 transition-colors shadow-sm"
        >
          <Heart size={18} />
        </button>
        {offer.distance && (
          <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold">
            {offer.distance}
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-primary border border-outline-variant/20">
              {offer.merchantLogo}
            </div>
            <span className="font-sans text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              {offer.merchant}
            </span>
          </div>
          <span className="text-[10px] font-bold text-secondary uppercase tracking-widest bg-secondary-fixed/30 px-2 py-0.5 rounded">
            {offer.category}
          </span>
        </div>

        <h3 className="font-sans text-base font-black text-primary leading-tight h-12 line-clamp-2 uppercase tracking-tight">
          {offer.title}
        </h3>

        <div className="mt-4 flex items-center justify-between border-t border-outline-variant/10 pt-4">
          {offer.status === 'registered' ? (
            <div className="flex items-center gap-1 text-green-600 font-sans text-xs font-bold">
              <CheckCircle size={14} />
              Registered
            </div>
          ) : (
            <Link 
              to={`/offers/${offer.id}`} 
              className="text-secondary font-sans text-sm font-bold hover:underline underline-offset-4 decoration-2"
            >
              Activate Offer
            </Link>
          )}
          <Link to={`/offers/${offer.id}`} className="text-on-surface-variant hover:text-primary transition-colors">
            <ExternalLink size={18} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default OfferCard;
