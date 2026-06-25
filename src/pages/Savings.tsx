/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, TrendingUp, Gift, ArrowUpRight, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useSession } from '../contexts/SessionContext';
import { useCard } from '../contexts/CardContext';

export default function Savings() {
  const navigate = useNavigate();
  const { savingsTransactions, activatedOffers } = useSession();
  const { cardType, userVariables } = useCard();

  const displayTier = userVariables?.cardType ?? cardType;
  const totalSaved = savingsTransactions.reduce((sum, t) => sum + t.amount, 0);
  const usedOffers = activatedOffers.size;

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

      {/* Summary Section */}
      <section className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Total Saved Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/30 rounded-4xl p-10 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <span className="text-[10px] font-black text-green-700 uppercase tracking-[0.3em]">Total Money Saved</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-6xl font-black text-green-700">${totalSaved.toFixed(2)}</h2>
              <p className="text-sm font-bold text-green-600 uppercase tracking-widest"></p>
            </div>
            <div className="mt-8 pt-8 border-t border-green-200/30">
              <p className="text-xs font-bold text-green-700/70 uppercase tracking-widest">
                From {savingsTransactions.length} transaction{savingsTransactions.length !== 1 ? 's' : ''}
              </p>
            </div>
          </motion.div>

          {/* Used Offers Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/30 rounded-4xl p-10 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                <Gift size={24} className="text-blue-600" />
              </div>
              <span className="text-[10px] font-black text-blue-700 uppercase tracking-[0.3em]">Offers Activated</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-6xl font-black text-blue-700">{usedOffers}</h2>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">Active Offers</p>
            </div>
            <div className="mt-8 pt-8 border-t border-blue-200/30">
              <p className="text-xs font-bold text-blue-700/70 uppercase tracking-widest">
                Keep activating for more savings
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Transactions List */}
      <section className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-12">
        <h2 className="text-3xl text-primary font-black mb-8">Recent Transactions</h2>

        {savingsTransactions.length === 0 ? (
          <div className="bg-white rounded-4xl p-16 text-center border border-outline-variant/10 shadow-sm">
            <Zap size={48} className="mx-auto mb-4 text-on-surface-variant/30" />
            <h3 className="text-xl font-black text-primary mb-2">No Savings Yet</h3>
            <p className="text-on-surface-variant mb-6">Activate offers from your cards to start saving money.</p>
            <Link
              to="/offers"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-2xl font-sans text-sm font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg"
            >
              Browse Offers
              <ArrowUpRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-4xl overflow-hidden shadow-sm border border-outline-variant/10 divide-y divide-outline-variant/10">
            {savingsTransactions.map((transaction, index) => (
              <motion.div
                key={`${transaction.sku}-${index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-8 md:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-surface-container-low transition-colors group"
              >
                <div className="flex items-center gap-6 md:gap-8">
                  {/* Merchant Avatar */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/5 flex items-center justify-center font-black text-primary text-lg shadow-inner border border-secondary/10 shrink-0">
                    {transaction.merchant.substring(0, 2).toUpperCase()}
                  </div>

                  {/* Merchant Details */}
                  <div className="flex-1">
                    <h3 className="font-sans font-black text-primary text-xl mb-2">
                      {transaction.merchant}
                    </h3>
                    <p className="font-sans text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">
                      {transaction.date}
                    </p>
                  </div>
                </div>

                {/* Savings Amount */}
                <div className="sm:text-right">
                  <div className="flex items-center gap-2 justify-end mb-2">
                    <TrendingUp size={18} className="text-green-600" />
                    <p className="font-sans font-black text-green-600 text-2xl">
                      ${transaction.amount.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-sans text-xs font-black text-on-surface-variant/50 uppercase tracking-widest">
                    Money Saved
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary to-primary/90 rounded-4xl p-12 text-center border border-secondary/20 shadow-2xl shadow-primary/10"
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
