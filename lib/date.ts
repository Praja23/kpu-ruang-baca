// lib/date.ts

export function getNowWIB(): Date {
  const now = new Date();
  // UTC+7
  return new Date(now.getTime() + 7 * 60 * 60 * 1000);
}

export function formatWIB(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
