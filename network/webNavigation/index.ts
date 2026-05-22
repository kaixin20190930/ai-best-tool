import { dataList, detailList, WebNavigationDetailData, WebNavigationListRow } from '@/lib/data';
import { toolToDetailData, toolToListRow } from '@/lib/services/toolPresenter';
import { getToolByName, getTools } from '@/lib/services/tools';

/* eslint-disable @typescript-eslint/indent */
export type ResponseBase<T> = {
  code: number;
  msg: string;
} & T;

export type ResponseRows<T = any> = ResponseBase<{
  total: number;
  rows: T;
}>;

export type ResponseData<T = any> = ResponseBase<{
  data: T | null;
}>;

export type WebNavigationListRequest = {
  content?: string;
  locale?: string;
  name?: string;
  pageNum: number;
  pageSize: number;
  title?: string;
};

function getStaticList(pageNum: number, pageSize: number): WebNavigationListRow[] {
  const start = Math.max(pageNum - 1, 0) * pageSize;
  return dataList.slice(start, start + pageSize);
}

export async function getWebNavigationList({ locale = 'en', pageNum, pageSize }: WebNavigationListRequest) {
  try {
    const result = await getTools({ status: 'published' }, { page: pageNum, pageSize }, 'popular');

    if (result.data.length > 0) {
      return {
        code: 200,
        msg: 'success',
        rows: result.data.map((tool) => toolToListRow(tool, locale)),
        total: result.total,
      } satisfies ResponseRows<WebNavigationListRow[]>;
    }
  } catch (error) {
    console.error('Failed to load tools from database, falling back to static data:', error);
  }

  const rows = getStaticList(pageNum, pageSize);
  const res = { code: 200, msg: 'success', rows, total: dataList.length } satisfies ResponseRows<WebNavigationListRow[]>;

  return res;
}

export async function getWebNavigationDetail(name: string, locale = 'en') {
  try {
    const tool = await getToolByName(name);

    if (tool && tool.status === 'published') {
      return {
        code: 200,
        msg: 'success',
        data: toolToDetailData(tool, locale),
      } satisfies ResponseData<WebNavigationDetailData>;
    }
  } catch (error) {
    console.error('Failed to load tool detail from database, falling back to static data:', error);
  }

  const res = {
    code: 200,
    msg: 'success',
    data: (detailList.find((item) => item.name === name) || null) as WebNavigationDetailData | null,
  } satisfies ResponseData<WebNavigationDetailData>;

  return res;
}
