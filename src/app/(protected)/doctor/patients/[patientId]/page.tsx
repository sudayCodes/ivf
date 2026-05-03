"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Activity, Pill, FlaskConical, CalendarDays } from "lucide-react";

type Cycle = {
  id: string;
  status: string;
  start_date: string | null;
  end_date: string | null;
};

type Medication = {
  id: string;
  medication_name: string;
  dose: string | null;
  route: string | null;
  start_date: string | null;
  end_date: string | null;
};

type Patient = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  date_of_birth: string | null;
  age: number | null;
  gender: string | null;
  blood_type: string | null;
  marital_status: string | null;
  allergies: string[] | null;
  medical_history: Record<string, any> | null;
  ivf_cycles: Cycle[];
  medications: Medication[];
};

const STATUS_COLORS: Record<string, string> = {
  PLANNING: "bg-slate-100 text-slate-600",
  STIMULATION: "bg-blue-100 text-blue-700",
  RETRIEVAL: "bg-amber-100 text-amber-700",
  FERTILIZATION: "bg-violet-100 text-violet-700",
  TRANSFER: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
};

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-slate-900">{value || "—"}</p>
    </div>
  );
}

export default function PatientEHRPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/doctor/patients/${patientId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setPatient(d.data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [patientId]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-400">
        Loading patient record…
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="space-y-4">
        <Link href="/doctor/patients" className="flex items-center gap-2 text-sm text-[#1A237E] hover:underline">
          <ArrowLeft className="size-4" /> Back to Patients
        </Link>
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          {error || "Patient not found."}
        </div>
      </div>
    );
  }

  const activeAllergies = patient.allergies?.filter(Boolean) ?? [];
  const medNotes = patient.medical_history?.notes;
  const emergencyName = patient.medical_history?.emergency_contact;
  const emergencyPhone = patient.medical_history?.emergency_phone;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/doctor/patients" className="mb-4 flex items-center gap-2 text-sm font-semibold text-[#1A237E] hover:underline">
          <ArrowLeft className="size-4" /> Back to Patients
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-[#1A237E]/10 text-2xl font-extrabold text-[#1A237E]">
            {patient.first_name[0]}{patient.last_name[0]}
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#000666]">
              {patient.first_name} {patient.last_name}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {patient.email}{patient.phone ? ` · ${patient.phone}` : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Demographics card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900">
          <CalendarDays className="size-4 text-[#1A237E]" /> Demographics
        </h2>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
          <InfoRow label="Date of Birth" value={patient.date_of_birth
            ? new Date(patient.date_of_birth).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
            : null}
          />
          {patient.age && <InfoRow label="Age" value={`${patient.age} years`} />}
          <InfoRow label="Gender" value={patient.gender ? patient.gender.charAt(0) + patient.gender.slice(1).toLowerCase() : null} />
          <InfoRow label="Blood Type" value={patient.blood_type} />
          <InfoRow label="Marital Status" value={patient.marital_status} />
        </div>
      </section>

      {/* Medical History card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900">
          <FlaskConical className="size-4 text-[#1A237E]" /> Medical History
        </h2>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Allergies</p>
            {activeAllergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {activeAllergies.map((a) => (
                  <span key={a} className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">{a}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No known allergies</p>
            )}
          </div>
          {medNotes && (
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Clinical Notes</p>
              <p className="text-sm leading-relaxed text-slate-700">{medNotes}</p>
            </div>
          )}
          {emergencyName && (
            <div>
              <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Emergency Contact</p>
              <p className="text-sm text-slate-700">{emergencyName}{emergencyPhone ? ` · ${emergencyPhone}` : ""}</p>
            </div>
          )}
        </div>
      </section>

      {/* IVF Cycles */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900">
          <Activity className="size-4 text-[#1A237E]" /> IVF Cycles
        </h2>
        {patient.ivf_cycles.length === 0 ? (
          <p className="text-sm text-slate-400">No cycles recorded.</p>
        ) : (
          <div className="space-y-3">
            {patient.ivf_cycles.map((cycle) => {
              const colorCls = STATUS_COLORS[cycle.status] ?? "bg-slate-100 text-slate-600";
              return (
                <div key={cycle.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-5 py-4">
                  <div>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${colorCls}`}>
                      {cycle.status.charAt(0) + cycle.status.slice(1).toLowerCase()}
                    </span>
                    <p className="mt-1 text-xs text-slate-400">ID: {cycle.id.slice(0, 8).toUpperCase()}</p>
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    {cycle.start_date && (
                      <p>Started {new Date(cycle.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    )}
                    {cycle.end_date && (
                      <p>Ended {new Date(cycle.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Medications */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900">
          <Pill className="size-4 text-[#1A237E]" /> Current Medications
        </h2>
        {patient.medications.length === 0 ? (
          <p className="text-sm text-slate-400">No medications recorded.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <div className="grid grid-cols-12 bg-slate-50 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
              <div className="col-span-4">Medication</div>
              <div className="col-span-2">Dose</div>
              <div className="col-span-2">Route</div>
              <div className="col-span-4">Duration</div>
            </div>
            {patient.medications.map((med) => (
              <div key={med.id} className="grid grid-cols-12 items-center border-t border-slate-100 px-5 py-3.5">
                <div className="col-span-4 font-semibold text-slate-900">{med.medication_name}</div>
                <div className="col-span-2 text-sm text-slate-600">{med.dose || "—"}</div>
                <div className="col-span-2 text-sm text-slate-600 capitalize">{med.route?.toLowerCase() || "—"}</div>
                <div className="col-span-4 text-xs text-slate-500">
                  {med.start_date
                    ? new Date(med.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                    : "—"}
                  {med.end_date
                    ? ` → ${new Date(med.end_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
                    : " → ongoing"}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
