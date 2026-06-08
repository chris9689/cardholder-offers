/**
 * Global app configuration and theme system.
 * Change branding, colors, fonts, spacing here; affects the entire app.
 */

// Brand

export const BRAND = {
  name: 'Spending Offers',
  logoUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuCmuskyyhrHeFWM3b12DTZNny1RwsOiUZI-7b6HpTHUfqogyUJl-wjj_KPhEnEUiBcvOGYVLiSpOW5z7SIwz4p47URs1z85CcDuIBXBXSO7gU2xSzFOWRx1_w3f0UR9ghQH_-Wb2Ocw0GGk0GLeQDyy0SkUkGyzTTqxpnloUjFv3hwAs-4YWOpEnvp9e1lYNOV3khBvWWis94S6QCN3vo73qM0XhDk-6uPhI7n_Ck_O2W8SKQ8W-4OOrBN2B5Wac77aQ5dTCBBxYJ0',
  logoAlt: 'Mastercard Logo',
  footerCopy: '(c) 2026 Premier Rewards Elite. All rights reserved.',
} as const;

// User (mock; replace with real auth in production)

export const USER = {
  name: 'Julian Anderson',
  initialPoints: 125400,
  defaultCardType: 'Black' as 'Standard' | 'Premium' | 'Black',
} as const;

// Theme
//
// These mirror the CSS custom properties defined in index.css @theme.
// Use these values anywhere JS/TS needs a color (e.g. inline styles, canvas).
// For Tailwind utility classes, continue using the CSS variable tokens
// (e.g. `text-primary`, `bg-secondary`) — they are driven by the same values.

export const THEME = {
  darkMode: false, // flip to true when dark-mode CSS tokens are added

  colors: {
    primary: '#000000',
    onPrimary: '#ffffff',
    primaryContainer: '#151b29',
    onPrimaryContainer: '#7e8395',

    secondary: '#775a19',
    onSecondary: '#ffffff',
    secondaryContainer: '#fed488',
    onSecondaryContainer: '#785a1a',
    secondaryFixed: '#ffdea5',
    onSecondaryFixed: '#261900',

    surface: '#f8f9fa',
    surfaceDim: '#d9dadb',
    surfaceBright: '#f8f9fa',
    surfaceLowest: '#ffffff',
    surfaceLow: '#f3f4f5',
    surfaceContainer: '#edeeef',
    surfaceHigh: '#e7e8e9',
    surfaceHighest: '#e1e3e4',

    onSurface: '#191c1d',
    onSurfaceVariant: '#45464c',

    outline: '#76777d',
    outlineVariant: '#c6c6cc',
  },

  fonts: {
    sans: '"Manrope", ui-sans-serif, system-ui, sans-serif',
    serif: '"Playfair Display", ui-serif, Georgia, serif',
    sizeBase: '1rem',
    sizeSm: '0.875rem',
    sizeXs: '0.75rem',
    size2xs: '0.625rem',
  },

  spacing: {
    gutter: '24px',
    maxWidth: '1280px',
    sectionPadding: '80px',
    marginDesktop: '64px',
    marginMobile: '20px',
  },

  radius: {
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '3rem',
  },
} as const;
