/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, MapPin, Navigation, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { ProductFeedItem } from '../lib/productFeed';

interface CityGeo {
  name: string;
  lat: number;
  lng: number;
}

// Real coordinates for the city hubs encoded in the SKU (segment 3, e.g.
// CO-US-NYC-... -> NYC). Pins are projected from these onto the panel via the
// bounding box of whichever cities actually have offers for the active tier.
const CITY_GEO: Record<string, CityGeo> = {
  NYC: { name: 'New York City', lat: 40.71, lng: -74.01 },
  MIA: { name: 'Miami', lat: 25.76, lng: -80.19 },
  LAX: { name: 'Los Angeles', lat: 34.05, lng: -118.24 },
  CHI: { name: 'Chicago', lat: 41.88, lng: -87.63 },
  MAD: { name: 'Madrid', lat: 40.42, lng: -3.7 },
  BCN: { name: 'Barcelona', lat: 41.39, lng: 2.17 },
  VAL: { name: 'Valencia', lat: 39.47, lng: -0.38 },
  SEV: { name: 'Seville', lat: 37.39, lng: -5.98 },
  PAR: { name: 'Paris', lat: 48.86, lng: 2.35 },
  LYN: { name: 'Lyon', lat: 45.76, lng: 4.83 },
  MRS: { name: 'Marseille', lat: 43.3, lng: 5.37 },
  NCE: { name: 'Nice', lat: 43.7, lng: 7.27 },
  MIL: { name: 'Milan', lat: 45.46, lng: 9.19 },
  ROM: { name: 'Rome', lat: 41.9, lng: 12.5 },
  FLO: { name: 'Florence', lat: 43.77, lng: 11.26 },
  NAP: { name: 'Naples', lat: 40.85, lng: 14.27 },
  DXB: { name: 'Dubai', lat: 25.2, lng: 55.27 },
  AUH: { name: 'Abu Dhabi', lat: 24.45, lng: 54.38 },
};

// Cap the number of offer pins rendered in the city view to keep it readable.
const MAX_CITY_PINS = 16;

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

interface MapCity {
  code: string;
  name: string;
  x: number;
  y: number;
  offers: ProductFeedItem[];
}

interface OfferPin {
  sku: string;
  brand: string;
  name: string;
  x: number;
  y: number;
}

interface OffersNearMapProps {
  country: string;
  offers: ProductFeedItem[];
  // Deterministic per-user seed (DY uid) so the highlighted city and the pin
  // layout stay stable for a user but vary between users.
  seed: string;
}

