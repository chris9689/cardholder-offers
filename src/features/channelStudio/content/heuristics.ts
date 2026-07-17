/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Heuristics — pure functions that turn a GenerationContext into realistic
 * channel copy WITHOUT any API. Every function is deterministic given its
 * inputs + variant index, so previews are stable and testable. These are the
 * exact seams a real provider (Braze / DY / OpenAI) would later replace.
 */

import type {
  ChannelContent,
  EmailContent,
  EmailProduct,
  GenerationContext,
  PushContent,
  SegmentDefinition,
  SegmentText,
  SegmentTextList,
  SegmentTemplateVars,
  StudioProduct,
} from '../types';
import { BRAND_LOGO_URL } from '../brandAssets';

/** Small deterministic PRNG so "Variants" change copy predictably, not randomly. */
function seeded(seedSource: string): () => number {
  let hash = 2166136261;
  for (let i = 0; i < seedSource.length; i += 1) {
    hash ^= seedSource.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  let state = hash >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return ((state >>> 0) % 10000) / 10000;
  };
}

function pick<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length) % items.length];
}

/** Tier-aware voice: value-led for Standard, concierge-led for Black. */
function tierTone(tier: string): 'value' | 'premium' | 'concierge' {
  if (tier === 'Black') {
    return 'concierge';
  }
  if (tier === 'Premium') {
    return 'premium';
  }
  return 'value';
}

/** Resolves a segment override (string | fn) against tokens, or a fallback. */
function resolveText(override: SegmentText | undefined, vars: SegmentTemplateVars, fallback: string): string {
  if (override === undefined) {
    return fallback;
  }
  return typeof override === 'function' ? override(vars) : override;
}

function resolveList(override: SegmentTextList | undefined, vars: SegmentTemplateVars, fallback: string[]): string[] {
  if (override === undefined) {
    return fallback;
  }
  return typeof override === 'function' ? override(vars) : override;
}

/** Builds the token bag exposed to segment copy overrides. */
function buildVars(ctx: GenerationContext, reward: string): SegmentTemplateVars {
  return {
    firstName: ctx.user.firstName,
    brand: ctx.primaryProduct.brand,
    reward,
    category: ctx.dominantCategory,
    tier: ctx.user.cardType,
    country: ctx.user.country,
    brandName: ctx.brandName,
  };
}

/**
 * Applies a segment's category bias: surfaces matching products first and
 * updates the dominant category used in copy. Returns a new context.
 */
function applySegmentContext(ctx: GenerationContext, segment: SegmentDefinition): GenerationContext {
  if (!segment.categoryBias) {
    return ctx;
  }
  const bias = segment.categoryBias.toLowerCase();
  const matching = ctx.products.filter((product) => product.category.toLowerCase() === bias);
  if (matching.length === 0) {
    // No products in the biased category — still steer copy toward it.
    return { ...ctx, dominantCategory: segment.categoryBias };
  }
  const rest = ctx.products.filter((product) => product.category.toLowerCase() !== bias);
  const products = [...matching, ...rest];
  return { ...ctx, products, primaryProduct: products[0], dominantCategory: segment.categoryBias };
}


function rewardPhrase(product: StudioProduct): string {
  const value = product.rewardValue;
  switch (product.rewardType) {
    case 'cashback':
      return `${value} back`;
    case 'credit':
      return `${value}`;
    case 'upgrade':
      return `${value}`;
    case 'access':
      return `${value}`;
    default:
      return value;
  }
}

// ---------------------------------------------------------------------------
// Push notification
// ---------------------------------------------------------------------------

export function generatePush(ctx: GenerationContext, variant: number, segment: SegmentDefinition): PushContent {
  const rng = seeded(`${ctx.pageType}:${ctx.user.cardType}:${segment.id}:push:${variant}`);
  const product = ctx.primaryProduct;
  const tone = segment.tone ?? tierTone(ctx.user.cardType);
  const reward = rewardPhrase(product);
  const vars = buildVars(ctx, reward);

  const titles: string[] = [];
  if (product.rewardType === 'cashback' || product.rewardType === 'credit') {
    titles.push(`${product.brand}: ${reward} today`);
    titles.push(`${reward} at ${product.brand} 🎁`);
  } else {
    titles.push(`Your ${product.brand} ${reward.toLowerCase()} is ready`);
    titles.push(`${product.brand}: ${reward} unlocked`);
  }
  titles.push(`Just for you at ${product.brand}`);

  const bodies: string[] = [];
  if (tone === 'concierge') {
    bodies.push(`${ctx.user.firstName}, your concierge reserved ${reward.toLowerCase()} at ${product.brand}. Tap to confirm.`);
  } else if (tone === 'premium') {
    bodies.push(`${ctx.user.firstName}, unlock ${reward.toLowerCase()} with your ${ctx.user.cardType} card. Tap to activate.`);
  } else {
    bodies.push(`${ctx.user.firstName}, activate ${reward.toLowerCase()} before it's gone. Tap to claim.`);
  }
  if (product.expiryLabel) {
    bodies.push(`${ctx.user.firstName}, ${reward.toLowerCase()} at ${product.brand} ends ${product.expiryLabel}. Don't miss it.`);
  }

  return {
    appName: ctx.brandName.toUpperCase(),
    appIconText: (ctx.brandName[0] ?? 'M').toUpperCase(),
    appIconImage: BRAND_LOGO_URL,
    title: resolveText(segment.push?.title, vars, pick(titles, rng)),
    body: resolveText(segment.push?.body, vars, pick(bodies, rng)),
    timeLabel: 'now',
    deeplink: `/offers/${encodeURIComponent(product.id)}`,
  };
}

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

