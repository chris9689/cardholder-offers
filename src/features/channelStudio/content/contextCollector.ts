/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Context collector — reads the LIVE app state (current route + offers data +
 * brand/user) and produces a normalized GenerationContext snapshot. It is
 * intentionally defensive: it never throws into the host app and always falls
 * back to sensible sample data so a preview is always available.
 */

import { OFFERS, NEAR_ME_OFFERS, type Offer } from '../../../data/offers';
import { BRAND } from '../../../config';
import type { CardType } from '../../../contexts/CardContext';
import type { GenerationContext, StudioProduct } from '../types';
import { getFeedStudioProducts } from './feedProducts';

interface CollectInput {
  pathname: string;
  userName: string;
  cardType: CardType;
  points: number;
  country: string;
  /** Optional segment category bias (friendly label, e.g. 'Travel'). */
  categoryBias?: string;
}

const ALL_OFFERS: Offer[] = [...OFFERS, ...NEAR_ME_OFFERS];

/** Extracts a human-readable expiry label from an offer's terms, if present. */
function extractExpiry(terms: string): string | undefined {
  const match = terms.match(
    /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/,
  );
  if (match) {
    return match[0].replace(/,/g, '');
  }
  const monthYear = terms.match(
    /(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}/,
  );
  return monthYear ? monthYear[0] : undefined;
}

function toStudioProduct(offer: Offer): StudioProduct {
  return {
    id: offer.sku ?? offer.id,
    brand: offer.merchant,
    name: offer.title,
    category: offer.category,
    image: offer.image,
    logoText: offer.merchantLogo,
    rewardValue: offer.rewardValue,
    rewardType: offer.rewardType,
    expiryLabel: extractExpiry(offer.terms),
  };
}

interface PageResolution {
  pageType: string;
  pageLabel: string;
  products: Offer[];
}

/** Maps the current route to a page label and the offers relevant to it. */
function resolvePage(pathname: string): PageResolution {
  const path = pathname.toLowerCase();

  if (path.startsWith('/offers/') && path.length > '/offers/'.length) {
    const token = decodeURIComponent(path.slice('/offers/'.length));
    const match = ALL_OFFERS.find(
      (offer) => (offer.sku ?? offer.id).toLowerCase() === token.toLowerCase(),
    );
    const detail = match ? [match, ...ALL_OFFERS.filter((o) => o !== match)] : ALL_OFFERS;
    return { pageType: 'offer-detail', pageLabel: match ? match.merchant : 'Offer', products: detail };
  }

  if (path === '/offers' || path === '/rewards') {
    return { pageType: 'browse', pageLabel: 'Browse Offers', products: OFFERS };
  }
  if (path === '/savings') {
    return { pageType: 'savings', pageLabel: 'Your Savings', products: OFFERS };
  }
  if (path === '/account') {
    return { pageType: 'account', pageLabel: 'My Account', products: OFFERS };
  }
  if (path === '/search') {
    return { pageType: 'search', pageLabel: 'Search Results', products: OFFERS };
  }
  if (path === '/curated') {
    return { pageType: 'curated', pageLabel: 'Curated For You', products: OFFERS };
  }

  return { pageType: 'home', pageLabel: 'Home', products: OFFERS };
}

function computeDominantCategory(products: StudioProduct[]): string {
  const counts = new Map<string, number>();
  for (const product of products) {
    if (!product.category) {
      continue;
    }
    counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
  }
  let best = products[0]?.category ?? 'Lifestyle';
  let bestCount = 0;
  for (const [category, count] of counts) {
    if (count > bestCount) {
      best = category;
      bestCount = count;
    }
  }
  return best;
}

export function collectContext(input: CollectInput): GenerationContext {
  const { pageType, pageLabel, products: rawProducts } = resolvePage(input.pathname);

  // Prefer real offers from the products.csv feed (filtered by country/tier,
  // and prioritized by the segment's category bias), falling back to the
  // page's static offers if the feed yields nothing.
  const feedProducts = getFeedStudioProducts({
    country: input.country,
    tier: input.cardType,
    category: input.categoryBias,
  });
  const staticProducts = (rawProducts.length > 0 ? rawProducts : OFFERS).map(toStudioProduct);
  const pool = feedProducts.length > 0 ? feedProducts : staticProducts;

  const products = pool.slice(0, 6);
  const safeProducts = products.length > 0 ? products : [toStudioProduct(OFFERS[0])];

  const firstName = input.userName.split(' ')[0] || input.userName;

  return {
    pageType,
    pageLabel,
    brandName: BRAND.name,
    user: {
      name: input.userName,
      firstName,
      cardType: input.cardType,
      points: input.points,
      country: input.country,
    },
    primaryProduct: safeProducts[0],
    products: safeProducts,
    dominantCategory: computeDominantCategory(safeProducts),
  };
}