export default function OffersNearMap({ country, offers, seed }: OffersNearMapProps) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  // Reset the drill-down whenever the country (tier/selection) changes.
  useEffect(() => {
    setSelectedCode(null);
  }, [country]);

  const cities = useMemo<MapCity[]>(() => {
    const byCity = new Map<string, ProductFeedItem[]>();
    for (const offer of offers) {
      const code = getCityCode(offer.sku);
      if (!CITY_GEO[code]) {
        continue;
      }
      const list = byCity.get(code) ?? [];
      list.push(offer);
      byCity.set(code, list);
    }

    const codes = Array.from(byCity.keys());
    if (codes.length === 0) {
      return [];
    }

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;
    for (const code of codes) {
      const geo = CITY_GEO[code];
      minLat = Math.min(minLat, geo.lat);
      maxLat = Math.max(maxLat, geo.lat);
      minLng = Math.min(minLng, geo.lng);
      maxLng = Math.max(maxLng, geo.lng);
    }

    const pad = 20;
    const project = (lat: number, lng: number) => {
      const nx = maxLng === minLng ? 0.5 : (lng - minLng) / (maxLng - minLng);
      const ny = maxLat === minLat ? 0.5 : (maxLat - lat) / (maxLat - minLat);
      return {
        x: pad + nx * (100 - 2 * pad),
        y: pad + ny * (100 - 2 * pad),
      };
    };

    return codes
      .map((code) => {
        const list = byCity.get(code) as ProductFeedItem[];
        const geo = CITY_GEO[code];
        const point = project(geo.lat, geo.lng);
        return {
          code,
          name: geo.name,
          x: point.x,
          y: point.y,
          offers: list,
        };
      })
      .sort((a, b) => b.offers.length - a.offers.length);
  }, [offers]);

  const selectedCity = useMemo(
    () => cities.find((city) => city.code === selectedCode) ?? null,
    [cities, selectedCode],
  );

  // Scatter a city's offers around its centre using a golden-angle spiral so
  // they read as distinct pins on the map rather than overlapping.
  const offerPins = useMemo<OfferPin[]>(() => {
    if (!selectedCity) {
      return [];
    }

    const ordered = [...selectedCity.offers]
      .sort((a, b) => hashSeed(seed + a.sku) - hashSeed(seed + b.sku))
      .slice(0, MAX_CITY_PINS);

    const golden = 137.508 * (Math.PI / 180);
    const angleOffset = (hashSeed(seed + selectedCity.code) % 360) * (Math.PI / 180);
    const maxR = 32;
    const cx = 50;
    const cy = 55;

    return ordered.map((offer, index) => {
      const r = ordered.length === 1 ? 0 : maxR * Math.sqrt((index + 0.6) / ordered.length);
      const angle = angleOffset + index * golden;
      return {
        sku: offer.sku,
        brand: offer.brand,
        name: offer.name,
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle) * 1.02,
      };
    });
  }, [selectedCity, seed]);

  if (cities.length === 0) {
    return null;
  }

  const highlightIndex = hashSeed(seed || 'guest-seed') % cities.length;
  const hub = cities[highlightIndex];
  const totalOffers = cities.reduce((sum, city) => sum + city.offers.length, 0);
  const cityCenter = { x: 50, y: 55 };

  return (
    <div className="relative rounded-[48px] overflow-hidden shadow-xl border-4 border-white min-h-[420px] h-full bg-primary">
      {/* Map backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_20%_10%,rgba(56,89,140,0.55),transparent_60%),radial-gradient(120%_120%_at_90%_90%,rgba(20,32,58,0.7),transparent_55%)]" />

      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <pattern id="map-grid" width="7" height="7" patternUnits="userSpaceOnUse">
            <path d="M7 0H0V7" fill="none" stroke="white" strokeOpacity="0.08" strokeWidth="0.25" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#map-grid)" />
        {selectedCity
          ? offerPins.map((pin) => (
              <line
                key={`spoke-${pin.sku}`}
                x1={cityCenter.x}
                y1={cityCenter.y}
                x2={pin.x}
                y2={pin.y}
                stroke="white"
                strokeOpacity="0.25"
                strokeWidth="1"
                strokeDasharray="2 2"
                vectorEffect="non-scaling-stroke"
              />
            ))
          : cities.map((city) =>
              city.code === hub.code ? null : (
                <path
                  key={`arc-${city.code}`}
                  d={`M ${hub.x} ${hub.y} Q ${(hub.x + city.x) / 2} ${Math.min(hub.y, city.y) - 12} ${city.x} ${city.y}`}
                  fill="none"
                  stroke="white"
                  strokeOpacity="0.35"
                  strokeWidth="1"
                  strokeDasharray="2 2"
                  vectorEffect="non-scaling-stroke"
                />
              ),
            )}
      </svg>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-7 md:p-8 z-20">
        {selectedCity ? (
          <>
            <button
              type="button"
              onClick={() => setSelectedCode(null)}
              className="inline-flex items-center gap-1.5 font-sans text-[10px] font-black uppercase tracking-[0.3em] text-white/80 hover:text-white transition-colors"
            >
              <ChevronLeft size={14} /> {country}
            </button>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mt-2">{selectedCity.name}</h3>
            <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-white/60 mt-1">
              {selectedCity.offers.length} {selectedCity.offers.length === 1 ? 'offer' : 'offers'}
              {selectedCity.offers.length > MAX_CITY_PINS ? ` · showing ${MAX_CITY_PINS}` : ''}
            </p>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-1.5 font-sans text-[10px] font-black uppercase tracking-[0.3em] text-white/70">
              <Navigation size={12} /> Offers Near You
            </span>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white mt-2">{country}</h3>
            <p className="font-sans text-[11px] font-bold uppercase tracking-widest text-white/60 mt-1">
              {totalOffers} offers · {cities.length} {cities.length === 1 ? 'city' : 'cities'}
            </p>
          </>
        )}
      </div>

      <AnimatePresence mode="wait">
        {selectedCity ? (
          <motion.div
            key={`city-${selectedCity.code}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {/* City centre marker */}
            <span
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
              style={{ left: `${cityCenter.x}%`, top: `${cityCenter.y}%` }}
            >
              <span className="w-3 h-3 rounded-full bg-white/40 ring-4 ring-white/10" />
            </span>

            {/* Offer pins */}
            {offerPins.map((pin) => (
              <Link
                key={pin.sku}
                to={`/offers/${encodeURIComponent(pin.sku)}`}
                className="group absolute z-30 -translate-x-1/2 -translate-y-full"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                aria-label={`${pin.brand}: ${pin.name}`}
              >
                <div className="flex flex-col items-center">
                  <span className="whitespace-nowrap mb-1.5 px-2.5 py-1 rounded-full bg-white/95 text-primary font-sans text-[9px] font-black uppercase tracking-wider shadow-lg opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                    {pin.brand}
                  </span>
                  <span className="relative flex items-center justify-center w-7 h-7 rounded-full border-2 border-white bg-secondary shadow-lg transition-transform group-hover:scale-110">
                    <Tag size={12} className="text-white" />
                  </span>
                </div>
              </Link>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="country"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0"
          >
            {/* City pins */}
            {cities.map((city) => {
              const isHub = city.code === hub.code;
              return (
                <button
                  key={city.code}
                  type="button"
                  onClick={() => setSelectedCode(city.code)}
                  className="group absolute z-30 -translate-x-1/2 -translate-y-full"
                  style={{ left: `${city.x}%`, top: `${city.y}%` }}
                  aria-label={`${city.name}: ${city.offers.length} offers`}
                >
                  <div className="flex flex-col items-center">
                    <span className="whitespace-nowrap mb-1.5 px-2.5 py-1 rounded-full bg-white/95 text-primary font-sans text-[9px] font-black uppercase tracking-wider shadow-lg opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
                      {city.name} · {city.offers.length}
                    </span>
                    <span className="relative flex items-center justify-center">
                      {isHub && (
                        <span className="absolute inline-flex h-8 w-8 rounded-full bg-secondary/60 animate-ping" />
                      )}
                      <span
                        className={`relative flex items-center justify-center rounded-full border-2 border-white shadow-lg transition-transform group-hover:scale-110 ${
                          isHub ? 'bg-secondary w-9 h-9' : 'bg-white/90 w-7 h-7'
                        }`}
                      >
                        <MapPin size={isHub ? 16 : 13} className={isHub ? 'text-white' : 'text-primary'} />
                      </span>
                    </span>
                  </div>
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer hint */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7 z-20 bg-linear-to-t from-black/60 to-transparent">
        {selectedCity ? (
          <Link
            to="/offers"
            className="inline-flex items-center gap-2 font-sans text-[10px] font-black uppercase tracking-widest text-white/80 hover:text-white transition-colors"
          >
            Browse all {selectedCity.name} offers <ArrowRight size={12} />
          </Link>
        ) : (
          <p className="font-sans text-[10px] font-bold uppercase tracking-widest text-white/70">
            Tap a city to explore its offers
          </p>
        )}
      </div>
    </div>
  );
}
