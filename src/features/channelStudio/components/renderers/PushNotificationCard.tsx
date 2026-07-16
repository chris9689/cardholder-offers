/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PushNotificationCard — an iOS lock-screen notification, frosted-glass style,
 * with an incoming slide + spring bounce animation.
 */

import React from 'react';
import { motion } from 'motion/react';
import type { PushContent } from '../../types';

interface PushNotificationCardProps {
  content: PushContent;
  delay?: number;
}

export default function PushNotificationCard({ content, delay = 0 }: PushNotificationCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -36, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 18, stiffness: 260, delay }}
      className="flex items-start gap-2.5"
      style={{
        padding: '12px 13px',
        borderRadius: 22,
        background: 'rgba(245,245,247,0.72)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 8px 24px -12px rgba(0,0,0,0.45)',
      }}
    >
      {/* App icon */}
      <div
        className="flex items-center justify-center shrink-0 overflow-hidden"
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: 'linear-gradient(160deg, #1a1a1a, #000)',
          color: '#fff',
          fontWeight: 800,
          fontSize: 16,
        }}
      >
        {content.appIconImage ? (
          <img src={content.appIconImage} alt="" className="w-full h-full object-cover" />
        ) : (
          content.appIconText
        )}
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1" style={{ color: '#1c1c1e' }}>
        <div className="flex items-center justify-between gap-2" style={{ lineHeight: 1.2 }}>
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: 0.4, opacity: 0.6, textTransform: 'uppercase' }}>
            {content.appName}
          </span>
          <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.5 }}>{content.timeLabel}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2, lineHeight: 1.25 }}>{content.title}</div>
        <div style={{ fontSize: 13, fontWeight: 400, marginTop: 1, lineHeight: 1.3, opacity: 0.9 }}>
          {content.body}
        </div>
      </div>
    </motion.div>
  );
}
