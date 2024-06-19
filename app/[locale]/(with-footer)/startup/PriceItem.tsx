import { cn } from '@/lib/utils';

export default function PriceItem({ title, isFree }: { title: string; isFree: boolean }) {
  return (
    <div
      className={cn(
        'flex-center w-fit gap-1 rounded-[4px] border border-gray-800 px-[10px] py-[2px] text-sm text-gray-800',
        isFree && 'border-[#1f9a4a] text-[#1f9a4a]',
      )}
    >
      <div className={cn('size-2 rounded-full bg-[#686B84]', isFree && 'bg-[#2CB65C]')} />
      {title}
    </div>
  );
}
