"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CaptureLocationTableLine } from "@/components/dashboard/CaptureLocationTableLine";
import { PhotoLocationPanel } from "@/components/dashboard/PhotoLocationPanel";
import { locationCheckTableSummary } from "@/lib/location-check-display";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  photo_latitude: number | null;
  photo_longitude: number | null;
  photo_location_accuracy_m: number | null;
  distance_to_tank_m: number | null;
  location_check_status: "pass" | "fail" | "unavailable" | null;
  capture_address: string | null;
  ai_issue_label: string | null;
};

type ComplaintsListProps = {
  complaints: ComplaintItem[] | Array<Record<string, unknown>>;
  updateComplaintMeta: (formData: FormData) => Promise<void>;
};

function statusLabel(status: ComplaintItem["status"]): string {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In Progress";
    case "resolved":
      return "Closed";
    case "rejected":
      return "Rejected";
    default:
      return status;
  }
}

function normalizeComplaintRow(r: Record<string, unknown>): ComplaintItem {
  const lcs = r.location_check_status;
  const location_check_status =
    lcs === "pass" || lcs === "fail" || lcs === "unavailable" ? lcs : null;
  const numOrNull = (v: unknown): number | null => {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string" && v.trim() !== "") {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    }
    return null;
  };
  const ail = r.ai_issue_label;
  const st = r.status;
  const status: ComplaintItem["status"] =
    st === "open" || st === "in_progress" || st === "resolved" || st === "rejected" ? st : "open";
  const pr = r.priority;
  const priority: ComplaintItem["priority"] =
    pr === "low" || pr === "medium" || pr === "high" ? pr : "medium";

  const imgRaw = r.image_url;
  const image_url =
    imgRaw != null && String(imgRaw).trim() !== "" ? String(imgRaw).trim() : null;

  const capAddr = r.capture_address;
  const capture_address =
    capAddr != null && String(capAddr).trim() ? String(capAddr).trim() : null;

  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    phone_number: String(r.phone_number ?? ""),
    tank_id: Number(r.tank_id),
    issue: String(r.issue ?? ""),
    image_url,
    status,
    priority,
    created_at: String(r.created_at ?? ""),
    photo_latitude: numOrNull(r.photo_latitude),
    photo_longitude: numOrNull(r.photo_longitude),
    photo_location_accuracy_m: numOrNull(r.photo_location_accuracy_m),
    distance_to_tank_m: numOrNull(r.distance_to_tank_m),
    location_check_status,
    capture_address,
    ai_issue_label: ail != null && String(ail).trim() ? String(ail).trim() : null,
  };
}

function priorityLabel(priority: ComplaintItem["priority"]): string {
  switch (priority) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    default:
      return priority;
  }
}

const selectClass =
  "h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50";

