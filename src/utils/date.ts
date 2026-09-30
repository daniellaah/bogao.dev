// Content dates are calendar dates: format them in UTC so a post dated
// 2026-03-07 reads "7 Mar 2026" whatever the build machine's time zone.
const DATE_PARTS = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "7 Mar 2026" */
export const formatDate = (date: Date) => {
  const parts = Object.fromEntries(
    DATE_PARTS.formatToParts(date).map(({ type, value }) => [type, value])
  );
  return `${parts.day} ${parts.month} ${parts.year}`;
};

export const getYear = (date: Date) => String(date.getUTCFullYear());

export const isSameDay = (a: Date, b: Date) =>
  a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
