/**
 * Comprehensive seed script — creates all demo data in Supabase.
 * Mirrors the mock data used in the frontend so pages show real DB records.
 *
 * Prerequisites:
 *   1. Run database-schema-fixed.sql in Supabase SQL Editor first.
 *   2. Set SUPABASE_SERVICE_ROLE_KEY in .env.local (required for auth user creation).
 *
 * Usage:
 *   npx tsx scripts/seed-all.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

if (!supabaseUrl || !serviceRoleKey) {
  console.error("❌  Missing env vars.");
  console.error("   NEXT_PUBLIC_SUPABASE_URL     →", supabaseUrl || "MISSING");
  console.error("   SUPABASE_SERVICE_ROLE_KEY    →", serviceRoleKey ? "set" : "MISSING");
  console.error("\nGet the service role key from:");
  console.error("  Supabase Dashboard → Project Settings → API → service_role");
  process.exit(1);
}

const db = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ─────────────────────────────────────────────────────────────────────────────
// Seed data definitions (mirrors mock data in src/lib/mock-*.ts)
// ─────────────────────────────────────────────────────────────────────────────

const DOCTORS = [
  { email: "doctor.rajesh@clinic.com", password: "DemoDoc@123", firstName: "Rajesh", lastName: "Sharma", phone: "+91-9876543210" },
  { email: "doctor.priya@clinic.com",  password: "DemoDoc@123", firstName: "Priya",  lastName: "Gupta",  phone: "+91-9876543211" },
];

const NURSES = [
  { email: "nurse.elena@clinic.com",  password: "DemoNurse@123", firstName: "Elena", lastName: "Rodriguez", phone: "+91-9876543220" },
  { email: "nurse.james@clinic.com",  password: "DemoNurse@123", firstName: "James", lastName: "Wilson",    phone: "+91-9876543221" },
];

const PATIENTS = [
  {
    id: "IVF-9921",
    email: "sarah.jenkins@patient.com",
    password: "DemoPatient@123",
    firstName: "Sarah",
    lastName: "Jenkins",
    dob: "1992-03-14",
    gender: "F" as const,
    bloodType: "A+",
    maritalStatus: "Married",
    phone: "+91-9876540001",
    cycleStatus: "STIMULATION" as const,
    cycleDay: 12,
    protocol: "Antagonist Protocol",
    startDate: "2026-10-04",
  },
  {
    id: "IVF-8840",
    email: "elena.rodriguez@patient.com",
    password: "DemoPatient@123",
    firstName: "Elena",
    lastName: "Rodriguez",
    dob: "1989-07-22",
    gender: "F" as const,
    bloodType: "O+",
    maritalStatus: "Married",
    phone: "+91-9876540002",
    cycleStatus: "STIMULATION" as const,
    cycleDay: 14,
    protocol: "Long Agonist Protocol",
    startDate: "2026-10-02",
  },
  {
    id: "IVF-7712",
    email: "jessica.thompson@patient.com",
    password: "DemoPatient@123",
    firstName: "Jessica",
    lastName: "Thompson",
    dob: "1994-11-08",
    gender: "F" as const,
    bloodType: "B+",
    maritalStatus: "Married",
    phone: "+91-9876540003",
    cycleStatus: "RETRIEVAL" as const,
    cycleDay: 5,
    protocol: "Mini-IVF Protocol",
    startDate: "2026-10-10",
  },
  {
    id: "IVF-9102",
    email: "michael.smith@patient.com",
    password: "DemoPatient@123",
    firstName: "Michael",
    lastName: "Smith",
    dob: "1987-05-30",
    gender: "M" as const,
    bloodType: "AB+",
    maritalStatus: "Married",
    phone: "+91-9876540004",
    cycleStatus: "TRANSFER" as const,
    cycleDay: 19,
    protocol: "Freeze All Protocol",
    startDate: "2026-09-28",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

async function createAuthUser(email: string, password: string) {
  const { data: existing } = await db.auth.admin.listUsers();
  const found = existing.users?.find((u) => u.email === email);
  if (found) return found;

  const { data, error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw new Error(`Auth user creation failed for ${email}: ${error.message}`);
  return data.user!;
}

async function getOrCreateProfile(
  authId: string,
  firstName: string,
  lastName: string,
  role: "DOCTOR" | "NURSE" | "PATIENT",
  phone?: string
) {
  const { data: existing } = await db
    .from("user_profiles")
    .select("*")
    .eq("auth_id", authId)
    .maybeSingle();
  if (existing) return existing;

  const { data, error } = await db
    .from("user_profiles")
    .insert({ auth_id: authId, first_name: firstName, last_name: lastName, role, phone: phone ?? null })
    .select()
    .single();
  if (error) throw new Error(`Profile creation failed for ${firstName}: ${error.message}`);
  return data;
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed steps
// ─────────────────────────────────────────────────────────────────────────────

async function seedDoctors() {
  console.log("\n👨‍⚕️  Seeding doctors...");
  const profiles: Record<string, string> = {};

  for (const d of DOCTORS) {
    const authUser = await createAuthUser(d.email, d.password);
    const profile = await getOrCreateProfile(authUser.id, d.firstName, d.lastName, "DOCTOR", d.phone);
    profiles[d.email] = profile.id;
    console.log(`  ✅  Dr. ${d.firstName} ${d.lastName}  →  profile ${profile.id}`);
  }
  return profiles;
}

async function seedNurses() {
  console.log("\n👩‍⚕️  Seeding nurses...");
  const profiles: Record<string, string> = {};

  for (const n of NURSES) {
    const authUser = await createAuthUser(n.email, n.password);
    const profile = await getOrCreateProfile(authUser.id, n.firstName, n.lastName, "NURSE", n.phone);
    profiles[n.email] = profile.id;
    console.log(`  ✅  Nurse ${n.firstName} ${n.lastName}  →  profile ${profile.id}`);
  }
  return profiles;
}

async function seedPatients(doctorProfiles: Record<string, string>) {
  console.log("\n🧑‍⚕️  Seeding patients...");
  const patientData: Record<string, { profileId: string; cycleId: string }> = {};
  const [primaryDoctorId] = Object.values(doctorProfiles);

  for (const p of PATIENTS) {
    const authUser = await createAuthUser(p.email, p.password);
    const profile = await getOrCreateProfile(authUser.id, p.firstName, p.lastName, "PATIENT", p.phone);

    // Upsert patient record (preserve custom ID from mock data)
    const { data: existingPatient } = await db
      .from("patients")
      .select("id")
      .eq("id", p.id)
      .maybeSingle();

    if (!existingPatient) {
      const { error } = await db.from("patients").insert({
        id: p.id,
        user_profile_id: profile.id,
        first_name: p.firstName,
        last_name: p.lastName,
        email: p.email,
        phone: p.phone,
        date_of_birth: p.dob,
        gender: p.gender,
        blood_type: p.bloodType,
        marital_status: p.maritalStatus,
      });
      if (error) throw new Error(`Patient creation failed for ${p.firstName}: ${error.message}`);
    }

    // Assign to primary doctor
    await db.from("doctor_patient_assignments").upsert({
      doctor_id: primaryDoctorId,
      patient_id: p.id,
      status: "ACTIVE",
    }, { onConflict: "doctor_id,patient_id" });

    // Create IVF cycle
    const { data: existingCycle } = await db
      .from("ivf_cycles")
      .select("id")
      .eq("patient_id", p.id)
      .maybeSingle();

    let cycleId: string;
    if (existingCycle) {
      cycleId = existingCycle.id;
    } else {
      const { data: cycle, error: cycleError } = await db
        .from("ivf_cycles")
        .insert({
          patient_id: p.id,
          doctor_id: primaryDoctorId,
          protocol: p.protocol,
          status: p.cycleStatus,
          start_date: p.startDate,
        })
        .select("id")
        .single();
      if (cycleError) throw new Error(`Cycle creation failed for ${p.firstName}: ${cycleError.message}`);
      cycleId = cycle.id;
    }

    patientData[p.id] = { profileId: profile.id, cycleId };
    console.log(`  ✅  ${p.firstName} ${p.lastName}  (${p.id})  →  cycle ${cycleId}`);
  }

  return patientData;
}

async function seedMedications(
  patientData: Record<string, { profileId: string; cycleId: string }>,
  doctorProfiles: Record<string, string>
) {
  console.log("\n💊  Seeding medications...");
  const [primaryDoctorId] = Object.values(doctorProfiles);

  const meds = [
    // Sarah Jenkins — Stimulation
    { patientId: "IVF-9921", name: "Gonal-F (FSH)",   dose: "300 IU", route: "Subcutaneous Injection", frequency: "Once daily (evening)", startDate: "2026-10-04", endDate: "2026-10-14", instructions: "Inject into lower abdomen. Rotate sites daily." },
    { patientId: "IVF-9921", name: "Menopur (hMG)",   dose: "75 IU",  route: "Subcutaneous Injection", frequency: "Once daily (evening)", startDate: "2026-10-04", endDate: "2026-10-14", instructions: "Reconstitute with provided saline. Inject after Gonal-F." },
    { patientId: "IVF-9921", name: "Cetrotide (GnRH Antagonist)", dose: "0.25 mg", route: "Subcutaneous Injection", frequency: "Once daily (morning)", startDate: "2026-10-08", endDate: "2026-10-14", instructions: "Begin when leading follicle reaches 14mm." },
    // Elena Rodriguez — Stimulation
    { patientId: "IVF-8840", name: "Gonal-F (FSH)",   dose: "225 IU", route: "Subcutaneous Injection", frequency: "Once daily (evening)", startDate: "2026-10-02", endDate: "2026-10-12" },
    { patientId: "IVF-8840", name: "Lupron (Buserelin)", dose: "0.5 ml", route: "Subcutaneous Injection", frequency: "Once daily (morning)", startDate: "2026-09-25", endDate: "2026-10-12" },
    // Jessica Thompson — Post Retrieval
    { patientId: "IVF-7712", name: "Progesterone (Crinone 8%)", dose: "1 applicator", route: "Vaginal Gel", frequency: "Twice daily", startDate: "2026-10-12", endDate: "2026-11-05", instructions: "Apply morning and evening. Begin day after retrieval." },
    { patientId: "IVF-7712", name: "Estrace (Estradiol)", dose: "2 mg", route: "Oral", frequency: "Three times daily", startDate: "2026-10-10", endDate: "2026-11-05" },
    // Michael Smith — Luteal support
    { patientId: "IVF-9102", name: "Progesterone in Oil", dose: "50 mg", route: "Intramuscular Injection", frequency: "Once daily", startDate: "2026-10-15", endDate: "2026-11-10", instructions: "Deep IM injection into gluteal muscle. Warm oil before injecting." },
  ];

  for (const m of meds) {
    const cycleId = patientData[m.patientId]?.cycleId;
    if (!cycleId) continue;

    const { error } = await db.from("medications").insert({
      patient_id: m.patientId,
      cycle_id: cycleId,
      prescribed_by: primaryDoctorId,
      medication_name: m.name,
      dose: m.dose,
      route: m.route,
      frequency: m.frequency,
      start_date: m.startDate,
      end_date: m.endDate ?? null,
      instructions: m.instructions ?? null,
    });
    if (error && !error.message.includes("duplicate")) {
      console.error(`  ⚠️   Medication insert warning (${m.name}): ${error.message}`);
    }
  }
  console.log(`  ✅  ${meds.length} medications inserted`);
}

async function seedAppointments(
  patientData: Record<string, { profileId: string; cycleId: string }>
) {
  console.log("\n📅  Seeding appointments...");

  const appts = [
    { patientId: "IVF-9921", type: "ULTRASOUND",    date: "2026-10-14T09:00:00", status: "SCHEDULED", notes: "Trigger assessment scan. Check E2 levels and follicle counts." },
    { patientId: "IVF-9921", type: "BLOODWORK",     date: "2026-10-12T08:00:00", status: "COMPLETED", notes: "E2: 2840 pg/mL, P4: 0.9 ng/mL, LH: 3.2 mIU/mL" },
    { patientId: "IVF-8840", type: "ULTRASOUND",    date: "2026-10-14T10:30:00", status: "SCHEDULED", notes: "Trigger ready assessment. Leading follicle 20mm." },
    { patientId: "IVF-8840", type: "PROCEDURE",     date: "2026-10-16T07:30:00", status: "SCHEDULED", notes: "Oocyte retrieval. NPO after midnight. Arrive 90 min early." },
    { patientId: "IVF-7712", type: "FOLLOW_UP",     date: "2026-10-21T11:00:00", status: "SCHEDULED", notes: "Embryo transfer — Day 5 blastocyst. Confirm uterine lining." },
    { patientId: "IVF-9102", type: "BLOODWORK",     date: "2026-11-01T08:30:00", status: "SCHEDULED", notes: "Beta hCG — 10 days post transfer. Confirm pregnancy." },
    { patientId: "IVF-9102", type: "CONSULTATION",  date: "2026-10-24T14:00:00", status: "COMPLETED", notes: "Cycle review and luteal support assessment." },
  ];

  for (const a of appts) {
    const cycleId = patientData[a.patientId]?.cycleId;
    const { error } = await db.from("appointments").insert({
      patient_id: a.patientId,
      cycle_id: cycleId ?? null,
      appointment_type: a.type,
      scheduled_date: a.date,
      status: a.status,
      notes: a.notes,
    });
    if (error && !error.message.includes("duplicate")) {
      console.error(`  ⚠️   Appointment insert warning: ${error.message}`);
    }
  }
  console.log(`  ✅  ${appts.length} appointments inserted`);
}

async function seedLabResults(
  patientData: Record<string, { profileId: string; cycleId: string }>,
  doctorProfiles: Record<string, string>
) {
  console.log("\n🧪  Seeding lab results...");
  const [primaryDoctorId] = Object.values(doctorProfiles);

  const results = [
    {
      patientId: "IVF-9921",
      type: "HORMONE_PANEL",
      date: "2026-10-12",
      data: { E2: "2840 pg/mL", P4: "0.9 ng/mL", LH: "3.2 mIU/mL", FSH: "6.1 mIU/mL" },
      interpretation: "E2 rising appropriately. P4 remains suppressed. Good stimulation response.",
    },
    {
      patientId: "IVF-9921",
      type: "ULTRASOUND_SCAN",
      date: "2026-10-12",
      data: { follicles_right: [16, 17, 15, 14], follicles_left: [18, 16, 15], endometrial_thickness: "9.2 mm", uterus: "Normal" },
      interpretation: "Multiple leading follicles. Endometrium trilaminar. Good response to stimulation.",
    },
    {
      patientId: "IVF-8840",
      type: "HORMONE_PANEL",
      date: "2026-10-13",
      data: { E2: "3200 pg/mL", P4: "1.1 ng/mL", LH: "4.1 mIU/mL" },
      interpretation: "Trigger criteria met. E2 confirmed at 3200 pg/mL. Scheduled trigger: 22:30.",
    },
    {
      patientId: "IVF-7712",
      type: "EMBRYOLOGY_REPORT",
      date: "2026-10-15",
      data: {
        oocytes_retrieved: 9,
        MII: 7,
        fertilised_2PN: 6,
        day3_count: 5,
        day5_blastocysts: 3,
        grades: ["4AA", "3AB", "3BB"],
      },
      interpretation: "Excellent fertilization rate. 3 high-quality blastocysts for transfer/freeze.",
    },
    {
      patientId: "IVF-9102",
      type: "HORMONE_PANEL",
      date: "2026-10-22",
      data: { P4: "18.2 ng/mL", E2: "412 pg/mL" },
      interpretation: "Adequate luteal support. P4 above 10 ng/mL threshold.",
    },
  ];

  for (const r of results) {
    const cycleId = patientData[r.patientId]?.cycleId;
    const { error } = await db.from("medical_results").insert({
      patient_id: r.patientId,
      cycle_id: cycleId ?? null,
      result_type: r.type,
      result_date: r.date,
      result_data: r.data,
      interpretation: r.interpretation,
      doctor_id: primaryDoctorId,
    });
    if (error && !error.message.includes("duplicate")) {
      console.error(`  ⚠️   Lab result insert warning: ${error.message}`);
    }
  }
  console.log(`  ✅  ${results.length} lab results inserted`);
}

async function seedCryoSamples(
  patientData: Record<string, { profileId: string; cycleId: string }>
) {
  console.log("\n❄️   Seeding cryo samples...");

  const samples = [
    { patientId: "IVF-8840", type: "EMBRYO", qty: 1,  grade: "4AA", loc: "TK-04-C2-S12", freezeDate: "2026-10-17", status: "FROZEN" },
    { patientId: "IVF-8840", type: "EMBRYO", qty: 1,  grade: "3AB", loc: "TK-04-C2-S13", freezeDate: "2026-10-17", status: "FROZEN" },
    { patientId: "IVF-9921", type: "EGG",    qty: 3,  grade: "MII", loc: "TK-04-C4-S01", freezeDate: "2026-03-21", status: "FROZEN" },
    { patientId: "IVF-7712", type: "EMBRYO", qty: 1,  grade: "5AB", loc: "TK-05-C2-S09", freezeDate: "2026-10-15", status: "FROZEN" },
    { patientId: "IVF-9102", type: "SPERM",  qty: 5,  grade: "MOT:40%", loc: "TK-07-C1-S05", freezeDate: "2026-01-04", status: "FROZEN" },
  ];

  for (const s of samples) {
    const cycleId = patientData[s.patientId]?.cycleId;
    const { error } = await db.from("cryo_samples").insert({
      patient_id: s.patientId,
      cycle_id: cycleId ?? null,
      sample_type: s.type,
      quantity: s.qty,
      quality_grade: s.grade,
      storage_location: s.loc,
      storage_date: s.freezeDate,
      freeze_date: s.freezeDate,
      thaw_status: "FROZEN",
    });
    if (error && !error.message.includes("duplicate")) {
      console.error(`  ⚠️   Cryo sample insert warning: ${error.message}`);
    }
  }
  console.log(`  ✅  ${samples.length} cryo samples inserted`);
}

async function seedAlerts(
  patientData: Record<string, { profileId: string; cycleId: string }>
) {
  console.log("\n🚨  Seeding alerts...");

  const alertList = [
    {
      patientId: "IVF-8840",
      type: "TRIGGER_WINDOW",
      message: "E2 levels confirmed at 3,200 pg/mL. Follicle growth meets criteria. Scheduled trigger: 22:30 tonight.",
      severity: "ALERT",
      doctors: true, nurses: true, patient: true,
    },
    {
      patientId: "IVF-9921",
      type: "OHSS_RISK",
      message: "OHSS Risk: Grade II. E2 > 2800 pg/mL with 10+ follicles. Monitor fluid intake. Consider coasting.",
      severity: "WARNING",
      doctors: true, nurses: true, patient: false,
    },
    {
      patientId: "IVF-7712",
      type: "LAB_RESULT_READY",
      message: "Embryology Day 5 report ready. 3 blastocysts graded: 4AA, 3AB, 3BB. Transfer candidate confirmed.",
      severity: "INFO",
      doctors: true, nurses: false, patient: true,
    },
    {
      patientId: "IVF-9102",
      type: "PROGESTERONE_LOW",
      message: "P4 at 8.1 ng/mL — below threshold of 10 ng/mL. Increase progesterone supplementation immediately.",
      severity: "ALERT",
      doctors: true, nurses: true, patient: false,
    },
  ];

  for (const a of alertList) {
    const { error } = await db.from("alerts").insert({
      patient_id: a.patientId,
      alert_type: a.type,
      message: a.message,
      severity: a.severity,
      visible_to_doctors: a.doctors,
      visible_to_nurses: a.nurses,
      visible_to_patient: a.patient,
    });
    if (error && !error.message.includes("duplicate")) {
      console.error(`  ⚠️   Alert insert warning: ${error.message}`);
    }
  }
  console.log(`  ✅  ${alertList.length} alerts inserted`);
}

async function seedCoordinationTasks(
  patientData: Record<string, { profileId: string; cycleId: string }>,
  doctorProfiles: Record<string, string>,
  nurseProfiles: Record<string, string>
) {
  console.log("\n📋  Seeding coordination tasks...");

  const [primaryDoctorId] = Object.values(doctorProfiles);
  const [primaryNurseId, secondaryNurseId] = Object.values(nurseProfiles);

  const tasks = [
    {
      patientId: "IVF-8840",
      nurseId: primaryNurseId,
      title: "Oocyte Trigger Injection — HCG 10,000 IU",
      type: "MEDICATION",
      priority: "URGENT",
      status: "PENDING",
      dueDate: "2026-10-14T22:30:00",
      description: "Administer HCG 10,000 IU subcutaneously at exactly 22:30. Confirm patient identity before injection.",
    },
    {
      patientId: "IVF-9921",
      nurseId: primaryNurseId,
      title: "Sperm Analysis Collection",
      type: "PROCEDURE",
      priority: "NORMAL",
      status: "PENDING",
      dueDate: "2026-10-15T08:00:00",
      description: "Collect semen sample. Send to andrology lab. Ensure 3-day abstinence was observed.",
    },
    {
      patientId: "IVF-7712",
      nurseId: secondaryNurseId ?? primaryNurseId,
      title: "Baseline Ultrasound — Cycle Day 2",
      type: "MONITORING",
      priority: "NORMAL",
      status: "IN_PROGRESS",
      dueDate: "2026-10-24T12:00:00",
      description: "Perform transvaginal ultrasound. Measure AFC, antral follicle count, and uterine lining.",
      acknowledged: true,
    },
    {
      patientId: "IVF-9921",
      nurseId: primaryNurseId,
      title: "AMH + FSH Blood Panel",
      type: "MONITORING",
      priority: "HIGH",
      status: "IN_PROGRESS",
      dueDate: "2026-10-24T09:45:00",
      description: "Draw AMH, FSH, LH, E2, progesterone. Process immediately — STAT order.",
      acknowledged: true,
    },
    {
      patientId: "IVF-7712",
      nurseId: secondaryNurseId ?? primaryNurseId,
      title: "STAT Bloodwork — Estradiol Levels",
      type: "MONITORING",
      priority: "HIGH",
      status: "COMPLETED",
      dueDate: "2026-10-24T09:00:00",
      description: "Urgent E2 check. Patient reported bloating — rule out early OHSS.",
      acknowledged: true,
      completedAt: "2026-10-24T09:14:00",
    },
    {
      patientId: "IVF-9102",
      nurseId: primaryNurseId,
      title: "Progesterone Injection — Luteal Support",
      type: "MEDICATION",
      priority: "NORMAL",
      status: "COMPLETED",
      dueDate: "2026-10-24T08:30:00",
      description: "Administer progesterone 50mg IM. Deep injection — warm oil to body temperature first.",
      acknowledged: true,
      completedAt: "2026-10-24T08:45:00",
    },
  ];

  for (const t of tasks) {
    const { error } = await db.from("coordination_tasks").insert({
      patient_id: t.patientId,
      created_by: primaryDoctorId,
      assigned_to: t.nurseId,
      title: t.title,
      description: t.description,
      task_type: t.type,
      priority: t.priority,
      status: t.status,
      due_date: t.dueDate,
      acknowledged: t.acknowledged ?? false,
      acknowledged_at: t.acknowledged ? t.dueDate : null,
      completed_at: t.completedAt ?? null,
    });
    if (error && !error.message.includes("duplicate")) {
      console.error(`  ⚠️   Task insert warning (${t.title}): ${error.message}`);
    }
  }

  // Assign nurses to patients
  for (const [nIdx, nId] of Object.values(nurseProfiles).entries()) {
    const patientsForNurse = PATIENTS.filter((_, i) => i % 2 === nIdx);
    for (const p of patientsForNurse) {
      await db.from("nurse_patient_assignments").upsert({
        nurse_id: nId,
        patient_id: p.id,
        status: "ACTIVE",
      }, { onConflict: "nurse_id,patient_id" });
    }
  }

  console.log(`  ✅  ${tasks.length} coordination tasks inserted`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🏥  IVF Platform — Seeding Supabase database...");
  console.log(`    URL: ${supabaseUrl}\n`);

  const doctorProfiles = await seedDoctors();
  const nurseProfiles  = await seedNurses();
  const patientData    = await seedPatients(doctorProfiles);

  await seedMedications(patientData, doctorProfiles);
  await seedAppointments(patientData);
  await seedLabResults(patientData, doctorProfiles);
  await seedCryoSamples(patientData);
  await seedAlerts(patientData);
  await seedCoordinationTasks(patientData, doctorProfiles, nurseProfiles);

  console.log("\n✅  All seed data inserted successfully!\n");
  console.log("Demo login credentials:");
  console.log("  Doctor   → doctor.rajesh@clinic.com   /  DemoDoc@123");
  console.log("  Doctor   → doctor.priya@clinic.com    /  DemoDoc@123");
  console.log("  Nurse    → nurse.elena@clinic.com     /  DemoNurse@123");
  console.log("  Nurse    → nurse.james@clinic.com     /  DemoNurse@123");
  console.log("  Patient  → sarah.jenkins@patient.com  /  DemoPatient@123");
  console.log("  Patient  → elena.rodriguez@patient.com /  DemoPatient@123");
  console.log("  Patient  → jessica.thompson@patient.com / DemoPatient@123");
  console.log("  Patient  → michael.smith@patient.com  /  DemoPatient@123\n");
}

main().catch((err) => {
  console.error("\n❌  Seed failed:", err.message ?? err);
  process.exit(1);
});
