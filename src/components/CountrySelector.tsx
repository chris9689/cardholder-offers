/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCard, COUNTRY_EVERYWHERE } from '../contexts/CardContext';
import { getFeedCountries } from '../lib/productFeed';

export default function CountrySelector() {
  const { selectedCountry, setSelectedCountry } = useCard();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const countries = useMemo(() => getFeedCountries(), []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const options = [COUNTRY_EVERYWHERE, ...countries];
  const label = selectedCountry === COUNTRY_EVERYWHERE ? 'Explore Offers Everywhere' : `Explore Offers in ${selectedCountry}`;

  const handleSelect = (country: string) => {
    setSelectedCountry(country);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="flex items-center gap-1.5 text-secondary font-sans text-[10px] font-black uppercase tracking-[0.2em] hover:text-primary transition-colors"
      >
        <Globe size={14} className="shrink-0" />
        <span className="truncate">{label}</span>
        <ChevronDown size={14} className={`shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            role="listbox"
            className="absolute right-0 md:right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-2xl border border-outline-variant/10 overflow-hidden py-2 z-50 max-h-72 overflow-y-auto"
          >
            <li className="px-4 py-2 text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 mb-1">
              Select Country
            </li>
            {options.map((country) => {
              const isSelected = country === selectedCountry;
              const optionLabel = country === COUNTRY_EVERYWHERE ? 'Everywhere' : country;
              return (
                <li key={country} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => handleSelect(country)}
                    className="w-full text-left px-4 py-3 text-xs font-bold tracking-widest uppercase hover:bg-surface-container transition-colors flex items-center justify-between gap-2 group"
                  >
                    <span className={isSelected ? 'text-secondary' : 'text-on-surface-variant'}>{optionLabel}</span>
                    {isSelected && <Check size={14} className="text-secondary shrink-0" />}
                  </button>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
