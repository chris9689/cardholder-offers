/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Globe, Mail, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BRAND } from '../config';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low border-t border-outline-variant/30 py-16">
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1">
          <img 
            alt={BRAND.logoAlt}
            className="h-10 w-auto mb-6" 
            src={BRAND.logoUrl}
          />
          <p className="font-sans text-on-surface-variant max-w-xs mb-8 leading-relaxed">
            Curating exclusive cardholder offers and savings across dining, travel, shopping, and culture—personalized to your card and the places you love.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors"><Globe size={20} /></a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors"><Mail size={20} /></a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors"><Share2 size={20} /></a>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="font-sans text-sm font-bold text-primary uppercase tracking-widest">Offers</span>
          <Link to="#" className="font-sans text-on-surface-variant hover:text-primary transition-colors">Featured Deals</Link>
          <Link to="#" className="font-sans text-on-surface-variant hover:text-primary transition-colors">Partner Merchants</Link>
          <Link to="#" className="font-sans text-on-surface-variant hover:text-primary transition-colors">Redeem Rewards</Link>
        </div>

        <div className="flex flex-col gap-4">
          <span className="font-sans text-sm font-bold text-primary uppercase tracking-widest">Support</span>
          <Link to="#" className="font-sans text-on-surface-variant hover:text-primary transition-colors">Contact Us</Link>
          <Link to="#" className="font-sans text-on-surface-variant hover:text-primary transition-colors">FAQ</Link>
          <Link to="#" className="font-sans text-on-surface-variant hover:text-primary transition-colors">Cardholder Agreement</Link>
        </div>

        <div className="flex flex-col gap-4">
          <span className="font-sans text-sm font-bold text-primary uppercase tracking-widest">Legal</span>
          <Link to="#" className="font-sans text-on-surface-variant hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="#" className="font-sans text-on-surface-variant hover:text-primary transition-colors">Terms of Service</Link>
          <p className="font-sans text-xs text-on-surface-variant mt-8 opacity-60">
            {BRAND.footerCopy}
          </p>
        </div>
      </div>
    </footer>
  );
}
