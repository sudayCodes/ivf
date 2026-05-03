"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Stethoscope,
  User,
  UserCheck,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

// ── Types ────────────────────────────────────────────────────────────────────

type FormData = {
  // Step 1 — Demographics
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  maritalStatus: string;
  phone: string;
  email: string;
  // Step 2 — Medical History
  allergies: string;
  medicalNotes: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  // Step 3 — Cycle Setup
  doctorId: string;
  protocol: string;
  startDate: string;
  cycleNotes: string;
};

const INITIAL: FormData = {
  firstName: "", lastName: "", dateOfBirth: "", gender: "", bloodType: "",
  maritalStatus: "", phone: "", email: "",
  allergies: "", medicalNotes: "", emergencyContactName: "", emergencyContactPhone: "",
  doctorId: "", protocol: "", startDate: "", cycleNotes: "",
};

const STEPS = [
  { id: 1, label: "Demographics", icon: User },
  { id: 2, label: "Medical History", icon: ClipboardList },
  { id: 3, label: "Cycle Setup", icon: Stethoscope },
  { id: 4, label: "Review", icon: UserCheck },
];

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const PROTOCOLS = ["Antagonist Protocol", "Agonist / Long Protocol", "Mini-IVF", "Natural Cycle IVF", "FET Protocol"];

