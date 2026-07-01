/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreditCard, Menu, X, ChevronDown, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useCard, CardType } from '../contexts/CardContext';
import { BRAND } from '../config';
import AffinityModeSelector from './AffinityModeSelector';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCardMenu, setShowCardMenu] = useState(false);
  const location = useLocation();
  const {
    cardType,
    setIsAgentOpen,
    showAffinityModal,
    pendingCardType,
    handleCardTypePending,
    confirmCardTypeChange,
    cancelCardTypeChange,
  } = useCard();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Offers', path: '/offers' },
    { name: 'Savings', path: '/savings' },
    { name: 'My Account', path: '/account' },
  ];

  const cardOptions: CardType[] = ['Standard', 'Premium', 'Black'];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-outline-variant/10">
      <div className="max-w-max-width mx-auto flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img 
            alt={BRAND.logoAlt}
            className="h-7 w-auto transition-transform group-hover:scale-105 duration-300" 
            src={BRAND.logoUrl}
          />
          <span className="font-sans font-black text-xs md:text-sm uppercase tracking-wider text-primary group-hover:text-secondary transition-colors duration-300">
            {BRAND.name}
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`nav-link ${
                location.pathname === link.path 
                ? 'text-primary border-primary' 
                : 'text-on-surface-variant border-transparent hover:text-primary hover:border-primary/30'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Account / Card Type Selector */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsAgentOpen(true)}
            className="flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-secondary-container/10 border border-secondary/20 hover:border-secondary/40 transition-all text-xs font-black uppercase tracking-widest text-secondary hover:scale-[1.03] active:scale-[0.97]"
          >
            <Sparkles size={14} className="animate-pulse" />
            <span className="hidden sm:inline">Ask Agent</span>
          </button>

          <div className="relative">
            <button 
              onMouseEnter={() => setShowCardMenu(true)}
              onClick={() => setShowCardMenu(!showCardMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low border border-outline-variant/20 hover:border-primary/30 transition-all text-xs font-bold uppercase tracking-widest text-primary"
            >
              <CreditCard size={16} className={cardType === 'Black' ? 'text-primary' : 'text-secondary'} />
              <span className="hidden sm:inline">{cardType} Card</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${showCardMenu ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showCardMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  onMouseLeave={() => setShowCardMenu(false)}
                  className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-outline-variant/10 overflow-hidden py-2"
                >
                  <p className="px-4 py-2 text-[10px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/10 mb-2">Switch Tier</p>
                  {cardOptions.map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        handleCardTypePending(type);
                        setShowCardMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-xs font-bold tracking-widest uppercase hover:bg-surface-container transition-colors flex items-center justify-between group"
                    >
                      <span className={cardType === type ? 'text-secondary' : 'text-on-surface-variant'}>{type}</span>
                      {cardType === type && (
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button 
            className="md:hidden p-2 text-primary"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute top-full left-0 w-full bg-white border-t md:hidden shadow-2xl"
          >
            <div className="flex flex-col p-8 gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="font-sans text-xl font-extrabold text-primary uppercase tracking-tighter"
                >
                  {link.name}
                </Link>
              ))}
              
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsAgentOpen(true);
                }}
                className="font-sans text-xl font-extrabold text-secondary uppercase tracking-tighter flex items-center gap-2 text-left bg-transparent border-none p-0"
              >
                <Sparkles size={20} className="animate-pulse text-secondary" />
                Ask Assistant
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </nav>

      {/* Affinity Mode Selector Modal */}
      <AffinityModeSelector
        isOpen={showAffinityModal}
        cardType={pendingCardType || cardType}
        onConfirm={confirmCardTypeChange}
        onCancel={cancelCardTypeChange}
      />
    </>
  );
}
