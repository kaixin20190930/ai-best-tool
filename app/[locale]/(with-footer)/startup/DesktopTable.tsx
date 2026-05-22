import { SquareArrowOutUpRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { STARTUP_LIST } from '@/lib/constants';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import PriceItem from './PriceItem';
import TagItem from './TagItem';

export default function DesktopTable() {
  const t = useTranslations('Startup.table');

  return (
    <div className='mb-10 hidden w-full lg:block'>
      <Table className='border-separate border-spacing-y-2'>
        <TableHeader>
          <TableRow className='tr-rounded h-16 rounded-[4px] bg-slate-900 hover:bg-slate-900'>
            <TableHead className='w-[100px] text-2xl font-bold text-slate-100'>{t('da')}</TableHead>
            <TableHead className='w-[200px] text-2xl font-bold text-slate-100'>{t('website')}</TableHead>
            <TableHead className='w-[200px] text-2xl font-bold text-slate-100'>{t('tags')}</TableHead>
            <TableHead className='w-[200px] text-2xl font-bold text-slate-100'>{t('price')}</TableHead>
            <TableHead className='w-16 text-2xl font-bold text-slate-100'>{t('submission')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='space-y-3'>
          {STARTUP_LIST.map((item) => (
            <TableRow key={item.DA} className='tr-rounded h-16 rounded-[4px] bg-white hover:bg-slate-50'>
              <TableCell className='text-sm text-slate-700'>{item.DA}</TableCell>
              <TableCell className='text-[18px] text-slate-800'>{item.Website}</TableCell>
              <TableCell className='flex gap-1'>
                {item.Tag ? item.Tag.split(',').map((tag) => <TagItem key={tag} title={tag} />) : null}
              </TableCell>
              <TableCell>
                <PriceItem title={item.Price} isFree={item.Price.toLowerCase() === 'free'} />
              </TableCell>
              <TableCell>
                <a
                  href={item.URL}
                  target='_blank'
                  rel='noreferrer'
                  className='flex-center h-10 w-full rounded-[4px] border border-slate-300 hover:bg-slate-100'
                >
                  <SquareArrowOutUpRight className='text-slate-600' />
                  <span className='sr-only'>{item.Website}</span>
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
