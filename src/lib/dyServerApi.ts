import { CardType } from '../contexts/CardContext';
import { getDyRecommendationContext, getPageId } from './dynamicYield';

type DeviceType = 'DESKTOP' | 'MOBILE' | 'TABLET';

interface DyCookieRecord {
  name: string;
  value: string;
  maxAge?: string;
}

interface DyIdentity {
  user: {
    dyid?: string;
    dyid_server?: string;
    active_consent_accepted: boolean;
  };
  session: {
    dy?: string;
  };
}

interface HeroBannerPayload {
  image?: string;
  label?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  link?: string;
}

export interface DyProductData {
  group_id?: string;
  categories?: string[];
  in_stock?: boolean;
  name: string;
  url?: string;
  image_url?: string;
  logo_url?: string;
  brand?: string;
  card_tier?: string;
  country_code?: string;
  locale?: string;
  language_code?: string;
  offer_country?: string;
  price?: number;
  [key: string]: unknown;
}

export interface DyRecommendationSlot {
  sku: string;
  productData: DyProductData;
  slotId?: string;
}

export interface HomepageChoiceResult {
  heroBanner: HeroBannerPayload | null;
  recommendations: DyRecommendationSlot[];
  recsTitle: string;
  recsSubtitle: string;
}

export interface PdpChoiceResult {
  recommendations: DyRecommendationSlot[];
  recsTitle: string;
}

export interface UserBarData {
  name: string;
  cardType: CardType;
  points: number;
}

export interface UserAffinityProfile {
  uid: string;
  categories: Record<string, number>;
  countries: Record<string, number>;
}

export interface AffinityPresetItem {
  attribute: string;
  values: string[];
}

const STORAGE_KEYS = {
  dyid: ['_dyid', 'dyid'],
  dyidServer: ['_dyid_server', 'dyid_server'],
  session: ['_dyjsession', 'dy'],
} as const;

// In-memory cache of the active dyid. Guarantees that every choose/event call
// includes the user identity even if localStorage/cookie persistence lags behind
// (e.g. immediately after resetDySession + establishFreshDyid). Populated by
// establishFreshDyid and applyReturnedCookies; consumed by readIdentity.
let cachedDyid: string | undefined;

function setCachedDyid(dyid: string | undefined): void {
  if (!dyid) {
    return;
  }
  cachedDyid = dyid;
  if (typeof window !== 'undefined') {
    // Mirror into every key readIdentity checks so later reads are consistent
    window.localStorage.setItem('_dyid', dyid);
    window.localStorage.setItem('dyid', dyid);
    window.localStorage.setItem('_dyid_server', dyid);
    window.localStorage.setItem('dyid_server', dyid);
  }
}

function clearCachedDyid(): void {
  cachedDyid = undefined;
}

// The currently selected country (e.g. 'Italy'), persisted via CardContext and
// synced here so it can be attached as a custom attribute to every DY API call.
// `undefined` means "Everywhere" (no country filter).
let selectedCountry: string | undefined;

export function setDySelectedCountry(country: string | null | undefined): void {
  selectedCountry = country && country.trim().length > 0 ? country : undefined;
}

function getCookie(name: string): string | undefined {
  const cookie = document.cookie
    .split('; ')
    .find((entry) => entry.startsWith(`${name}=`));

  if (!cookie) {
    return undefined;
  }

  return decodeURIComponent(cookie.split('=').slice(1).join('='));
}

function getLocalValue(keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = window.localStorage.getItem(key);
    if (value) {
      return value;
    }
  }
  return undefined;
}

function detectDeviceType(): DeviceType {
  const ua = navigator.userAgent.toLowerCase();

  if (/tablet|ipad|playbook|silk/.test(ua)) {
    return 'TABLET';
  }

  if (/mobile|android|iphone|ipod/.test(ua)) {
    return 'MOBILE';
  }

  return 'DESKTOP';
}

