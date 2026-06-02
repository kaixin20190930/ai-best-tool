import { redirect } from 'next/navigation';

export default function DeveloperListingRedirect({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}/pricing`);
}
