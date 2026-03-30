"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { WaterTank } from "@/services/tanks";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

function tankStressIntensity(tank: WaterTank): number {
  const total = tank.capacityLakhLiters;
  if (total <= 0) return 0.35;
  const available =
    tank.capacityAvailableLakhLiters > 0
      ? tank.capacityAvailableLakhLiters
      : Math.max(0, total - tank.capacityUsedLakhLiters);
  const ratio = Math.min(1, Math.max(0, available / total));
  return Math.min(1, Math.max(0.15, 1 - ratio));
}

/** Pin fill colour — same scale as the heat gradient (stable → stressed). */
function stressMarkerColor(tank: WaterTank): string {
  const i = tankStressIntensity(tank);
  if (i < 0.32) return "#1a237e";
  if (i < 0.45) return "#2e7d32";
  if (i < 0.58) return "#f9a825";
  if (i < 0.72) return "#ef6c00";
  if (i < 0.86) return "#c62828";
  return "#b71c1c";
}

function stressPinIcon(color: string): L.DivIcon {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 24 36" aria-hidden="true">
    <path fill="${color}" stroke="#fff" stroke-width="1.25" stroke-linejoin="round"
      d="M12 1.25C6.33 1.25 1.75 5.87 1.75 11.5c0 5.2 6.55 13.8 9.45 17.35a1.2 1.2 0 0 0 1.9 0c2.9-3.55 9.45-12.15 9.45-17.35C22.55 5.87 17.67 1.25 12 1.25z"/>
    <circle cx="12" cy="11.5" r="3.25" fill="#fff"/>
  </svg>`;
  return L.divIcon({
    className: "tank-stress-marker",
    html: `<div style="width:28px;height:36px;display:flex;align-items:flex-start;justify-content:center">${svg}</div>`,
    iconSize: [28, 36],
    iconAnchor: [14, 34],
    popupAnchor: [0, -30],
  });
}

function isValidCoord(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    Math.abs(lat) > 1e-6 &&
    Math.abs(lng) > 1e-6 &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

const DEFAULT_CENTER: [number, number] = [19.8762, 75.3433];
const DEFAULT_ZOOM = 12;

function FitBounds({ tanks }: { tanks: WaterTank[] }) {
  const map = useMap();
  useEffect(() => {
    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      try {
        if (!map.getContainer()?.isConnected) return;
        const pts = tanks.filter((t) => isValidCoord(t.latitude, t.longitude));
        if (pts.length === 0) {
          map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
          return;
        }
        if (pts.length === 1) {
          map.setView([pts[0]!.latitude, pts[0]!.longitude], 14);
          return;
        }
        const bounds = L.latLngBounds(pts.map((t) => [t.latitude, t.longitude] as [number, number]));
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
      } catch {
        /* map container may be null during unmount / layout */
      }
    };
    map.whenReady(run);
    const t = window.setTimeout(run, 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [map, tanks]);
  return null;
}

/** Pixel radius/blur scale with zoom so heat stays visible zoomed out and tighter zoomed in. */
function heatSizeForZoom(zoom: number): { radius: number; blur: number } {
  const z = Math.min(19, Math.max(5, zoom));
  // Lower zoom (wider map) → larger radius so blobs merge instead of vanishing behind pin-sized spots.
  const radius = Math.round(78 - (z - 5) * 3.6);
  const blur = Math.round(Math.max(18, radius * 0.78));
  return {
    radius: Math.max(26, Math.min(88, radius)),
    blur: Math.max(16, Math.min(72, blur)),
  };
}

type HeatLayerInstance = L.Layer & {
  setOptions: (o: Record<string, unknown>) => HeatLayerInstance;
};

function HeatLayer({ points }: { points: [number, number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;

    let heat: HeatLayerInstance | null = null;
    let cancelled = false;

    const syncHeatToZoom = () => {
      if (cancelled || !heat) return;
      try {
        if (!map.getContainer()?.isConnected) return;
        const next = heatSizeForZoom(map.getZoom());
        heat.setOptions({
          radius: next.radius,
          blur: next.blur,
        });
      } catch {
        /* getZoom / getSize can throw if map pane is gone */
      }
    };

    let attached = false;
    const attach = () => {
      if (cancelled || attached) return;
      try {
        if (!map.getContainer()?.isConnected) return;
        map.getZoom();

        const Lheat = L as unknown as {
          heatLayer: (p: typeof points, o: Record<string, unknown>) => HeatLayerInstance;
        };
        const { radius, blur } = heatSizeForZoom(map.getZoom());
        heat = Lheat.heatLayer(points, {
          radius,
          blur,
          minOpacity: 0.22,
          max: 0.95,
          gradient: {
            0.2: "#1a237e",
            0.4: "#2e7d32",
            0.55: "#f9a825",
            0.75: "#ef6c00",
            0.9: "#c62828",
            1.0: "#b71c1c",
          },
        });

        heat.addTo(map);
        attached = true;
        syncHeatToZoom();
        map.on("zoomend", syncHeatToZoom);
        map.on("zoom", syncHeatToZoom);
      } catch {
        /* leaflet.heat / getSize during zero-size or teardown */
      }
    };

    map.whenReady(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(attach);
      });
    });

    return () => {
      cancelled = true;
      map.off("zoomend", syncHeatToZoom);
      map.off("zoom", syncHeatToZoom);
      if (heat) {
        try {
          map.removeLayer(heat);
        } catch {
          /* map may already be destroyed */
        }
        heat = null;
      }
    };
  }, [map, points]);
  return null;
}

/** Ensures the map recalculates size after layout (sidebar, flex, dynamic import). */
function InvalidateMapSize() {
  const map = useMap();
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        map.invalidateSize();
      } catch {
        /* ignore */
      }
    }, 0);
    return () => clearTimeout(id);
  }, [map]);

  useEffect(() => {
    const el = map.getContainer();
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      try {
        map.invalidateSize();
      } catch {
        /* ignore */
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [map]);

  return null;
}

type TanksMapHeatmapProps = {
  tanks: WaterTank[];
};

export function TanksMapHeatmap({ tanks }: TanksMapHeatmapProps) {
  const heatPoints = useMemo(() => {
    return tanks
      .filter((t) => isValidCoord(t.latitude, t.longitude))
      .map((t) => [t.latitude, t.longitude, tankStressIntensity(t)] as [number, number, number]);
  }, [tanks]);

  const plotted = useMemo(
    () => tanks.filter((t) => isValidCoord(t.latitude, t.longitude)),
    [tanks],
  );

  return (
    <div className="relative overflow-hidden rounded-[14px] border border-[#dce4ef] bg-[#e8eef5] shadow-[0_2px_8px_rgba(26,58,110,0.10)]">
      <div className="border-b border-[#dce4ef] bg-white px-5 py-4">
        <p
          className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#e8610a]"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          Stress heatmap
        </p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-[#6b7a94]">
          Pins and heat use the same stress scale (available vs capacity). Zoom adjusts heat spread;
          click a pin for tank details.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[#6b7a94]">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-8 rounded bg-[#1a237e]" /> Low
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-8 rounded bg-[#2e7d32]" /> OK
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-8 rounded bg-[#f9a825]" /> Watch
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-8 rounded bg-[#ef6c00]" /> High
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-8 rounded bg-[#b71c1c]" /> Critical
          </span>
        </div>
      </div>

      <div className="relative h-[min(72vh,640px)] w-full [&_.leaflet-tile-pane]:opacity-100">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          className="h-full w-full rounded-b-[13px]"
          scrollWheelZoom
          style={{ minHeight: "100%" }}
        >
          <InvalidateMapSize />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds tanks={tanks} />
          {plotted.map((tank) => (
            <Marker
              key={tank.id}
              position={[tank.latitude, tank.longitude]}
              icon={stressPinIcon(stressMarkerColor(tank))}
            >
              <Popup>
                <div className="min-w-[180px] text-[#1a2535]">
                  <p className="font-semibold">{tank.name}</p>
                  <p className="text-xs text-[#6b7a94]">{tank.ward}</p>
                  <p className="mt-1 text-xs">
                    Available: {tank.capacityAvailableLakhLiters} LL / {tank.capacityLakhLiters} LL
                  </p>
                </div>
              </Popup>
            </Marker>
          ))}
          {/* Heat on top of markers (canvas uses pointer-events: none); radius scales with zoom. */}
          <HeatLayer points={heatPoints} />
        </MapContainer>
      </div>
    </div>
  );
}
