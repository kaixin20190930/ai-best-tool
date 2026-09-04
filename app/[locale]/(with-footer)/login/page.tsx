import { Metadata } from 'next';

import { safeLocalizedReturnPath } from '@/lib/navigation/localizedPaths';
import { getNoindexMetadata } from '@/lib/seo/indexing';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your account',
  ...getNoindexMetadata(),
};

export default function LoginPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: { redirect?: string | string[] };
}) {
  const value = searchParams?.redirect;
  const redirectTo = safeLocalizedReturnPath(Array.isArray(value) ? value[0] : value, params.locale);

  return (
    <div className='theme-page container flex min-h-[calc(100vh-200px)] items-center justify-center py-10'>
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}