function readIdentity(): DyIdentity {
  const dyid = getLocalValue(STORAGE_KEYS.dyid) || getCookie('_dyid') || cachedDyid;
  const dyidServer = getLocalValue(STORAGE_KEYS.dyidServer) || getCookie('_dyid_server') || dyid;
  const dySession = getLocalValue(STORAGE_KEYS.session) || getCookie('_dyjsession');

  const user: DyIdentity['user'] = { active_consent_accepted: true };
  if (dyid) {
    user.dyid = dyid;
    user.dyid_server = dyidServer;
  }

  const session: DyIdentity['session'] = {};
  if (dySession) {
    session.dy = dySession;
  }

  return { user, session };
}

function applyReturnedCookies(cookies: DyCookieRecord[] | undefined): void {
  if (!cookies || cookies.length === 0) {
    return;
  }

  cookies.forEach((cookieRecord) => {
    if (!cookieRecord.name || !cookieRecord.value) {
      return;
    }

    const maxAge = Number(cookieRecord.maxAge || '0');
    const maxAgeDirective = Number.isFinite(maxAge) && maxAge > 0 ? `; max-age=${maxAge}` : '';
    document.cookie = `${cookieRecord.name}=${encodeURIComponent(cookieRecord.value)}; path=/${maxAgeDirective}; SameSite=Lax`;
    window.localStorage.setItem(cookieRecord.name, cookieRecord.value);

    if (cookieRecord.name === '_dyjsession') {
      window.localStorage.setItem('dy', cookieRecord.value);
    }

    if (cookieRecord.name === '_dyid') {
      window.localStorage.setItem('dyid', cookieRecord.value);
      cachedDyid = cookieRecord.value;
    }

    if (cookieRecord.name === '_dyid_server') {
      window.localStorage.setItem('dyid_server', cookieRecord.value);
      cachedDyid = cookieRecord.value;
    }
  });
}

function buildBasePayload(pathname: string, cardType: CardType) {
  const recommendationContext = getDyRecommendationContext(pathname);
  const pageId = getPageId(pathname);
  const identity = readIdentity();

  return {
    user: identity.user,
    session: identity.session,
    context: {
      page: {
        type: recommendationContext.type,
        location: window.location.href,
        data: recommendationContext.type === 'PRODUCT' ? recommendationContext.data || [pageId] : [pageId],
      },
      device: {
        userAgent: navigator.userAgent,
        type: detectDeviceType(),
      },
      pageAttributes: {
        card_tier: cardType,
        ...(selectedCountry ? { country: selectedCountry } : {}),
      },
    },
  };
}

export async function trackPageview(pathname: string, cardType: CardType): Promise<void> {
  const payload = {
    ...buildBasePayload(pathname, cardType),
    options: {
      isImplicitPageview: true,
    },
  };

  const response = await fetch('/api/dy/pageview', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'same-origin',
  });

  if (!response.ok) {
    return;
  }

  try {
    const body = await response.json();
    applyReturnedCookies(body?.cookies);
  } catch {
    // no-op: pageview can return empty body in some integrations
  }
}

export async function chooseHeroBanner(pathname: string, cardType: CardType): Promise<HeroBannerPayload | null> {
  const payload = {
    ...buildBasePayload(pathname, cardType),
    selector: {
      names: ['Hero Banner Campaign'],
      groups: ['Homepage'],
    },
    options: {
      isImplicitPageview: true,
      returnAnalyticsMetadata: false,
      isImplicitImpressionMode: true,
      isImplicitClientData: false,
    },
  };

  const response = await fetch('/api/dy/choose', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
    credentials: 'same-origin',
  });

  if (!response.ok) {
    return null;
  }

  const body = await response.json();
  applyReturnedCookies(body?.cookies);

  const payloadData = body?.choices?.[0]?.variations?.[0]?.payload?.data;
  if (!payloadData || typeof payloadData !== 'object') {
    return null;
  }

  return payloadData as HeroBannerPayload;
}

