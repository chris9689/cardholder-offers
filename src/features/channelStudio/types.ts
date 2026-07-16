/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Channel Studio — type definitions.
 *
 * This feature is fully self-contained. It only READS from the rest of the app
 * (offers data, brand/user config, card context, current route). It never
 * mutates existing app state, so it cannot impact existing features.
 */

import type { CardType } from '../../contexts/CardContext';

/** Channels a campaign can be previewed in. Push + Email are active for MVP. */
export type ChannelId = 'push' | 'email' | 'sms' | 'whatsapp' | 'inapp' | 'wallet';

/** Physical device used to render a channel. */
export type DeviceId = 'iphone' | 'ipad';

export type DeviceTheme = 'light' | 'dark';

export type StudioStatus = 'idle' | 'loading' | 'ready' | 'error';

/** A normalized product/offer pulled from the current page. */
export interface StudioProduct {
  id: string;
  brand: string;
  name: string;
  category: string;
  image: string;
  logoText: string;
  rewardValue: string;
  rewardType: string;
  expiryLabel?: string;
}

/**
 * A snapshot of everything the generator needs, collected from the live app
 * at the moment the studio is opened (or regenerated).
 */
export interface GenerationContext {
  pageType: string;
  pageLabel: string;
  brandName: string;
  user: {
    name: string;
    firstName: string;
    cardType: CardType;
    points: number;
    country: string;
  };
  primaryProduct: StudioProduct;
  products: StudioProduct[];
  dominantCategory: string;
}

/** Generated content for a push notification (iPhone lock screen). */
export interface PushContent {
  appName: string;
  appIconText: string;
  appIconImage?: string;
  title: string;
  body: string;
  timeLabel: string;
  deeplink: string;
}

/** A product card rendered inside an email body. */
export interface EmailProduct {
  brand: string;
  name: string;
  image: string;
  reward: string;
}

/** Generated content for a marketing email (iPad Mail app). */
export interface EmailContent {
  senderName: string;
  senderEmail: string;
  senderInitial: string;
  subject: string;
  preheader: string;
  timeLabel: string;
  heroImage: string;
  eyebrow: string;
  headline: string;
  bodyParagraphs: string[];
  products: EmailProduct[];
  ctaLabel: string;
  recommendationReason: string;
  footerNote: string;
}

export interface ChannelContent {
  channel: ChannelId;
  push?: PushContent;
  email?: EmailContent;
}

/** User-tunable personalization levers exposed in the Inspector. */
export interface StudioConfig {
  tier: CardType;
  country: string;
  theme: DeviceTheme;
  senderName: string;
}

/** Declares a channel for the left rail. */
export interface ChannelDefinition {
  id: ChannelId;
  label: string;
  device: DeviceId;
  icon: string;
  enabled: boolean;
}
