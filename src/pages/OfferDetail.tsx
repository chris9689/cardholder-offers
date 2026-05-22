/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowLeft, Share2, Heart, ShieldCheck, Clock, Info, CheckCircle, ExternalLink } from 'lucide-react';
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { OFFERS } from '../data/offers';
import { motion } from 'motion/react';
import OfferCard from '../components/OfferCard';

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const offer = OFFERS.find(o => o.id === id) || OFFERS[0];

  return (
    <div className="pt-24 min-h-screen bg-white">
      {/* Navigation */}
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-8">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary font-sans text-xs font-bold uppercase tracking-widest transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Offers
        </button>
      </div>

      {/* Main Content */}
      <section className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop grid lg:grid-cols-2 gap-16 pb-32">
        {/* Left: Image Container */}
        <div className="relative">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="aspect-[4/5] rounded-[48px] overflow-hidden shadow-2xl sticky top-32"
          >
            <img src={offer.image} className="w-full h-full object-cover" alt={offer.merchant} />
            <div className="absolute top-6 right-6 flex flex-col gap-3">
              <button className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-red-500 shadow-xl transition-all"><Heart size={24} /></button>
              <button className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-on-surface-variant hover:text-primary shadow-xl transition-all"><Share2 size={24} /></button>
            </div>
          </motion.div>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col gap-10">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-sm font-bold text-primary border border-outline-variant/20 shadow-sm">
                {offer.merchantLogo}
              </div>
              <div>
                <h4 className="font-sans text-sm font-bold text-on-surface-variant uppercase tracking-widest leading-none">
                  {offer.merchant}
                </h4>
                <p className="text-secondary font-sans text-xs font-bold tracking-widest uppercase mt-1">{offer.category}</p>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-7xl text-primary font-black mb-8 leading-[0.95] tracking-tighter uppercase not-italic">
              {offer.title}
            </h1>
            
            <div className="flex flex-wrap gap-4 mb-10">
              <div className="bg-secondary text-white px-6 py-3 rounded-2xl font-sans text-sm font-bold shadow-lg shadow-secondary/20">
                {offer.rewardValue} {offer.rewardType.charAt(0).toUpperCase() + offer.rewardType.slice(1)}
              </div>
              <div className="bg-surface-container text-on-surface-variant px-6 py-3 rounded-2xl font-sans text-sm font-bold flex items-center gap-2">
                <Clock size={16} />
                Ends Dec 31, 2024
              </div>
            </div>

            <p className="font-sans text-on-surface-variant text-xl font-light leading-relaxed mb-10 pb-10 border-b border-outline-variant/20">
              {offer.description}
            </p>
          </div>

          <div className="flex flex-col gap-8">
            <div>
              <h3 className="font-sans text-xl font-black text-primary mb-4 flex items-center gap-2 uppercase tracking-wide">
                <Info size={24} className="text-secondary" />
                Offer Details
              </h3>
              <p className="font-sans text-on-surface-variant leading-loose font-light">
                {offer.details}
              </p>
            </div>

            <div className="bg-surface-container-low p-8 rounded-[32px] border border-outline-variant/10">
              <h3 className="font-sans text-xl font-black text-primary mb-6 flex items-center gap-2 uppercase tracking-wide">
                <ShieldCheck size={24} className="text-green-600" />
                How to Redeem
              </h3>
              <ul className="flex flex-col gap-4">
                <li className="flex gap-4 font-sans text-on-surface-variant font-light">
                   <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                   Click "Activate Offer" to register your eligible card.
                </li>
                <li className="flex gap-4 font-sans text-on-surface-variant font-light">
                   <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                   Use the activated card at {offer.merchant} (in-store or online).
                </li>
                <li className="flex gap-4 font-sans text-on-surface-variant font-light">
                   <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                   Rewards will be credited to your account within 30 days.
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-sans text-xl font-black text-primary mb-4 uppercase tracking-wide">Terms & Conditions</h3>
              <p className="font-sans text-on-surface-variant text-sm leading-relaxed font-light opacity-70">
                {offer.terms} Standard cardholder agreement applies. Cannot be combined with other promotional offers unless specified. Reward points are calculated based on the net transaction value excluding taxes and shipping fees.
              </p>
            </div>
          </div>

          <div className="sticky bottom-8 lg:relative lg:bottom-0 mt-8">
            {offer.status === 'registered' ? (
              <div className="w-full bg-green-50 text-green-700 p-6 rounded-3xl border border-green-200 flex items-center justify-center gap-3 font-sans font-bold shadow-xl">
                 <CheckCircle size={24} />
                 Card Registered & Offer Active
              </div>
            ) : (
              <button className="w-full bg-primary text-white p-6 rounded-3xl font-sans text-lg font-bold hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3">
                 Activate Offer
                 <ExternalLink size={20} />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Suggested Section */}
      <section className="bg-surface-container py-32">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex justify-between items-end mb-16">
            <h2 className="font-sans text-3xl md:text-5xl text-primary font-black uppercase tracking-tighter">Recommended for you</h2>
            <Link to="/offers" className="font-sans text-xs font-bold text-primary border-b-2 border-primary pb-1 uppercase tracking-widest hover:text-secondary hover:border-secondary transition-all">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {OFFERS.slice(0, 3).map(o => (
              <OfferCard key={o.id} offer={o} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
