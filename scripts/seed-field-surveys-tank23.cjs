/**
 * Inserts ~550 dummy field_surveys rows for tank_id = 23 with zone_number 1–5 (rotating).
 *
 * Requires the Supabase **service_role** JWT (not the anon key). Paste it only in .env locally.
 *
 * Usage:
 *   npm run seed:field-surveys-t23
 *
 * Or:
 *   TOTAL=550 TANK_ID=23 node scripts/seed-field-surveys-tank23.cjs
 *
 * .env: NEXT_PUBLIC_SUPABASE_URL=… and SUPABASE_SERVICE_ROLE_KEY=…
 * (Dashboard → Project Settings → API → service_role “secret”.)
 */

const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

function loadDotEnv() {
  const envPath = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

function jwtRole(token) {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const json = Buffer.from(part, "base64url").toString("utf8");
    const payload = JSON.parse(json);
    return payload.role || null;
  } catch {
    return null;
  }
}

loadDotEnv();

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const TANK_ID = Number(process.env.TANK_ID || 23);
const TOTAL = Math.min(2000, Math.max(1, Number(process.env.TOTAL || 550)));
const BATCH = 100;

if (!SUPABASE_URL) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL) in environment or .env.");
  process.exit(1);
}

if (!SERVICE_KEY) {
  console.error(`
Missing SUPABASE_SERVICE_ROLE_KEY.

The anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY) cannot insert into field_surveys under RLS.
Add to .env:

  SUPABASE_SERVICE_ROLE_KEY=<service_role key from Supabase Dashboard → Settings → API>

Never commit the service_role key or expose it in the browser.
`);
  process.exit(1);
}

if (jwtRole(SERVICE_KEY) === "anon") {
  console.error(
    "SUPABASE_SERVICE_ROLE_KEY looks like the anon key (JWT role is 'anon'). Use the **service_role** secret from the API settings instead.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function rowForN(n) {
  const zone = ((n - 1) % 5) + 1;
  const hh = String(6 + (n % 12)).padStart(2, "0");
  const mm = String((n * 7) % 60).padStart(2, "0");
  const langs = ["en", "hi", "mr", "ur"];
  const pressures = ["low", "medium", "high"];
  const daysBack = n % 23;
  const created = new Date();
  created.setUTCMinutes(created.getUTCMinutes() - n * 97 - daysBack * 24 * 60);
  const surveyDate = new Date();
  surveyDate.setUTCDate(surveyDate.getUTCDate() - ((n * 3) % 180));
  return {
    tank_id: TANK_ID,
    respondent_name: `Dummy respondent ${n}`,
    phone_number: `+9198765${String(n % 50000).padStart(5, "0")}`,
    survey_date: surveyDate.toISOString().slice(0, 10),
    arrival_time: `${hh}:${mm}:00`,
    duration_minutes: 15 + (n % 90),
    pressure_level: pressures[(n - 1) % 3],
    notes: `Seeded survey — tank ${TANK_ID}, zone ${zone}, record ${n}`,
    image_url: null,
    submission_kind: n % 8 === 0 ? "supply_report" : "field_survey",
    report_channel: "web",
    language: langs[(n - 1) % 4],
    zone_number: zone,
    created_at: created.toISOString(),
  };
}

async function main() {
  const rows = [];
  for (let n = 1; n <= TOTAL; n++) rows.push(rowForN(n));

  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const { error } = await supabase.from("field_surveys").insert(chunk);
    if (error) {
      console.error(`Insert failed at offset ${i}:`, error.message);
      process.exit(1);
    }
    console.log(`Inserted ${Math.min(i + BATCH, rows.length)} / ${rows.length}`);
  }
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
