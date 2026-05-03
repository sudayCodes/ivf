"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

import { MedicationCard } from "@/components/patient/medication-card";
import { StatusBadge } from "@/components/patient/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function PatientMedicationsPage() {
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patient/medications")
      .then((r) => r.json())
      .then((data) => setMedications(data.data ?? []))
      .catch(() => setMedications([]))
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toISOString().split("T")[0];

  const medCards = medications.map((m: any) => {
    const todayRecord = (m.medication_adherence ?? []).find(
      (a: any) => a.adherence_date === today
    );
    return {
      id: m.id,
      name: m.medication_name ?? "Medication",
      dose: m.dose ?? "—",
      route: m.route ?? "Oral",
      time: m.frequency ?? "Daily",
      status: (todayRecord?.status === "TAKEN" ? "taken" : "upcoming") as "taken" | "upcoming",
      note: todayRecord?.confirmed_at
        ? `Confirmed at ${new Date(todayRecord.confirmed_at).toLocaleTimeString()}`
        : undefined,
    };
  });

  const takenCount = medCards.filter((m) => m.status === "taken").length;
  const adherence = medCards.length > 0 ? Math.round((takenCount / medCards.length) * 100) : 0;

  const adherenceHistory = medications
    .flatMap((m: any) =>
      (m.medication_adherence ?? []).map((a: any) => ({
        id: a.id,
        date: new Date(a.adherence_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        time: a.confirmed_at
          ? new Date(a.confirmed_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
          : "—",
        medication: m.medication_name ?? "Medication",
        dose: m.dose ?? "—",
        status: a.status === "TAKEN" ? "Completed" : a.status === "MISSED" ? "Missed" : "Held",
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  if (loading) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-3xl font-extrabold text-slate-900">Medication Tracker</h1>
        </header>
        <p className="text-sm text-slate-500">Loading medications...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="mb-2">
        <h1 className="text-3xl font-extrabold text-slate-900">Medication Tracker</h1>
      </header>

      {medications.length === 0 ? (
        <p className="text-sm text-slate-500">No medications prescribed yet.</p>
      ) : (
        <>
          {medCards.some((m) => m.status === "upcoming") && (
            <section className="flex items-start gap-3 rounded-xl border-l-4 border-rose-500 bg-rose-100/70 p-4">
              <AlertTriangle className="mt-0.5 size-5 text-rose-700" />
              <div>
                <p className="text-sm font-bold text-rose-800">Pending Medications</p>
                <p className="text-xs text-rose-700">
                  You have medications due today. Please follow your schedule.
                </p>
              </div>
            </section>
          )}

          <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="space-y-4 lg:col-span-8">
              <h2 className="text-lg font-bold text-emerald-900">Daily Timeline</h2>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Morning Schedule
                </p>
                {medCards[0] && <MedicationCard {...medCards[0]} />}
              </div>
              {medCards.length > 1 && (
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <p className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                    Evening Schedule
                  </p>
                  <div className="grid gap-4 md:grid-cols-2">
                    {medCards.slice(1).map((medication) => (
                      <MedicationCard key={medication.id} {...medication} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <aside className="space-y-4 lg:col-span-4">
              <article className="rounded-2xl bg-white p-6 text-center shadow-sm">
                <h3 className="text-lg font-bold">Weekly Adherence</h3>
                <div
                  className="mx-auto my-5 flex size-36 items-center justify-center rounded-full"
                  style={{
                    background: `conic-gradient(#10b981 ${adherence}%, #e2e8f0 ${adherence}% 100%)`,
                  }}
                >
                  <div className="flex size-28 flex-col items-center justify-center rounded-full bg-white">
                    <p className="text-3xl font-extrabold text-emerald-700">{adherence}%</p>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">On Track</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600">
                  {adherence >= 80
                    ? "Excellent consistency. Keep following the protocol."
                    : "Stay on track with your medication schedule."}
                </p>
              </article>
            </aside>
          </section>

          {adherenceHistory.length > 0 && (
            <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="border-b p-6">
                <h2 className="text-lg font-bold">Medication History</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100 hover:bg-slate-100">
                    <TableHead className="px-6 py-4 text-xs uppercase tracking-wide text-slate-500">Date</TableHead>
                    <TableHead className="px-6 py-4 text-xs uppercase tracking-wide text-slate-500">Time</TableHead>
                    <TableHead className="px-6 py-4 text-xs uppercase tracking-wide text-slate-500">Medication</TableHead>
                    <TableHead className="px-6 py-4 text-xs uppercase tracking-wide text-slate-500">Dose</TableHead>
                    <TableHead className="px-6 py-4 text-xs uppercase tracking-wide text-slate-500">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adherenceHistory.map((row) => (
                    <TableRow key={row.id} className="hover:bg-slate-50">
                      <TableCell className="px-6 py-4 text-sm font-semibold">{row.date}</TableCell>
                      <TableCell className="px-6 py-4 text-sm text-slate-500">{row.time}</TableCell>
                      <TableCell className="px-6 py-4 text-sm font-bold">{row.medication}</TableCell>
                      <TableCell className="px-6 py-4 text-sm">{row.dose}</TableCell>
                      <TableCell className="px-6 py-4">
                        <StatusBadge
                          label={row.status}
                          tone={row.status === "Completed" ? "success" : "danger"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          )}
        </>
      )}
    </div>
  );
}
