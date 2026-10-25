import { redirect } from 'next/navigation';

export default function Page({ params: { locale } }: { params: { locale: string } }) {
  redirect(`/${locale}/guides/ai-tools-for-automation-comparison`);
}
