/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ChannelStudioOverlay — the full-screen "Channel Studio" surface. Rendered in
 * a portal, over a dark canvas, with a toolbar, channel rail, device stage and
 * inspector. Fully removable; owns no host-app state.
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { X, Layers, Smartphone } from 'lucide-react';
import { useChannelStudio } from '../ChannelStudioProvider';
import ChannelRail from './ChannelRail';
import DeviceStage from './DeviceStage';
import Inspector from './Inspector';

export default function ChannelStudioOverlay() {
  const { isOpen, close, contextSnapshot, deviceMode, setDeviceMode, activeChannel, setActiveChannel } =
    useChannelStudio();

  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-100 flex items-center justify-center"
          style={{ background: 'rgba(6,6,10,0.6)' }}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Channel Preview"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            onClick={(event) => event.stopPropagation()}
            className="relative flex flex-col overflow-hidden w-full h-full"
            style={{
              background: 'linear-gradient(160deg, #17151f 0%, #0d0c14 55%, #08070c 100%)',
            }}
          >
            {/* Toolbar */}
            <div className="flex items-center justify-between shrink-0 px-6 py-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center rounded-xl bg-white/10" style={{ width: 34, height: 34 }}>
                  <Layers size={17} className="text-white" />
                </span>
                <div>
                  <div className="text-[14px] font-black uppercase tracking-widest text-white leading-none">Channel Preview</div>
                  {contextSnapshot && (
                    <div className="text-[11px] text-white/40 mt-1">
                      {contextSnapshot.pageLabel} • personalized preview
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Compare toggle */}
                <div className="hidden lg:flex items-center rounded-full bg-white/8 p-1">
                  <button
                    onClick={() => setDeviceMode('single')}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-all ${
                      deviceMode === 'single' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Smartphone size={13} /> Single
                  </button>
                  <button
                    onClick={() => setDeviceMode('compare')}
                    className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-all ${
                      deviceMode === 'compare' ? 'bg-white text-black' : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Layers size={13} /> Compare
                  </button>
                </div>

                <button
                  onClick={close}
                  className="flex items-center justify-center rounded-full bg-white/8 hover:bg-white/16 text-white transition-colors"
                  style={{ width: 38, height: 38 }}
                  aria-label="Close Channel Studio"
                >
                  <X size={19} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 flex min-h-0">
              <div className="shrink-0 border-r border-white/8">
                <ChannelRail activeChannel={activeChannel} deviceMode={deviceMode} onSelect={setActiveChannel} />
              </div>
              <div className="flex-1 min-w-0">
                <DeviceStage />
              </div>
              <div className="shrink-0 border-l border-white/8 hidden md:block">
                <Inspector />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
