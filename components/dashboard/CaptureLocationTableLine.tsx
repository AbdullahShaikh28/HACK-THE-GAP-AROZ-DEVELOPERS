"use client";

import { useEffect, useState } from "react";
import { fetchDisplayNameForCoords } from "@/lib/client-fetch-address";
import { formatCaptureCoordinates } from "@/lib/format-capture-coords";

type CaptureLocationTableLineProps = {
  captureAddress: string | null;
  photoLatitude: number | null;
  photoLongitude: number | null;
};

export function CaptureLocationTableLine({
  captureAddress,
  photoLatitude,
  photoLongitude,
}: CaptureLocationTableLineProps) {
  const stored = captureAddress?.trim() ?? "";
  const [resolved, setResolved] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasCoords =
    photoLatitude != null &&
    photoLongitude != null &&
    Number.isFinite(photoLatitude) &&
    Number.isFinite(photoLongitude);

  useEffect(() => {
    if (stored) {
      setResolved(null);
      return;
    }
    if (!hasCoords || photoLatitude == null || photoLongitude == null) {
      setResolved(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchDisplayNameForCoords(photoLatitude, photoLongitude)
      .then((name) => {
        if (!cancelled) setResolved(name);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [stored, hasCoords, photoLatitude, photoLongitude]);

  if (stored) {
    return (
      <span
        className="line-clamp-2 text-[11px] leading-snug text-foreground/90"
        title={stored}
      >
        {stored}
      </span>
    );
  }

  if (loading) {
    return (
      <span className="text-[11px] text-muted-foreground">Resolving address…</span>
    );
  }

  const line = resolved?.trim() ?? "";
  if (line) {
    return (
      <span className="line-clamp-2 text-[11px] leading-snug text-foreground/90" title={line}>
        {line}
      </span>
    );
  }

  return (
    <span
      className="break-all font-mono text-[11px] text-foreground/90"
      title="Captured latitude, longitude (WGS84)"
    >
      {formatCaptureCoordinates(photoLatitude, photoLongitude)}
    </span>
  );
}
