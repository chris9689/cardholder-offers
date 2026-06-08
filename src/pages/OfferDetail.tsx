/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ArrowLeft, ShieldCheck, Clock, Info, ExternalLink, Globe, BadgeCheck } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useCard } from '../contexts/CardContext';
import { choosePdpRecommendations, DyRecommendationSlot } from '../lib/dyServerApi';
import DyOfferCard from '../components/DyOfferCard';
import { getAllProducts, getCategoryDescription, getProductBySku, ProductFeedItem } from '../lib/productFeed';

function formatEndDate(enddate: string): string {
  const date = new Date(enddate);
  if (Number.isNaN(date.getTime())) {
    return 'N/A';
  }
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

function fallbackImage(brand: string): string {
  const query = encodeURIComponent(`${brand} offer`);
  return `https://source.unsplash.com/1400x900/?${query}`;
}

export default function OfferDetail() {
  const { sku } = useParams();
  const navigate = useNavigate();
  const { cardType } = useCard();
  const [recsTitle, setRecsTitle] = useState('Recommended for You');
  const [recommendations, setRecommendations] = useState<DyRecommendationSlot[]>([]);

  const allProducts = useMemo(() => getAllProducts(), []);
  const product = useMemo<ProductFeedItem | undefined>(() => {
    if (!sku) {
      return allProducts[0];
    }
    return getProductBySku(sku) || allProducts[0];
  }, [allProducts, sku]);

  useEffect(() => {
    if (!product?.sku) {
      return;
    }

    let isMounted = true;
    const loadRecommendations = async () => {
      const result = await choosePdpRecommendations(product.sku, cardType);
      if (!isMounted) {
        return;
      }
      setRecsTitle(result.recsTitle);
      setRecommendations(result.recommendations);
    };

    void loadRecommendations();
    return () => {
      isMounted = false;
    };
  }, [product?.sku, cardType]);

  if (!product) {
    return (
      <div className="pt-24 min-h-screen bg-white flex items-center justify-center px-margin-mobile md:px-margin-desktop">
        <div className="bg-surface-container-low border border-outline-variant/20 rounded-4xl p-10 text-center max-w-xl">
          <h2 className="text-2xl font-black text-primary uppercase tracking-wide mb-3">Offer Not Found</h2>
          <p className="font-sans text-on-surface-variant">No matching offer exists in the product feed.</p>
        </div>
      </div>
    );
  }

  const offerEndDate = formatEndDate(product.enddate);
  const categoryDescription = getCategoryDescription(product.categories);
  const imageUrl = product.image_url && !product.image_url.includes('example.com') ? product.image_url : fallbackImage(product.brand);

  return (
    <div className="pt-24 min-h-screen bg-surface">
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
      <section className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop grid lg:grid-cols-12 gap-10 lg:gap-16 pb-20 md:pb-32">
        <div className="lg:col-span-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-4xl border border-outline-variant/20 bg-white shadow-2xl p-4 md:p-6 sticky top-28"
          >
            <div className="rounded-3xl overflow-hidden bg-surface-container-high relative aspect-5/4 md:aspect-4/3">
              <img
                src={imageUrl}
                alt={product.brand}
                className="absolute inset-0 w-full h-full object-contain md:object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3">
                <div className="bg-black/65 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  SKU {product.sku}
                </div>
                <div className="bg-white/90 text-primary px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest">
                  {product.card_tier}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="lg:col-span-6 flex flex-col gap-7 md:gap-9">
          <div className="bg-white rounded-4xl p-6 md:p-8 border border-outline-variant/10 shadow-lg">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-surface-container-high border border-outline-variant/20 overflow-hidden flex items-center justify-center shrink-0">
                {product.logo_url ? (
                  <img src={product.logo_url} alt={product.brand} className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xs font-black text-primary">{product.brand.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div>
                <h4 className="font-sans text-xs font-black text-on-surface-variant uppercase tracking-widest">{product.brand}</h4>
                <p className="font-sans text-[11px] font-bold text-secondary uppercase tracking-widest mt-1">{product.categories}</p>
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl text-primary font-black leading-tight tracking-tighter uppercase mb-5">
              {product.name}
            </h1>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-surface-container-low rounded-2xl p-3 border border-outline-variant/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70">Offer Country</p>
                <p className="text-sm font-black text-primary mt-1">{product.offer_country}</p>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-3 border border-outline-variant/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70">Valid Through</p>
                <p className="text-sm font-black text-primary mt-1">{offerEndDate}</p>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-3 border border-outline-variant/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70">Card Tier</p>
                <p className="text-sm font-black text-primary mt-1">{product.card_tier}</p>
              </div>
              <div className="bg-surface-container-low rounded-2xl p-3 border border-outline-variant/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant/70">Category</p>
                <p className="text-sm font-black text-primary mt-1">{product.categories}</p>
              </div>
            </div>

            <p className="font-sans text-on-surface-variant text-base md:text-lg leading-relaxed font-medium">
              {categoryDescription}
            </p>
          </div>

          <div className="bg-surface-container-low p-6 md:p-8 rounded-4xl border border-outline-variant/10">
            <h3 className="font-sans text-xl font-black text-primary mb-4 flex items-center gap-2 uppercase tracking-wide">
              <Info size={22} className="text-secondary" />
              Offer Details
            </h3>
            <p className="font-sans text-on-surface-variant leading-loose font-light mb-5">
              This offer is available for eligible cardholders and applies to qualifying transactions that meet the published spend threshold.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-secondary-fixed/40 text-secondary">
                <Clock size={14} /> Expires {offerEndDate}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white text-primary border border-outline-variant/20">
                <Globe size={14} /> {product.offer_country}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-white text-primary border border-outline-variant/20">
                <BadgeCheck size={14} /> {product.card_tier} Tier
              </span>
            </div>
          </div>

          <div className="bg-surface-container-low p-6 md:p-8 rounded-4xl border border-outline-variant/10">
            <h3 className="font-sans text-xl font-black text-primary mb-6 flex items-center gap-2 uppercase tracking-wide">
              <ShieldCheck size={22} className="text-green-700" />
              How to Redeem
            </h3>
            <ul className="flex flex-col gap-4">
              <li className="flex gap-4 font-sans text-on-surface-variant font-light">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                Open this offer page and review eligibility, spend requirement, and validity period.
              </li>
              <li className="flex gap-4 font-sans text-on-surface-variant font-light">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                Activate the offer, then complete a qualifying purchase using your eligible enrolled card.
              </li>
              <li className="flex gap-4 font-sans text-on-surface-variant font-light">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0 text-xs font-bold">3</div>
                Allow processing time for benefit posting and monitor status updates in your account activity.
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-4xl border border-outline-variant/10 shadow-lg">
            <h3 className="font-sans text-xl font-black text-primary mb-4 uppercase tracking-wide">Terms & Conditions</h3>
            <p className="font-sans text-on-surface-variant text-sm leading-relaxed font-light opacity-80">
              Offer valid through {offerEndDate}. Eligibility, minimum spend requirements, and posting timelines apply per issuing program terms.
              Offer availability may vary by region and card tier. Standard cardholder agreement and network terms remain applicable.
            </p>
          </div>

          <div className="sticky bottom-6 lg:relative lg:bottom-0 mt-1">
            <a
              href={product.url || '#'}
              className="w-full bg-primary text-white p-5 rounded-3xl font-sans text-base font-bold hover:bg-primary/90 hover:scale-[1.01] active:scale-95 transition-all shadow-2xl shadow-primary/20 flex items-center justify-center gap-3"
            >
              Activate Offer
              <ExternalLink size={18} />
            </a>
          </div>
        </div>
      </section>

      {/* Suggested Section */}
      <section className="bg-surface-container py-20 md:py-28">
        <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="flex justify-between items-end mb-12">
            <h2 className="font-sans text-2xl md:text-4xl text-primary font-black uppercase tracking-tighter">{recsTitle}</h2>
            <Link to="/offers" className="font-sans text-xs font-bold text-primary border-b-2 border-primary pb-1 uppercase tracking-widest hover:text-secondary hover:border-secondary transition-all">View All</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recommendations.length > 0
              ? recommendations.slice(0, 3).map((slot) => (
                  <DyOfferCard key={slot.slotId || slot.sku} slot={slot} />
                ))
              : allProducts.slice(0, 3).map((item) => (
                  <DyOfferCard
                    key={item.sku}
                    slot={{
                      sku: item.sku,
                      productData: {
                        group_id: item.group_id,
                        categories: [item.categories],
                        in_stock: item.in_stock,
                        name: item.name,
                        url: item.url,
                        image_url: item.image_url,
                        logo_url: item.logo_url,
                        brand: item.brand,
                        card_tier: item.card_tier,
                        offer_country: item.offer_country,
                      },
                    }}
                  />
                ))}
          </div>
        </div>
      </section>
    </div>
  );
}
