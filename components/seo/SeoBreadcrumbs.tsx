import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { BASE_URL } from '@/lib/env';
import { generateLocalizedCanonicalUrl, generateLocalizedPath } from '@/lib/seo/metadata';
import { generateBreadcrumbSchema } from '@/lib/seo/schema';
import { cn } from '@/lib/utils';

import { StructuredDataServer } from './StructuredData';

export interface SeoBreadcrumbItem {
  name: string;
  path: string;
}

export interface SeoBreadcrumbsProps {
  items: SeoBreadcrumbItem[];
  locale: string;
  className?: string;
}

export default function SeoBreadcrumbs({ items, locale, className }: SeoBreadcrumbsProps) {
  if (items.length < 2) return null;

  const schemaItems = items.map((item) => ({
    name: item.name,
    url: generateLocalizedCanonicalUrl(item.path, locale, BASE_URL),
  }));

  return (
    <>
      <StructuredDataServer data={generateBreadcrumbSchema(schemaItems)} />
      <nav
        aria-label='Breadcrumb'
        className={cn('overflow-x-auto pb-1 text-sm text-slate-500', className)}
        data-seo-breadcrumbs
      >
        <ol className='flex min-w-max items-center gap-1.5'>
          {items.map((item, index) => {
            const isCurrent = index === items.length - 1;

            return (
              <li key={`${item.path}:${item.name}`} className='flex items-center gap-1.5'>
                {index > 0 ? <ChevronRight aria-hidden='true' className='size-3.5 shrink-0 text-slate-300' /> : null}
                {isCurrent ? (
                  <span aria-current='page' className='max-w-[18rem] truncate font-medium text-slate-700'>
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={generateLocalizedPath(item.path, locale)}
                    className='rounded-sm hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500'
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
