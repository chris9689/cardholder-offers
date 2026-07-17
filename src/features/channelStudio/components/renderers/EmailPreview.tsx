/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * EmailPreview — the iPadOS Mail app: a two-pane layout (inbox list + reading
 * pane) with the generated campaign opened in the reading pane.
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  Search,
  ChevronLeft,
  Reply,
  ReplyAll,
  Forward,
  Trash2,
  Archive,
  Flag,
  MoreHorizontal,
  Check,
} from 'lucide-react';
import type { EmailContent, EmailProduct, DeviceTheme } from '../../types';
import { APPLE_FONT } from '../../deviceFont';
import { BRAND_LOGO_URL } from '../../brandAssets';

interface EmailPreviewProps {
  content: EmailContent;
  theme: DeviceTheme;
}

const FILLER_ROWS = [
  { from: 'Apple Card', subject: 'Your July statement is ready', snippet: 'View your latest transactions and balance.', time: 'Tue' },
  { from: 'Calendar', subject: 'Invitation: Q3 Planning', snippet: 'You have been invited to an event.', time: 'Mon' },
];

interface OfferTileProps {
  product: EmailProduct;
  isDark: boolean;
  border: string;
  surface: string;
  textPrimary: string;
  textMuted: string;
}

/** A single offer card matching the Mastercard "Handpicked offers" grid tile. */
function OfferTile({ product, isDark, border, surface, textPrimary, textMuted }: OfferTileProps) {
  return (
    <div style={{ border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden', background: surface }}>
      <div className="relative" style={{ height: 104 }}>
        <img src={product.image} alt="" className="w-full h-full object-cover" />
        <div
          className="absolute flex items-center gap-1"
          style={{
            left: 8,
            bottom: 8,
            background: 'rgba(255,255,255,0.94)',
            color: '#1c1c1e',
            borderRadius: 999,
            padding: '3px 8px 3px 6px',
            fontSize: 10,
            fontWeight: 700,
            boxShadow: '0 4px 10px -4px rgba(0,0,0,0.35)',
          }}
        >
          <Check size={11} strokeWidth={3} color="#1a8a4a" />
          Ready to use
        </div>
      </div>
      <div style={{ padding: '10px 11px 12px' }}>
        <div className="flex items-start gap-2">
          <div
            className="flex items-center justify-center shrink-0"
            style={{ width: 26, height: 26, borderRadius: 999, background: 'rgba(119,90,25,0.12)', color: '#775a19', fontSize: 10, fontWeight: 800 }}
          >
            {product.logoText ?? product.brand.slice(0, 2).toUpperCase()}
          </div>
          <div className="line-clamp-2" style={{ fontSize: 12.5, fontWeight: 600, color: textPrimary, lineHeight: 1.3 }}>
            {product.name}
          </div>
        </div>
        <div className="truncate" style={{ fontSize: 11, color: textMuted, marginTop: 7, marginLeft: 34 }}>
          {product.brand}
          {product.country ? ` · ${product.country}` : ''}
        </div>
      </div>
    </div>
  );
}

export default function EmailPreview({ content, theme }: EmailPreviewProps) {
  const isDark = theme === 'dark';
  const surface = isDark ? '#000' : '#fff';
  const sidebar = isDark ? '#1c1c1e' : '#f7f7fa';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const textPrimary = isDark ? '#f2f2f7' : '#1c1c1e';
  const textMuted = isDark ? '#9a9aa2' : '#8a8a8e';
  const blue = '#0a84ff';

  return (
    <div className="w-full h-full flex" style={{ background: surface, fontFamily: APPLE_FONT }}>
      {/* Sidebar / inbox list */}
      <div className="h-full flex flex-col shrink-0" style={{ width: 300, background: sidebar, borderRight: `1px solid ${border}` }}>
        <div className="flex items-center justify-between" style={{ padding: '14px 16px 8px' }}>
          <div className="flex items-center gap-1" style={{ color: blue, fontSize: 15, fontWeight: 500 }}>
            <ChevronLeft size={18} strokeWidth={2.5} />
            <span>Mailboxes</span>
          </div>
          <MoreHorizontal size={18} color={blue} />
        </div>
        <div style={{ padding: '0 16px 6px' }}>
          <div style={{ fontSize: 26, fontWeight: 800, color: textPrimary, letterSpacing: -0.5 }}>Inbox</div>
          <div
            className="flex items-center gap-2 mt-2"
            style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', borderRadius: 10, padding: '7px 10px' }}
          >
            <Search size={15} color={textMuted} />
            <span style={{ fontSize: 14, color: textMuted }}>Search</span>
          </div>
        </div>

        {/* Selected campaign row */}
        <div style={{ padding: '4px 0' }}>
          <div
            className="flex gap-2.5"
            style={{ padding: '12px 16px', background: isDark ? 'rgba(10,132,255,0.16)' : 'rgba(10,132,255,0.1)', borderLeft: `3px solid ${blue}` }}
          >
            <span style={{ width: 9, height: 9, borderRadius: 999, background: blue, marginTop: 6, flexShrink: 0 }} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span style={{ fontSize: 15, fontWeight: 700, color: textPrimary }}>{content.senderName}</span>
                <span style={{ fontSize: 12, color: textMuted }}>{content.timeLabel}</span>
              </div>
              <div className="truncate" style={{ fontSize: 14, fontWeight: 600, color: textPrimary, marginTop: 1 }}>
                {content.subject}
              </div>
              <div className="line-clamp-2" style={{ fontSize: 13, color: textMuted, marginTop: 1, lineHeight: 1.3 }}>
                {content.preheader}
              </div>
            </div>
          </div>

          {/* Filler rows */}
          {FILLER_ROWS.map((row) => (
            <div key={row.subject} className="flex gap-2.5" style={{ padding: '12px 16px', borderTop: `1px solid ${border}` }}>
              <span style={{ width: 9, height: 9, marginTop: 6, flexShrink: 0 }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 15, fontWeight: 600, color: textPrimary }}>{row.from}</span>
                  <span style={{ fontSize: 12, color: textMuted }}>{row.time}</span>
                </div>
                <div className="truncate" style={{ fontSize: 14, color: textPrimary, marginTop: 1 }}>{row.subject}</div>
                <div className="truncate" style={{ fontSize: 13, color: textMuted, marginTop: 1 }}>{row.snippet}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reading pane */}
      <div className="h-full flex-1 flex flex-col min-w-0" style={{ background: surface }}>
        {/* Toolbar */}
        <div className="flex items-center justify-between shrink-0" style={{ padding: '10px 18px', borderBottom: `1px solid ${border}` }}>
          <div className="flex items-center gap-5" style={{ color: blue }}>
            <Archive size={18} />
            <Trash2 size={18} />
            <Flag size={18} />
          </div>
          <div className="flex items-center gap-5" style={{ color: blue }}>
            <Reply size={18} />
            <ReplyAll size={18} />
            <Forward size={18} />
          </div>
        </div>

        {/* Scrollable email */}
        <motion.div
          key={content.subject}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className={`flex-1 overflow-y-auto ios-scrollbar${isDark ? ' ios-scrollbar-dark' : ''}`}
        >
          {/* Header meta */}
          <div style={{ padding: '18px 26px 14px', borderBottom: `1px solid ${border}` }}>
            <div style={{ fontSize: 21, fontWeight: 800, color: textPrimary, letterSpacing: -0.3, lineHeight: 1.25 }}>
              {content.subject}
            </div>
            <div className="flex items-center gap-3 mt-3">
              <div
                className="flex items-center justify-center shrink-0"
                style={{ width: 40, height: 40, borderRadius: 999, background: '#000', color: '#fff', fontWeight: 700, fontSize: 16 }}
              >
                {content.senderInitial}
              </div>
              <div className="min-w-0">
                <div style={{ fontSize: 15, fontWeight: 700, color: textPrimary }}>{content.senderName}</div>
                <div style={{ fontSize: 13, color: textMuted }} className="truncate">
                  {content.senderEmail} • {content.timeLabel}
                </div>
              </div>
            </div>
          </div>

          {/* Email body (rendered marketing template) */}
          <div style={{ background: isDark ? '#0d0d0f' : '#f4f5f7', padding: '22px 26px 30px' }}>
            <div style={{ maxWidth: 560, margin: '0 auto', display: 'grid', gap: 14 }}>
              {/* Preheader strip */}
              <div className="flex items-center justify-between" style={{ padding: '0 4px' }}>
                <span className="truncate" style={{ fontSize: 11, color: textMuted, marginRight: 12 }}>
                  {content.preheader}
                </span>
                <span style={{ fontSize: 11, fontWeight: 600, color: blue, whiteSpace: 'nowrap' }}>View in browser</span>
              </div>

              {/* Hero banner */}
              <div className="relative" style={{ height: 214, borderRadius: 18, overflow: 'hidden' }}>
                <img src={content.heroImage} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.65))' }} />
                <img
                  src={BRAND_LOGO_URL}
                  alt=""
                  className="absolute"
                  style={{ top: 16, left: 18, height: 26, objectFit: 'contain' }}
                />
                <div className="absolute" style={{ left: 18, right: 18, bottom: 16 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 800, letterSpacing: 1.5, color: 'rgba(255,255,255,0.85)' }}>
                    {content.eyebrow}
                  </div>
                  <div style={{ fontSize: 25, fontWeight: 800, color: '#fff', letterSpacing: -0.4, lineHeight: 1.12, marginTop: 4, maxWidth: 300 }}>
                    {content.headline}
                  </div>
                  <div
                    className="inline-block"
                    style={{ marginTop: 12, background: '#fff', color: '#111', borderRadius: 999, padding: '9px 18px', fontSize: 12.5, fontWeight: 700 }}
                  >
                    Log in to your account
                  </div>
                </div>
              </div>

              {/* Handpicked offers section */}
              <div style={{ background: surface, borderRadius: 18, padding: '22px 18px 20px', border: `1px solid ${border}` }}>
                <div className="text-center" style={{ fontSize: 18, fontWeight: 800, color: textPrimary, letterSpacing: -0.3, lineHeight: 1.3, maxWidth: 330, margin: '0 auto 4px' }}>
                  Handpicked offers to help inspire your next purchase
                </div>
                {content.bodyParagraphs[1] ? (
                  <div className="text-center" style={{ fontSize: 13, color: textMuted, lineHeight: 1.5, maxWidth: 360, margin: '0 auto 16px' }}>
                    {content.bodyParagraphs[1]}
                  </div>
                ) : (
                  <div style={{ height: 14 }} />
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {content.products.slice(0, 4).map((product) => (
                    <OfferTile
                      key={`${product.brand}-${product.name}`}
                      product={product}
                      isDark={isDark}
                      border={border}
                      surface={isDark ? '#1c1c1e' : '#fff'}
                      textPrimary={textPrimary}
                      textMuted={textMuted}
                    />
                  ))}
                </div>
              </div>

              {/* Favorite brands band */}
              <div className="text-center" style={{ background: surface, borderRadius: 18, padding: '20px 18px', border: `1px solid ${border}` }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: textPrimary, letterSpacing: -0.2, marginBottom: 14 }}>
                  Hundreds of offers from your favorite brands
                </div>
                <div className="flex flex-wrap items-center justify-center" style={{ gap: 8 }}>
                  {content.products.map((product) => (
                    <div
                      key={`chip-${product.brand}`}
                      className="flex items-center justify-center"
                      style={{
                        minWidth: 54,
                        height: 34,
                        padding: '0 10px',
                        borderRadius: 8,
                        background: isDark ? 'rgba(255,255,255,0.06)' : '#f4f5f7',
                        border: `1px solid ${border}`,
                        fontSize: 11,
                        fontWeight: 800,
                        color: '#775a19',
                      }}
                    >
                      {product.logoText ?? product.brand.slice(0, 2).toUpperCase()}
                    </div>
                  ))}
                </div>
              </div>

              {/* More offers */}
              {content.products.length > 4 && (
                <div style={{ background: surface, borderRadius: 18, padding: '20px 18px', border: `1px solid ${border}` }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: textPrimary, letterSpacing: -0.2, marginBottom: 14 }}>
                    More offers are waiting for you
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {content.products.slice(4, 6).map((product) => (
                      <OfferTile
                        key={`more-${product.brand}-${product.name}`}
                        product={product}
                        isDark={isDark}
                        border={border}
                        surface={isDark ? '#1c1c1e' : '#fff'}
                        textPrimary={textPrimary}
                        textMuted={textMuted}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Footer banner */}
              <div className="relative" style={{ height: 150, borderRadius: 18, overflow: 'hidden' }}>
                <img src={content.heroImage} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.7))' }} />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ padding: '0 24px' }}>
                  <div style={{ fontSize: 17, fontWeight: 800, color: '#fff', letterSpacing: -0.2, lineHeight: 1.25, maxWidth: 320 }}>
                    See the world in a whole new light with {content.senderName}
                  </div>
                  <div
                    style={{ marginTop: 12, background: '#fff', color: '#111', borderRadius: 999, padding: '9px 18px', fontSize: 12.5, fontWeight: 700 }}
                  >
                    {content.ctaLabel}
                  </div>
                </div>
              </div>

              {/* Legal footer */}
              <div className="text-center" style={{ fontSize: 10.5, color: textMuted, lineHeight: 1.5, padding: '2px 8px 4px' }}>
                {content.footerNote}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
