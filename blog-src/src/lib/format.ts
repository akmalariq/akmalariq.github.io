const longDate = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

const shortDate = new Intl.DateTimeFormat("en", {
  year: "numeric",
  month: "short",
  day: "numeric",
});

export const formatDate = (d: Date) => longDate.format(d);
export const formatDateShort = (d: Date) => shortDate.format(d);
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

// Very rough reading time: 220 wpm over the raw body, floored at 1 minute.
export function readingTime(body = ""): string {
  const words = body.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 220));
  return `${minutes} min read`;
}
