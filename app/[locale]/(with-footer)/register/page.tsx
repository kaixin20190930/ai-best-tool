import { Metadata } from 'next';

import { getNoindexMetadata } from '@/lib/seo/indexing';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create a new account',
  ...getNoindexMetadata(),
};

export default function RegisterPage() {
  return (
    <div className='theme-page container flex min-h-[calc(100vh-200px)] items-center justify-center py-10'>
      <RegisterForm />
    </div>
  );
}
