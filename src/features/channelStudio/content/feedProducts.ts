/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Feed adapter — maps the real products.csv feed (via productFeed.ts) into the
 * StudioProduct shape the previews consume. This lets the default segment
 * previews use genuine offers (brands, images, rewards, expiry) instead of the
 * static sample data.
 */

import { getAllProducts, type ProductFeedItem } from '../../../lib/productFeed';
import type { StudioProduct } from '../types';

/** CSV category codes -> friendly labels used in copy and segment categoryBias. */
const CATEGORY_LABELS: Record<string, string> = {
  ARTSCULTURE: 'Arts & Culture',
  SHOPPING: 'Shopping',
  TRAVEL: 'Travel',
  CULINARY: 'Dining',
  SPORTSWELLNESS: 'Wellness',
  ENTERTAINMENT: 'Entertainment',
};

function categoryLabel(code: string): string {
  const key = (code || '').split(/[|,]/)[0].trim().toUpperCase();
  return CATEGORY_LABELS[key] ?? 'Lifestyle';
}

/** Derives a reward value + type from the offer name, e.g. "Get 20% cashback…". */
function deriveReward(name: string): { rewardValue: string; rewardType: string } {
  const percent = name.match(/(\d+)\s*%/);
  const isCashback = /cashback/i.test(name);
  if (percent) {
    return { rewardValue: `${percent[1]}%`, rewardType: isCashback ? 'cashback' : 'credit' };
  }
  if (/upgrade/i.test(name)) {
    return { rewardValue: 'Upgrade', rewardType: 'upgrade' };
  }
  if (/access|priority|vip/i.test(name)) {
    return { rewardValue: 'Access', rewardType: 'access' };
  }
  return { rewardValue: 'Reward', rewardType: 'credit' };
}

/** Formats an ISO end date into a short label, e.g. "November 24 2026". */
function formatExpiry(iso: string): string | undefined {
  if (!iso) {
    return undefined;
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function toStudioProduct(item: ProductFeedItem): StudioProduct {
  const { rewardValue, rewardType } = deriveReward(item.name);
  return {
    id: item.sku,
    brand: item.brand,
    name: item.name,
    category: categoryLabel(item.categories),
    image: item.image_url,
    logoText: (item.brand || '?').slice(0, 2).toUpperCase(),
    logoUrl: item.logo_url || undefined,
    rewardValue,
    rewardType,
    expiryLabel: formatExpiry(item.enddate),
  };
}

interface FeedQuery {
  country?: string;
  tier?: string;
  /** Friendly category label (e.g. 'Travel') to prioritize, from a segment. */
  category?: string;
}

/**
 * Returns real offers from the feed as StudioProducts. Filters by country and
 * tier when matches exist, otherwise relaxes the filter so a preview is always
 * available. When a category is given (segment bias), matching offers are
 * surfaced first. Requires a usable image so the email/push always look polished.
 */
export function getFeedStudioProducts(query: FeedQuery = {}): StudioProduct[] {
  const all = getAllProducts().filter((item) => item.in_stock && item.image_url && item.brand && item.name);
  if (all.length === 0) {
    return [];
  }

  let pool = all;

  if (query.country) {
    const byCountry = pool.filter((item) => item.offer_country?.toLowerCase() === query.country!.toLowerCase());
    if (byCountry.length > 0) {
      pool = byCountry;
    }
  }

  if (query.tier) {
    const byTier = pool.filter((item) => item.card_tier?.toLowerCase() === query.tier!.toLowerCase());
    if (byTier.length > 0) {
      pool = byTier;
    }
  }

  // Segment category bias: surface matching offers first (stable partition),
  // so e.g. Frequent Travelers see travel offers from the selected country up top.
  if (query.category) {
    const wanted = query.category.toLowerCase();
    const matching = pool.filter((item) => categoryLabel(item.categories).toLowerCase() === wanted);
    const rest = pool.filter((item) => categoryLabel(item.categories).toLowerCase() !== wanted);
    pool = [...matching, ...rest];
  }

  // De-duplicate by brand + name so the preview shows variety, not repeats.
  const seen = new Set<string>();
  const unique: StudioProduct[] = [];
  for (const item of pool) {
    const key = `${item.brand}|${item.name}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(toStudioProduct(item));
  }

  return unique;
}
