import { WebNavigationListRow } from '@/lib/data';

import WebNavCard from './WebNavCard';

export default function WebNavCardList({ dataList }: { dataList: WebNavigationListRow[] }) {
  return (
    <div className='grid grid-cols-2 gap-5 lg:grid-cols-3 lg:gap-7'>
      {dataList.map((item) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <WebNavCard key={item.id} {...item} />
      ))}
    </div>
  );
}
