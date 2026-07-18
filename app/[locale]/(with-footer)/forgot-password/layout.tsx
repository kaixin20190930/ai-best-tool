import type { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';

export const metadata: Metadata = {
  ...getNoindexMetadata(),
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
