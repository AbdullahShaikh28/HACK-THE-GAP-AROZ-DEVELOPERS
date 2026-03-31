"use client";

import * as React from "react";
import {
  locationCheckBadgeText,
  locationCheckDescription,
} from "@/lib/location-check-display";

export type PhotoLocationBodyProps = {
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracyM: number | null;
  locationCheckStatus: "pass" | "fail" | "unavailable" | null;
  distanceToTankM: number | null;
  aiIssueLabel?: string | null;
  /** Saved display_name from DB; skips reverse-geocode when set. */
  storedCaptureAddress?: string | null;
  /** When false, skip Nominatim request (e.g. panel unmounted). */
  fetchEnabled: boolean;
};

function mapsHref(lat: number, lon: number) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=18/${lat}/${lon}`;
}

export function PhotoLocationPanel({
  imageUrl,
  latitude,
  longitude,
  accuracyM,
  locationCheckStatus,
  distanceToTankM,
  aiIssueLabel,
  storedCaptureAddress,
  fetchEnabled,
}: PhotoLocationBodyProps) {
  const [address, setAddress] = React.useState<string | null>(null);
  const [addressLoading, setAddressLoading] = React.useState(false);
  const [addressError, setAddressError] = React.useState<string | null>(null);
  const [imageBroken, setImageBroken] = React.useState(false);

  React.useEffect(() => {
    setImageBroken(false);
  }, [imageUrl]);

  const lat = latitude;
  const lon = longitude;
  const hasCoords = lat != null && lon != null && Number.isFinite(lat) && Number.isFinite(lon);

  React.useEffect(() => {
    if (!fetchEnabled || !hasCoords || lat == null || lon == null) {
      setAddress(null);
      setAddressError(null);
      setAddressLoading(false);
      return;
    }

    const prefill = storedCaptureAddress?.trim();
    if (prefill) {
      setAddress(prefill);
      setAddressError(null);
      setAddressLoading(false);
      return;
    }

    let cancelled = false;
    setAddress(null);
    setAddressError(null);
    setAddressLoading(true);

    const q = new URLSearchParams({ lat: String(lat), lon: String(lon) });
    fetch(`/api/geocode/reverse?${q.toString()}`)
      .then(async (res) => {
        const data = (await res.json()) as { display_name?: string | null; error?: string };
        if (cancelled) return;
        if (!res.ok) {
          setAddressError(data.error || "Could not resolve address.");
          return;
        }
        setAddress(typeof data.display_name === "string" ? data.display_name : null);
      })
      .catch(() => {
        if (!cancelled) setAddressError("Could not resolve address.");
      })
      .finally(() => {
        if (!cancelled) setAddressLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchEnabled, hasCoords, lat, lon, storedCaptureAddress]);

  const reviewTone =
    locationCheckStatus === "fail"
      ? "border-rose-200 bg-rose-50/90 text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-50"
      : locationCheckStatus === "pass"
        ? "border-emerald-200 bg-emerald-50/80 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-50"
        : "border-border bg-muted/40 text-foreground";

  return (
    <div className="space-y-4">
      {imageUrl ? (
        <div className="space-y-2">
          <div className="overflow-hidden rounded-lg border border-border bg-muted">
            {!imageBroken ? (
              /* eslint-disable-next-line @next/next/no-img-element -- supabase public URLs vary per project */
              <img
                src={imageUrl}
                alt="Submission photo"
                className="max-h-[min(50vh,420px)] w-full bg-black/5 object-contain"
                referrerPolicy="no-referrer"
                onError={() => setImageBroken(true)}
              />
            ) : (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                Preview could not be loaded (blocked URL or private bucket). Use the link below.
              </p>
            )}
          </div>
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-block break-all text-sm font-medium text-primary underline underline-offset-2"
          >
            Open image URL in new tab
          </a>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No image for this row.</p>
      )}

      <div className="space-y-2 text-sm">
        <p className="font-medium text-foreground">Captured location</p>
        {!hasCoords ? (
          <p className="text-muted-foreground">
            No GPS coordinates were stored for this photo. (If the DB was updated after submission,
            older rows may lack latitude/longitude.)
          </p>
        ) : (
          <>
            {addressLoading ? (
              <p className="text-muted-foreground">Looking up address…</p>
            ) : address ? (
              <p className="leading-snug text-foreground">{address}</p>
            ) : addressError ? (
              <p className="text-muted-foreground">{addressError}</p>
            ) : null}
            <p className="text-xs tabular-nums text-muted-foreground">
              Coordinates: {lat!.toFixed(6)}, {lon!.toFixed(6)}
              {accuracyM != null ? ` · GPS accuracy ±${Math.round(accuracyM)} m` : ""}
            </p>
            <a
              href={mapsHref(lat!, lon!)}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm font-medium text-primary underline underline-offset-2"
            >
              Open on map
            </a>
            <p className="text-[11px] text-muted-foreground">
              Address from OpenStreetMap (Nominatim). Data © OpenStreetMap contributors.
            </p>
          </>
        )}
      </div>

      <div className={`rounded-lg border px-3 py-2 text-sm ${reviewTone}`}>
        <p className="font-semibold">
          {locationCheckBadgeText(locationCheckStatus, distanceToTankM)}
        </p>
        <p className="mt-1 text-sm opacity-90">
          {locationCheckDescription(locationCheckStatus, distanceToTankM)}
        </p>
        {aiIssueLabel?.trim() ? (
          <p className="mt-2 opacity-90">
            <span className="font-medium">AI suggestion:</span> {aiIssueLabel}
          </p>
        ) : null}
      </div>
    </div>
  );
}
