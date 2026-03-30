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
};

type ComplaintsListProps = {
  complaints: ComplaintItem[];
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
  complaints,
  updateComplaintMeta,
}: ComplaintsListProps) {
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
              title="Click to update status and priority"
              onClick={() => openDialog(complaint)}
            >
              <TableCell className="font-medium">{complaint.name}</TableCell>
              <TableCell className="tabular-nums text-muted-foreground">
                {complaint.phone_number}
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
        <DialogContent showCloseButton>
          <DialogHeader>
            <DialogTitle>Update complaint</DialogTitle>
            <DialogDescription>
              Change status and priority for{" "}
              <span className="font-medium text-foreground">
                {dialogComplaint?.name ?? ""}
              </span>
              .
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
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

          <DialogFooter>
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
