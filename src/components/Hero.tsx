/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';

const SLIDES = [
  {
    id: 1,
    tagline: 'Summer Curations',
    title1: 'Exclusive',
    title2: 'Rewards.',
    description: 'Curated luxury stays and culinary journeys for the modern connoisseur.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1600',
    link: '/offers'
  },
  {
    id: 2,
    tagline: 'Jetsetter Privilege',
    title1: 'Amalfi Coast',
    title2: 'Escapes.',
    description: 'Unlock complimentary luxury suite upgrades and private coastal yacht outings.',
    image: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1600',
    link: '/offers'
  },
  {
    id: 3,
    tagline: 'Bespoke Dining',
    title1: 'Michelin Star',
    title2: 'Artistry.',
    description: 'Secure priority bookings and customized tasting menus at world-renowned destinations.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1600',
    link: '/offers'
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];

  return (
    <div className="w-full max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop mt-8">
      <section className="relative w-full h-[460px] md:h-[540px] rounded-[32px] md:rounded-[48px] overflow-hidden group shadow-xl border border-outline-variant/10 bg-black">
        {/* Background Image Carousel transition */}
        <div className="absolute inset-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.9, ease: 'easeInOut' }}
              className="absolute inset-0 w-full h-full"
            >
              <img 
                className="absolute inset-0 w-full h-full object-cover opacity-80" 
                alt={slide.tagline}
                src={slide.image} 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/40 to-transparent" />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="w-full px-8 md:px-20 z-10">
            <AnimatePresence mode="wait">
              <motion.div 
                key={currentSlide}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="max-w-xl text-white"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-sans text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-secondary-fixed">
                    {slide.tagline}
                  </span>
                  <Sparkles size={14} className="text-secondary-fixed animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                
                <h1 className="text-4xl md:text-7xl mb-4 leading-[1.05] md:leading-[1.02] font-black uppercase tracking-tighter not-italic">
                  {slide.title1} <br /> {slide.title2}
                </h1>
                
                <p className="font-sans text-sm md:text-base mb-8 opacity-80 max-w-sm md:max-w-md leading-relaxed font-normal">
                  {slide.description}
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Link 
                    to={slide.link} 
                    className="bg-white text-primary px-8 py-3.5 rounded-full font-sans text-xs font-black uppercase tracking-widest hover:bg-secondary-fixed hover:text-white transition-all duration-500 shadow-xl flex items-center gap-2 group"
                  >
                    <span>Explore Collection</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        
        {/* Navigation Arrows */}
        <button 
          onClick={handlePrev}
          className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm z-20 cursor-pointer"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={handleNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-black/30 hover:bg-black/60 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-sm z-20 cursor-pointer"
        >
          <ChevronRight size={20} />
        </button>

        {/* Indicator Bullets */}
        <div className="absolute bottom-8 md:bottom-12 right-8 md:right-16 flex gap-2.5 z-20">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 hover:bg-white transition-all duration-500 cursor-pointer ${currentSlide === idx ? 'w-10 bg-white rounded-full' : 'w-2 bg-white/40 rounded-full'}`}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
