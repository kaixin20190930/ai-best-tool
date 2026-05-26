import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ShieldCheck, Mail, Globe, KeyRound, ExternalLink } from 'lucide-react';

const runtimeFields = [
  {
    label: 'Site URL',
    value: process.env.NEXT_PUBLIC_SITE_URL || 'Not configured',
    icon: Globe,
  },
  {
    label: 'Admin emails',
    value: process.env.ADMIN_EMAILS || 'Not configured',
    icon: Mail,
  },
  {
    label: 'OAuth providers',
    value: 'Google, GitHub',
    icon: KeyRound,
  },
  {
    label: 'Admin access',
    value: 'Protected by middleware + Supabase role/email checks',
    icon: ShieldCheck,
  },
];

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'admin' });

  return {
    title: `${t('title')} - Settings`,
  };
}

export default async function AdminSettingsPage({
  params,
}: {
  params: { locale: string };
}) {
  const isChinese = params.locale === 'cn' || params.locale === 'tw';

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {isChinese ? '站点设置' : 'Settings'}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {isChinese
              ? '这里先放运行时配置和关键入口，后续你真有需要时再扩成完整的站点设置中心。'
              : 'This page shows the runtime settings and key operational links for now. We can expand it into a fuller settings hub later when there is a clear need.'}
          </p>
        </div>
        <Link
          href="https://supabase.com/dashboard"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-800"
        >
          {isChinese ? '打开 Supabase 控制台' : 'Open Supabase dashboard'}
          <ExternalLink className="size-4" />
        </Link>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {runtimeFields.map((field) => (
          <div
            key={field.label}
            className="theme-surface rounded-lg border border-slate-200 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-600">{field.label}</p>
                <p className="mt-2 break-words text-sm leading-6 text-slate-900">
                  {field.value}
                </p>
              </div>
              <div className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
                <field.icon className="size-5" />
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="theme-surface mt-6 rounded-lg border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          {isChinese ? '建议继续配置的内容' : 'What to configure next'}
        </h2>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
          <li>
            {isChinese
              ? '在 Supabase Dashboard 里确认 Google / GitHub OAuth provider 和 redirect URL。'
              : 'Confirm the Google / GitHub OAuth providers and redirect URLs in Supabase Dashboard.'}
          </li>
          <li>
            {isChinese
              ? '把 ADMIN_EMAILS 里的邮箱和你实际希望的管理员身份对齐。'
              : 'Keep ADMIN_EMAILS aligned with the accounts that should have admin access.'}
          </li>
          <li>
            {isChinese
              ? '如果后面要做更细的权限控制，再把角色字段写入 Supabase auth metadata。'
              : 'If you need finer-grained access control later, store roles in Supabase auth metadata.'}
          </li>
        </ul>
      </section>
    </div>
  );
}
