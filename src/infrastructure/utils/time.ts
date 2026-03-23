/**
 * 时间格式化工具函数
 *
 * 将日期格式化为友好的相对时间
 */

/**
 * 格式化时间为相对时间字符串
 * @param date - 要格式化的日期
 * @returns 格式化后的字符串
 */
export function formatTime(date: Date | string | number): string {
  const targetDate = new Date(date);
  const now = new Date();
  const diff = now.getTime() - targetDate.getTime();

  // 小于 1 分钟
  if (diff < 60 * 1000) {
    return '刚刚';
  }

  // 小于 1 小时
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}分钟前`;
  }

  // 小于 24 小时
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}小时前`;
  }

  // 昨天
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (isSameDay(targetDate, yesterday)) {
    return '昨天';
  }

  // 超过 1 天，返回日期
  return formatDate(targetDate);
}

/**
 * 判断两个日期是否是同一天
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * 格式化为日期字符串 YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 格式化为完整时间字符串 YYYY-MM-DD HH:mm:ss
 */
export function formatDateTime(date: Date | string | number): string {
  const targetDate = new Date(date);
  const dateStr = formatDate(targetDate);
  const hours = String(targetDate.getHours()).padStart(2, '0');
  const minutes = String(targetDate.getMinutes()).padStart(2, '0');
  const seconds = String(targetDate.getSeconds()).padStart(2, '0');
  return `${dateStr} ${hours}:${minutes}:${seconds}`;
}