export async function chooseHomepageGroup(pathname: string, cardType: CardType): Promise<HomepageChoiceResult> {
  const payload = {
    ...buildBasePayload(pathname, cardType),
    selector: {
      names: ['Hero Banner Campaign'],
      groups: ['Homepage'],
    },
    options: {
      isImplicitPageview: true,
      returnAnalyticsMetadata: false,
      isImplicitImpressionMode: true,
      isImplicitClientData: false,
    },
  };

  const empty: HomepageChoiceResult = {
    heroBanner: null,
    recommendations: [],
    recsTitle: 'Recommended Offers',
    recsSubtitle: 'Personalized Picks',
  };

  const response = await fetch('/api/dy/choose', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'same-origin',
  });

  if (!response.ok) {
    return empty;
  }

  const body = await response.json();
  applyReturnedCookies(body?.cookies);

  let heroBanner: HeroBannerPayload | null = null;
  let recommendations: DyRecommendationSlot[] = [];
  let recsTitle = empty.recsTitle;
  let recsSubtitle = empty.recsSubtitle;

  for (const choice of body?.choices ?? []) {
    const variation = choice?.variations?.[0];
    if (!variation) continue;

    if (choice.type === 'DECISION' && variation.payload?.data) {
      heroBanner = variation.payload.data as HeroBannerPayload;
    } else if (choice.type === 'RECS_DECISION' && variation.payload?.data) {
      const data = variation.payload.data as { custom?: { title?: string; subtitle?: string }; slots?: DyRecommendationSlot[] };
      recommendations = data.slots ?? [];
      recsTitle = data.custom?.title ?? recsTitle;
      recsSubtitle = data.custom?.subtitle ?? recsSubtitle;
    }
  }

  return { heroBanner, recommendations, recsTitle, recsSubtitle };
}

export async function choosePdpRecommendations(sku: string, cardType: CardType): Promise<PdpChoiceResult> {
  const base = buildBasePayload(`/offers/${encodeURIComponent(sku)}`, cardType);
  const payload = {
    ...base,
    context: {
      ...base.context,
      page: {
        type: 'PRODUCT',
        location: window.location.href,
        data: [sku],
      },
    },
    selector: {
      names: ['PDP Recommendation'],
      groups: ['Productpage'],
    },
    options: {
      isImplicitPageview: true,
      returnAnalyticsMetadata: false,
      isImplicitImpressionMode: true,
      isImplicitClientData: false,
    },
  };

  const fallback: PdpChoiceResult = {
    recommendations: [],
    recsTitle: 'Recommended for You',
  };

  const response = await fetch('/api/dy/choose', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'same-origin',
  });

  if (!response.ok) {
    return fallback;
  }

  const body = await response.json();
  applyReturnedCookies(body?.cookies);

  for (const choice of body?.choices ?? []) {
    const variation = choice?.variations?.[0];
    if (choice?.type !== 'RECS_DECISION' || !variation?.payload?.data) {
      continue;
    }

    const data = variation.payload.data as { custom?: { title?: string }; slots?: DyRecommendationSlot[] };
    return {
      recommendations: data.slots ?? [],
      recsTitle: data.custom?.title ?? fallback.recsTitle,
    };
  }

  return fallback;
}

export type { HeroBannerPayload };

// ─── Experience Search ────────────────────────────────────────────────────────

export interface DySearchFacetValue {
  name: string;
  count: number;
}

export interface DySearchFacet {
  column: string;
  displayName: string;
  valuesType: string;
  values: DySearchFacetValue[];
}

export interface DySearchResult {
  slots: DyRecommendationSlot[];
  facets: DySearchFacet[];
  totalNumResults: number;
  searchQuery: string;
  normalizedQuery: string;
}

