/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Apple-style font stack for the device previews.
 *
 * NOTE: Apple's San Francisco (SF Pro) font is proprietary and cannot be
 * embedded/redistributed in a web app. This stack renders the REAL SF font
 * natively on Apple devices (via -apple-system / BlinkMacSystemFont) and falls
 * back to Inter — a free, open-source, metrically near-identical look-alike —
 * on Windows/Android so the previews look authentically iOS everywhere.
 */

export const APPLE_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Inter", "Segoe UI", Roboto, sans-serif';
