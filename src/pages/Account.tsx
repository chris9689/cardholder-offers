/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { CreditCard, Award, History, Settings, ChevronRight, PieChart, Bell, Sparkles, TrendingUp } from 'lucide-react';
import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CardType, useCard } from '../contexts/CardContext';
import { useSession } from '../contexts/SessionContext';
import { USER } from '../config';

interface ActivityItem {
  merchant: string;
  date: string;
  amount: string;
  reward: string;
}

interface TierAccountMock {
  cardEnding: string;
  nextTierLabel: string;
  progressWidthClass: string;
  activities: ActivityItem[];
}

const DEFAULT_ACTIVITIES: ActivityItem[] = [
  { merchant: 'Walmart', date: 'Jun 22, 2026', amount: '$45.67', reward: '+$4.57 Cashback' },
  { merchant: 'CVS Pharmacy', date: 'Jun 19, 2026', amount: '$28.34', reward: '+$2.83 Cashback' },
  { merchant: 'Costco', date: 'Jun 15, 2026', amount: '$102.50', reward: '+$10.25 Cashback' },
];

const DEFAULT_TIER_MOCK: TierAccountMock = {
  cardEnding: '4242',
  nextTierLabel: 'Spend $1,250 more to unlock Centurion Privileges',
  progressWidthClass: 'w-3/4',
  activities: DEFAULT_ACTIVITIES,
};

const TIER_ACCOUNT_MOCKS: Record<CardType, TierAccountMock> = {
  Standard: {
    cardEnding: '1184',
    nextTierLabel: 'Spend $2,400 more this quarter to unlock Premium tier perks',
    progressWidthClass: 'w-2/5',
    activities: [
      { merchant: 'Walmart', date: 'Jun 22, 2026', amount: '$45.67', reward: 'Activated Offer' },
      { merchant: 'CVS Pharmacy', date: 'Jun 19, 2026', amount: '$28.34', reward: 'Activated Offer' },
      { merchant: 'Costco', date: 'Jun 15, 2026', amount: '$102.50', reward: 'Activated Offer' },
    ],
  },
  Premium: {
    cardEnding: '7721',
    nextTierLabel: 'Spend $3,600 more to unlock Black card privileges',
    progressWidthClass: 'w-3/5',
    activities: [
      { merchant: 'Marriott Hotel', date: 'Jun 20, 2026', amount: '$385.50', reward: 'Activated Offer' },
      { merchant: 'Delta Airlines', date: 'Jun 16, 2026', amount: '$425.75', reward: 'Activated Offer' },
      { merchant: 'Ruth\'s Chris Steakhouse', date: 'Jun 12, 2026', amount: '$189.99', reward: 'Activated Offer' },
    ],
  },
  Black: {
    cardEnding: '4242',
    nextTierLabel: 'You are in the highest published tier. Unlock invite-only concierge moments with premium spend.',
    progressWidthClass: 'w-[92%]',
    activities: [
      { merchant: 'Park Hyatt Resort', date: 'Jun 21, 2026', amount: '$895.00', reward: 'Activated Offer' },
      { merchant: 'United First Class', date: 'Jun 18, 2026', amount: '$950.00', reward: 'Activated Offer' },
      { merchant: 'Luxury Spa & Wellness', date: 'Jun 14, 2026', amount: '$680.50', reward: 'Activated Offer' },
    ],
  },
};

