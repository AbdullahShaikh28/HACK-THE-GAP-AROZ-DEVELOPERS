"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import type { ValveSchedulingInsights, ZoneValveSuggestion } from "@/services/cei-insights";
import { formatSupplySchedule } from "@/lib/supply-schedule-format";
import { computeZoneNextSupplyStart, extractHHmmIST } from "@/lib/zone-supply-rotation";

type Props = {
  data: ValveSchedulingInsights;
};

const LS_MAIN = "htg-valve-manual-main";
const LS_ZONES = "htg-valve-manual-zones";

type ManualMainStored = { commenceIso: string; durationMin: number };
type ManualZoneStored = { durationMin?: number; commenceIso?: string };

function parseDatetimeLocal(s: string) {
  if (!s || !s.includes("T")) return null;
  const [date, time] = s.split("T");
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  if ([y, mo, d, h, mi].some((n) => Number.isNaN(n))) return null;
  return new Date(y, mo - 1, d, h, mi, 0, 0);
}

function toDatetimeLocalValue(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function stressBadgeClass(level: ZoneValveSuggestion["stressLevel"]) {
  if (level === "high") return "bg-red-100 text-red-800 border-red-200";
  if (level === "medium") return "bg-amber-100 text-amber-900 border-amber-200";
  return "bg-emerald-50 text-emerald-900 border-emerald-200";
}

function loadMain(tankId: number): ManualMainStored | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${LS_MAIN}-${tankId}`);
    if (!raw) return null;
    const p = JSON.parse(raw) as ManualMainStored;
    if (!p.commenceIso || typeof p.durationMin !== "number") return null;
    return p;
  } catch {
    return null;
  }
}

function saveMain(tankId: number, v: ManualMainStored | null) {
  if (typeof window === "undefined") return;
  if (!v) localStorage.removeItem(`${LS_MAIN}-${tankId}`);
  else localStorage.setItem(`${LS_MAIN}-${tankId}`, JSON.stringify(v));
}

function loadZones(tankId: number): Record<number, ManualZoneStored> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(`${LS_ZONES}-${tankId}`);
    if (!raw) return {};
    return JSON.parse(raw) as Record<number, ManualZoneStored>;
  } catch {
    return {};
  }
}

function saveZones(tankId: number, z: Record<number, ManualZoneStored>) {
  if (typeof window === "undefined") return;
  const keys = Object.keys(z).filter((k) => z[Number(k)]?.durationMin != null || z[Number(k)]?.commenceIso);
  if (keys.length === 0) localStorage.removeItem(`${LS_ZONES}-${tankId}`);
  else localStorage.setItem(`${LS_ZONES}-${tankId}`, JSON.stringify(z));
}

export function ValveControlPanel({ data }: Props) {
  const {
    baseInsight,
    zones,
    surveyWindowDays,
    tankName,
    ward,
    tankId,
    rotationExplainer,
    dailySupplyTimeHHmm,
  } = data;
  const [confirmed, setConfirmed] = React.useState<Record<number, boolean>>({});

  const [useManualMain, setUseManualMain] = React.useState(false);
  const [manualMain, setManualMain] = React.useState<ManualMainStored | null>(null);
  const [mainCommenceInput, setMainCommenceInput] = React.useState("");
  const [mainDurationInput, setMainDurationInput] = React.useState(String(baseInsight?.recommendedDurationMinutes ?? 45));

  const [zoneManual, setZoneManual] = React.useState<Record<number, ManualZoneStored>>({});

  React.useEffect(() => {
    const m = loadMain(tankId);
    setManualMain(m);
    setUseManualMain(!!m);
    if (m?.commenceIso) {
      setMainCommenceInput(toDatetimeLocalValue(new Date(m.commenceIso)));
    } else if (baseInsight) {
      setMainCommenceInput(toDatetimeLocalValue(new Date(baseInsight.scheduledOpenAt)));
    }
    setMainDurationInput(String(m?.durationMin ?? baseInsight?.recommendedDurationMinutes ?? 45));
    setZoneManual(loadZones(tankId));
  }, [tankId, baseInsight]);

  const effectiveMainStartIso = React.useMemo(() => {
    if (useManualMain && manualMain) return manualMain.commenceIso;
    return baseInsight?.scheduledOpenAt ?? "";
  }, [useManualMain, manualMain, baseInsight]);

  const effectiveMainDuration = React.useMemo(() => {
    if (useManualMain && manualMain) return manualMain.durationMin;
    return baseInsight?.recommendedDurationMinutes ?? 45;
  }, [useManualMain, manualMain, baseInsight]);

  const mainSchedule =
    effectiveMainStartIso.length > 0
      ? formatSupplySchedule(effectiveMainStartIso, effectiveMainDuration)
      : null;

  const aiInsightSchedule = baseInsight
    ? formatSupplySchedule(baseInsight.scheduledOpenAt, baseInsight.recommendedDurationMinutes)
    : null;

  function applyManualMain() {
    const d = parseDatetimeLocal(mainCommenceInput);
    const dur = Math.min(240, Math.max(5, Number(mainDurationInput) || 45));
    if (!d) return;
    const stored: ManualMainStored = { commenceIso: d.toISOString(), durationMin: dur };
    setManualMain(stored);
    saveMain(tankId, stored);
    setUseManualMain(true);
  }

  function clearManualMain() {
    setManualMain(null);
    saveMain(tankId, null);
    setUseManualMain(false);
    if (baseInsight) {
      setMainCommenceInput(toDatetimeLocalValue(new Date(baseInsight.scheduledOpenAt)));
      setMainDurationInput(String(baseInsight.recommendedDurationMinutes));
    }
  }

  function updateZoneManual(zone: number, patch: Partial<ManualZoneStored>) {
    setZoneManual((prev) => {
      const merged: ManualZoneStored = { ...prev[zone], ...patch };
      const next = { ...prev };
      if (merged.durationMin == null && merged.commenceIso == null) {
        delete next[zone];
      } else {
        next[zone] = merged;
      }
      saveZones(tankId, next);
      return next;
    });
  }

  function clearZoneManual(zone: number) {
    setZoneManual((prev) => {
      const next = { ...prev };
      delete next[zone];
      saveZones(tankId, next);
      return next;
    });
  }

  function toggleZone(zone: number) {
    setConfirmed((prev) => ({ ...prev, [zone]: !prev[zone] }));
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-background to-secondary/30">
        <h2 className="text-lg font-semibold text-foreground">Zone rotation (Mon–Fri)</h2>
        <p className="mt-1 text-sm text-muted">{rotationExplainer}</p>
        <p className="mt-3 text-sm text-foreground">
          <span className="font-semibold">{tankName}</span>
          <span className="text-muted"> — {ward}</span>
        </p>
        <p className="mt-2 text-sm">
          Default valve time (IST):{" "}
          <span className="font-semibold">
            {useManualMain && manualMain
              ? extractHHmmIST(manualMain.commenceIso)
              : dailySupplyTimeHHmm}
          </span>
          . The same clock time is used on each zone&apos;s day — zones are not all on the same calendar day.
        </p>
        {useManualMain && manualMain && mainSchedule ? (
          <div className="mt-4 rounded-xl border border-border bg-background/80 p-4 text-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Manual override</p>
            <p className="mt-1 text-foreground">
              Window: <span className="font-semibold">{mainSchedule.startLabel}</span>
            </p>
            <p className="mt-1 text-muted">
              {mainSchedule.durationMin} min · ends {mainSchedule.endTimeLabel}
            </p>
          </div>
        ) : null}
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs font-semibold text-foreground">Survey-backed zones (this window)</p>
          <ul className="mt-2 space-y-1.5 text-sm">
            {zones.map((z) => (
              <li key={z.zone} className="flex flex-wrap justify-between gap-2 text-muted">
                <span className="text-foreground">
                  <span className="font-medium">{z.zoneLabel}</span>
                  <span className="text-muted"> — {z.rotationWeekdayLabel}</span>
                </span>
                <span>
                  {z.surveySubmissions} survey{z.surveySubmissions === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-foreground">Manual distribution schedule</h2>
        <p className="mt-1 text-sm text-muted">
          Override AI timing for the main valve window. Zone cards below can still add per-zone
          duration or start times.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="main-mode"
              checked={!useManualMain}
              onChange={() => {
                setUseManualMain(false);
              }}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-foreground">Use AI-recommended commence time</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="radio"
              name="main-mode"
              checked={useManualMain}
              onChange={() => {
                setUseManualMain(true);
                if (!manualMain && baseInsight) {
                  const d = parseDatetimeLocal(mainCommenceInput) ?? new Date(baseInsight.scheduledOpenAt);
                  const dur = Math.min(240, Math.max(5, Number(mainDurationInput) || 45));
                  const stored = { commenceIso: d.toISOString(), durationMin: dur };
                  setManualMain(stored);
                  saveMain(tankId, stored);
                }
              }}
              className="h-4 w-4 accent-primary"
            />
            <span className="text-foreground">Use manual commence &amp; duration</span>
          </label>
        </div>

        <div
          className={`mt-4 grid gap-3 rounded-lg border border-border bg-background/60 p-4 md:grid-cols-[1fr_140px_auto] md:items-end ${!useManualMain ? "opacity-60" : ""}`}
        >
          <div className="space-y-1">
            <label htmlFor="manual-commence" className="text-xs font-medium text-foreground">
              Distribution commences (local)
            </label>
            <input
              id="manual-commence"
              type="datetime-local"
              value={mainCommenceInput}
              disabled={!useManualMain}
              onChange={(e) => setMainCommenceInput(e.target.value)}
              className="h-10 w-full max-w-md rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none disabled:cursor-not-allowed"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="manual-dur" className="text-xs font-medium text-foreground">
              Duration (min)
            </label>
            <input
              id="manual-dur"
              type="number"
              min={5}
              max={240}
              disabled={!useManualMain}
              value={mainDurationInput}
              onChange={(e) => setMainDurationInput(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none disabled:cursor-not-allowed"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={!useManualMain}
              onClick={applyManualMain}
              className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
            >
              Save manual window
            </button>
            <button
              type="button"
              onClick={clearManualMain}
              className="h-10 rounded-lg border border-border bg-background px-4 text-sm font-medium text-foreground transition hover:bg-accent"
            >
              Clear manual
            </button>
          </div>
        </div>
      </Card>

      <Card className="border-secondary/80 bg-gradient-to-br from-secondary/40 to-background">
        <h2 className="text-lg font-semibold text-foreground">AI valve window (tank)</h2>
        <p className="mt-1 text-sm text-muted">
          Baseline from complaints &amp; utilization — overridden above when manual schedule is on.
        </p>
        {baseInsight && aiInsightSchedule ? (
          <div className="mt-4 space-y-2 rounded-lg border border-border bg-background/80 p-4 text-sm">
            <p className="text-foreground">
              <span className="font-semibold">{baseInsight.tankName}</span>
              <span className="text-muted"> — {ward}</span>
            </p>
            <p className="text-foreground">
              AI suggests opening <span className="font-semibold">main distribution</span> at{" "}
              <span className="font-semibold">{aiInsightSchedule.startLabel}</span> for{" "}
              <span className="font-semibold">{baseInsight.recommendedDurationMinutes} minutes</span>{" "}
              (supply ends at <span className="font-semibold">{aiInsightSchedule.endTimeLabel}</span>).
            </p>
            <p className="text-sm text-muted">
              Zones rotate by weekday (Zone 1 Monday … Zone 5 Friday); per-zone cards below use survey
              aggregates and that rotation — not one single day for everyone.
            </p>
            <p className="text-muted">{baseInsight.reasoningSummary}</p>
            {baseInsight.riskFlags.length > 0 ? (
              <ul className="list-inside list-disc text-xs text-muted">
                {baseInsight.riskFlags.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">No baseline insight available.</p>
        )}
      </Card>

      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-foreground">Per-zone valve cards</h2>
        <p className="text-sm text-muted">
          Durations and stress use <span className="font-medium text-foreground">field_surveys</span> in
          the lookback window (tank 23 dummy seed is ~550 rows rotating zones 1–5). Next supply uses
          Mon–Fri rotation at the default time unless you override a zone below.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {zones.map((z) => {
          const zm = zoneManual[z.zone];
          const aiDur = z.recommendedMinutes;
          const manualDur = zm?.durationMin;
          const effectiveDur = manualDur ?? aiDur;
          const zoneStartIso = zm?.commenceIso
            ? zm.commenceIso
            : useManualMain && manualMain
              ? computeZoneNextSupplyStart(
                  z.zone,
                  extractHHmmIST(manualMain.commenceIso),
                  new Date(),
                ).startIso
              : z.nextSupplyStartIso;
          const zoneSchedule =
            zoneStartIso.length > 0 ? formatSupplySchedule(zoneStartIso, effectiveDur) : null;
          const hasZoneManual = zm?.durationMin != null || zm?.commenceIso != null;

          return (
            <Card
              key={z.zone}
              className={
                z.stressLevel === "high"
                  ? "border-red-200/80 shadow-sm"
                  : z.stressLevel === "medium"
                    ? "border-amber-200/60"
                    : undefined
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">{z.valveLabel}</p>
                  <p className="mt-1 text-lg font-semibold text-foreground">{z.zoneLabel}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${stressBadgeClass(z.stressLevel)}`}
                >
                  {z.stressLevel === "high"
                    ? "High stress"
                    : z.stressLevel === "medium"
                      ? "Watch"
                      : "Stable"}
                </span>
              </div>

              {zoneSchedule ? (
                <div className="mt-3 rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs">
                  <p className="font-medium text-foreground">Scheduled supply</p>
                  <p className="mt-1 text-muted">
                    Starts <span className="font-semibold text-foreground">{zoneSchedule.startLabel}</span>
                    {" · "}
                    {effectiveDur} min
                    {" · "}
                    Ends <span className="font-semibold text-foreground">{zoneSchedule.endTimeLabel}</span>
                    <span className="text-muted">
                      {" "}
                      (
                      {zm?.commenceIso
                        ? "custom zone start"
                        : hasZoneManual
                          ? "manual duration"
                          : useManualMain && manualMain
                            ? "rotation + manual time"
                            : "Mon–Fri rotation + AI time"}
                      )
                    </span>
                  </p>
                </div>
              ) : null}

              <dl className="mt-4 grid gap-2 text-sm">
                <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
                  <dt className="text-muted">Rotation day</dt>
                  <dd className="font-medium text-foreground">{z.rotationWeekdayLabel}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
                  <dt className="text-muted">AI suggested duration</dt>
                  <dd className="font-semibold text-foreground">{aiDur} min</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
                  <dt className="text-muted">Effective duration</dt>
                  <dd className="font-semibold text-foreground">{effectiveDur} min</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
                  <dt className="text-muted">Survey samples (window)</dt>
                  <dd className="font-medium text-foreground">{z.surveySubmissions}</dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border/60 pb-2">
                  <dt className="text-muted">Low pressure in zone</dt>
                  <dd className="font-medium text-foreground">{z.lowPressurePct.toFixed(1)}%</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted">Avg duration (surveys)</dt>
                  <dd className="font-medium text-foreground">
                    {z.surveySubmissions > 0 ? `${z.avgDurationMinutes.toFixed(1)} min` : "—"}
                  </dd>
                </div>
              </dl>

              <p className="mt-4 text-xs leading-relaxed text-muted">{z.rationale}</p>

              <div className="mt-4 space-y-3 rounded-lg border border-border bg-background/60 p-3">
                <p className="text-xs font-semibold text-foreground">Manual valve plan (this zone)</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs text-muted" htmlFor={`zd-${z.zone}`}>
                      Override duration (min)
                    </label>
                    <input
                      id={`zd-${z.zone}`}
                      type="number"
                      min={5}
                      max={240}
                      placeholder={`Default ${aiDur}`}
                      value={zm?.durationMin ?? ""}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") updateZoneManual(z.zone, { durationMin: undefined });
                        else updateZoneManual(z.zone, { durationMin: Number(v) });
                      }}
                      className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted" htmlFor={`zt-${z.zone}`}>
                      Zone commences (optional)
                    </label>
                    <input
                      id={`zt-${z.zone}`}
                      type="datetime-local"
                      value={
                        zm?.commenceIso
                          ? toDatetimeLocalValue(new Date(zm.commenceIso))
                          : ""
                      }
                      onChange={(e) => {
                        const v = e.target.value;
                        if (!v) {
                          updateZoneManual(z.zone, { commenceIso: undefined });
                          return;
                        }
                        const d = parseDatetimeLocal(v);
                        if (d) updateZoneManual(z.zone, { commenceIso: d.toISOString() });
                      }}
                      className="h-9 w-full rounded-md border border-border bg-background px-2 text-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => clearZoneManual(z.zone)}
                    className="text-xs font-medium text-muted underline hover:text-foreground"
                  >
                    Clear zone overrides
                  </button>
                </div>
              </div>

              <div className="mt-4 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => toggleZone(z.zone)}
                  className={
                    confirmed[z.zone]
                      ? "h-10 w-full rounded-lg border border-emerald-300 bg-emerald-50 text-sm font-medium text-emerald-900 transition hover:bg-emerald-100"
                      : "h-10 w-full rounded-lg bg-primary text-sm font-medium text-primary-foreground transition hover:opacity-90"
                  }
                >
                  {confirmed[z.zone]
                    ? "Marked as scheduled — tap to undo"
                    : `Confirm valve plan for ${z.zoneLabel}`}
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted">
        Manual plans are saved in this browser only and do not operate physical valves — use SCADA /
        field process to open valves. Survey context: last {surveyWindowDays} days for{" "}
        <span className="font-medium">{tankName}</span>.
      </p>
    </div>
  );
}
