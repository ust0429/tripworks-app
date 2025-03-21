/**
 * date-fns モックファイル
 */

export const format = (date: Date, formatStr: string, options?: any): string => {
  const locale = options?.locale;
  const japaneseDay = locale?.code === 'ja' ? '（月）' : '';
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日${japaneseDay} ${date.getHours()}:${date.getMinutes()}`;
};

export const ja = {
  code: 'ja',
  formatLong: {
    date: () => 'yyyy年MM月dd日',
    time: () => 'HH:mm',
    dateTime: () => 'yyyy年MM月dd日 HH:mm'
  }
};
