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
  segmentId: string;
}

// ---------------------------------------------------------------------------
// Segments (backend-configurable audience variants)
// ---------------------------------------------------------------------------

/**
 * Tokens available inside segment copy overrides. Use these in the segment
 * registry to write realistic, personalized copy without touching component
 * code, e.g. `(v) => `${v.firstName}, ${v.reward} at ${v.brand}``.
 */
export interface SegmentTemplateVars {
  /** Recipient first name, e.g. "Julian". */
  firstName: string;
  /** Featured product/merchant brand, e.g. "Rosewood Hotels". */
  brand: string;
  /** Reward phrase, e.g. "10% back" or "Room Upgrade". */
  reward: string;
  /** Dominant / biased category label, e.g. "Travel". */
  category: string;
  /** Card tier, e.g. "Black". */
  tier: string;
  /** Locale/country, e.g. "United States". */
  country: string;
  /** App/brand name, e.g. "Spending Offers". */
  brandName: string;
}

/** A copy override: either a literal string or a function of the tokens. */
export type SegmentText = string | ((vars: SegmentTemplateVars) => string);
export type SegmentTextList = string[] | ((vars: SegmentTemplateVars) => string[]);

/** Per-segment push notification copy overrides (all optional). */
export interface SegmentPushTemplate {
  title?: SegmentText;
  body?: SegmentText;
}

/** Per-segment email copy overrides (all optional). */
export interface SegmentEmailTemplate {
  subject?: SegmentText;
  preheader?: SegmentText;
  eyebrow?: SegmentText;
  headline?: SegmentText;
  body?: SegmentTextList;
  ctaLabel?: SegmentText;
  recommendationReason?: SegmentText;
}

/**
 * A backend-configurable audience segment. Add or edit these in
 * segments/segmentRegistry.ts — no component changes required.
 */
export interface SegmentDefinition {
  id: string;
  label: string;
  description?: string;
  /** Overrides the tier-derived voice. */
  tone?: 'value' | 'premium' | 'concierge';
  /** Prefers products in this category (by label) when building the preview. */
  categoryBias?: string;
  /** Push copy overrides for this segment. */
  push?: SegmentPushTemplate;
  /** Email copy overrides for this segment. */
  email?: SegmentEmailTemplate;
}


/** Declares a channel for the left rail. */
export interface ChannelDefinition {
  id: ChannelId;
  label: string;
  device: DeviceId;
  icon: string;
  enabled: boolean;
}
