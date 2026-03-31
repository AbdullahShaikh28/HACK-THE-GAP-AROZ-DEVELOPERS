"use client";

import { useCallback, useId, useRef } from "react";
import exifr from "exifr";
import type { PhotoCaptureValue } from "@/lib/photo-capture-types";

export type PhotoCaptureInputProps = {
  id?: string;
  label: string;
  required?: boolean;
  value: PhotoCaptureValue | null;
  onChange: (value: PhotoCaptureValue | null) => void;
  /** Hint shown under the controls */
  hint?: string;
};

async function readExifGps(file: File): Promise<{ lat: number; lon: number } | null> {
  try {
    const tags = await exifr.parse(file, { gps: true });
    if (tags == null) return null;
    const lat = (tags as { latitude?: number }).latitude;
    const lon = (tags as { longitude?: number }).longitude;
    if (typeof lat === "number" && typeof lon === "number" && Number.isFinite(lat) && Number.isFinite(lon)) {
      return { lat, lon };
    }
    return null;
  } catch {
    return null;
  }
}

function readGpsFromBrowser(): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
} | null> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
      },
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 14_000, maximumAge: 0 },
    );
  });
}

export function PhotoCaptureInput({
  id: propId,
  label,
  required,
  value,
  onChange,
  hint,
}: PhotoCaptureInputProps) {
  const reactId = useId();
  const baseId = propId ?? reactId;
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File | null) => {
      if (!file || !file.type.startsWith("image/")) {
        onChange(null);
        return;
      }

      const previewUrl = URL.createObjectURL(file);

      let latitude: number | null = null;
      let longitude: number | null = null;
      let accuracyM: number | null = null;
      let locationSource: PhotoCaptureValue["locationSource"] = null;

      const [gps, exif] = await Promise.all([readGpsFromBrowser(), readExifGps(file)]);
      if (gps) {
        latitude = gps.latitude;
        longitude = gps.longitude;
        accuracyM = gps.accuracy;
        locationSource = "gps";
      } else if (exif) {
        latitude = exif.lat;
        longitude = exif.lon;
        accuracyM = null;
        locationSource = "exif";
      }

      onChange({
        file,
        previewUrl,
        latitude,
        longitude,
        accuracyM,
        locationSource,
      });
    },
    [onChange],
  );

  const onInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      await processFile(file);
      event.target.value = "";
    },
    [processFile],
  );

  const clear = useCallback(() => {
    if (value?.previewUrl) {
      URL.revokeObjectURL(value.previewUrl);
    }
    onChange(null);
  }, [onChange, value?.previewUrl]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-[#1a2535]">{label}</span>
        {required ? (
          <span className="text-xs text-red-600" aria-hidden>
            *
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="h-9 rounded-lg border border-[#dce4ef] bg-white px-3 text-sm font-medium text-[#1a2535] shadow-sm hover:bg-[#f8fafc]"
          onClick={() => cameraInputRef.current?.click()}
        >
          Take photo
        </button>
        <button
          type="button"
          className="h-9 rounded-lg border border-[#dce4ef] bg-white px-3 text-sm font-medium text-[#1a2535] shadow-sm hover:bg-[#f8fafc]"
          onClick={() => galleryInputRef.current?.click()}
        >
          Choose from gallery
        </button>
        {value ? (
          <button
            type="button"
            className="h-9 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-800 hover:bg-red-100"
            onClick={clear}
          >
            Remove
          </button>
        ) : null}
      </div>

      <input
        ref={cameraInputRef}
        id={`${baseId}_camera`}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={onInputChange}
      />
      <input
        ref={galleryInputRef}
        id={`${baseId}_gallery`}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden
        tabIndex={-1}
        onChange={onInputChange}
      />

      {value ? (
        <div className="space-y-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.previewUrl}
            alt=""
            className="max-h-48 max-w-full rounded-lg border border-[#dce4ef] object-contain"
          />
          <p className="text-xs text-[#6b7a94]">
            {value.latitude != null && value.longitude != null ? (
              <>
                Location: {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
                {value.locationSource ? ` (${value.locationSource})` : ""}
                {value.accuracyM != null ? ` · ±${Math.round(value.accuracyM)} m` : ""}
              </>
            ) : (
              "No GPS — allow location permission for proximity check, or use a photo with embedded location (EXIF)."
            )}
          </p>
        </div>
      ) : null}

      {hint ? <p className="text-[11px] leading-relaxed text-[#6b7a94]">{hint}</p> : null}
    </div>
  );
}
