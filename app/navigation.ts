import { createSharedPathnamesNavigation } from 'next-intl/navigation';

import { locales } from '../i18n';

export const localePrefix = 'as-needed';

// eslint-disable-next-line object-curly-newline
export const { redirect, usePathname, useRouter } = createSharedPathnamesNavigation({ locales, localePrefix });
export { default as Link } from '@/components/navigation/LocalizedLink';
