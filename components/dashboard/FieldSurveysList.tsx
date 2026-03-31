import { FieldSurveyPhotoCell } from "@/components/dashboard/FieldSurveyPhotoCell";
import { CaptureLocationTableLine } from "@/components/dashboard/CaptureLocationTableLine";
import { locationCheckTableSummary } from "@/lib/location-check-display";
import { FORM_LANGUAGE_OPTIONS } from "@/lib/form-language-options";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type FieldSurveyListItem = {
  id: string;
  respondent_name: string;
  phone_number: string;
  survey_date: string | null;
  arrival_time: string | null;
  duration_minutes: number | null;
  pressure_level: "low" | "medium" | "high";
  notes: string | null;
  image_url: string | null;
  submission_kind: "field_survey" | "supply_report" | null;
  report_channel: "web" | "whatsapp" | null;
  language: "en" | "hi" | "mr" | "ur" | null;
  zone_number: number | null;
  location_check_status: "pass" | "fail" | "unavailable" | null;
  distance_to_tank_m: number | null;
  ai_issue_label: string | null;
  photo_latitude: number | null;
  photo_longitude: number | null;
  photo_location_accuracy_m: number | null;
  capture_address: string | null;
  created_at: string;
};

function kindLabel(kind: FieldSurveyListItem["submission_kind"]): string {
  if (kind === "supply_report") return "Supply report";
  if (kind === "field_survey") return "Field survey";
  return "Survey";
}

function pressureLabel(level: FieldSurveyListItem["pressure_level"]): string {
  switch (level) {
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    default:
      return level;
  }
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

function formatTime(value: string | null): string {
  if (!value) return "—";
  const parts = value.split(":");
  if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
  return value;
}

function formatSurveyDate(value: string | null): string {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value + "T12:00:00"));
  } catch {
    return value;
  }
}

function languageLabel(code: FieldSurveyListItem["language"]): string {
  if (!code) return "—";
  const opt = FORM_LANGUAGE_OPTIONS.find((o) => o.code === code);
  return opt ? `${opt.nativeLabel} (${opt.label})` : code;
}

export function FieldSurveysList({ rows }: { rows: FieldSurveyListItem[] }) {
  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted">
        No field surveys or supply reports yet for this tank.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Submitted</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Zone</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Survey date</TableHead>
            <TableHead>Arrival</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Pressure</TableHead>
            <TableHead>Language</TableHead>
            <TableHead className="min-w-[10rem] max-w-sm">Notes</TableHead>
            <TableHead>Photo</TableHead>
            <TableHead>Location / review</TableHead>
            <TableHead>AI tag</TableHead>
            <TableHead>Channel</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                {formatSubmittedAt(row.created_at)}
              </TableCell>
              <TableCell className="text-sm">{kindLabel(row.submission_kind)}</TableCell>
              <TableCell className="text-center text-sm tabular-nums text-muted-foreground">
                {row.zone_number != null ? row.zone_number : "—"}
              </TableCell>
              <TableCell className="font-medium">{row.respondent_name}</TableCell>
              <TableCell className="tabular-nums text-sm text-muted-foreground">
                {row.phone_number}
              </TableCell>
              <TableCell className="text-sm">{formatSurveyDate(row.survey_date)}</TableCell>
              <TableCell className="text-sm">{formatTime(row.arrival_time)}</TableCell>
              <TableCell className="text-sm">
                {row.duration_minutes != null ? `${row.duration_minutes} min` : "—"}
              </TableCell>
              <TableCell className="text-sm">{pressureLabel(row.pressure_level)}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {languageLabel(row.language)}
              </TableCell>
              <TableCell>
                <span
                  className="line-clamp-2 text-sm text-foreground"
                  title={row.notes ?? undefined}
                >
                  {row.notes?.trim() ? row.notes : "—"}
                </span>
              </TableCell>
              <TableCell>
                <FieldSurveyPhotoCell row={row} />
              </TableCell>
              <TableCell className="max-w-[11rem] text-sm">
                <div className="flex flex-col gap-0.5">
                  <span
                    className={
                      row.location_check_status === "pass"
                        ? "whitespace-nowrap font-medium text-emerald-700"
                        : row.location_check_status === "fail"
                          ? "whitespace-nowrap font-medium text-rose-700"
                          : "whitespace-nowrap text-muted-foreground"
                    }
                    title="Automated distance check vs tank map point"
                  >
                    {locationCheckTableSummary(
                      row.location_check_status,
                      row.distance_to_tank_m,
                    )}
                  </span>
                  <CaptureLocationTableLine
                    captureAddress={row.capture_address}
                    photoLatitude={row.photo_latitude}
                    photoLongitude={row.photo_longitude}
                  />
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {row.ai_issue_label?.trim() ? row.ai_issue_label : "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {row.report_channel === "whatsapp"
                  ? "WhatsApp"
                  : row.report_channel === "web"
                    ? "Web"
                    : "—"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
