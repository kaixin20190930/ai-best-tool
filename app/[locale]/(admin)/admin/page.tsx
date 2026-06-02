import { redirect } from 'next/navigation';

export default function LocaleAdminRootPage({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}/admin/dashboard`);
}
