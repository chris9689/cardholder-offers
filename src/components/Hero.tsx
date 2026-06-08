/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { useCard } from '../contexts/CardContext';
import { chooseHeroBanner, HeroBannerPayload } from '../lib/dyServerApi';

const FALLBACK_BANNER: HeroBannerPayload = {
  image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600',
  label: 'Summer Curations',
  title: 'Exclusive Rewards',
  subtitle: 'Curated luxury stays and culinary journeys for the modern connoisseur.',
  cta: 'Explore Collection',
  link: '/offers',
};

function resolveLink(link: string | undefined): string {
  if (!link) {
    return '/offers';
  }

  if (link.startsWith('http://') || link.startsWith('https://')) {
    return link;
  }

  return link.startsWith('/') ? link : `/${link}`;
}

export default function Hero() {
  const { pathname } = useLocation();
  const { cardType } = useCard();
  const [banner, setBanner] = useState<HeroBannerPayload | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadBanner = async () => {
      const payload = await chooseHeroBanner(pathname, cardType);
      if (isMounted) {
        setBanner(payload);
      }
    };

    void loadBanner();

    return () => {
      isMounted = false;
    };
  }, [pathname, cardType]);

  const activeBanner = useMemo(() => ({ ...FALLBACK_BANNER, ...(banner || {}) }), [banner]);
  const heroLink = resolveLink(activeBanner.link);
  const titleSegments = (activeBanner.title || FALLBACK_BANNER.title || '').split(' ');
  const titleFirstLine = titleSegments.slice(0, Math.max(1, Math.ceil(titleSegments.length / 2))).join(' ');
  const titleSecondLine = titleSegments.slice(Math.max(1, Math.ceil(titleSegments.length / 2))).join(' ');

  return (
    <div className="w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop mt-8">
      <section className="relative w-full h-[460px] md:h-[540px] rounded-4xl md:rounded-[48px] overflow-hidden group shadow-xl border border-outline-variant/10 bg-black">
        <div className="absolute inset-0">
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full"
          >
            <img
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              alt={activeBanner.label || 'Hero Banner'}
              src={activeBanner.image || FALLBACK_BANNER.image}
            />
            <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/40 to-transparent" />
          </motion.div>
        </div>

        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-8 md:px-20 z-10">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="max-w-xl text-white"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="font-sans text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-secondary-fixed">
                  {activeBanner.label || FALLBACK_BANNER.label}
                </span>
                <Sparkles size={14} className="text-secondary-fixed animate-spin" style={{ animationDuration: '6s' }} />
              </div>

              <h1 className="text-4xl md:text-7xl mb-4 leading-[1.05] md:leading-[1.02] font-black uppercase tracking-tighter not-italic">
                {titleFirstLine}
                {titleSecondLine ? <><br />{titleSecondLine}</> : null}
              </h1>

              <p className="font-sans text-sm md:text-base mb-8 opacity-80 max-w-sm md:max-w-md leading-relaxed font-normal">
                {activeBanner.subtitle || FALLBACK_BANNER.subtitle}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to={heroLink}
                  className="bg-white text-primary px-8 py-3.5 rounded-full font-sans text-xs font-black uppercase tracking-widest hover:bg-secondary-fixed hover:text-white transition-all duration-500 shadow-xl flex items-center gap-2 group"
                >
                  <span>{activeBanner.cta || FALLBACK_BANNER.cta}</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
