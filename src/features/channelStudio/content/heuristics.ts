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
  StudioProduct,
} from '../types';

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

export function generatePush(ctx: GenerationContext, variant: number): PushContent {
  const rng = seeded(`${ctx.pageType}:${ctx.user.cardType}:push:${variant}`);
  const product = ctx.primaryProduct;
  const tone = tierTone(ctx.user.cardType);
  const reward = rewardPhrase(product);

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
    title: pick(titles, rng),
    body: pick(bodies, rng),
    timeLabel: 'now',
    deeplink: `/offers/${encodeURIComponent(product.id)}`,
  };
}

// ---------------------------------------------------------------------------
// Email
// ---------------------------------------------------------------------------

function toEmailProduct(product: StudioProduct): EmailProduct {
  return {
    brand: product.brand,
    name: product.name,
    image: product.image,
    reward: rewardPhrase(product),
  };
}

export function generateEmail(
  ctx: GenerationContext,
  variant: number,
  senderName: string,
): EmailContent {
  const rng = seeded(`${ctx.pageType}:${ctx.user.cardType}:email:${variant}`);
  const product = ctx.primaryProduct;
  const tone = tierTone(ctx.user.cardType);
  const reward = rewardPhrase(product);

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

  const bodies: string[][] = [
    [
      `Hi ${ctx.user.firstName},`,
      tone === 'concierge'
        ? `Your concierge curated a selection of ${ctx.dominantCategory.toLowerCase()} experiences reserved exclusively for ${ctx.user.cardType} cardholders.`
        : `Based on your love of ${ctx.dominantCategory.toLowerCase()}, we picked offers we think you'll enjoy — starting with ${reward.toLowerCase()} at ${product.brand}.`,
      `Activate with your registered card and the reward is applied automatically.`,
    ],
  ];

  return {
    senderName,
    senderEmail: `offers@${ctx.brandName.toLowerCase().replace(/\s+/g, '')}.com`,
    senderInitial: (senderName[0] ?? 'S').toUpperCase(),
    subject: pick(subjects, rng),
    preheader: pick(preheaders, rng),
    timeLabel: '9:41 AM',
    heroImage: product.image,
    eyebrow: eyebrows[tone],
    headline: pick(headlines, rng),
    bodyParagraphs: bodies[0],
    products: ctx.products.slice(0, 3).map(toEmailProduct),
    ctaLabel: product.rewardType === 'access' || product.rewardType === 'upgrade' ? 'Reserve now' : 'Activate offer',
    recommendationReason: `Because you like ${ctx.dominantCategory}`,
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
): ChannelContent {
  if (channel === 'email') {
    return { channel, email: generateEmail(ctx, variant, senderName) };
  }
  return { channel: 'push', push: generatePush(ctx, variant) };
}