export async function performDySearch(
  query: string,
  pathname: string,
  cardType: CardType,
  offset = 0,
  numItems = 25,
  filters: Record<string, string[]> = {},
): Promise<DySearchResult> {
  const empty: DySearchResult = { slots: [], facets: [], totalNumResults: 0, searchQuery: query, normalizedQuery: query };

  if (!query.trim()) return empty;

  const identity = readIdentity();
  const recommendationContext = getDyRecommendationContext(pathname);
  const pageId = getPageId(pathname);

  const filterConditions = Object.entries(filters)
    .filter(([, values]) => values.length > 0)
    .map(([column, values]) => ({
      type: 'ATTRIBUTE' as const,
      column,
      operator: 'IN_LIST' as const,
      args: values,
    }));

  const payload = {
    user: identity.user,
    session: identity.session,
    context: {
      page: {
        type: recommendationContext.type,
        location: window.location.href,
        data: [pageId],
      },
      device: {
        userAgent: navigator.userAgent,
        type: detectDeviceType(),
      },
      pageAttributes: {
        card_tier: cardType,
        ...(selectedCountry ? { country: selectedCountry } : {}),
      },
    },
    selector: {
      name: 'Semantic Search',
    },
    query: {
      text: query,
      pagination: {
        offset,
        numItems,
      },
      ...(filterConditions.length > 0 ? { conditions: filterConditions } : {}),
    },
    options: {
      returnAnalyticsMetadata: false,
      isImplicitClientData: false,
    },
  };

  const response = await fetch('/api/dy/search', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'same-origin',
  });

  if (!response.ok) return empty;

  const body = await response.json();
  applyReturnedCookies(body?.cookies);

  const data = body?.choices?.[0]?.variations?.[0]?.payload?.data;
  if (!data) return empty;

  return {
    slots: data.slots ?? [],
    facets: data.facets ?? [],
    totalNumResults: data.totalNumResults ?? 0,
    searchQuery: data.searchQuery ?? query,
    normalizedQuery: data.normalizedQuery ?? query,
  };
}

// ─── Shopping Muse ────────────────────────────────────────────────────────────

export interface DyShoppingMuseWidget {
  title?: string;
  slots: DyRecommendationSlot[];
}

export interface DyShoppingMuseResult {
  assistant: string;
  support: boolean;
  chatId?: string;
  widgets: DyShoppingMuseWidget[];
}

export async function performShoppingMuse(
  prompt: string,
  pathname: string,
  cardType: CardType,
  chatId?: string,
  userVariables?: UserBarData | null,
): Promise<DyShoppingMuseResult | null> {
  if (!prompt.trim()) {
    return null;
  }

  const basePayload = buildBasePayload(pathname, cardType);

  const payload: Record<string, unknown> = {
    ...basePayload,
    context: {
      ...basePayload.context,
      pageAttributes: {
        ...basePayload.context.pageAttributes,
        ...(userVariables
          ? {
              user_name: userVariables.name,
              user_card_tier: cardType,
              user_points: userVariables.points,
            }
          : {}),
      },
    },
    query: {
      text: prompt,
      ...(chatId ? { chatId } : {}),
    },
    selector: {
      name: 'Shopping Muse',
    },
    options: {
      productData: {
        skusOnly: false,
      },
    },
  };

  const response = await fetch('/api/dy/shopping-muse', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'same-origin',
  });

  if (!response.ok) {
    return null;
  }

  const body = await response.json();
  applyReturnedCookies(body?.cookies);

  const data = body?.choices?.[0]?.variations?.[0]?.payload?.data;
  if (!data || typeof data !== 'object') {
    return null;
  }

  return {
    assistant: typeof data.assistant === 'string' ? data.assistant : 'No response available.',
    support: Boolean(data.support),
    chatId: typeof data.chatId === 'string' ? data.chatId : undefined,
    widgets: Array.isArray(data.widgets) ? data.widgets : [],
  };
}

