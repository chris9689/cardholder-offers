/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Maximize2, Minimize2, Navigation, Plus, Search, MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSession } from '../contexts/SessionContext';
import type { ProductFeedItem } from '../lib/productFeed';

// ---------------------------------------------------------------------------
// City focus
//
// The "Offers Near You" map showcases one city per country. The focus city is
// chosen automatically (the city with the most offers in the selected country).
// New York keeps its hand-drawn art; every other city uses the generic
// procedural map. Add entries below to label additional city codes; unknown
// codes fall back to the country name.
// ---------------------------------------------------------------------------
const CITY_INFO: Record<string, { name: string; label: string }> = {
  // United States
  NYC: { name: 'New York', label: 'Manhattan' },
  LAX: { name: 'Los Angeles', label: 'California' },
  CHI: { name: 'Chicago', label: 'Illinois' },
  MIA: { name: 'Miami', label: 'Florida' },
  // France
  PAR: { name: 'Paris', label: 'Île-de-France' },
  LYN: { name: 'Lyon', label: 'France' },
  MRS: { name: 'Marseille', label: 'France' },
  NCE: { name: 'Nice', label: 'France' },
  // Italy
  MIL: { name: 'Milan', label: 'Lombardy' },
  ROM: { name: 'Rome', label: 'Lazio' },
  FLO: { name: 'Florence', label: 'Tuscany' },
  NAP: { name: 'Naples', label: 'Campania' },
  // Spain
  MAD: { name: 'Madrid', label: 'Spain' },
  BCN: { name: 'Barcelona', label: 'Catalonia' },
  SEV: { name: 'Seville', label: 'Andalusia' },
  VAL: { name: 'Valencia', label: 'Spain' },
  // United Arab Emirates
  DXB: { name: 'Dubai', label: 'UAE' },
  AUH: { name: 'Abu Dhabi', label: 'UAE' },
};

// Cap the number of offer pins rendered so the map stays readable.
const MAX_PINS = 14;
const MAX_PINS_EXPANDED = 26;

// Default framing for the map (viewBox: x, y, w, h). The expanded view is
// zoomed in from the full scene so there is room to pan a searched location in.
const EXPANDED_VIEWBOX: [number, number, number, number] = [20, 10, 100, 80];
const COLLAPSED_VIEWBOX: [number, number, number, number] = [48, 12, 44, 74];

// Mocked address search (New York only): selecting the suggestion drops a
// destination marker and clusters a few existing NYC offers around it.
const SEARCH_ADDRESS = '4658 Camden Street, Sparks, NV, 89431';
const SEARCH_POINT = { x: 22, y: 46 };
const SEARCH_PIN_OFFSETS: Array<[number, number]> = [
  [-6, 6],
  [6, 5],
  [-2, 11],
  [7, 12],
];

