"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

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

export async function createTankerRequest(formData: FormData): Promise<
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

  const assignedTankId = await getUserAssignedTankId(user.id);
  if (!assignedTankId) {
    return { ok: false, error: "No tank assigned to your profile." };
  }

  const tankerName = String(formData.get("name") ?? "").trim();
  const vehicleNumber = String(formData.get("vehicle_number") ?? "").trim();
  const phoneNumber = String(formData.get("phone_number") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const supplyDate = String(formData.get("supply_date") ?? "").trim();
  const supplyTime = String(formData.get("supply_time") ?? "").trim();
  const paymentStatus = String(formData.get("payment_status") ?? "").trim().toLowerCase();

  const allowedPaymentStatus = ["received", "cod", "online"];

  if (!tankerName) return { ok: false, error: "Name is required." };
  if (!vehicleNumber) return { ok: false, error: "Vehicle number is required." };
  if (!phoneNumber) return { ok: false, error: "Phone number is required." };
  if (!address) return { ok: false, error: "Address is required." };
  if (!supplyDate) return { ok: false, error: "Date is required." };
  if (!supplyTime) return { ok: false, error: "Time is required." };
  if (!allowedPaymentStatus.includes(paymentStatus)) {
    return { ok: false, error: "Payment status must be received, COD, or online." };
  }

  const { error } = await (supabase as any).from("tanker_requests").insert({
    tank_id: assignedTankId,
    requester_name: tankerName,
    vehicle_number: vehicleNumber,
    phone_number: phoneNumber,
    address,
    supply_date: supplyDate,
    supply_time: supplyTime,
    payment_status: paymentStatus,
    source: "dashboard",
  });

  if (error) {
    const msg = [error.message, error.details, error.hint].filter(Boolean).join(" ");
    const missingTable =
      /relation|does not exist|could not find|schema cache|PGRST204/i.test(msg) &&
      /tanker_requests/i.test(msg);
    if (missingTable) {
      return {
        ok: false,
        error:
          "tanker_requests table is missing. Run sql/cei_tanker_requests.sql and refresh.",
      };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/tankers");
  return { ok: true };
}
