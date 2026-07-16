/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * DeviceStage — the center canvas. Renders the iPhone (push) and/or iPad
 * (email) depending on the active channel and compare mode, including the
 * "personalizing…" generation shimmer.
 */

import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import PhoneFrame from './frames/PhoneFrame';
import TabletFrame from './frames/TabletFrame';
import PushNotificationCard from './renderers/PushNotificationCard';
import EmailPreview from './renderers/EmailPreview';
import { useChannelStudio } from '../ChannelStudioProvider';
import type { ChannelId } from '../types';

function ShimmerCaption({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-3" style={{ background: 'rgba(10,10,14,0.55)', backdropFilter: 'blur(2px)' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
        className="flex items-center justify-center rounded-2xl"
        style={{ width: 46, height: 46, background: 'rgba(255,255,255,0.12)' }}
      >
        <Sparkles size={22} className="text-white" />
      </motion.div>
      <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">{label}</span>
    </div>
  );
}

function PhoneStage({ compact }: { compact?: boolean }) {
  const { results, config, contextSnapshot } = useChannelStudio();
  const result = results.push;
  const label = contextSnapshot ? `Personalizing for ${contextSnapshot.user.firstName}` : 'Personalizing';

  return (
    <div className="relative" style={{ transform: compact ? 'scale(0.9)' : 'none' }}>
      {result.status === 'loading' && <ShimmerCaption label={label} />}
      <PhoneFrame theme={config.theme}>
        <AnimatePresence mode="wait">
          {result.status === 'ready' && result.content?.push && (
            <PushNotificationCard key={result.content.push.title} content={result.content.push} />
          )}
        </AnimatePresence>
      </PhoneFrame>
    </div>
  );
}

function TabletStage({ compact }: { compact?: boolean }) {
  const { results, config, contextSnapshot } = useChannelStudio();
  const result = results.email;
  const label = contextSnapshot ? `Personalizing for ${contextSnapshot.user.firstName}` : 'Personalizing';

  return (
    <div className="relative" style={{ transform: compact ? 'scale(0.72)' : 'none', transformOrigin: 'center' }}>
      {result.status === 'loading' && <ShimmerCaption label={label} />}
      <TabletFrame theme={config.theme}>
        {result.status === 'ready' && result.content?.email ? (
          <EmailPreview content={result.content.email} theme={config.theme} />
        ) : (
          <div className="w-full h-full" style={{ background: config.theme === 'dark' ? '#000' : '#fff' }} />
        )}
      </TabletFrame>
    </div>
  );
}

export default function DeviceStage() {
  const { activeChannel, deviceMode } = useChannelStudio();

  if (deviceMode === 'compare') {
    return (
      <div className="w-full h-full flex items-center justify-center gap-6 px-6 overflow-hidden">
        <PhoneStage compact />
        <TabletStage compact />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden px-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeChannel}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          {(activeChannel as ChannelId) === 'email' ? <TabletStage /> : <PhoneStage />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
