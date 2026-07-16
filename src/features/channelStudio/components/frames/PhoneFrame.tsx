/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PhoneFrame — a high-fidelity iPhone 15 Pro rendered entirely in CSS.
 * Presents a lock-screen surface (wallpaper, Dynamic Island, status bar, clock,
 * home indicator) and renders its children in the notification region.
 */

import React from 'react';
import { Signal, Wifi, BatteryFull, Flashlight, Camera } from 'lucide-react';
import type { DeviceTheme } from '../../types';

interface PhoneFrameProps {
  theme: DeviceTheme;
  time?: string;
  date?: string;
  children?: React.ReactNode;
}

const WALLPAPERS: Record<DeviceTheme, string> = {
  dark: 'radial-gradient(120% 90% at 50% 0%, #3b2f63 0%, #201a3a 42%, #0c0a1c 100%)',
  light: 'radial-gradient(120% 90% at 50% 0%, #e9eefb 0%, #cdd7f2 45%, #aebde6 100%)',
};

export default function PhoneFrame({ theme, time = '9:41', date, children }: PhoneFrameProps) {
  const isDark = theme === 'dark';
  const fg = isDark ? '#ffffff' : '#0b1020';
  const resolvedDate =
    date ??
    new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div
      className="relative"
      style={{
        width: 340,
        height: 720,
        borderRadius: 58,
        padding: 12,
        background: 'linear-gradient(145deg, #4b4d52 0%, #2a2b2f 40%, #1c1d20 100%)',
        boxShadow:
          '0 2px 4px rgba(0,0,0,0.4), 0 30px 70px -20px rgba(0,0,0,0.75), inset 0 0 2px 2px rgba(255,255,255,0.12)',
      }}
    >
      {/* Titanium side buttons */}
      <span style={sideButton(-3, 132, 3, 34)} />
      <span style={sideButton(-3, 176, 3, 56)} />
      <span style={sideButton(-3, 240, 3, 56)} />
      <span style={{ ...sideButton(340, 200, 3, 90), left: 'auto', right: -3 }} />

      {/* Screen */}
      <div
        className="relative overflow-hidden"
        style={{ width: '100%', height: '100%', borderRadius: 47, background: WALLPAPERS[theme] }}
      >
        {/* Status bar */}
        <div
          className="absolute top-0 inset-x-0 flex items-center justify-between px-8 z-20"
          style={{ height: 54, color: fg }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: 0.3 }}>{time}</span>
          <div className="flex items-center gap-1.5">
            <Signal size={16} strokeWidth={2.5} />
            <Wifi size={16} strokeWidth={2.5} />
            <BatteryFull size={20} strokeWidth={2} />
          </div>
        </div>

        {/* Dynamic Island */}
        <div
          className="absolute left-1/2 z-30"
          style={{
            top: 14,
            transform: 'translateX(-50%)',
            width: 122,
            height: 35,
            borderRadius: 20,
            background: '#000',
          }}
        />

        {/* Lock-screen clock */}
        <div className="absolute inset-x-0 z-10 text-center" style={{ top: 74, color: fg }}>
          <div style={{ fontSize: 15, fontWeight: 600, opacity: 0.9 }}>{resolvedDate}</div>
          <div
            style={{
              fontSize: 84,
              fontWeight: 500,
              lineHeight: 1.02,
              letterSpacing: -1,
              marginTop: 2,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {time}
          </div>
        </div>

        {/* Notification region */}
        <div className="absolute inset-x-0 z-10" style={{ top: 236, bottom: 96, padding: '0 12px', overflow: 'hidden' }}>
          <div className="flex flex-col gap-2.5">{children}</div>
        </div>

        {/* Bottom quick actions + home indicator */}
        <div className="absolute inset-x-0 bottom-0 z-10" style={{ height: 96 }}>
          <div className="flex items-center justify-between px-9" style={{ marginTop: 8 }}>
            <QuickAction icon={<Flashlight size={20} fill={fg} color={fg} />} isDark={isDark} />
            <QuickAction icon={<Camera size={20} fill={fg} color={fg} />} isDark={isDark} />
          </div>
          <div
            className="absolute left-1/2"
            style={{
              bottom: 9,
              transform: 'translateX(-50%)',
              width: 134,
              height: 5,
              borderRadius: 3,
              background: fg,
              opacity: 0.85,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, isDark }: { icon: React.ReactNode; isDark: boolean }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: 48,
        height: 48,
        borderRadius: 999,
        background: isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.12)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {icon}
    </div>
  );
}

function sideButton(left: number, top: number, width: number, height: number): React.CSSProperties {
  return {
    position: 'absolute',
    left,
    top,
    width,
    height,
    borderRadius: 2,
    background: 'linear-gradient(90deg, #202124, #45464b)',
  };
}
