/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * DeviceStage — the center canvas. Renders the iPhone (push) and/or iPad
 * (email) depending on the active channel and compare mode. Devices are drawn
 * at their natural pixel size then auto-scaled to fit the available space, so
 * they are never cut off regardless of viewport size or compare mode.
 */

import React, { useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import PhoneFrame from './frames/PhoneFrame';
import TabletFrame from './frames/TabletFrame';
import PushNotificationCard from './renderers/PushNotificationCard';
import EmailPreview from './renderers/EmailPreview';
import { useChannelStudio } from '../ChannelStudioProvider';
import type { ChannelId } from '../types';

// Natural (unscaled) device dimensions, matching the frame components.
const PHONE = { width: 364, height: 744 };
const TABLET = { width: 908, height: 668 };
const PADDING = 40;

/**
 * Measures the wrapper and returns a scale factor so device content of the
 * given natural size fits inside. Never upscales beyond 1.
 */
function useFitScale(naturalWidth: number, naturalHeight: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.001);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    const compute = () => {
      const availW = node.clientWidth - PADDING;
      const availH = node.clientHeight - PADDING;
      if (availW <= 0 || availH <= 0) {
        return;
      }
      const next = Math.min(availW / naturalWidth, availH / naturalHeight, 1);
      setScale(next > 0 ? next : 0.001);
    };
    compute();
    const observer = new ResizeObserver(compute);
    observer.observe(node);
    return () => observer.disconnect();
  }, [naturalWidth, naturalHeight]);

  return { ref, scale };
}

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

function PhoneDevice() {
  const { results, config, contextSnapshot } = useChannelStudio();
  const result = results.push;
  const label = contextSnapshot ? `Personalizing for ${contextSnapshot.user.firstName}` : 'Personalizing';

  return (
    <div className="relative">
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

function TabletDevice() {
  const { results, config, contextSnapshot } = useChannelStudio();
  const result = results.email;
  const label = contextSnapshot ? `Personalizing for ${contextSnapshot.user.firstName}` : 'Personalizing';

  return (
    <div className="relative">
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

/** Wraps a fixed-size device and scales it to fit the available stage area. */
function ScaledDevice({
  natural,
  children,
}: {
  natural: { width: number; height: number };
  children: React.ReactNode;
}) {
  const { ref, scale } = useFitScale(natural.width, natural.height);
  return (
    <div ref={ref} className="flex-1 min-w-0 h-full flex items-center justify-center overflow-hidden">
      <div
        style={{
          width: natural.width,
          height: natural.height,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
          flexShrink: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function DeviceStage() {
  const { activeChannel, deviceMode } = useChannelStudio();

  if (deviceMode === 'compare') {
    return (
      <div className="w-full h-full flex items-stretch justify-center gap-2 px-2 py-2">
        <ScaledDevice natural={PHONE}>
          <PhoneDevice />
        </ScaledDevice>
        <ScaledDevice natural={TABLET}>
          <TabletDevice />
        </ScaledDevice>
      </div>
    );
  }

  const isEmail = (activeChannel as ChannelId) === 'email';
  const natural = isEmail ? TABLET : PHONE;

  return (
    <div className="w-full h-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeChannel}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="w-full h-full"
        >
          <ScaledDevice natural={natural}>{isEmail ? <TabletDevice /> : <PhoneDevice />}</ScaledDevice>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