function hashSeed(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function getCityCode(sku: string): string {
  return sku.split('-')[2] || '';
}

// Derive a plausible cashback amount from the offer copy ("Get 20% off when you
// spend €20") and its min_spend so activating from the map posts to Savings.
function deriveSaving(offer: ProductFeedItem): number {
  const pctMatch = offer.name.match(/(\d+)\s*%/);
  const minSpend = Number.parseFloat(offer.min_spend) || 0;
  if (pctMatch && minSpend > 0) {
    const pct = Number.parseInt(pctMatch[1], 10);
    return Math.round(pct * minSpend) / 100;
  }
  return Math.round((5 + (hashSeed(offer.sku) % 20)) * 100) / 100;
}

// Map palette tuned to read like Google Maps.
const WATER = '#a9d4ec';
const LAND_MANHATTAN = '#f2f3ee';
const LAND_OUTER = '#e6ebe2';
const GREEN = '#c4e4a8';
const ROAD_CASING = '#d5dbdf';
const ROAD_FILL = '#ffffff';
const HIGHWAY = '#ffd583';
const BRIDGE = '#c2c8cd';
const LABEL = '#8b95a1';

// Manhattan island silhouette (viewBox 0 0 140 100, island centred near x=70).
const ISLAND =
  'M59 8 C51 9 49 17 51 27 L52 58 C53 75 63 90 71 93 C78 82 84 66 85 50 L86 24 C87 14 73 7 63 8 Z';
const NEW_JERSEY = 'M-8 -8 L37 -8 C40 18 31 40 37 62 C42 82 33 100 36 108 L-8 108 Z';
const BROOKLYN = 'M105 -8 C100 20 109 42 102 62 C97 82 106 102 103 108 L143 108 L143 -8 Z';

const AVENUES = [55, 61, 67, 73, 79, 85];
const STREETS = [12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84, 90];

// Small deterministic PRNG so pin scatter is stable per user but varies between.
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function NycMapArt() {
  return (
    <>
      <defs>
        <clipPath id="nyc-island-clip">
          <path d={ISLAND} />
        </clipPath>
        <clipPath id="nyc-nj-clip">
          <path d={NEW_JERSEY} />
        </clipPath>
        <clipPath id="nyc-bk-clip">
          <path d={BROOKLYN} />
        </clipPath>
      </defs>

      {/* Water base (whole scene) */}
      <rect x={-40} y={-20} width={220} height={140} fill={WATER} />

      {/* Land masses */}
      <path d={NEW_JERSEY} fill={LAND_OUTER} />
      <path d={BROOKLYN} fill={LAND_OUTER} />
      <path d={ISLAND} fill={LAND_MANHATTAN} />

      {/* Central Park */}
      <rect x={61} y={26} width={14} height={26} rx={1.5} fill={GREEN} />

      {/* Outer borough parks (clipped to land) */}
      <g clipPath="url(#nyc-nj-clip)">
        <rect x={12} y={40} width={10} height={13} rx={1.5} fill={GREEN} />
        <rect x={4} y={70} width={11} height={12} rx={1.5} fill={GREEN} />
      </g>
      <g clipPath="url(#nyc-bk-clip)">
        <rect x={116} y={30} width={9} height={11} rx={1.5} fill={GREEN} />
        <rect x={122} y={58} width={11} height={13} rx={1.5} fill={GREEN} />
      </g>

      {/* Manhattan street grid (clipped to the island) */}
      <g clipPath="url(#nyc-island-clip)">
        {STREETS.map((y) => (
          <line key={`stc-${y}`} x1={47} y1={y} x2={91} y2={y} stroke={ROAD_CASING} strokeWidth={1.5} />
        ))}
        {STREETS.map((y) => (
          <line key={`stf-${y}`} x1={47} y1={y} x2={91} y2={y} stroke={ROAD_FILL} strokeWidth={0.9} />
        ))}
        {AVENUES.map((x) => (
          <line key={`avc-${x}`} x1={x} y1={4} x2={x} y2={96} stroke={ROAD_CASING} strokeWidth={2} />
        ))}
        {AVENUES.map((x) => (
          <line key={`avf-${x}`} x1={x} y1={4} x2={x} y2={96} stroke={ROAD_FILL} strokeWidth={1.3} />
        ))}
        {/* Broadway diagonal */}
        <line x1={81} y1={10} x2={64} y2={94} stroke={ROAD_CASING} strokeWidth={2.4} />
        <line x1={81} y1={10} x2={64} y2={94} stroke={HIGHWAY} strokeWidth={1.5} />
        {/* West Side Hwy / FDR along the shores */}
        <path d="M51 24 L52 58 C53 74 61 88 70 92" fill="none" stroke={HIGHWAY} strokeWidth={1.4} />
        <path d="M86 24 L85 50 C84 66 79 80 71 91" fill="none" stroke={HIGHWAY} strokeWidth={1.4} />
      </g>

      {/* Roads on the outer boroughs to fill the view (clipped to their land) */}
      <g clipPath="url(#nyc-bk-clip)">
        {[6, 15, 24, 33, 42, 51, 60, 69, 78, 87].map((y) => (
          <line key={`bkhc-${y}`} x1={103} y1={y} x2={146} y2={y + 2} stroke={ROAD_CASING} strokeWidth={1.1} />
        ))}
        {[6, 15, 24, 33, 42, 51, 60, 69, 78, 87].map((y) => (
          <line key={`bkhf-${y}`} x1={103} y1={y} x2={146} y2={y + 2} stroke={ROAD_FILL} strokeWidth={0.65} />
        ))}
        {[109, 117, 125, 133, 141].map((x) => (
          <line key={`bkvc-${x}`} x1={x} y1={-6} x2={x - 3} y2={106} stroke={ROAD_CASING} strokeWidth={1.1} />
        ))}
        {[109, 117, 125, 133, 141].map((x) => (
          <line key={`bkvf-${x}`} x1={x} y1={-6} x2={x - 3} y2={106} stroke={ROAD_FILL} strokeWidth={0.65} />
        ))}
      </g>
      <g clipPath="url(#nyc-nj-clip)">
        {[4, 13, 22, 31, 40, 49, 58, 67, 76, 85].map((y) => (
          <line key={`njhc-${y}`} x1={-10} y1={y} x2={39} y2={y + 2} stroke={ROAD_CASING} strokeWidth={1.1} />
        ))}
        {[4, 13, 22, 31, 40, 49, 58, 67, 76, 85].map((y) => (
          <line key={`njhf-${y}`} x1={-10} y1={y} x2={39} y2={y + 2} stroke={ROAD_FILL} strokeWidth={0.65} />
        ))}
        {[-2, 6, 14, 22, 30].map((x) => (
          <line key={`njvc-${x}`} x1={x} y1={-6} x2={x + 3} y2={106} stroke={ROAD_CASING} strokeWidth={1.1} />
        ))}
        {[-2, 6, 14, 22, 30].map((x) => (
          <line key={`njvf-${x}`} x1={x} y1={-6} x2={x + 3} y2={106} stroke={ROAD_FILL} strokeWidth={0.65} />
        ))}
      </g>

      {/* East River bridges */}
      <line x1={87} y1={72} x2={105} y2={74} stroke={BRIDGE} strokeWidth={1.3} />
      <line x1={88} y1={78} x2={105} y2={80} stroke={BRIDGE} strokeWidth={1.3} />
      <line x1={89} y1={84} x2={104} y2={86} stroke={BRIDGE} strokeWidth={1.3} />

      {/* Faint place labels */}
      <text x={43} y={50} fill={LABEL} fontSize={3} fontWeight={700} textAnchor="middle" transform="rotate(-90 43 50)" style={{ letterSpacing: '0.12em' }}>
        HUDSON RIVER
      </text>
      <text x={96} y={40} fill={LABEL} fontSize={3} fontWeight={700} textAnchor="middle" transform="rotate(-90 96 40)" style={{ letterSpacing: '0.12em' }}>
        EAST RIVER
      </text>
      <text x={68} y={40} fill="#5f8a43" fontSize={2.4} fontWeight={800} textAnchor="middle" style={{ letterSpacing: '0.06em' }}>
        CENTRAL PARK
      </text>
      <text x={68} y={70} fill={LABEL} fontSize={4} fontWeight={800} textAnchor="middle" opacity={0.6} style={{ letterSpacing: '0.16em' }}>
        MANHATTAN
      </text>
      <text x={121} y={64} fill={LABEL} fontSize={3.4} fontWeight={800} textAnchor="middle" opacity={0.55} style={{ letterSpacing: '0.14em' }}>
        BROOKLYN
      </text>
      <text x={18} y={52} fill={LABEL} fontSize={3.4} fontWeight={800} textAnchor="middle" opacity={0.55} style={{ letterSpacing: '0.14em' }}>
        NEW JERSEY
      </text>
    </>
  );
}

// Procedural stylized city used for every showcase city except New York. Seeded
// by the city so each renders a distinct-but-plausible street grid, a corner
// bay, a river channel, parks, and a boulevard.
function GenericCityMapArt({ citySeed, cityName }: { citySeed: number; cityName: string }) {
  const rng = mulberry32(citySeed || 1);

  const corners: Array<[number, number]> = [
    [0, 0],
    [140, 0],
    [0, 100],
    [140, 100],
  ];
  const [bayX, bayY] = corners[Math.floor(rng() * 4) % 4];
  const bayR = 30 + rng() * 12;

  // Keep the river out of the dead-center pin cluster (upper or lower third).
  const riverY = rng() < 0.5 ? 22 + rng() * 8 : 68 + rng() * 8;
  const amp = 6 + rng() * 8;
  const riverW = 4.5 + rng() * 2.5;
  const riverPath = `M -14 ${riverY} C 30 ${riverY - amp} 55 ${riverY + amp} 78 ${riverY} S 128 ${riverY - amp} 154 ${riverY}`;

  const boulevardX = 40 + rng() * 60;
  const streets = [8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96];
  const avenues = [8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96, 104, 112, 120, 128];

  // One park near the centre so the collapsed (zoomed) view has a landmark.
  const park1 = { x: 58 + rng() * 8, y: 34 + rng() * 8, w: 10 + rng() * 4, h: 9 + rng() * 4 };
  const park2 = { x: 10 + rng() * 20, y: 58 + rng() * 20, w: 9 + rng() * 5, h: 8 + rng() * 5 };

  return (
    <>
      {/* Land base (covers the widened expanded viewBox) */}
      <rect x={-40} y={-20} width={220} height={140} fill={LAND_OUTER} />

      {/* Street grid */}
      <g>
        {streets.map((y) => (
          <line key={`gsh-c-${y}`} x1={-14} y1={y} x2={154} y2={y} stroke={ROAD_CASING} strokeWidth={1.1} />
        ))}
        {streets.map((y) => (
          <line key={`gsh-f-${y}`} x1={-14} y1={y} x2={154} y2={y} stroke={ROAD_FILL} strokeWidth={0.7} />
        ))}
        {avenues.map((x) => (
          <line key={`gav-c-${x}`} x1={x} y1={-14} x2={x} y2={114} stroke={ROAD_CASING} strokeWidth={1.3} />
        ))}
        {avenues.map((x) => (
          <line key={`gav-f-${x}`} x1={x} y1={-14} x2={x} y2={114} stroke={ROAD_FILL} strokeWidth={0.85} />
        ))}
      </g>

      {/* Diagonal boulevard */}
      <line x1={boulevardX} y1={-14} x2={boulevardX - 40} y2={114} stroke={ROAD_CASING} strokeWidth={2.2} />
      <line x1={boulevardX} y1={-14} x2={boulevardX - 40} y2={114} stroke={HIGHWAY} strokeWidth={1.3} />

      {/* Parks */}
      <rect x={park1.x} y={park1.y} width={park1.w} height={park1.h} rx={1.5} fill={GREEN} />
      <rect x={park2.x} y={park2.y} width={park2.w} height={park2.h} rx={1.5} fill={GREEN} />

      {/* Water: corner bay + river channel (drawn on top to interrupt the grid) */}
      <circle cx={bayX} cy={bayY} r={bayR} fill={WATER} />
      <path d={riverPath} fill="none" stroke={WATER} strokeWidth={riverW} strokeLinecap="round" />

      {/* City label */}
      <text x={70} y={54} fill={LABEL} fontSize={4} fontWeight={800} textAnchor="middle" opacity={0.5} style={{ letterSpacing: '0.16em' }}>
        {cityName.toUpperCase()}
      </text>
    </>
  );
}

interface OfferPin {
  x: number;
  y: number;
  offer: ProductFeedItem;
}

interface OffersNearMapProps {
  country: string;
  offers: ProductFeedItem[];
  // Deterministic per-user seed (DY uid) so the pin layout stays stable for a
  // user but varies between users.
  seed: string;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export default function OffersNearMap({ country, offers, seed, expanded, onToggleExpand }: OffersNearMapProps) {
  const [activeSku, setActiveSku] = useState<string | null>(null);
  const [hoveredSku, setHoveredSku] = useState<string | null>(null);
  const [internalExpanded, setInternalExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchedLocation, setSearchedLocation] = useState<string | null>(null);
  const { activatedOffers, activateOffer, recordSaving } = useSession();

  const isExpanded = expanded ?? internalExpanded;
  const toggleExpand = onToggleExpand ?? (() => setInternalExpanded((v) => !v));

  useEffect(() => {
    setActiveSku(null);
    setSearchQuery('');
    setSearchedLocation(null);
  }, [country]);

  // Showcase one city per country: focus on the city with the most offers in
  // the provided (already country-filtered) set.
  const focusCityCode = useMemo(() => {
    const counts = new Map<string, number>();
    for (const offer of offers) {
      const code = getCityCode(offer.sku);
      if (code) {
        counts.set(code, (counts.get(code) ?? 0) + 1);
      }
    }
    let best = '';
    let bestCount = -1;
    counts.forEach((count, code) => {
      if (count > bestCount) {
        best = code;
        bestCount = count;
      }
    });
    return best;
  }, [offers]);

  const cityInfo = CITY_INFO[focusCityCode] ?? { name: country, label: '' };
  const isNyc = focusCityCode === 'NYC';

  // Animated viewBox: zoom into the searched location (centering it) when set,
  // otherwise sit at the default expanded/collapsed framing.
  const [viewBox, setViewBox] = useState<[number, number, number, number]>(() =>
    (expanded ?? internalExpanded) ? EXPANDED_VIEWBOX : COLLAPSED_VIEWBOX,
  );
  const viewBoxRef = useRef(viewBox);
  useEffect(() => {
    const target: [number, number, number, number] = !isExpanded
      ? COLLAPSED_VIEWBOX
      : searchedLocation && isNyc
        ? [
            SEARCH_POINT.x - EXPANDED_VIEWBOX[2] / 2,
            SEARCH_POINT.y - EXPANDED_VIEWBOX[3] / 2,
            EXPANDED_VIEWBOX[2],
            EXPANDED_VIEWBOX[3],
          ]
        : EXPANDED_VIEWBOX;
    const from = viewBoxRef.current;
    const start = performance.now();
    const duration = 600;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      const next: [number, number, number, number] = [
        from[0] + (target[0] - from[0]) * e,
        from[1] + (target[1] - from[1]) * e,
        from[2] + (target[2] - from[2]) * e,
        from[3] + (target[3] - from[3]) * e,
      ];
      viewBoxRef.current = next;
      setViewBox(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isExpanded, searchedLocation, isNyc]);

  // Focus on the showcase city's offers; fall back to all provided offers so the
  // map always has something to show.
  const cityOffers = useMemo(() => {
    const matches = offers.filter((offer) => getCityCode(offer.sku) === focusCityCode);
    return matches.length > 0 ? matches : offers;
  }, [offers, focusCityCode]);

  const maxPins = isExpanded ? MAX_PINS_EXPANDED : MAX_PINS;

  // Scatter offers across Manhattan using a golden-angle spiral constrained to
  // an ellipse that hugs the island, so pins read as distinct locations. Any
  // offers beyond MAX_PINS spill into the outer boroughs and only surface once
  // the map is expanded.
  const pins = useMemo<OfferPin[]>(() => {
    const ordered = [...cityOffers]
      .sort((a, b) => hashSeed(seed + a.sku) - hashSeed(seed + b.sku))
      .slice(0, maxPins);

    const rng = mulberry32(hashSeed(`${seed}-nyc`));
    const golden = 137.508 * (Math.PI / 180);
    const cx = 70;
    const cy = 48;
    const rx = 13;
    const ry = 17;
    // Fixed denominator so the central pins keep the same spots when expanding.
    const manhattanCount = Math.max(Math.min(cityOffers.length, MAX_PINS), 1);

    return ordered.map((offer, index) => {
      if (index < MAX_PINS) {
        const frac = manhattanCount === 1 ? 0 : Math.sqrt((index + 0.6) / manhattanCount);
        const angle = index * golden + rng() * 0.6;
        const x = cx + rx * frac * Math.cos(angle);
        let y = cy + ry * frac * Math.sin(angle);
        // Nudge pins out of Central Park so they sit on streets.
        if (x > 60 && x < 76 && y > 22 && y < 50) {
          y = 53;
        }
        return { offer, x, y };
      }

      // Overflow offers populate the outer boroughs (revealed when expanded).
      const outerIndex = index - MAX_PINS;
      const zoneRng = mulberry32(hashSeed(`${seed}-outer-${offer.sku}`));
      if (outerIndex % 2 === 0) {
        // Brooklyn / Queens (right side)
        return { offer, x: 111 + zoneRng() * 24, y: 26 + zoneRng() * 50 };
      }
      // New Jersey (left side)
      return { offer, x: 9 + zoneRng() * 22, y: 32 + zoneRng() * 44 };
    });
  }, [cityOffers, seed, maxPins]);

  // Offers pinned around the searched (mocked) location. Reuses existing NYC
  // offers as if they were also available there.
  const searchedPins = useMemo<OfferPin[]>(() => {
    if (!searchedLocation || !isNyc) {
      return [];
    }
    return cityOffers.slice(0, SEARCH_PIN_OFFSETS.length).map((offer, i) => ({
      offer,
      x: SEARCH_POINT.x + SEARCH_PIN_OFFSETS[i][0],
      y: SEARCH_POINT.y + SEARCH_PIN_OFFSETS[i][1],
    }));
  }, [searchedLocation, isNyc, cityOffers]);

  // Original pins stay visible; searched-location pins are added on top when expanded.
  const visiblePins = useMemo(
    () => (isExpanded ? [...pins, ...searchedPins] : pins),
    [isExpanded, pins, searchedPins],
  );

  const showSuggestion =
    isNyc &&
    isExpanded &&
    !searchedLocation &&
    searchQuery.trim().length > 0 &&
    SEARCH_ADDRESS.toLowerCase().includes(searchQuery.trim().toLowerCase());

  const activeOffer = useMemo(
    () => visiblePins.find((pin) => pin.offer.sku === activeSku)?.offer ?? null,
    [visiblePins, activeSku],
  );

  const labelPin = useMemo(() => {
    const sku = hoveredSku ?? activeSku;
    return sku ? visiblePins.find((pin) => pin.offer.sku === sku) ?? null : null;
  }, [visiblePins, hoveredSku, activeSku]);

  if (cityOffers.length === 0) {
    return null;
  }

  const handleBackgroundClick = () => {
    setActiveSku(null);
    if (!isExpanded) {
      toggleExpand();
    }
  };

  const handleActivate = (offer: ProductFeedItem) => {
    if (activatedOffers.has(offer.sku)) {
      return;
    }
    activateOffer(offer.sku);
    recordSaving({
      sku: offer.sku,
      merchant: offer.brand,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      amount: deriveSaving(offer),
    });
  };

  return (
    <div
      className={`relative w-full rounded-[48px] overflow-hidden shadow-xl border-4 border-white ${
        isExpanded ? 'h-[75vh] min-h-150 md:min-h-180' : 'h-full min-h-130'
      }`}
      style={{ backgroundColor: WATER }}
    >
      {/* Realistic New York street canvas. Collapsed zooms into central
          Manhattan so the narrow card fills edge-to-edge; expanded zooms out to
          the full scene (New Jersey + Manhattan + Brooklyn) where the overflow
          offer pins in the outer boroughs become visible. */}
      <svg
        className={`absolute inset-0 w-full h-full ${isExpanded ? 'cursor-default' : 'cursor-zoom-in'}`}
        viewBox={`${viewBox[0]} ${viewBox[1]} ${viewBox[2]} ${viewBox[3]}`}
        preserveAspectRatio="xMidYMid slice"
        onClick={handleBackgroundClick}
        aria-hidden="true"
      >
        {isNyc ? <NycMapArt /> : <GenericCityMapArt citySeed={hashSeed(focusCityCode || cityInfo.name)} cityName={cityInfo.name} />}

        {/* Offer pins */}
        {visiblePins.map((pin, pinIndex) => {
          const isActive = pin.offer.sku === activeSku;
          const isDone = activatedOffers.has(pin.offer.sku);
          const s = isActive ? 0.28 : 0.22;
          const color = isDone ? '#16a34a' : 'var(--color-secondary, #cf4500)';
          return (
            <g
              key={`${pin.offer.sku}-${pinIndex}`}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setActiveSku(isActive ? null : pin.offer.sku);
              }}
              onMouseEnter={() => setHoveredSku(pin.offer.sku)}
              onMouseLeave={() => setHoveredSku((cur) => (cur === pin.offer.sku ? null : cur))}
            >
              {isActive && <circle cx={pin.x} cy={pin.y} r={2.4} fill="none" stroke={color} strokeWidth={0.8} opacity={0.6} />}
              <g transform={`translate(${pin.x} ${pin.y}) scale(${s}) translate(-12 -23)`}>
                <path
                  d="M12 23s7-8.4 7-14A7 7 0 0 0 5 9c0 5.6 7 14 7 14z"
                  fill={color}
                  stroke="#ffffff"
                  strokeWidth={1.6}
                />
                <circle cx={12} cy={9} r={2.6} fill="#ffffff" />
              </g>
            </g>
          );
        })}

        {/* Searched-location destination marker */}
        {searchedLocation && isExpanded && isNyc && (
          <g style={{ pointerEvents: 'none' }}>
            <circle cx={SEARCH_POINT.x} cy={SEARCH_POINT.y} r={3} fill="none" stroke="#1f2b4d" strokeWidth={0.6} opacity={0.5} />
            <g transform={`translate(${SEARCH_POINT.x} ${SEARCH_POINT.y}) scale(0.3) translate(-12 -23)`}>
              <path
                d="M12 23s7-8.4 7-14A7 7 0 0 0 5 9c0 5.6 7 14 7 14z"
                fill="#1f2b4d"
                stroke="#ffffff"
                strokeWidth={1.6}
              />
              <circle cx={12} cy={9} r={2.6} fill="#ffffff" />
            </g>
            <text
              x={SEARCH_POINT.x}
              y={SEARCH_POINT.y - 8}
              textAnchor="middle"
              fontSize={2.4}
              fontWeight={800}
              fill="#1f2b4d"
              stroke="#ffffff"
              strokeWidth={0.9}
              paintOrder="stroke"
              style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}
            >
              4658 Camden St
            </text>
          </g>
        )}

        {/* Hover / active pin label */}
        {labelPin && (
          <text
            x={labelPin.x}
            y={labelPin.y - 7}
            textAnchor="middle"
            fontSize={2.6}
            fontWeight={800}
            fill="var(--color-primary, #1f2b4d)"
            stroke="#ffffff"
            strokeWidth={0.9}
            paintOrder="stroke"
            style={{ textTransform: 'uppercase', letterSpacing: '0.04em', pointerEvents: 'none' }}
          >
            {labelPin.offer.brand}
          </text>
        )}
      </svg>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-7 md:p-8 z-20 pointer-events-none bg-linear-to-b from-white/95 via-white/55 to-transparent">
        <span className="inline-flex items-center gap-1.5 font-sans text-[10px] font-black uppercase tracking-[0.3em] text-secondary">
          <Navigation size={12} /> Offers Near You
        </span>
        <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-primary mt-2">{cityInfo.name}</h3>
        <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-on-surface-variant mt-1">
          {cityOffers.length} {cityOffers.length === 1 ? 'offer' : 'offers'}
          {cityInfo.label ? ` · ${cityInfo.label}` : ''}
        </p>
      </div>

      {/* Address search (New York only, when expanded) */}
      {isExpanded && isNyc && (
        <div className="absolute top-28 md:top-32 right-7 md:right-8 z-30 w-[min(22rem,calc(100%-4rem))]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (searchedLocation) {
                  setSearchedLocation(null);
                }
              }}
              placeholder="Search an address…"
              className="w-full rounded-xl bg-white shadow-md border border-outline-variant/20 pl-9 pr-9 py-2.5 font-sans text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {(searchQuery || searchedLocation) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchedLocation(null);
                }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {showSuggestion && (
            <button
              type="button"
              onClick={() => {
                setSearchedLocation(SEARCH_ADDRESS);
                setSearchQuery(SEARCH_ADDRESS);
                setActiveSku(null);
              }}
              className="mt-1.5 w-full text-left rounded-xl bg-white shadow-lg border border-outline-variant/20 px-3 py-2.5 hover:bg-surface-container transition-colors flex items-center gap-2"
            >
              <MapPin size={14} className="text-secondary shrink-0" />
              <span className="font-sans text-sm text-primary">{SEARCH_ADDRESS}</span>
            </button>
          )}
        </div>
      )}

      {/* Expand / collapse control */}
      <button
        type="button"
        onClick={toggleExpand}
        aria-label={isExpanded ? 'Collapse map' : 'Expand map'}
        className="absolute top-6 right-6 z-30 w-10 h-10 rounded-xl bg-white shadow-md border border-outline-variant/20 flex items-center justify-center text-primary hover:bg-surface-container transition-colors"
      >
        {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
      </button>

      {/* Offer quick-view card */}
      <AnimatePresence>
        {activeOffer && (
          <motion.div
            key={`qv-${activeOffer.sku}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className={`absolute z-40 bg-white rounded-3xl shadow-2xl border border-outline-variant/20 p-4 ${
              isExpanded ? 'left-8 bottom-8 w-80' : 'left-1/2 -translate-x-1/2 bottom-6 w-[88%] max-w-85'
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveSku(null)}
              aria-label="Close"
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant transition-colors"
            >
              <X size={14} />
            </button>

            <div className="flex items-center gap-3 pr-8">
              <div className="w-14 h-14 rounded-2xl overflow-hidden bg-surface-container-high border border-outline-variant/20 flex items-center justify-center shrink-0">
                {activeOffer.image_url ? (
                  <img src={activeOffer.image_url} alt={activeOffer.brand} className="w-full h-full object-cover" />
                ) : activeOffer.logo_url ? (
                  <img src={activeOffer.logo_url} alt={activeOffer.brand} className="w-9 h-9 object-contain" />
                ) : (
                  <span className="text-xs font-black text-primary">{activeOffer.brand.slice(0, 2).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0">
                <p className="font-sans text-[10px] font-black uppercase tracking-widest text-secondary truncate">{activeOffer.brand}</p>
                <p className="font-sans text-sm font-bold text-primary leading-snug line-clamp-2">{activeOffer.name}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleActivate(activeOffer)}
                disabled={activatedOffers.has(activeOffer.sku)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 font-sans text-[11px] font-black uppercase tracking-widest transition-all ${
                  activatedOffers.has(activeOffer.sku)
                    ? 'bg-green-600 text-white cursor-default'
                    : 'bg-primary text-white hover:bg-primary/90 active:scale-95'
                }`}
              >
                {activatedOffers.has(activeOffer.sku) ? (
                  <>
                    <Check size={14} /> Activated
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Activate
                  </>
                )}
              </button>
              <Link
                to={`/offers/${encodeURIComponent(activeOffer.sku)}`}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-2.5 font-sans text-[11px] font-black uppercase tracking-widest text-primary border border-outline-variant/30 hover:bg-surface-container transition-colors"
              >
                See details <ArrowRight size={12} />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer hint */}
      {!activeOffer && (
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7 z-20 pointer-events-none bg-linear-to-t from-white/90 to-transparent">
          <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            {isExpanded ? 'Tap a pin to preview an offer' : 'Tap the map to expand · tap a pin to preview'}
          </p>
        </div>
      )}
    </div>
  );
}