export default function Account() {
  const { cardType, userVariables } = useCard();
  const { savingsTransactions } = useSession();

  const displayName = userVariables?.name ?? USER.name;
  const displayTier = userVariables?.cardType ?? cardType;
  const totalSaved = savingsTransactions.reduce((sum, t) => sum + t.amount, 0);

  const tierData = TIER_ACCOUNT_MOCKS[displayTier] ?? DEFAULT_TIER_MOCK;
  const activities = tierData.activities?.length > 0 ? tierData.activities : DEFAULT_ACTIVITIES;

  return (
    <div className="pt-16 min-h-screen pb-32 bg-surface">
      {/* Header Profile - Reduced Height & Cleaner */}
      <section className="bg-white border-b border-outline-variant/10 py-16 px-margin-mobile md:px-margin-desktop overflow-hidden relative">
        <div className="max-w-max-width mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="font-sans text-[10px] font-black text-secondary uppercase tracking-[0.4em]">Membership Dashboard</span>
                <div className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              </div>
              <h1 className="text-4xl md:text-6xl text-primary font-black mb-6">{displayName}</h1>
              <div className="flex flex-wrap gap-3">
                <div className="bg-primary px-5 py-2.5 rounded-xl flex items-center gap-2.5 shadow-lg shadow-primary/10">
                  <Award size={16} className="text-secondary" />
                  <span className="font-sans text-[10px] font-black uppercase tracking-widest text-white">{displayTier} Elite Tier</span>
                </div>
                <div className="bg-surface-container px-5 py-2.5 rounded-xl flex items-center gap-2.5 border border-outline-variant/20">
                   <CreditCard size={16} className="text-on-surface-variant" />
                   <span className="font-sans text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Card Ending {tierData.cardEnding}</span>
                </div>
              </div>
            </div>
            
            <div className="hidden lg:block bg-secondary-container/30 border border-secondary/10 p-6 rounded-3xl max-w-xs">
              <div className="flex items-center gap-2 mb-2 text-secondary">
                <Sparkles size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Next Tier Progress</span>
              </div>
              <div className="w-full h-1.5 bg-white rounded-full overflow-hidden mb-3">
                <div className={`h-full bg-secondary rounded-full ${tierData.progressWidthClass}`} />
              </div>
              <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-widest leading-relaxed">
                {tierData.nextTierLabel}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Account Actions */}
      <section className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop py-16 grid lg:grid-cols-12 gap-12">
        {/* Stats Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-10 rounded-[40px] shadow-sm border border-outline-variant/10">
            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] mb-8 block flex items-center gap-2">
              <TrendingUp size={14} className="text-green-600" />
              Total Saved
            </span>
            <div className="space-y-1">
              <h3 className="text-6xl text-primary font-black">${totalSaved.toFixed(2)}</h3>
              <p className="text-xs font-black text-green-600 uppercase tracking-widest">From Activated Offers</p>
            </div>
            <div className="mt-12 pt-8 border-t border-outline-variant/10">
              <Link to="/savings" className="w-full bg-primary text-white py-4 rounded-2xl font-sans text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/10 flex items-center justify-center">
                View Savings Details
              </Link>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-outline-variant/10">
            <h4 className="text-xl text-primary font-black mb-8 ml-2">Quick Settings</h4>
            <div className="space-y-2">
              {[
                { icon: <PieChart size={18} />, label: 'Spending' },
                { icon: <Bell size={18} />, label: 'Alerts' },
                { icon: <Settings size={18} />, label: 'Security' },
              ].map((item, idx) => (
                <button key={idx} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-surface-container transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="text-on-surface-variant group-hover:text-primary transition-colors">{item.icon}</div>
                    <span className="font-sans text-xs font-bold text-on-surface-variant group-hover:text-primary transition-colors uppercase tracking-widest">{item.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-outline-variant opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Activity & History Column */}
        <div className="lg:col-span-8 space-y-12">
          <div className="flex justify-between items-baseline mb-4 ml-4">
            <h2 className="text-3xl text-primary font-black">Recent Activated Offers</h2>
            <Link to="/savings" className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] border-b border-secondary/30 pb-0.5">Full Savings</Link>
          </div>
          
          <div className="bg-white rounded-[48px] overflow-hidden shadow-sm border border-outline-variant/10 divide-y divide-outline-variant/10">
            {activities.map((act, i) => (
              <div key={i} className="p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 hover:bg-surface-container-low transition-colors group">
                <div className="flex items-center gap-8">
                  <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center font-black text-primary text-xl shadow-inner uppercase">
                    {act.merchant.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="font-sans font-black text-primary text-xl mb-1">{act.merchant}</h5>
                    <p className="font-sans text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em]">{act.date}</p>
                  </div>
                </div>
                <div className="sm:text-right">
                  <p className="font-sans font-black text-primary text-xl mb-1">{act.amount}</p>
                  <p className="font-sans text-xs font-black text-secondary uppercase tracking-widest">{act.reward}</p>
                </div>
              </div>
            ))}
            <button className="w-full p-8 text-center font-sans text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] hover:text-primary hover:bg-surface-container-low transition-all">
              Load More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
