import { cn } from '@/lib/utils';

export default function PriceItem({ title, isFree }: { title: string; isFree: boolean }) {
  return (
    <div
      className={cn(
        'flex-center w-fit gap-1 rounded-[4px] border border-slate-300 px-[10px] py-[2px] text-sm text-slate-700',
        isFree && 'border-emerald-600 text-emerald-700',
      )}
    >
      <div className={cn('size-2 rounded-full bg-slate-400', isFree && 'bg-emerald-600')} />
      {title}
    </div>
  );
}
