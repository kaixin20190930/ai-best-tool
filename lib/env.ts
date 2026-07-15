const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  'https://aibesttool.com';

export const BASE_URL = siteUrl.replace(/\/$/, '');

export const GOOGLE_TRACKING_ID = process.env.GOOGLE_TRACKING_ID || 'G-G5N2JEFERP';
export const GOOGLE_ADSENSE_URL = process.env.GOOGLE_ADSENSE_URL || '';
export const CONTACT_US_EMAIL = process.env.CONTACT_US_EMAIL || '';
