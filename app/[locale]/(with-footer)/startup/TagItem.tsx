export default function TagItem({ title }: { title: string }) {
  return (
    <div className='w-fit rounded-[4px] border border-gray-800 px-1 text-center text-[10px] text-gray-800'>{title}</div>
  );
}
