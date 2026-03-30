"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import type { TankInsight } from "@/services/cei-insights";
import {
  listTankContacts,
  upsertZoneContact,
  type AssignedTankSummary,
  type ZoneContactRow,
} from "./actions";
import { formatSupplySchedule } from "@/lib/supply-schedule-format";
import { buildSchedulingInsightWhatsAppBody } from "@/lib/scheduling-whatsapp-message";
import { getDummyZoneLabel } from "@/lib/dummy-zones";

type Props = {
  assignedTank: AssignedTankSummary;
  initialContacts: ZoneContactRow[];
  initialInsight: TankInsight | null;
};

export function ZoneContactsPanel({
  assignedTank,
  initialContacts,
  initialInsight,
}: Props) {
  const tankId = assignedTank.id;
  const [contacts, setContacts] = React.useState<ZoneContactRow[]>(initialContacts);
  const [insight] = React.useState<TankInsight | null>(initialInsight);
  const [sendState, setSendState] = React.useState<"idle" | "sending" | "done" | "error">("idle");
  const [sendMessage, setSendMessage] = React.useState<string | null>(null);
  const [formError, setFormError] = React.useState<string | null>(null);

  const previewZone = 3;

  async function onSubmit(formData: FormData) {
    setFormError(null);
    formData.set("tank_id", String(tankId));
    const result = await upsertZoneContact(formData);
    if (!result.ok) {
      setFormError(result.error);
      return;
    }
    setContacts(await listTankContacts(tankId));
  }

  async function onSendWhatsApp() {
    setSendState("sending");
    setSendMessage(null);
    try {
      const res = await fetch("/api/whatsapp/scheduling-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tankId }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        sentCount?: number;
        message?: string;
        error?: string;
      };
      if (!res.ok) {
        setSendState("error");
        setSendMessage(data.error ?? "Send failed.");
        return;
      }
      setSendState("done");
      setSendMessage(
        data.message ??
          `Sent ${data.sentCount ?? 0} message${(data.sentCount ?? 0) === 1 ? "" : "s"}.`,
      );
    } catch {
      setSendState("error");
      setSendMessage("Network error.");
    }
  }

  const previewBody =
    insight &&
    buildSchedulingInsightWhatsAppBody(insight, previewZone, new Date());

  const insightSchedule = insight
    ? formatSupplySchedule(insight.scheduledOpenAt, insight.recommendedDurationMinutes)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="text-lg font-semibold text-foreground">Tank & contacts</h2>
        <p className="mt-1 text-sm text-muted">
          Add survey contacts with zone (1–5) for your assigned tank, then send scheduling updates on
          WhatsApp.
        </p>

        <div className="mt-4 rounded-lg border border-border bg-background p-4">
          <p className="text-xs font-medium text-muted">Your assigned tank</p>
          <p className="mt-1 text-sm text-foreground">
            <span className="font-semibold">{assignedTank.name}</span>
            <span className="text-muted"> — {assignedTank.ward}</span>
          </p>
        </div>

        <form action={onSubmit} className="mt-6 grid gap-3 border-t border-border pt-6 md:grid-cols-2">
          <div className="space-y-1 md:col-span-2">
            <label htmlFor="zc_name" className="text-xs font-medium text-foreground">
              Name
            </label>
            <input
              id="zc_name"
              name="name"
              required
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
              placeholder="Resident name"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="zc_phone" className="text-xs font-medium text-foreground">
              Phone
            </label>
            <input
              id="zc_phone"
              name="phone_number"
              required
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
              placeholder="+91…"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="zc_zone" className="text-xs font-medium text-foreground">
              Zone
            </label>
            <select
              id="zc_zone"
              name="zone_number"
              required
              defaultValue="1"
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
            >
              {[1, 2, 3, 4, 5].map((z) => (
                <option key={z} value={z}>
                  {getDummyZoneLabel(z)}
                </option>
              ))}
            </select>
          </div>
          {formError ? (
            <p className="text-sm text-red-600 md:col-span-2">{formError}</p>
          ) : null}
          <div className="md:col-span-2">
            <button
              type="submit"
              className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Save contact
            </button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-foreground">Contacts</h2>
        <p className="mt-1 text-sm text-muted">
          {contacts.length} contact{contacts.length === 1 ? "" : "s"}
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="pb-2 pr-4 font-medium">Name</th>
                <th className="pb-2 pr-4 font-medium">Phone</th>
                <th className="pb-2 font-medium">Zone</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="py-2 pr-4 text-foreground">{c.name ?? "—"}</td>
                  <td className="py-2 pr-4 text-foreground">{c.phone_number}</td>
                  <td className="py-2 text-foreground">
                    {c.zone_number != null ? getDummyZoneLabel(c.zone_number) : "—"}
                  </td>
                </tr>
              ))}
              {contacts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-muted">
                    No contacts for this tank yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-foreground">AI Scheduling Insights</h2>
        {insight ? (
          <div className="mt-4 space-y-3 text-sm">
            <p className="text-foreground">
              <span className="font-semibold">{insight.tankName}</span>: open valve at{" "}
              <span className="font-semibold">{insightSchedule?.startLabel}</span> for{" "}
              <span className="font-semibold">{insight.recommendedDurationMinutes} minutes</span>{" "}
              (supply ends at <span className="font-semibold">{insightSchedule?.endTimeLabel}</span>).
            </p>
            <p className="text-muted">{insight.reasoningSummary}</p>
            <p className="text-muted">
              Sample WhatsApp ({getDummyZoneLabel(previewZone)}):{" "}
              <span className="whitespace-pre-wrap text-foreground/90">{previewBody}</span>
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">No insight for this tank.</p>
        )}

        <div className="mt-6 border-t border-border pt-4">
          <button
            type="button"
            disabled={!insight || sendState === "sending"}
            onClick={() => void onSendWhatsApp()}
            className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
          >
            {sendState === "sending" ? "Sending…" : "Send WhatsApp to zoned contacts"}
          </button>
          {sendMessage ? (
            <p
              className={`mt-2 text-sm ${sendState === "error" ? "text-red-600" : "text-muted"}`}
            >
              {sendMessage}
            </p>
          ) : null}
          <p className="mt-2 text-xs text-muted">
            Only contacts with a zone number receive messages. Sign-in required.
          </p>
        </div>
      </Card>
    </div>
  );
}