// ── Field helpers ─────────────────────────────────────────────────────────────

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}{required && <span className="ml-0.5 text-rose-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1A237E]/30 focus:border-[#1A237E]";
const selectCls = `${inputCls} cursor-pointer`;

// ── Main page ─────────────────────────────────────────────────────────────────

export default function NurseOnboardingPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(INITIAL);
  const [doctors, setDoctors] = useState<{ id: string; first_name: string; last_name: string }[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetch("/api/staff/doctors")
      .then((r) => r.json())
      .then((d) => setDoctors(d.data ?? []))
      .catch(() => {});
  }, []);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const canAdvance = () => {
    if (step === 1) return form.firstName && form.lastName && form.email && form.dateOfBirth;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/nurse/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create patient");
      setSuccess({ id: data.data.id, name: `${form.firstName} ${form.lastName}` });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Success state ──────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-6 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="size-10 text-emerald-600" />
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Patient Onboarded</h2>
          <p className="mt-2 text-slate-600">
            <span className="font-semibold text-[#1A237E]">{success.name}</span> has been successfully registered.
          </p>
          <p className="mt-1 text-xs text-slate-400">Patient ID: {success.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => { setSuccess(null); setForm(INITIAL); setStep(1); }}
            className="rounded-xl bg-[#1A237E] hover:bg-[#111a63]"
          >
            Onboard Another Patient
          </Button>
          <Button asChild variant="secondary" className="rounded-xl">
            <Link href="/nurse/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // ── Step indicator ─────────────────────────────────────────────────────────

  const StepBar = () => (
    <div className="flex items-center gap-0">
      {STEPS.map((s, idx) => {
        const done = step > s.id;
        const active = step === s.id;
        const Icon = s.icon;
        return (
          <div key={s.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex size-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                      ? "bg-[#1A237E] text-white shadow-lg shadow-[#1A237E]/25"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {done ? <CheckCircle2 className="size-5" /> : <Icon className="size-4" />}
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wide ${active ? "text-[#1A237E]" : done ? "text-emerald-600" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`mb-5 h-0.5 flex-1 mx-2 ${done ? "bg-emerald-400" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );

  // ── Step 1 — Demographics ──────────────────────────────────────────────────

  const Step1 = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Patient Demographics</h3>
        <p className="mt-1 text-sm text-slate-500">Basic identification and contact details.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="First Name" required>
          <input className={inputCls} placeholder="e.g. Sarah" value={form.firstName} onChange={set("firstName")} />
        </Field>
        <Field label="Last Name" required>
          <input className={inputCls} placeholder="e.g. Jenkins" value={form.lastName} onChange={set("lastName")} />
        </Field>
        <Field label="Date of Birth" required>
          <input className={inputCls} type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} />
        </Field>
        <Field label="Gender">
          <select className={selectCls} value={form.gender} onChange={set("gender")}>
            <option value="">Select gender</option>
            <option value="F">Female</option>
            <option value="M">Male</option>
            <option value="OTHER">Other / Prefer not to say</option>
          </select>
        </Field>
        <Field label="Blood Type">
          <select className={selectCls} value={form.bloodType} onChange={set("bloodType")}>
            <option value="">Unknown</option>
            {BLOOD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Marital Status">
          <select className={selectCls} value={form.maritalStatus} onChange={set("maritalStatus")}>
            <option value="">Select status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
            <option value="Partnered">Partnered</option>
            <option value="Divorced">Divorced</option>
            <option value="Widowed">Widowed</option>
          </select>
        </Field>
        <Field label="Email Address" required>
          <input className={inputCls} type="email" placeholder="patient@example.com" value={form.email} onChange={set("email")} />
        </Field>
        <Field label="Phone Number">
          <input className={inputCls} type="tel" placeholder="+1 (555) 000-0000" value={form.phone} onChange={set("phone")} />
        </Field>
      </div>
    </div>
  );

  // ── Step 2 — Medical History ───────────────────────────────────────────────

  const Step2 = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Medical History</h3>
        <p className="mt-1 text-sm text-slate-500">Allergies, conditions, and emergency contacts.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field label="Known Allergies">
          <input
            className={inputCls}
            placeholder="e.g. Penicillin, Latex, Aspirin (comma-separated)"
            value={form.allergies}
            onChange={set("allergies")}
          />
        </Field>
        <div className="md:col-span-1 flex flex-col justify-end">
          {form.allergies && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {form.allergies.split(",").map((a) => a.trim()).filter(Boolean).map((a) => (
                <span key={a} className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">{a}</span>
              ))}
            </div>
          )}
        </div>
        <div className="md:col-span-2">
          <Field label="Medical History & Pre-existing Conditions">
            <textarea
              className={`${inputCls} min-h-[100px] resize-none`}
              placeholder="Describe relevant medical history, previous surgeries, chronic conditions, or fertility treatments..."
              value={form.medicalNotes}
              onChange={set("medicalNotes")}
            />
          </Field>
        </div>
        <Field label="Emergency Contact Name">
          <input className={inputCls} placeholder="Full name" value={form.emergencyContactName} onChange={set("emergencyContactName")} />
        </Field>
        <Field label="Emergency Contact Phone">
          <input className={inputCls} type="tel" placeholder="+1 (555) 000-0000" value={form.emergencyContactPhone} onChange={set("emergencyContactPhone")} />
        </Field>
      </div>
    </div>
  );

  // ── Step 3 — Cycle Setup ───────────────────────────────────────────────────

  const Step3 = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Cycle Setup</h3>
        <p className="mt-1 text-sm text-slate-500">Assign a doctor and configure the initial IVF protocol. All fields optional.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Field label="Assign to Doctor">
            <select className={selectCls} value={form.doctorId} onChange={set("doctorId")}>
              <option value="">— Select a doctor (optional) —</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.first_name} {d.last_name}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {form.doctorId && (
          <>
            <Field label="Protocol">
              <select className={selectCls} value={form.protocol} onChange={set("protocol")}>
                <option value="">— Select a protocol —</option>
                {PROTOCOLS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Cycle Start Date">
              <input className={inputCls} type="date" value={form.startDate} onChange={set("startDate")} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Initial Clinical Notes">
                <textarea
                  className={`${inputCls} min-h-[80px] resize-none`}
                  placeholder="Initial clinical observations, patient readiness notes..."
                  value={form.cycleNotes}
                  onChange={set("cycleNotes")}
                />
              </Field>
            </div>
          </>
        )}

        {!form.doctorId && (
          <div className="md:col-span-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <p className="text-sm font-semibold text-slate-600">Select a doctor above to configure the initial IVF cycle.</p>
            <p className="mt-1 text-xs text-slate-400">You can assign a doctor and create the cycle later from the patient record.</p>
          </div>
        )}
      </div>
    </div>
  );

  // ── Step 4 — Review ────────────────────────────────────────────────────────

  const selectedDoctor = doctors.find((d) => d.id === form.doctorId);

  const Step4 = () => (
    <div className="space-y-5">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Review & Confirm</h3>
        <p className="mt-1 text-sm text-slate-500">Verify the information before creating the patient record.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Demographics summary */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Demographics</p>
            <button onClick={() => setStep(1)} className="text-xs font-semibold text-[#1A237E] hover:underline">Edit</button>
          </div>
          <p className="text-lg font-bold text-slate-900">{form.firstName} {form.lastName}</p>
          <p className="text-sm text-slate-600">DOB: {form.dateOfBirth || "—"}</p>
          <p className="text-sm text-slate-600">Gender: {form.gender || "—"} · Blood: {form.bloodType || "Unknown"}</p>
          <p className="mt-2 text-sm text-slate-600">{form.email}</p>
          {form.phone && <p className="text-sm text-slate-600">{form.phone}</p>}
        </div>

        {/* Medical summary */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Medical History</p>
            <button onClick={() => setStep(2)} className="text-xs font-semibold text-[#1A237E] hover:underline">Edit</button>
          </div>
          {form.allergies ? (
            <div className="mb-2 flex flex-wrap gap-1">
              {form.allergies.split(",").map((a) => a.trim()).filter(Boolean).map((a) => (
                <span key={a} className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-semibold text-rose-700">{a}</span>
              ))}
            </div>
          ) : (
            <p className="mb-2 text-sm text-slate-400">No known allergies</p>
          )}
          {form.medicalNotes ? (
            <p className="text-xs text-slate-600 leading-relaxed">{form.medicalNotes.slice(0, 120)}{form.medicalNotes.length > 120 ? "..." : ""}</p>
          ) : (
            <p className="text-sm text-slate-400">No additional history</p>
          )}
          {form.emergencyContactName && (
            <p className="mt-2 text-xs text-slate-500">Emergency: {form.emergencyContactName} {form.emergencyContactPhone && `· ${form.emergencyContactPhone}`}</p>
          )}
        </div>

        {/* Cycle summary */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Cycle Setup</p>
            <button onClick={() => setStep(3)} className="text-xs font-semibold text-[#1A237E] hover:underline">Edit</button>
          </div>
          {selectedDoctor ? (
            <>
              <p className="text-sm font-bold text-slate-900">
                Dr. {selectedDoctor.first_name} {selectedDoctor.last_name}
              </p>
              {form.protocol && <p className="text-sm text-slate-600">Protocol: {form.protocol}</p>}
              {form.startDate && <p className="text-sm text-slate-600">Start: {form.startDate}</p>}
            </>
          ) : (
            <p className="text-sm text-slate-400">No doctor assigned — cycle will be set up later.</p>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-sm font-semibold text-rose-700">{error}</p>
        </div>
      )}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#000666]">
          Patient Onboarding
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Register a new patient and configure their initial care protocol.
        </p>
      </header>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Step bar */}
        <div className="border-b border-slate-100 px-8 py-6">
          <StepBar />
        </div>

        {/* Step content */}
        <div className="px-8 py-8">
          {step === 1 && <Step1 />}
          {step === 2 && <Step2 />}
          {step === 3 && <Step3 />}
          {step === 4 && <Step4 />}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between border-t border-slate-100 px-8 py-5">
          <Button
            variant="secondary"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
            className="gap-2 rounded-xl"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>

          <span className="text-xs text-slate-400">Step {step} of {STEPS.length}</span>

          {step < 4 ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canAdvance()}
              className="gap-2 rounded-xl bg-[#1A237E] hover:bg-[#111a63]"
            >
              Continue
              <ArrowRight className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-6"
            >
              {submitting ? "Creating patient..." : "Complete Onboarding"}
              {!submitting && <CheckCircle2 className="size-4" />}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
