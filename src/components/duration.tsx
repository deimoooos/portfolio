const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Split an ISO `YYYY-MM` by hand rather than through `new Date()`.
 * `new Date("2023-06")` parses as UTC midnight, so anywhere west of Greenwich
 * it reads back as May — a silent off-by-one month.
 */
function parse(iso: string) {
  const [year, month] = iso.split("-").map(Number);
  return { year, month };
}

function formatMonth(iso: string) {
  const { year, month } = parse(iso);
  return `${MONTHS[month - 1]} ${year}`;
}

/** Whole months from `start` to `end`, counting both endpoints. */
function monthsBetween(start: string, end: string) {
  const a = parse(start);
  const b = parse(end);
  return (b.year - a.year) * 12 + (b.month - a.month) + 1;
}

function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** "1 year and 8 months". Drops a zero part; never returns "0 months". */
export function formatDuration(months: number) {
  const total = Math.max(1, months);
  const years = Math.floor(total / 12);
  const rest = total % 12;

  const parts = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? "" : "s"}`);
  if (rest > 0) parts.push(`${rest} month${rest === 1 ? "" : "s"}`);
  return parts.join(" and ");
}

/**
 * Just the year a span began, e.g. "2025".
 *
 * `dateTime` keeps the full `YYYY-MM`, so the month survives in the markup even
 * though only the year is on screen.
 */
export function StartYear({ start }: { start: string }) {
  return <time dateTime={start}>{parse(start).year}</time>;
}

/** "June 2023 — Present". Em dash, matching the rest of the copy. */
export function DateRange({ start, end }: { start: string; end: string | null }) {
  return (
    <span>
      <time dateTime={start}>{formatMonth(start)}</time>
      {" — "}
      {end ? <time dateTime={end}>{formatMonth(end)}</time> : "Present"}
    </span>
  );
}

/**
 * How long a span lasted, e.g. "1 year and 8 months".
 *
 * `<time>` cannot carry a duration — HTML's duration format has no year or
 * month component, since neither is a fixed length — so whichever dates are
 * not rendered beside this are kept in an `sr-only` `<time>` instead. That
 * keeps the actual period available to assistive tech and to anything parsing
 * the page, without announcing a date that is already on screen twice.
 *
 * `end: null` means the role is current and the span runs to today. That is
 * evaluated when the page renders, which is why both routes set `revalidate`.
 */
export function Duration({
  start,
  end,
  shown = "none",
}: {
  start: string;
  end: string | null;
  /** Which dates are already visible next to this. */
  shown?: "none" | "start" | "range";
}) {
  return (
    <>
      {shown !== "range" && (
        <span className="sr-only">
          {shown === "none" && (
            <>
              <time dateTime={start}>{formatMonth(start)}</time>{" "}
            </>
          )}
          {"to "}
          {end ? <time dateTime={end}>{formatMonth(end)}</time> : "present"}
          {". "}
        </span>
      )}
      {formatDuration(monthsBetween(start, end ?? currentMonth()))}
    </>
  );
}
