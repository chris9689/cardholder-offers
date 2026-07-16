/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ChannelStudioFab — floating trigger for the Channel Studio. Placed as a
 * fixed pill so it needs no changes to existing navigation. Hidden while the
 * studio is open.
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone } from 'lucide-react';
import { useChannelStudio } from '../ChannelStudioProvider';

export default function ChannelStudioFab() {
  const { isOpen, open } = useChannelStudio();

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 22, stiffness: 260 }}
          onClick={open}
          className="fixed z-60 flex items-center gap-2.5 rounded-full bg-primary text-white shadow-2xl hover:scale-[1.04] active:scale-[0.97] transition-transform"
          style={{ bottom: 24, right: 24, padding: '14px 20px', border: '1px solid rgba(255,255,255,0.12)' }}
          aria-label="Preview other channels"
        >
          <span className="flex items-center justify-center rounded-full bg-white/15" style={{ width: 26, height: 26 }}>
            <Smartphone size={15} />
          </span>
          <span className="text-[11px] font-black uppercase tracking-widest hidden sm:inline">Preview Other Channels</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
