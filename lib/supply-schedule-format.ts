/** Stable date+time strings for supply windows (India timezone for CEI). */

const TZ = "Asia/Kolkata";

export function formatSupplySchedule(startIso: string, durationMin: number) {
  const start = new Date(startIso);
  const end = new Date(start.getTime() + durationMin * 60_000);
  const fmt = new Intl.DateTimeFormat("en-IN", {
    timeZone: TZ,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const fmtTime = new Intl.DateTimeFormat("en-IN", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  });
  return {
    /** Full local date and time when supply starts. */
    startLabel: fmt.format(start),
    /** Clock time when supply ends (same calendar day unless crossing midnight). */
    endTimeLabel: fmtTime.format(end),
    durationMin,
  };
}
