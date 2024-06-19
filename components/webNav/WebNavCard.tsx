import Link from 'next/link';
import { Heart } from 'lucide-react';

import { WebNavigationListRow } from '@/lib/data';

import BaseImage from '../image/BaseImage';

export default function WebNavCard({ name, thumbnailUrl, title, url, content }: WebNavigationListRow) {
  return (
    <div className='flex flex-col gap-5 rounded-[12px] border-2 border-blue-900 bg-[#60a5fa] p-3 shadow-md shadow-blue-800 hover:opacity-70 lg:p-5'>
      <Link href={`/ai/${name}`} title={title}>
        <BaseImage
          width={350}
          height={220}
          src={thumbnailUrl || ''}
          alt={title}
          title={title}
          className='aspect-[350/220] w-full justify-self-center rounded-[8px] bg-white/40 hover:opacity-70'
        />
      </Link>
      <div className='flex items-center justify-between'>
        <a href={url} title={title} target='_blank' rel='noreferrer' className='hover:opacity-70'>
          <h3 className='line-clamp-1 flex-1 text-lg font-bold text-gray-950 lg:text-xl'>{title}</h3>
        </a>
        <a href={url} title={title} target='_blank' rel='noreferrer' className='hover:opacity-70'>
          <Heart className='size-7' stroke='#374151' />
          <span className='sr-only'>{title}</span>
        </a>
      </div>
      <div className='flex items-center justify-between'>
        <p className='line-clamp-5 text-sm text-gray-700 lg:text-base'>{content}</p>
      </div>
    </div>
  );
}
