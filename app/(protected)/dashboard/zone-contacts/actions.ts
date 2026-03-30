"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type AssignedTankSummary = {
  id: number;
  name: string;
  ward: string;
};

export type ZoneContactRow = {
  id: number;
  name: string | null;
  phone_number: string;
  zone_number: number | null;
  source: string;
  created_at: string;
};

async function getUserAssignedTankId(userId: string): Promise<number | null> {
  const supabase = await createClient();
  const { data } = await (supabase as any)
    .from("profiles")
    .select("tank_id")
    .eq("id", userId)
    .single();
  const id = data?.tank_id;
  return typeof id === "number" && id >= 1 ? id : null;
}

async function tankMatchesProfile(userId: string, tankId: number): Promise<boolean> {
  const assigned = await getUserAssignedTankId(userId);
  return assigned === tankId;
}

export async function listTankContacts(tankId: number): Promise<ZoneContactRow[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];
  if (!(await tankMatchesProfile(user.id, tankId))) return [];

  const { data, error } = await (supabase as any)
    .from("tank_contacts")
    .select("id,name,phone_number,zone_number,source,created_at")
    .eq("tank_id", tankId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as ZoneContactRow[];
}

export async function upsertZoneContact(formData: FormData): Promise<
  | { ok: true }
  | {
      ok: false;
      error: string;
    }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const tankId = Number(formData.get("tank_id"));
  const name = String(formData.get("name") ?? "").trim();
  const phone_number = String(formData.get("phone_number") ?? "").trim();
  const zone_number = Number(formData.get("zone_number"));

  if (Number.isNaN(tankId) || tankId < 1) {
    return { ok: false, error: "Invalid tank." };
  }
  if (!(await tankMatchesProfile(user.id, tankId))) {
    return { ok: false, error: "You can only add contacts for your assigned tank." };
  }
  if (!name) {
    return { ok: false, error: "Name is required." };
  }
  if (!phone_number) {
    return { ok: false, error: "Phone number is required." };
  }
  if (Number.isNaN(zone_number) || zone_number < 1 || zone_number > 5) {
    return { ok: false, error: "Zone must be between 1 and 5." };
  }

  const { error } = await (supabase as any).from("tank_contacts").upsert(
    {
      tank_id: tankId,
      name,
      phone_number,
      zone_number,
      source: "survey",
    },
    { onConflict: "tank_id,phone_number" },
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/zone-contacts");
  return { ok: true };
}
