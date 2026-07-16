/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ChannelRail — left-hand channel selector. Active channels are interactive;
 * future channels are shown as elegant "Soon" rows to surface the roadmap.
 */

import React from 'react';
import { Bell, Mail, MessageSquare, MessageCircle, Smartphone, Wallet } from 'lucide-react';
import { CHANNELS } from '../channels/channelRegistry';
import type { ChannelId } from '../types';

const ICONS: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  bell: Bell,
  mail: Mail,
  'message-square': MessageSquare,
  'message-circle': MessageCircle,
  smartphone: Smartphone,
  wallet: Wallet,
};

interface ChannelRailProps {
  activeChannel: ChannelId;
  deviceMode: 'single' | 'compare';
  onSelect: (channel: ChannelId) => void;
}

export default function ChannelRail({ activeChannel, deviceMode, onSelect }: ChannelRailProps) {
  return (
    <div className="h-full flex flex-col gap-1.5 p-4 overflow-y-auto" style={{ width: 244 }}>
      <div className="px-2 pb-2 pt-1 text-[10px] font-black uppercase tracking-widest text-white/40">Channels</div>
      {CHANNELS.map((channel) => {
        const Icon = ICONS[channel.icon] ?? Bell;
        const isActive = deviceMode === 'single' && channel.enabled && channel.id === activeChannel;
        return (
          <button
            key={channel.id}
            disabled={!channel.enabled}
            onClick={() => channel.enabled && onSelect(channel.id)}
            className={`group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-left transition-all ${
              isActive
                ? 'bg-white text-black shadow-lg'
                : channel.enabled
                  ? 'text-white/80 hover:bg-white/10'
                  : 'text-white/30 cursor-not-allowed'
            }`}
          >
            <span
              className={`flex items-center justify-center rounded-xl transition-colors ${
                isActive ? 'bg-black text-white' : 'bg-white/10 text-white/70 group-hover:text-white'
              }`}
              style={{ width: 34, height: 34 }}
            >
              <Icon size={17} strokeWidth={2.2} />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] font-bold tracking-tight truncate">{channel.label}</span>
              <span className={`block text-[10px] font-semibold uppercase tracking-widest ${isActive ? 'text-black/50' : 'text-white/35'}`}>
                {channel.enabled ? (channel.device === 'iphone' ? 'iPhone' : 'iPad') : 'Soon'}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
