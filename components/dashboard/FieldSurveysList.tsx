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
                {row.image_url ? (
                  <a
                    href={row.image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-primary underline underline-offset-2"
                  >
                    View
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
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
