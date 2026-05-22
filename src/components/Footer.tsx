/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Globe, Mail, Share2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="w-full bg-surface-container-low border-t border-outline-variant/30 py-16">
      <div className="max-w-max-width mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1">
          <img 
            alt="Mastercard Logo" 
            className="h-10 w-auto mb-6" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCmuskyyhrHeFWM3b12DTZNny1RwsOiUZI-7b6HpTHUfqogyUJl-wjj_KPhEnEUiBcvOGYVLiSpOW5z7SIwz4p47URs1z85CcDuIBXBXSO7gU2xSzFOWRx1_w3f0UR9ghQH_-Wb2Ocw0GGk0GLeQDyy0SkUkGyzTTqxpnloUjFv3hwAs-4YWOpEnvp9e1lYNOV3khBvWWis94S6QCN3vo73qM0XhDk-6uPhI7n_Ck_O2W8SKQ8W-4OOrBN2B5Wac77aQ5dTCBBxYJ0" 
          />
          <p className="font-sans text-on-surface-variant max-w-xs mb-8 leading-relaxed">
            Crafting exclusive financial experiences for the world's most discerning travelers and connoisseurs.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors"><Globe size={20} /></a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors"><Mail size={20} /></a>
            <a href="#" className="text-on-surface-variant hover:text-primary transition-colors"><Share2 size={20} /></a>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <span className="font-sans text-sm font-bold text-primary uppercase tracking-widest">Programs</span>
          <Link to="#" className="font-sans text-on-surface-variant hover:text-primary transition-colors">Elite Benefits</Link>
          <Link to="#" className="font-sans text-on-surface-variant hover:text-primary transition-colors">Partner Lounge</Link>
          <Link to="#" className="font-sans text-on-surface-variant hover:text-primary transition-colors">Reward Transfer</Link>
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
            © 2024 Premier Rewards Elite. <br /> All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
