export default function TagItem({ title }: { title: string }) {
  return (
    <div className='w-fit rounded-[4px] border border-slate-300 bg-slate-50 px-1 text-center text-[10px] text-slate-700'>
      {title}
    </div>
  );
}
