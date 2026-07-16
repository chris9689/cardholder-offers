/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * TabletFrame — a high-fidelity iPad Pro (landscape) rendered in CSS.
 * Renders children as the full-screen app surface (used for the Mail app).
 */

import React from 'react';
import { Wifi, BatteryFull } from 'lucide-react';
import type { DeviceTheme } from '../../types';

interface TabletFrameProps {
  theme: DeviceTheme;
  time?: string;
  children?: React.ReactNode;
}

export default function TabletFrame({ theme, time = '9:41', children }: TabletFrameProps) {
  const isDark = theme === 'dark';
  const statusFg = isDark ? '#e5e7eb' : '#1c1c1e';

  return (
    <div
      className="relative"
      style={{
        width: 880,
        height: 640,
        borderRadius: 34,
        padding: 14,
        background: 'linear-gradient(145deg, #3a3b40 0%, #232428 45%, #171719 100%)',
        boxShadow:
          '0 2px 4px rgba(0,0,0,0.4), 0 34px 80px -22px rgba(0,0,0,0.7), inset 0 0 2px 2px rgba(255,255,255,0.1)',
      }}
    >
      {/* Screen */}
      <div
        className="relative overflow-hidden"
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 22,
          background: isDark ? '#000' : '#fff',
        }}
      >
        {/* Status bar */}
        <div
          className="absolute top-0 inset-x-0 flex items-center justify-between z-30"
          style={{ height: 26, padding: '0 20px', color: statusFg, background: isDark ? '#1c1c1e' : '#f2f2f7' }}
        >
          <span style={{ fontSize: 12, fontWeight: 600 }}>{time}</span>
          <div className="flex items-center gap-1.5">
            <Wifi size={13} strokeWidth={2.5} />
            <BatteryFull size={17} strokeWidth={2} />
          </div>
        </div>

        {/* App surface */}
        <div className="absolute inset-x-0 bottom-0" style={{ top: 26 }}>
          {children}
        </div>
      </div>
    </div>
  );
}
