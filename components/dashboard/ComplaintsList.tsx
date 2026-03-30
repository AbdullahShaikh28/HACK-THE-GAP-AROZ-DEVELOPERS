"use client";

import { useState } from "react";

type ComplaintItem = {
  id: string;
  name: string;
  phone_number: string;
  tank_id: number;
  issue: string;
  image_url: string | null;
  status: "open" | "in_progress" | "resolved" | "rejected";
  priority: "low" | "medium" | "high";
  created_at: string;
};

type ComplaintsListProps = {
  complaints: ComplaintItem[];
  tankNameById: Record<number, string>;
  updateComplaintMeta: (formData: FormData) => Promise<void>;
};

export function ComplaintsList({
  complaints,
  tankNameById,
  updateComplaintMeta,
}: ComplaintsListProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  function formatCreatedAt(value: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return `${date.toISOString().slice(0, 19).replace("T", " ")} UTC`;
  }

  if (complaints.length === 0) {
    return <p className="text-sm text-muted">No complaints submitted yet.</p>;
  }

  return (
    <>
      <div className="space-y-4">
        {complaints.map((complaint) => (
          <div
            key={complaint.id}
            className="rounded-lg border border-border bg-background p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {complaint.name} - {complaint.phone_number}
                </p>
                <p className="text-xs text-muted">
                  Tank: {tankNameById[complaint.tank_id] ?? `#${complaint.tank_id}`}
                </p>
              </div>
              <p className="text-xs text-muted">
                {formatCreatedAt(complaint.created_at)}
              </p>
            </div>

            <p className="mt-2 text-sm text-foreground">{complaint.issue}</p>
            {complaint.image_url ? (
              <button
                type="button"
                onClick={() => setPreviewUrl(complaint.image_url)}
                className="mt-3 overflow-hidden rounded-md border border-border"
                title="Preview uploaded image"
              >
                <img
                  src={complaint.image_url}
                  alt="Complaint preview"
                  className="h-20 w-28 object-cover"
                />
              </button>
            ) : null}

            <form action={updateComplaintMeta} className="mt-3 grid gap-3 md:grid-cols-4">
              <input type="hidden" name="complaint_id" value={complaint.id} />

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Status</label>
                <select
                  name="status"
                  defaultValue={complaint.status}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Priority</label>
                <select
                  name="priority"
                  defaultValue={complaint.priority ?? "medium"}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        ))}
      </div>

      {previewUrl ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
          <div className="relative max-h-[90vh] w-full max-w-3xl rounded-xl bg-white p-3">
            <button
              type="button"
              onClick={() => setPreviewUrl(null)}
              className="absolute right-3 top-3 rounded-md bg-black/70 px-2 py-1 text-xs text-white"
            >
              Close
            </button>
            <img
              src={previewUrl}
              alt="Complaint full preview"
              className="max-h-[85vh] w-full rounded-md object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
