/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { CardType } from '../contexts/CardContext';

interface AffinityModeSelectorProps {
  isOpen: boolean;
  cardType: CardType;
  onConfirm: (usePreset: boolean) => Promise<void>;
  onCancel: () => void;
}

export default function AffinityModeSelector({
  isOpen,
  cardType,
  onConfirm,
  onCancel,
}: AffinityModeSelectorProps) {
  const [usePreset, setUsePreset] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm(usePreset);
    } finally {
      setIsLoading(false);
    }
  };

  const presetDescriptions: Record<CardType, string> = {
    Standard: 'Shopping, dining & entertainment',
    Premium: 'Travel, dining, entertainment & culture',
    Black: 'Luxury travel, dining, events & culture',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-6"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
                <h2 className="text-lg font-black uppercase tracking-wider text-primary">
                  Switching to {cardType}
                </h2>
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="p-1 text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-sm text-on-surface-variant">
                  How would you like to start your {cardType} card experience?
                </p>

                {/* Checkbox Option */}
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-secondary/30 cursor-pointer hover:border-secondary/50 transition-colors" style={{ borderColor: usePreset ? 'var(--color-secondary, #775a19)' : 'var(--color-outline-variant, #c6c6cc)' }}>
                    <input
                      type="checkbox"
                      checked={usePreset}
                      onChange={(e) => setUsePreset(e.target.checked)}
                      disabled={isLoading}
                      className="mt-1 w-4 h-4 cursor-pointer accent-secondary"
                    />
                    <div className="flex-1">
                      <div className="font-bold text-sm text-primary">
                        Start with {cardType} Presets
                      </div>
                      <div className="text-xs text-on-surface-variant mt-1">
                        {presetDescriptions[cardType]}
                      </div>
                    </div>
                  </label>

                  {/* Unchecked state */}
                  <label className="flex items-start gap-3 p-4 rounded-xl border-2 border-outline-variant/20 cursor-pointer hover:border-outline-variant/40 transition-colors">
                    <input
                      type="checkbox"
                      checked={usePreset}
                      onChange={(e) => setUsePreset(e.target.checked)}
                      disabled={isLoading}
                      className="mt-1 w-4 h-4 cursor-pointer"
                      style={{ accentColor: 'var(--color-primary, #000000)' }}
                    />
                    <div className="flex-1">
                      <div className="font-bold text-sm text-on-surface-variant">
                        Start Fresh
                      </div>
                      <div className="text-xs text-on-surface-variant/60 mt-1">
                        New session with no affinity history
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t border-outline-variant/10 bg-surface-low">
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl border border-outline-variant/20 text-primary font-bold uppercase tracking-wider text-sm hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl bg-secondary text-white font-bold uppercase tracking-wider text-sm hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Setting up...' : 'Confirm'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
