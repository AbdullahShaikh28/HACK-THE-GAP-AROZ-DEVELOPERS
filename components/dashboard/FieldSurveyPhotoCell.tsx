"use client";

import { useMemo, useState } from "react";
import type { FieldSurveyListItem } from "./FieldSurveysList";
import {
  PhotoLocationDialog,
  type PhotoLocationDialogPayload,
} from "./PhotoLocationDialog";

function submissionTitle(row: FieldSurveyListItem): string {
  const kind =
    row.submission_kind === "supply_report"
      ? "Supply report"
      : row.submission_kind === "field_survey"
        ? "Field survey"
        : "Survey";
  return `${kind} — ${row.respondent_name}`;
}

function formatSubmittedAt(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function FieldSurveyPhotoCell({ row }: { row: FieldSurveyListItem }) {
  const [open, setOpen] = useState(false);

  const payload = useMemo((): PhotoLocationDialogPayload => {
    return {
      title: submissionTitle(row),
      description: `Submitted ${formatSubmittedAt(row.created_at)}`,
      imageUrl: row.image_url,
      latitude: row.photo_latitude,
      longitude: row.photo_longitude,
      accuracyM: row.photo_location_accuracy_m,
      locationCheckStatus: row.location_check_status,
      distanceToTankM: row.distance_to_tank_m,
      aiIssueLabel: row.ai_issue_label,
      storedCaptureAddress: row.capture_address,
    };
  }, [row]);

  if (!row.image_url) {
    return <span className="text-sm text-muted-foreground">—</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-primary underline underline-offset-2 hover:opacity-80"
      >
        View
      </button>
      <PhotoLocationDialog open={open} onOpenChange={setOpen} payload={payload} />
    </>
  );
}
