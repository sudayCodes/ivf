import { AlertTriangle } from "lucide-react";

import { supabaseServer } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

const STATIC_VITALS = [
  { metric: "BP", value: "145/95", status: "Elevated" },
  { metric: "Heart Rate", value: "88 bpm", status: "Normal" },
  { metric: "Temp", value: "37.2°C", status: "Normal" },
  { metric: "O2 Sat", value: "98%", status: "Stable" },
];

export default async function DoctorCriticalCarePage() {
  const [{ data: alertRows }, { data: labRows }] = await Promise.all([
    supabaseServer
      .from("alerts")
      .select("id, patient_id, alert_type, message, severity, created_at, patients(first_name, last_name)")
      .eq("visible_to_doctors", true)
      .order("created_at", { ascending: false })
      .limit(10),
    supabaseServer
      .from("medical_results")
      .select("id, result_type, result_date, result_data, interpretation, patients(first_name, last_name)")
      .order("result_date", { ascending: false })
      .limit(6),
  ]);

  const criticalAlerts = (alertRows ?? []).map((a: any) => {
    const patient = a.patients as { first_name: string; last_name: string } | null;
    return {
      id: a.id,
      name: patient ? `${patient.first_name} ${patient.last_name}` : "Unknown Patient",
      risk: a.message ?? "",
      severity: a.severity === "ALERT" ? "Critical" : "Urgent",
      updated: new Date(a.created_at).toLocaleDateString(),
    };
  });

  const labResults = (labRows ?? []).map((r: any) => ({
    parameter: r.result_type ?? "Lab Result",
    current: typeof r.result_data === "object" ? JSON.stringify(r.result_data).slice(0, 30) : String(r.result_data ?? "—"),
    previous: r.interpretation ?? "Pending review",
    trend: "flat" as const,
  }));

  const primaryPatient = criticalAlerts[0];

  return (
    <div className="grid grid-cols-12 gap-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <aside className="col-span-12 max-h-[calc(100vh-9rem)] overflow-y-auto border-r bg-slate-100 p-6 lg:col-span-3">
        <h2 className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
          Priority Alerts ({criticalAlerts.length})
        </h2>
        {criticalAlerts.length === 0 ? (
          <p className="text-sm text-slate-500">No critical alerts.</p>
        ) : (
          <div className="space-y-3">
            {criticalAlerts.map((patient, index) => (
              <article
                key={patient.id}
                className={`rounded p-4 ${
                  index === 0 ? "border-l-4 border-red-600 bg-white" : "bg-slate-200/70"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">#{patient.id.slice(0, 8)}</p>
                  <span className="bg-rose-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-700">
                    {patient.severity}
                  </span>
                </div>
                <p className="font-bold text-slate-900">{patient.name}</p>
                <p className="mt-1 text-[11px] text-slate-600">{patient.risk.slice(0, 80)}</p>
                <p className="mt-2 text-[10px] text-slate-500">{patient.updated}</p>
              </article>
            ))}
          </div>
        )}
      </aside>

      <section className="col-span-12 max-h-[calc(100vh-9rem)] overflow-y-auto p-8 lg:col-span-9">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-bold text-slate-900">
              {primaryPatient?.name ?? "No Active Patient"}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {primaryPatient ? `Alert: ${primaryPatient.risk.slice(0, 80)}` : "No critical alerts at this time."}
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="rounded bg-red-700 hover:bg-red-600">
              Notify Senior Consultant
            </Button>
            <Button variant="secondary" className="rounded">
              Export Chart
            </Button>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-12 gap-6">
          <article className="col-span-12 rounded bg-slate-100 p-6 lg:col-span-8">
            <h4 className="mb-5 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
              Real-Time Vitals
            </h4>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {STATIC_VITALS.map((v) => (
                <div key={v.metric} className="rounded bg-white p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {v.metric}
                  </p>
                  <p className={`text-xl font-extrabold ${v.status === "Elevated" ? "text-red-700" : "text-slate-900"}`}>
                    {v.value}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold text-slate-600">{v.status}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="col-span-12 flex flex-col items-center justify-center rounded bg-rose-100 p-6 text-center lg:col-span-4">
            <AlertTriangle className="mb-2 size-8 text-red-700" />
            <h4 className="text-xl font-black text-red-700">OHSS RISK</h4>
            <p className="text-xs font-bold uppercase tracking-widest text-red-700">
              Severe fluid shift · Admit for monitoring
            </p>
          </article>
        </div>

        <article className="mb-6 rounded bg-slate-100 p-6">
          <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Recent Lab Observations
          </h4>
          {labResults.length === 0 ? (
            <p className="text-sm text-slate-500">No lab results available.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] uppercase tracking-widest text-slate-500">
                  <th className="pb-2">Parameter</th>
                  <th className="pb-2">Current</th>
                  <th className="pb-2">Interpretation</th>
                  <th className="pb-2 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 text-sm">
                {labResults.map((lab) => (
                  <tr key={lab.parameter}>
                    <td className="py-3 font-semibold">{lab.parameter}</td>
                    <td className="py-3 font-bold text-slate-900">{lab.current}</td>
                    <td className="py-3 text-slate-600">{lab.previous}</td>
                    <td className="py-3 text-right">
                      <span className="text-xs text-slate-500">—</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>

        <article className="rounded bg-slate-100 p-6">
          <h4 className="mb-4 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Critical Clinical Notes
          </h4>
          <textarea
            className="h-28 w-full rounded bg-white p-4 text-sm"
            placeholder="Type critical observation, assessment, or plan here..."
          />
        </article>
      </section>
    </div>
  );
}