export async function chooseUserBar(pathname: string, cardType: CardType): Promise<UserBarData | null> {
  const payload = {
    ...buildBasePayload(pathname, cardType),
    selector: {
      names: ['User Status Bar API'],
    },
    options: {
      isImplicitPageview: false,
      returnAnalyticsMetadata: false,
      isImplicitImpressionMode: true,
      isImplicitClientData: false,
    },
  };

  try {
    const response = await fetch('/api/dy/choose', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'same-origin',
    });

    if (!response.ok) {
      return null;
    }

    const body = await response.json();
    applyReturnedCookies(body?.cookies);

    const payloadData = body?.choices?.[0]?.variations?.[0]?.payload?.data?.userBar;
    if (!payloadData || typeof payloadData !== 'object') {
      return null;
    }

    const data = payloadData as {
      name?: unknown;
      cardType?: unknown;
      points?: unknown;
    };

    const normalizedName = typeof data.name === 'string' && data.name.trim().length > 0 ? data.name.trim() : null;
    const normalizedPointsRaw = typeof data.points === 'number' ? data.points : Number(data.points);
    const normalizedPoints = Number.isFinite(normalizedPointsRaw) ? normalizedPointsRaw : 0;
    return {
      name: normalizedName ?? 'Cardholder',
      // Keep selected tier as source of truth to prevent stale/incorrect API cardType from overriding UI state.
      cardType,
      points: normalizedPoints,
    };
  } catch {
    return null;
  }
}

export function resetDySession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Clear all DY identity tokens from localStorage and cookies to force generation of new dyid/session
  // on next API call. The DY.API client-side library will regenerate these when readIdentity() is called.
  STORAGE_KEYS.dyid.forEach((key) => {
    window.localStorage.removeItem(key);
    document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
  });
  STORAGE_KEYS.dyidServer.forEach((key) => {
    window.localStorage.removeItem(key);
    document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
  });
  STORAGE_KEYS.session.forEach((key) => {
    window.localStorage.removeItem(key);
    document.cookie = `${key}=; path=/; max-age=0; SameSite=Lax`;
  });

  // Clear the in-memory dyid cache so the next choose call generates a fresh identity.
  clearCachedDyid();

  // Note: The DY script may cache identity in memory. The next API call (e.g., trackPageview)
  // will read fresh values from localStorage via readIdentity() and send them to the backend,
  // where a new dyid will be generated if one is not provided.
}

/**
 * Waits until the client-side DY script (api_dynamic.js) has loaded and exposed
 * window.DY.API. Resolves true once available, false on timeout.
 */
function waitForDyApi(timeoutMs = 8000): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (typeof window.DY?.API === 'function') {
      resolve(true);
      return;
    }

    const start = Date.now();
    const interval = window.setInterval(() => {
      if (typeof window.DY?.API === 'function') {
        window.clearInterval(interval);
        resolve(true);
      } else if (Date.now() - start > timeoutMs) {
        window.clearInterval(interval);
        resolve(false);
      }
    }, 100);
  });
}

/**
 * Informs affinity through the client-side DY script (window.DY.API) rather than
 * the server-side event proxy. This ties the affinity to the SAME identity the
 * loaded DY script uses (the _dyid it manages), which is also the identity the
 * server /choose calls read via readIdentity(). Using the client script keeps a
 * single shared identity so:
 *   - the affinity actually applies to subsequent recommendations, and
 *   - DY.ServerUtil.getUserAffinities() (client-side QA check) reflects it.
 */
export async function informAffinityPresetClient(affinityData: AffinityPresetItem[]): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  const ready = await waitForDyApi();
  if (!ready || typeof window.DY?.API !== 'function') {
    console.error('informAffinityPresetClient: DY.API not available; affinity not informed');
    return;
  }

  window.DY.API('event', {
    name: 'Inform Affinity',
    properties: {
      dyType: 'inform-affinity-v1',
      source: 'tier-preset-selection',
      data: affinityData,
    },
  });

  console.debug('informAffinityPresetClient - inform affinity sent via client DY.API', affinityData);
}