export function ComplaintsList({
  complaints: complaintsProp,
  updateComplaintMeta,
}: ComplaintsListProps) {
  const complaints = (complaintsProp as Array<Record<string, unknown>>).map(
    normalizeComplaintRow,
  );
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [dialogComplaint, setDialogComplaint] = useState<ComplaintItem | null>(
    null,
  );
  const [editStatus, setEditStatus] = useState<ComplaintItem["status"]>("open");
  const [editPriority, setEditPriority] =
    useState<ComplaintItem["priority"]>("medium");

  function openDialog(c: ComplaintItem) {
    setDialogComplaint(c);
    setEditStatus(c.status);
    setEditPriority(c.priority);
  }

  function closeDialog() {
    setDialogComplaint(null);
  }

  function handleSave() {
    if (!dialogComplaint) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("complaint_id", dialogComplaint.id);
      fd.set("status", editStatus);
      fd.set("priority", editPriority);
      await updateComplaintMeta(fd);
      router.refresh();
      closeDialog();
    });
  }

  if (complaints.length === 0) {
    return <p className="text-sm text-muted">No complaints submitted yet.</p>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Number</TableHead>
            <TableHead className="w-[4.5rem]">Photo</TableHead>
            <TableHead className="min-w-[9rem] max-w-[11rem]">Location / review</TableHead>
            <TableHead className="min-w-[12rem] max-w-md">Issue</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complaints.map((complaint) => (
            <TableRow
              key={complaint.id}
              className="cursor-pointer hover:bg-muted/40"
              title="Click to view photo, location, and update status"
              onClick={() => openDialog(complaint)}
            >
              <TableCell className="font-medium">{complaint.name}</TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {complaint.phone_number}
              </TableCell>
              <TableCell className="align-middle">
                {complaint.image_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={complaint.image_url}
                    alt=""
                    className="h-12 w-12 rounded-md border border-border object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-xs">
                <div className="flex max-w-[11rem] flex-col gap-0.5">
                  <span
                    className={
                      complaint.location_check_status === "pass"
                        ? "whitespace-nowrap font-medium text-emerald-700"
                        : complaint.location_check_status === "fail"
                          ? "whitespace-nowrap font-medium text-rose-700"
                          : "whitespace-nowrap text-muted-foreground"
                    }
                    title="Automated distance check vs tank map point (not a court finding)"
                  >
                    {locationCheckTableSummary(
                      complaint.location_check_status,
                      complaint.distance_to_tank_m,
                    )}
                  </span>
                  <CaptureLocationTableLine
                    captureAddress={complaint.capture_address}
                    photoLatitude={complaint.photo_latitude}
                    photoLongitude={complaint.photo_longitude}
                  />
                </div>
              </TableCell>
              <TableCell>
                <span
                  className="line-clamp-2 text-foreground"
                  title={complaint.issue}
                >
                  {complaint.issue}
                </span>
              </TableCell>
              <TableCell className="text-sm text-foreground">
                {statusLabel(complaint.status)}
              </TableCell>
              <TableCell className="text-sm text-foreground">
                {priorityLabel(complaint.priority)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog
        open={dialogComplaint !== null}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent
          showCloseButton
          className="!flex max-h-[min(90vh,880px)] w-full max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-6 sm:max-w-2xl"
        >
          <DialogHeader className="shrink-0">
            <DialogTitle>Update complaint</DialogTitle>
            <DialogDescription>
              Photo, capture location, and status for{" "}
              <span className="font-medium text-foreground">
                {dialogComplaint?.name ?? ""}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto py-4 pr-1">
            {dialogComplaint ? (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="mb-2 text-sm font-semibold text-foreground">
                  Photo &amp; capture location
                </p>
                <PhotoLocationPanel
                  key={dialogComplaint.id}
                  imageUrl={dialogComplaint.image_url}
                  latitude={dialogComplaint.photo_latitude}
                  longitude={dialogComplaint.photo_longitude}
                  accuracyM={dialogComplaint.photo_location_accuracy_m}
                  locationCheckStatus={dialogComplaint.location_check_status}
                  distanceToTankM={dialogComplaint.distance_to_tank_m}
                  aiIssueLabel={dialogComplaint.ai_issue_label}
                  storedCaptureAddress={dialogComplaint.capture_address}
                  fetchEnabled={Boolean(dialogComplaint)}
                />
              </div>
            ) : null}
            <div className="grid gap-2 rounded-md border border-border px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Issue text
              </p>
              <p className="text-sm text-foreground">{dialogComplaint?.issue}</p>
            </div>
            <div className="grid gap-2">
              <label htmlFor="complaint-status" className="text-sm font-medium">
                Status
              </label>
              <select
                id="complaint-status"
                className={selectClass}
                value={editStatus}
                onChange={(e) =>
                  setEditStatus(e.target.value as ComplaintItem["status"])
                }
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Closed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="grid gap-2">
              <label
                htmlFor="complaint-priority"
                className="text-sm font-medium"
              >
                Priority
              </label>
              <select
                id="complaint-priority"
                className={selectClass}
                value={editPriority}
                onChange={(e) =>
                  setEditPriority(e.target.value as ComplaintItem["priority"])
                }
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <DialogFooter className="shrink-0 border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeDialog}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isPending}>
              {isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