function toEmailProduct(product: StudioProduct, country: string): EmailProduct {
  return {
    brand: product.brand,
    name: product.name,
    image: product.image,
    reward: rewardPhrase(product),
    country,
    logoText: product.logoText,
  };
}

export function generateEmail(
  ctx: GenerationContext,
  variant: number,
  senderName: string,
  segment: SegmentDefinition,
): EmailContent {
  const rng = seeded(`${ctx.pageType}:${ctx.user.cardType}:${segment.id}:email:${variant}`);
  const product = ctx.primaryProduct;
  const tone = segment.tone ?? tierTone(ctx.user.cardType);
  const reward = rewardPhrase(product);
  const vars = buildVars(ctx, reward);

  const subjects = [
    `${ctx.user.firstName}, a ${reward.toLowerCase()} reward picked for your ${ctx.user.cardType} card`,
    `Your ${ctx.dominantCategory.toLowerCase()} rewards are ready, ${ctx.user.firstName}`,
    `Handpicked: ${product.brand} and more ${reward.toLowerCase()}`,
  ];

  const preheaders = [
    `Curated ${ctx.dominantCategory.toLowerCase()} offers based on what you love.`,
    `Exclusive benefits for ${ctx.user.cardType} cardholders — activate in one tap.`,
    `We saved these just for you.`,
  ];

  const eyebrows = {
    concierge: 'YOUR PRIVATE SELECTION',
    premium: 'PREMIUM BENEFITS',
    value: 'REWARDS FOR YOU',
  } as const;

  const headlines = [
    `${reward} at ${product.brand}`,
    `A little something for you, ${ctx.user.firstName}`,
    `Your ${ctx.dominantCategory} picks`,
  ];

  const defaultBody: string[] = [
    `Hi ${ctx.user.firstName},`,
    tone === 'concierge'
      ? `Your concierge curated a selection of ${ctx.dominantCategory.toLowerCase()} experiences reserved exclusively for ${ctx.user.cardType} cardholders.`
      : `Based on your love of ${ctx.dominantCategory.toLowerCase()}, we picked offers we think you'll enjoy — starting with ${reward.toLowerCase()} at ${product.brand}.`,
    `Activate with your registered card and the reward is applied automatically.`,
  ];

  const defaultCta = product.rewardType === 'access' || product.rewardType === 'upgrade' ? 'Reserve now' : 'Activate offer';

  return {
    senderName,
    senderEmail: `offers@${ctx.brandName.toLowerCase().replace(/\s+/g, '')}.com`,
    senderInitial: (senderName[0] ?? 'S').toUpperCase(),
    subject: resolveText(segment.email?.subject, vars, pick(subjects, rng)),
    preheader: resolveText(segment.email?.preheader, vars, pick(preheaders, rng)),
    timeLabel: '9:41 AM',
    heroImage: product.image,
    eyebrow: resolveText(segment.email?.eyebrow, vars, eyebrows[tone]),
    headline: resolveText(segment.email?.headline, vars, pick(headlines, rng)),
    bodyParagraphs: resolveList(segment.email?.body, vars, defaultBody),
    products: ctx.products.slice(0, 6).map((p) => toEmailProduct(p, ctx.user.country)),
    ctaLabel: resolveText(segment.email?.ctaLabel, vars, defaultCta),
    recommendationReason: resolveText(segment.email?.recommendationReason, vars, `Because you like ${ctx.dominantCategory}`),
    footerNote: `Sent to ${ctx.user.firstName} • ${ctx.user.cardType} Card • ${ctx.user.country}`,
  };
}

// ---------------------------------------------------------------------------
// Combined
// ---------------------------------------------------------------------------

export function generateContent(
  channel: ChannelContent['channel'],
  ctx: GenerationContext,
  variant: number,
  senderName: string,
  segment: SegmentDefinition,
): ChannelContent {
  const segmentCtx = applySegmentContext(ctx, segment);
  if (channel === 'email') {
    return { channel, email: generateEmail(segmentCtx, variant, senderName, segment) };
  }
  return { channel: 'push', push: generatePush(segmentCtx, variant, segment) };
}
