import { CheckCircle2 } from "lucide-react";

import { supabaseServer } from "@/lib/supabase";
import { StatusBadge } from "@/components/patient/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function NurseMedicationsPage() {
  const today = new Date().toISOString().split("T")[0];

  const { data: medRows } = await supabaseServer
    .from("medications")
    .select(`
      id,
      medication_name,
      dose,
      route,
      frequency,
      instructions,
      patient_id,
      patients (id, first_name, last_name),
      medication_adherence (adherence_date, status)
    `)
    .order("created_at", { ascending: false })
    .limit(30);

  const meds = (medRows ?? []).map((m: any) => {
    const patient = m.patients as { id: string; first_name: string; last_name: string } | null;
    const todayAdherence = (m.medication_adherence ?? []).find(
      (a: any) => a.adherence_date === today
    );
    return {
      id: m.id,
      patientId: patient?.id ?? m.patient_id,
      patientName: patient ? `${patient.first_name} ${patient.last_name}` : "Unknown Patient",
      medication: m.medication_name ?? "Unknown",
      dosage: m.dose ?? "—",
      route: m.route ?? "—",
      notes: m.instructions ?? m.frequency ?? "—",
      frequency: m.frequency ?? "—",
      adherenceStatus: todayAdherence?.status ?? "PENDING",
    };
  });

  const firstPatient = meds[0]
    ? { id: meds[0].patientId, name: meds[0].patientName, cycleDay: "Active Cycle" }
    : { id: "—", name: "No patients", cycleDay: "—" };

  const patientMeds = meds.filter((m) => m.patientId === firstPatient.id).slice(0, 5);

  const scheduleItems = patientMeds.map((m, idx) => ({
    id: m.id,
    time: idx === 0 ? "08:00" : idx === 1 ? "10:30" : "14:00",
    meridiem: idx < 2 ? "AM" : "PM",
    medication: m.medication,
    dosage: m.dosage,
    notes: m.notes,
    status: m.adherenceStatus === "TAKEN" ? "Administered" : m.adherenceStatus === "HELD" ? "Upcoming" : "Pending",
  }));

  const wardMeds = meds.map((m, idx) => ({
    id: m.id,
    dueTime: `0${7 + idx}:30`.slice(-5),
    patient: m.patientName,
    room: `${300 + idx}-${String.fromCharCode(65 + (idx % 3))}`,
    medication: m.medication,
    dose: `${m.route} / ${m.dosage}`,
    status: m.adherenceStatus === "TAKEN" ? "Ready" : idx % 3 === 0 ? "Urgent" : "Upcoming",
  }));

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#000666]">
              {firstPatient.name}
            </h1>
            <div className="mt-2 flex gap-2">
              <StatusBadge label={`ID: ${firstPatient.id.slice(0, 8)}`} />
              <StatusBadge label={firstPatient.cycleDay} tone="warning" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <article className="col-span-12 rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-8">
            <div className="rounded-t-xl bg-slate-100 px-4 py-3">
              <h2 className="text-sm font-bold uppercase tracking-widest text-[#1A237E]">
                Today&apos;s Protocol Schedule
              </h2>
            </div>
            <div className="space-y-2 p-2">
              {scheduleItems.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-slate-500">No medications scheduled today.</p>
              ) : (
                scheduleItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 rounded-lg bg-slate-50 p-4">
                    <div className="w-16 text-center">
                      <p className="text-lg font-black text-slate-800">{item.time}</p>
                      <p className="text-[10px] font-bold uppercase text-slate-500">{item.meridiem}</p>
                    </div>
                    <div className="flex-1 border-l-2 border-slate-300 pl-4">
                      <p className="text-base font-bold text-slate-900">{item.medication}</p>
                      <p className="text-xs text-slate-600">
                        Dosage: {item.dosage} · {item.notes}
                      </p>
                    </div>
                    <div>
                      {item.status === "Administered" ? (
                        <div className="flex items-center gap-2 text-emerald-700">
                          <CheckCircle2 className="size-4" />
                          <span className="text-xs font-bold">Done</span>
                        </div>
                      ) : (
                        <StatusBadge
                          label={item.status}
                          tone={item.status === "Pending" ? "danger" : "neutral"}
                        />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </article>

          <aside className="col-span-12 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-4">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-[#1A237E]">
              Shift Handover Notes
            </h3>
            <textarea
              rows={8}
              defaultValue="Review medication schedule with incoming shift. Ensure all administered doses are logged."
              className="w-full resize-none rounded-lg bg-slate-100 p-3 text-sm"
            />
          </aside>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between bg-slate-100 px-6 py-4">
          <h2 className="text-xl font-black tracking-tight text-slate-800">
            Ward-Wide Due Medications
          </h2>
          <StatusBadge label={`${wardMeds.filter((w) => w.status === "Urgent").length} Overdue`} tone="danger" />
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50 hover:bg-slate-50">
              <TableHead className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Due Time</TableHead>
              <TableHead className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Patient</TableHead>
              <TableHead className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Medication</TableHead>
              <TableHead className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Route/Dose</TableHead>
              <TableHead className="px-6 py-3 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Status</TableHead>
              <TableHead className="px-6 py-3 text-right text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {wardMeds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                  No ward medications due.
                </TableCell>
              </TableRow>
            ) : (
              wardMeds.map((row) => (
                <TableRow key={row.id} className="hover:bg-slate-50">
                  <TableCell className="px-6 py-4 font-mono text-sm font-bold text-slate-800">{row.dueTime}</TableCell>
                  <TableCell className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{row.patient}</p>
                    <p className="text-[10px] text-slate-500">Room {row.room}</p>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-sm font-semibold text-slate-800">{row.medication}</TableCell>
                  <TableCell className="px-6 py-4 text-sm text-slate-700">{row.dose}</TableCell>
                  <TableCell className="px-6 py-4">
                    <StatusBadge
                      label={row.status}
                      tone={
                        row.status === "Urgent"
                          ? "danger"
                          : row.status === "Upcoming"
                            ? "warning"
                            : "neutral"
                      }
                    />
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <button className="rounded px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1A237E] hover:bg-slate-100">
                      Process
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
