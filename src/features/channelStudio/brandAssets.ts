/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared brand assets used across every channel preview (push app icon,
 * email header logo, etc.). Centralized so the logo can be swapped in one
 * place without touching component code.
 */

/** Primary brand logo shown in push app icon and email header. */
export const BRAND_LOGO_URL = 'https://cdn.dynamicyield.com/api/8794982/images/3c0946abb377.webp';

/**
 * Default email footer banner image. Segments can override this per-audience
 * via the `email.footerImage` field in the segment registry.
 */
export const DEFAULT_EMAIL_FOOTER_IMAGE_URL =
  'https://cdn.dynamicyield.com/api/8794982/images/45c2ce8a5681.webp';
