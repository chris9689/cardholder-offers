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
} from 'lucide-react';
import type { EmailContent, DeviceTheme } from '../../types';
import { APPLE_FONT } from '../../deviceFont';

interface EmailPreviewProps {
  content: EmailContent;
  theme: DeviceTheme;
}

const FILLER_ROWS = [
  { from: 'Apple Card', subject: 'Your July statement is ready', snippet: 'View your latest transactions and balance.', time: 'Tue' },
  { from: 'Calendar', subject: 'Invitation: Q3 Planning', snippet: 'You have been invited to an event.', time: 'Mon' },
];

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
            <div style={{ maxWidth: 520, margin: '0 auto', background: isDark ? '#161618' : '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 10px 30px -18px rgba(0,0,0,0.4)' }}>
              {/* Hero */}
              <div className="relative" style={{ height: 190 }}>
                <img src={content.heroImage} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.55))' }} />
                <div className="absolute bottom-0 left-0 p-5">
                  <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: 'rgba(255,255,255,0.85)' }}>
                    {content.eyebrow}
                  </div>
                  <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: -0.4, lineHeight: 1.1, marginTop: 4 }}>
                    {content.headline}
                  </div>
                </div>
              </div>

              {/* Body copy */}
              <div style={{ padding: '20px 22px 8px' }}>
                {content.bodyParagraphs.map((p, i) => (
                  <p key={i} style={{ fontSize: 14.5, lineHeight: 1.55, color: textPrimary, marginBottom: 12 }}>
                    {p}
                  </p>
                ))}
              </div>

              {/* Recommendation label */}
              <div style={{ padding: '0 22px' }}>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, textTransform: 'uppercase', color: '#775a19' }}>
                  {content.recommendationReason}
                </span>
              </div>

              {/* Product cards */}
              <div style={{ padding: '10px 22px 4px', display: 'grid', gap: 12 }}>
                {content.products.map((product) => (
                  <div
                    key={product.name}
                    className="flex items-center gap-3"
                    style={{ border: `1px solid ${border}`, borderRadius: 14, padding: 10, background: isDark ? '#1c1c1e' : '#fff' }}
                  >
                    <img src={product.image} alt="" style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                    <div className="min-w-0 flex-1">
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: textMuted }}>
                        {product.brand}
                      </div>
                      <div className="line-clamp-2" style={{ fontSize: 14, fontWeight: 600, color: textPrimary, lineHeight: 1.25 }}>
                        {product.name}
                      </div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#775a19', background: 'rgba(119,90,25,0.12)', padding: '4px 8px', borderRadius: 8, whiteSpace: 'nowrap' }}>
                      {product.reward}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{ padding: '18px 22px 24px' }}>
                <div
                  className="text-center"
                  style={{ background: '#000', color: '#fff', borderRadius: 999, padding: '14px 20px', fontSize: 14, fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase' }}
                >
                  {content.ctaLabel}
                </div>
                <div className="text-center" style={{ fontSize: 11, color: textMuted, marginTop: 14 }}>
                  {content.footerNote}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
