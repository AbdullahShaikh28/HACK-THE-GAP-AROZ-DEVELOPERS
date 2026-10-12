"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { createTankerRequest } from "./actions";

export type TankerListItem = {
  id: string;
  requester_name: string;
  vehicle_number: string;
  phone_number: string;
  address: string;
  supply_date: string;
  supply_time: string;
  payment_status: "received" | "cod" | "online" | string;
  source: string;
  created_at: string;
};

type Props = {
  tankName: string;
  ward: string | null;
  rows: TankerListItem[];
};

function formatDate(value: string) {
  const d = new Date(`${value}T12:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

function paymentLabel(value: string) {
  if (value === "received") return "Received";
  if (value === "cod") return "COD";
  if (value === "online") return "Online";
  return value;
}

function sourceLabel(value: string) {
  if (value === "whatsapp_booking") return "WhatsApp booking";
  return "Dashboard";
}

export function TankersPageTabs({ tankName, ward, rows }: Props) {
  const router = useRouter();
  const [tab, setTab] = React.useState<"form" | "list">("form");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const form = event.currentTarget;
    const fd = new FormData(form);
    setPending(true);
    const result = await createTankerRequest(fd);
    setPending(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess("Tanker request saved.");
    form.reset();
    router.refresh();
    setTab("list");
  }

  return (
    <Card className="p-0">
      <div className="flex border-b border-border px-6 pt-5">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "form"}
          className={cn(
            "-mb-px border-b-2 px-4 pb-3 text-sm font-semibold transition-colors",
            tab === "form"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setTab("form")}
        >
          New tanker request
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "list"}
          className={cn(
            "-mb-px border-b-2 px-4 pb-3 text-sm font-semibold transition-colors",
            tab === "list"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setTab("list")}
        >
          Tanker list
        </button>
      </div>

      <div className="p-6 pt-5" role="tabpanel" hidden={tab !== "form"}>
        {tab === "form" ? (
          <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-medium text-foreground">Assigned tank</label>
              <input
                value={ward ? `${tankName} (${ward})` : tankName}
                readOnly
                className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3 text-sm text-foreground outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="tk_name" className="text-xs font-medium text-foreground">
                Name
              </label>
              <input
                id="tk_name"
                name="name"
                required
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
                placeholder="Enter name"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="tk_vehicle_number" className="text-xs font-medium text-foreground">
                Vehicle number
              </label>
              <input
                id="tk_vehicle_number"
                name="vehicle_number"
                required
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
                placeholder="MH-20-AB-1234"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="tk_phone" className="text-xs font-medium text-foreground">
                Phone number
              </label>
              <input
                id="tk_phone"
                name="phone_number"
                required
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
                placeholder="+91..."
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <label htmlFor="tk_address" className="text-xs font-medium text-foreground">
                Address
              </label>
              <input
                id="tk_address"
                name="address"
                required
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
                placeholder="Enter address"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="tk_date" className="text-xs font-medium text-foreground">
                Date
              </label>
              <input
                id="tk_date"
                name="supply_date"
                type="date"
                required
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="tk_time" className="text-xs font-medium text-foreground">
                Time
              </label>
              <input
                id="tk_time"
                name="supply_time"
                type="time"
                required
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="tk_payment_status" className="text-xs font-medium text-foreground">
                Payment status
              </label>
              <select
                id="tk_payment_status"
                name="payment_status"
                defaultValue="received"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
              >
                <option value="received">Received</option>
                <option value="cod">COD</option>
                <option value="online">Online</option>
              </select>
            </div>

            {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}
            {success ? <p className="text-sm text-emerald-700 md:col-span-2">{success}</p> : null}

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={pending}
                className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
              >
                {pending ? "Saving..." : "Save tanker request"}
              </button>
            </div>
          </form>
        ) : null}
      </div>

      <div className="p-6 pt-5" role="tabpanel" hidden={tab !== "list"}>
        {tab === "list" ? (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Tanker requests for your tank</h2>
              <p className="mt-1 text-sm text-muted">
                {rows.length} record{rows.length === 1 ? "" : "s"} for{" "}
                <span className="font-medium text-foreground">{tankName}</span>
                {ward ? <span className="text-muted"> ({ward})</span> : null}.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted">
                    <th className="pb-2 pr-4 font-medium">Name</th>
                    <th className="pb-2 pr-4 font-medium">Vehicle</th>
                    <th className="pb-2 pr-4 font-medium">Phone</th>
                    <th className="pb-2 pr-4 font-medium">Address</th>
                    <th className="pb-2 pr-4 font-medium">Date</th>
                    <th className="pb-2 pr-4 font-medium">Time</th>
                    <th className="pb-2 pr-4 font-medium">Payment</th>
                    <th className="pb-2 pr-4 font-medium">Label</th>
                    <th className="pb-2 pr-4 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id} className="border-b border-border/60">
                      <td className="py-2 pr-4 text-foreground">{row.requester_name}</td>
                      <td className="py-2 pr-4 text-foreground">{row.vehicle_number}</td>
                      <td className="py-2 pr-4 text-foreground">{row.phone_number}</td>
                      <td className="py-2 pr-4 text-foreground">{row.address}</td>
                      <td className="py-2 pr-4 text-foreground">{formatDate(row.supply_date)}</td>
                      <td className="py-2 pr-4 text-foreground">{row.supply_time}</td>
                      <td className="py-2 pr-4 text-foreground">{paymentLabel(row.payment_status)}</td>
                      <td className="py-2 pr-4 text-foreground">{sourceLabel(row.source)}</td>
                      <td className="py-2 pr-4 text-muted-foreground">
                        {new Date(row.created_at).toLocaleString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-4 text-muted">
                        No tanker requests yet for your assigned tank.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
