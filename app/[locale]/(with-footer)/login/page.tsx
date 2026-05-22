import { Metadata } from 'next';

import { LoginForm } from '@/components/auth/LoginForm';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your account',
};

function getSafeRedirectParam(value: string | string[] | undefined) {
  const redirect = Array.isArray(value) ? value[0] : value;

  if (!redirect?.startsWith('/') || redirect.startsWith('//') || redirect.includes('://')) {
    return undefined;
  }

  return redirect;
}

export default function LoginPage({
  searchParams,
}: {
  searchParams?: { redirect?: string | string[] };
}) {
  const redirectTo = getSafeRedirectParam(searchParams?.redirect);

  return (
    <div className="theme-page container flex min-h-[calc(100vh-200px)] items-center justify-center py-10">
      <LoginForm redirectTo={redirectTo} />
    </div>
  );
}
