/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * ============================================================================
 * SEGMENT REGISTRY — BACKEND CONFIGURATION
 * ============================================================================
 *
 * This is the single place to define audience segments and how their previews
 * look. Edit this file (code, not UI) to add, remove, or restyle segments —
 * the Inspector dropdown and the generated push/email content update
 * automatically. No component changes required.
 *
 * HOW A SEGMENT SHAPES THE PREVIEW
 * --------------------------------
 *   tone          Overrides the tier-derived voice ('value' | 'premium' |
 *                 'concierge'). Affects default copy when you don't override it.
 *   categoryBias  Featured category label (e.g. 'Travel'). Products in that
 *                 category are surfaced first, and copy references it.
 *   push          Override the notification title / body.
 *   email         Override subject, preheader, eyebrow, headline, body
 *                 paragraphs, CTA label, recommendation reason, and the
 *                 footer banner image (email.footerImage — an absolute image
 *                 URL shown at the bottom of the email; omit to use the
 *                 default footer image).
 *
 * Every override is either a plain string OR a function of these tokens
 * (see SegmentTemplateVars): firstName, brand, reward, category, tier,
 * country, brandName. Example:
 *
 *   push: {
 *     title: (v) => `${v.brand}: ${v.reward} for you`,
 *     body:  (v) => `${v.firstName}, tap to activate before it expires.`,
 *   }
 *
 * Anything you leave out falls back to the smart default heuristics, so you
 * only configure what you want to customize per segment.
 * ============================================================================
 */

import type { SegmentDefinition } from '../types';

export const SEGMENTS: SegmentDefinition[] = [
  {
    id: 'all',
    label: 'All Cardholders',
    description: 'Default audience — uses tier-based personalization.',
    // No overrides: falls back entirely to the default heuristics.
  },
  {
    id: 'high-spenders',
    label: 'High Spenders',
    description: 'Top-tier spend; premium, exclusivity-led messaging.',
    tone: 'concierge',
    push: {
      title: (v) => `${v.brand}: an exclusive reward awaits`,
      body: (v) => `${v.firstName}, your ${v.tier} status unlocks ${v.reward.toLowerCase()} at ${v.brand}. Tap to redeem.`,
    },
    email: {
      eyebrow: 'YOUR PRIVATE SELECTION',
      subject: (v) => `${v.firstName}, an exclusive ${v.brand} reward for you`,
      preheader: (v) => `Reserved for our ${v.tier} cardholders — ${v.reward.toLowerCase()}.`,
      headline: (v) => `${v.reward} at ${v.brand}`,
      body: (v) => [
        `Hi ${v.firstName},`,
        `As one of our most valued ${v.tier} cardholders, we've reserved a curated set of ${v.category.toLowerCase()} rewards for you — beginning with ${v.reward.toLowerCase()} at ${v.brand}.`,
        `Your dedicated benefits are applied automatically when you pay with your registered card.`,
      ],
      ctaLabel: 'Redeem exclusive reward',
      recommendationReason: (v) => `Curated for your ${v.category} taste`,
    },
  },
  {
    id: 'frequent-travelers',
    label: 'Frequent Travelers',
    description: 'Travel-first audience; biases toward travel offers.',
    tone: 'premium',
    categoryBias: 'Travel',
    push: {
      title: (v) => `✈️ ${v.brand}: ${v.reward}`,
      body: (v) => `${v.firstName}, your next trip just got better — ${v.reward.toLowerCase()} at ${v.brand}. Tap to unlock.`,
    },
    email: {
      eyebrow: 'TRAVEL BENEFITS',
      subject: (v) => `${v.firstName}, ${v.reward.toLowerCase()} for your next journey`,
      preheader: () => `Handpicked travel rewards to elevate every trip.`,
      headline: (v) => `${v.reward} for your travels`,
      body: (v) => [
        `Hi ${v.firstName},`,
        `Because you travel often, we've lined up travel rewards worth packing for — starting with ${v.reward.toLowerCase()} at ${v.brand}.`,
        `Book with your registered card and the benefit is applied automatically.`,
      ],
      ctaLabel: 'Explore travel rewards',
      recommendationReason: () => `Because you love to travel`,
      // Example: give this segment its own footer banner image.
      footerImage: 'https://cdn.dynamicyield.com/api/8794982/images/45c2ce8a5681.webp',
    },
  },
  {
    id: 'foodies',
    label: 'Dining & Foodies',
    description: 'Culinary-led audience; biases toward dining offers.',
    tone: 'premium',
    categoryBias: 'Dining',
    push: {
      title: (v) => `🍽️ ${v.brand}: a table with a reward`,
      body: (v) => `${v.firstName}, savor ${v.reward.toLowerCase()} at ${v.brand}. Tap to reserve.`,
    },
    email: {
      eyebrow: 'CULINARY BENEFITS',
      subject: (v) => `${v.firstName}, a curated table awaits at ${v.brand}`,
      headline: (v) => `${v.reward} at ${v.brand}`,
      recommendationReason: () => `Because you love great dining`,
      ctaLabel: 'Reserve your table',
    },
  },
  {
    id: 'new-cardholders',
    label: 'New Cardholders',
    description: 'Recently onboarded; welcoming, activation-focused copy.',
    tone: 'value',
    push: {
      title: (v) => `Welcome — your first ${v.brandName} reward`,
      body: (v) => `${v.firstName}, get started with ${v.reward.toLowerCase()} at ${v.brand}. Tap to activate.`,
    },
    email: {
      eyebrow: 'WELCOME',
      subject: (v) => `Welcome, ${v.firstName} — here's your first reward`,
      preheader: () => `Get the most from your new card in one tap.`,
      headline: (v) => `Welcome, ${v.firstName}`,
      body: (v) => [
        `Hi ${v.firstName},`,
        `Welcome aboard! To help you get started, we've picked an easy first win: ${v.reward.toLowerCase()} at ${v.brand}.`,
        `Just pay with your registered card and the reward applies automatically.`,
      ],
      ctaLabel: 'Activate your first reward',
      recommendationReason: () => `Popular with new cardholders`,
    },
  },
  {
    id: 'winback',
    label: 'Lapsing / Win-back',
    description: 'Low recent activity; urgency and re-engagement messaging.',
    tone: 'value',
    push: {
      title: (v) => `${v.firstName}, we saved ${v.reward.toLowerCase()} for you`,
      body: (v) => `It's been a while — ${v.reward.toLowerCase()} at ${v.brand} is waiting. Tap before it's gone.`,
    },
    email: {
      eyebrow: 'WE MISSED YOU',
      subject: (v) => `${v.firstName}, ${v.reward.toLowerCase()} is waiting for you`,
      preheader: () => `Come back and claim a reward picked just for you.`,
      headline: () => `We saved something for you`,
      body: (v) => [
        `Hi ${v.firstName},`,
        `We've missed you — so we set aside ${v.reward.toLowerCase()} at ${v.brand} to welcome you back.`,
        `Reactivate simply by paying with your registered card.`,
      ],
      ctaLabel: 'Claim your reward',
      recommendationReason: () => `Chosen to welcome you back`,
    },
  },
];

export const DEFAULT_SEGMENT_ID = SEGMENTS[0].id;

export function getSegment(id: string): SegmentDefinition {
  return SEGMENTS.find((segment) => segment.id === id) ?? SEGMENTS[0];
}
