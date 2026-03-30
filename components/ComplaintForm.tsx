"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const COMPLAINTS_BUCKET = process.env.NEXT_PUBLIC_COMPLAINTS_BUCKET ?? "imaged";

type TankOption = {
  id: number;
  name: string;
  ward: string;
};

type ComplaintFormProps = {
  tanks: TankOption[];
  initialPhoneNumber?: string;
  initialTankId?: number;
  initialChannel?: "web" | "whatsapp";
};

export function ComplaintForm({
  tanks,
  initialPhoneNumber,
  initialTankId,
  initialChannel = "web",
}: ComplaintFormProps) {
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber ?? "");
  const [tankId, setTankId] = useState(
    initialTankId ? String(initialTankId) : tanks[0] ? String(tanks[0].id) : "",
  );
  const [issue, setIssue] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [pressureLevel, setPressureLevel] = useState<"low" | "medium" | "high">("medium");
  const [reportType, setReportType] = useState<"complaint" | "supply_report">(
    "complaint",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    try {
      const supabase = createClient();
      let imageUrl: string | null = null;

      if (imageFile) {
        const extension = imageFile.name.split(".").pop() ?? "jpg";
        const filePath = `complaints/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
        const { error: uploadError } = await (supabase as any)
          .storage
          .from(COMPLAINTS_BUCKET)
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          if (uploadError.message?.toLowerCase().includes("bucket not found")) {
            throw new Error(
              `Bucket "${COMPLAINTS_BUCKET}" not found. Create it in Supabase Storage or set NEXT_PUBLIC_COMPLAINTS_BUCKET.`,
            );
          }
          throw new Error(uploadError.message);
        }

        const { data: publicData } = (supabase as any)
          .storage
          .from(COMPLAINTS_BUCKET)
          .getPublicUrl(filePath);

        imageUrl = publicData?.publicUrl ?? null;
      }

      const { error: insertError } = await (supabase as any)
        .from("complaints")
        .insert({
          name,
          phone_number: phoneNumber,
          tank_id: Number(tankId),
          issue,
          arrival_time: arrivalTime || null,
          duration_minutes: durationMinutes ? Number(durationMinutes) : null,
          pressure_level: pressureLevel,
          report_channel: initialChannel,
          source_phone: phoneNumber,
          report_type: reportType,
          image_url: imageUrl,
        });

      if (insertError) {
        throw new Error(insertError.message);
      }

      await (supabase as any).from("tank_contacts").upsert(
        {
          tank_id: Number(tankId),
          name,
          phone_number: phoneNumber,
          source: "complaint",
        },
        { onConflict: "tank_id,phone_number" },
      );

      setMessage("Complaint submitted successfully.");
      setName("");
      setPhoneNumber("");
      setIssue("");
      setArrivalTime("");
      setDurationMinutes("");
      setPressureLevel("medium");
      setReportType("complaint");
      setImageFile(null);
      if (initialPhoneNumber) setPhoneNumber(initialPhoneNumber);
      if (initialTankId) setTankId(String(initialTankId));
      else if (tanks[0]) setTankId(String(tanks[0].id));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to submit complaint.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-[#dce4ef] bg-white p-6 shadow-[0_2px_8px_rgba(26,58,110,0.10)]">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium text-[#1a2535]">
            Name
          </label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-10 w-full rounded-lg border border-[#dce4ef] px-3 text-sm outline-none focus:border-[#1a3a6e]"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="phone" className="text-sm font-medium text-[#1a2535]">
            Phone Number
          </label>
          <input
            id="phone"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            className="h-10 w-full rounded-lg border border-[#dce4ef] px-3 text-sm outline-none focus:border-[#1a3a6e]"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="tank" className="text-sm font-medium text-[#1a2535]">
          Tank
        </label>
        <select
          id="tank"
          value={tankId}
          onChange={(event) => setTankId(event.target.value)}
          className="h-10 w-full rounded-lg border border-[#dce4ef] px-3 text-sm outline-none focus:border-[#1a3a6e]"
          required
        >
          {tanks.map((tank) => (
            <option key={tank.id} value={tank.id}>
              {tank.name} ({tank.ward})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="issue" className="text-sm font-medium text-[#1a2535]">
          Complaint Details
        </label>
        <textarea
          id="issue"
          value={issue}
          onChange={(event) => setIssue(event.target.value)}
          rows={4}
          className="w-full rounded-lg border border-[#dce4ef] px-3 py-2 text-sm outline-none focus:border-[#1a3a6e]"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-1">
          <label htmlFor="arrivalTime" className="text-sm font-medium text-[#1a2535]">
            Arrival Time
          </label>
          <input
            id="arrivalTime"
            type="time"
            value={arrivalTime}
            onChange={(event) => setArrivalTime(event.target.value)}
            className="h-10 w-full rounded-lg border border-[#dce4ef] px-3 text-sm outline-none focus:border-[#1a3a6e]"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="duration" className="text-sm font-medium text-[#1a2535]">
            Duration (minutes)
          </label>
          <input
            id="duration"
            type="number"
            min="0"
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(event.target.value)}
            className="h-10 w-full rounded-lg border border-[#dce4ef] px-3 text-sm outline-none focus:border-[#1a3a6e]"
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="pressure" className="text-sm font-medium text-[#1a2535]">
            Pressure
          </label>
          <select
            id="pressure"
            value={pressureLevel}
            onChange={(event) =>
              setPressureLevel(event.target.value as "low" | "medium" | "high")
            }
            className="h-10 w-full rounded-lg border border-[#dce4ef] px-3 text-sm outline-none focus:border-[#1a3a6e]"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="reportType" className="text-sm font-medium text-[#1a2535]">
          Report Type
        </label>
        <select
          id="reportType"
          value={reportType}
          onChange={(event) =>
            setReportType(event.target.value as "complaint" | "supply_report")
          }
          className="h-10 w-full rounded-lg border border-[#dce4ef] px-3 text-sm outline-none focus:border-[#1a3a6e]"
        >
          <option value="complaint">Complaint</option>
          <option value="supply_report">Supply Report</option>
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="image" className="text-sm font-medium text-[#1a2535]">
          Upload Image
        </label>
        <input
          id="image"
          type="file"
          accept="image/*"
          onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
          className="block w-full text-sm text-[#1a2535]"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-10 rounded-lg bg-[#1a3a6e] px-4 text-sm font-semibold text-white transition hover:bg-[#16325c] disabled:opacity-60"
      >
        {isSubmitting ? "Submitting..." : "Submit Complaint"}
      </button>
    </form>
  );
}
