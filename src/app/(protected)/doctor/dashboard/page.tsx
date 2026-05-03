import { supabaseServer } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

export default async function DoctorDashboardPage() {
  const [
    { count: patientCount },
    { count: alertCount },
    { count: resultsCount },
    { count: cyclesCount },
    { data: cycleRows },
    { data: alertRows },
  ] = await Promise.all([
    supabaseServer.from("patients").select("*", { count: "exact", head: true }),
    supabaseServer
      .from("alerts")
      .select("*", { count: "exact", head: true })
      .eq("visible_to_doctors", true),
    supabaseServer
      .from("medical_results")
      .select("*", { count: "exact", head: true }),
    supabaseServer
      .from("ivf_cycles")
      .select("*", { count: "exact", head: true })
      .in("status", ["STIMULATION", "RETRIEVAL", "TRANSFER"]),
    supabaseServer
      .from("ivf_cycles")
      .select("id, status, start_date, patient_id, patients(id, first_name, last_name)")
      .in("status", ["STIMULATION", "RETRIEVAL", "TRANSFER", "PLANNING"])
      .limit(10),
    supabaseServer
      .from("alerts")
      .select("*")
      .eq("visible_to_doctors", true)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const stats = [
    { id: "d1", label: "Active Patients", value: String(patientCount ?? 0), detail: "Registered patients", tone: "navy" },
    { id: "d2", label: "Critical Alerts", value: String(alertCount ?? 0).padStart(2, "0"), detail: "Requires attention", tone: "red" },
    { id: "d3", label: "Lab Results", value: String(resultsCount ?? 0).padStart(2, "0"), detail: "In system", tone: "teal" },
    { id: "d4", label: "Active IVF Cycles", value: String(cyclesCount ?? 0).padStart(2, "0"), detail: "Stimulation / Retrieval / Transfer", tone: "dark" },
  ] as const;

  const schedule = (cycleRows ?? []).map((c: any) => {
    const patient = c.patients as { id: string; first_name: string; last_name: string } | null;
    const startDate = c.start_date ? new Date(c.start_date) : new Date();
    const cycleDay = Math.max(1, Math.floor((Date.now() - startDate.getTime()) / 86_400_000) + 1);
    return {
      id: patient?.id ?? c.id,
      name: patient ? `${patient.first_name} ${patient.last_name}` : "Unknown Patient",
      cycleDay: `Day ${cycleDay}`,
      stage: c.status.charAt(0) + c.status.slice(1).toLowerCase().replace("_", " "),
      startDate: startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
  });

  const alerts = (alertRows ?? []).map((a: any) => ({
    id: a.id,
    title: a.alert_type ?? "Alert",
    patient: a.patient_id ?? "Unknown",
    message: a.message ?? "",
    severity: a.severity === "ALERT" ? "critical" : "urgent",
  }));

  return (
    <div className="space-y-10 bg-background text-on-surface">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Clinical Overview</h2>
        <p className="text-sm text-on-surface-variant">
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · Laboratory Operations Active
        </p>
      </div>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {stats.map((stat) => (
          <article
            key={stat.id}
            className={`min-h-[130px] p-6 rounded-xl relative overflow-hidden backdrop-blur-md ${
              stat.tone === "red"
                ? "bg-error/10 text-error shadow-[0_8px_32px_rgba(186,26,26,0.04)]"
                : stat.tone === "dark"
                  ? "bg-surface-dim text-on-surface shadow-[0_8px_32px_rgba(25,28,30,0.04)]"
                  : "bg-surface-lowest shadow-[0_8px_32px_rgba(25,28,30,0.04)]"
            }`}
          >
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-75">{stat.label}</p>
            <div className="mt-4 flex items-end justify-between">
              <p className="text-4xl font-extrabold tracking-tighter">{stat.value}</p>
              <p className="text-[10px] font-bold">{stat.detail}</p>
            </div>
            {stat.tone === "dark" && (
              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary to-primary-container" />
            )}
          </article>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold">Active Patient Cycles</h3>
            <div className="flex gap-2">
              <Button variant="secondary" className="rounded-md text-[11px] uppercase tracking-wider bg-surface-lowest border border-outline-variant/15 text-on-surface hover:bg-surface-low shadow-none">
                Filter
              </Button>
              <Button className="rounded-md bg-gradient-to-r from-primary to-primary-container text-[11px] uppercase tracking-wider text-primary-foreground hover:opacity-90 shadow-none">
                Add Record
              </Button>
            </div>
          </div>

          <div className="overflow-hidden bg-surface-lowest rounded-xl shadow-[0_8px_32px_rgba(25,28,30,0.04)]">
            {schedule.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-on-surface-variant">
                No active cycles.{" "}
                <Link href="/doctor/patients" className="text-primary underline">
                  View all patients
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-surface-low hover:bg-surface-low">
                    <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Patient Name</TableHead>
                    <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Cycle Day</TableHead>
                    <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Stage</TableHead>
                    <TableHead className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Start Date</TableHead>
                    <TableHead className="px-6 py-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedule.map((row) => (
                    <TableRow key={row.id} className="hover:bg-surface transition-colors duration-200 border-surface-low">
                      <TableCell className="px-6 py-5">
                        <p className="font-bold text-on-surface">{row.name}</p>
                        <p className="text-xs text-on-surface-variant">ID: {row.id}</p>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-sm font-bold text-on-surface">{row.cycleDay}</TableCell>
                      <TableCell className="px-6 py-5">
                        <span className="bg-secondary/15 px-2 py-1 text-[10px] font-bold rounded-full uppercase text-secondary">
                          {row.stage}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-5 text-sm text-on-surface-variant">{row.startDate}</TableCell>
                      <TableCell className="px-6 py-5 text-right">
                        <Link
                          href="/doctor/patients"
                          className="inline-block border border-outline-variant/15 px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-on-surface hover:bg-surface hover:text-primary transition-colors duration-200"
                        >
                          Open EHR
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        <aside className="space-y-4 lg:col-span-4 bg-surface-highest p-6 rounded-xl">
          <h3 className="text-xl font-bold">Critical Alerts</h3>
          {alerts.length === 0 ? (
            <p className="text-sm text-on-surface-variant">No active alerts.</p>
          ) : (
            alerts.map((alert) => (
              <article
                key={alert.id}
                className="p-5 rounded-md relative overflow-hidden backdrop-blur-md shadow-[0_8px_32px_rgba(25,28,30,0.04)] bg-surface-lowest"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${alert.severity === "critical" ? "bg-error" : "bg-tertiary"}`} />
                <p className={`text-[10px] font-extrabold uppercase tracking-widest ${alert.severity === "critical" ? "text-error" : "text-tertiary"}`}>
                  {alert.title}
                </p>
                <p className="mt-1 font-bold text-on-surface headline-sm">{alert.patient}</p>
                <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">{alert.message}</p>
              </article>
            ))
          )}
        </aside>
      </section>
    </div>
  );
}
