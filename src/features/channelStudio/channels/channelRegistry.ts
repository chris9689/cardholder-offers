/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Channel registry — declares which channels appear in the studio rail.
 * Future channels are listed but disabled ("Coming soon"), which surfaces the
 * roadmap directly in the product for sales demos.
 */

import type { ChannelDefinition } from '../types';

export const CHANNELS: ChannelDefinition[] = [
  { id: 'push', label: 'Push Notification', device: 'iphone', icon: 'bell', enabled: true },
  { id: 'email', label: 'Email Campaign', device: 'ipad', icon: 'mail', enabled: true },
  { id: 'sms', label: 'SMS', device: 'iphone', icon: 'message-square', enabled: false },
  { id: 'whatsapp', label: 'WhatsApp', device: 'iphone', icon: 'message-circle', enabled: false },
  { id: 'inapp', label: 'In-App Message', device: 'iphone', icon: 'smartphone', enabled: false },
  { id: 'wallet', label: 'Wallet Pass', device: 'iphone', icon: 'wallet', enabled: false },
];

export const ACTIVE_CHANNELS = CHANNELS.filter((channel) => channel.enabled);

export function getChannel(id: ChannelDefinition['id']): ChannelDefinition {
  return CHANNELS.find((channel) => channel.id === id) ?? CHANNELS[0];
}