export async function informAffinityPreset(affinityData: AffinityPresetItem[], explicitDyid?: string): Promise<void> {
  if (typeof window === 'undefined') {
    return;
  }

  // Prefer an explicitly-passed dyid (extracted directly from a fresh choose response).
  // Fall back to localStorage, then readIdentity().
  let dyid =
    explicitDyid ||
    window.localStorage.getItem('dyid') ||
    window.localStorage.getItem('_dyid') ||
    window.localStorage.getItem('dyid_server') ||
    window.localStorage.getItem('_dyid_server') ||
    undefined;

  if (!dyid) {
    const identity = readIdentity();
    dyid = identity.user.dyid;
  }

  console.debug('informAffinityPreset - dyid:', dyid ? dyid : 'missing');

  const identity = readIdentity();

  const payload = {
    user: {
      dyid: dyid || undefined,
      dyid_server: dyid || undefined,
      active_consent_accepted: true,
    },
    session: identity.session,
    context: {
      page: {
        type: 'OTHER',
        location: window.location.href,
        data: [],
      },
      device: {
        userAgent: navigator.userAgent,
        type: detectDeviceType(),
      },
    },
    events: [
      {
        name: 'Inform Affinity',
        properties: {
          dyType: 'inform-affinity-v1',
          source: 'tier-preset-selection',
          data: affinityData,
        },
      },
    ],
  };

  try {
    console.debug('Sending informAffinityPreset payload:', JSON.stringify(payload, null, 2));

    const response = await fetch('/api/dy/event', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'same-origin',
    });

    console.debug('informAffinityPreset response status:', response.status);

    if (response.ok) {
      const body = await response.json();
      applyReturnedCookies(body?.cookies);
    } else {
      console.error('informAffinityPreset failed with status:', response.status);
    }
  } catch (error) {
    console.error('Failed to inform affinity preset:', error);
  }
}

/**
 * Resets the DY session and establishes a fresh identity by calling a choose
 * endpoint. Returns the freshly-generated dyid extracted directly from the
 * choose response cookies (avoids localStorage timing races).
 */
export async function establishFreshDyid(pathname: string, cardType: CardType): Promise<string | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  const payload = {
    ...buildBasePayload(pathname, cardType),
    selector: {
      names: ['User Status Bar API'],
    },
    options: {
      isImplicitPageview: true,
      returnAnalyticsMetadata: false,
      isImplicitImpressionMode: true,
      isImplicitClientData: false,
    },
  };

  try {
    const response = await fetch('/api/dy/choose', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'same-origin',
    });

    if (!response.ok) {
      return null;
    }

    const body = await response.json();
    applyReturnedCookies(body?.cookies);

    // Extract the fresh dyid directly from the returned cookies
    const cookies: DyCookieRecord[] = Array.isArray(body?.cookies) ? body.cookies : [];
    const dyidCookie =
      cookies.find((c) => c.name === '_dyid_server') || cookies.find((c) => c.name === '_dyid');

    const dyid =
      dyidCookie?.value ||
      window.localStorage.getItem('dyid') ||
      window.localStorage.getItem('_dyid') ||
      null;

    // Cache the fresh dyid so every subsequent choose/event call includes the
    // user identity, even before localStorage/cookies fully settle.
    setCachedDyid(dyid ?? undefined);

    console.debug('establishFreshDyid - resolved dyid:', dyid ? dyid : 'missing');
    return dyid;
  } catch (error) {
    console.error('Failed to establish fresh dyid:', error);
    return null;
  }
}

export async function fetchUserAffinities(): Promise<UserAffinityProfile | null> {
  const identity = readIdentity();
  const uid = identity.user.dyid;

  if (!uid) {
    return null;
  }

  try {
    const response = await fetch('/api/dy/user-affinities', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ uid }),
      credentials: 'same-origin',
    });

    if (!response.ok) {
      return null;
    }

    const body = await response.json();
    const rawCategories = body?.categories;
    const rawCountries = body?.countries;

    const categories: Record<string, number> = {};
    if (rawCategories && typeof rawCategories === 'object') {
      for (const [key, value] of Object.entries(rawCategories as Record<string, unknown>)) {
        const numericValue = Number(value);
        if (Number.isFinite(numericValue)) {
          categories[key] = numericValue;
        }
      }
    }

    const countries: Record<string, number> = {};
    if (rawCountries && typeof rawCountries === 'object') {
      for (const [key, value] of Object.entries(rawCountries as Record<string, unknown>)) {
        const numericValue = Number(value);
        if (Number.isFinite(numericValue)) {
          countries[key] = numericValue;
        }
      }
    }

    return { uid, categories, countries };
  } catch {
    return null;
  }
}
