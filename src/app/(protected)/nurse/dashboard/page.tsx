"use client";
import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { StatusBadge } from "@/components/patient/status-badge";
import { Button } from "@/components/ui/button";

export default function NurseDashboardPage() {
  const [assignedTasks, setAssignedTasks] = useState<any[]>([]);
  const [nurseAlerts, setNurseAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tasksRes, alertsRes] = await Promise.all([
          fetch("/api/nurse/tasks"),
          fetch("/api/nurse/alerts"),
        ]);
        const tasksData = await tasksRes.json();
        const alertsData = await alertsRes.json();
        setAssignedTasks(Array.isArray(tasksData) ? tasksData : tasksData.data ?? []);
        setNurseAlerts(alertsData.data ?? []);
      } catch {
        setAssignedTasks([]);
        setNurseAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  const pendingCount = assignedTasks.filter((t) => t.status === "PENDING").length;

  const stats = [
    { id: "s1", label: "Assigned Tasks", value: String(assignedTasks.length).padStart(2, "0"), detail: "Active tasks" },
    { id: "s2", label: "Pending Tasks", value: String(pendingCount).padStart(2, "0"), detail: "Awaiting action" },
    { id: "s3", label: "Active Alerts", value: String(nurseAlerts.length).padStart(2, "0"), detail: "Requiring attention" },
  ];

  const formatTask = (task: any) => ({
    ...task,
    patientName: task.patients?.[0]
      ? `${task.patients[0].first_name} ${task.patients[0].last_name}`
      : "Unknown Patient",
    createdBy: task.user_profiles?.[0]
      ? `${task.user_profiles[0].first_name} ${task.user_profiles[0].last_name}`
      : "Unknown Doctor",
    priority: task.priority === "URGENT" || task.priority === "HIGH" ? "Critical" : "Normal",
    dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString() : "N/A",
  });

  return (
    <div className="space-y-8 bg-background text-on-surface">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary">
            Clinic Operations
          </h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Real-time patient flow and clinical logistics.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="rounded-md border border-outline-variant/15 bg-surface-lowest text-[11px] uppercase tracking-wider text-on-surface hover:bg-surface-low shadow-none">
            Export Log
          </Button>
          <Button asChild className="rounded-md bg-gradient-to-r from-primary to-primary-container text-[11px] uppercase tracking-wider text-primary-foreground hover:opacity-90 shadow-none">
            <Link href="/nurse/medications">Medications</Link>
          </Button>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.id} className="rounded-xl border-l-[3px] border-secondary bg-surface-lowest p-5 relative overflow-hidden backdrop-blur-md shadow-[0_8px_32px_rgba(25,28,30,0.04)]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              {stat.label}
            </p>
            <div className="mt-1 flex items-end gap-2">
              <p className="text-3xl font-black text-primary">{stat.value}</p>
              <p className="text-xs font-semibold text-on-surface-variant">{stat.detail}</p>
            </div>
          </article>
        ))}
      </section>

      {loading ? (
        <div className="rounded-xl bg-surface-lowest p-6 shadow-[0_8px_32px_rgba(25,28,30,0.04)]">
          <p className="text-sm text-on-surface-variant">Loading data...</p>
        </div>
      ) : (
        <>
          {assignedTasks.length > 0 && (
            <section className="rounded-xl bg-surface-lowest shadow-[0_8px_32px_rgba(25,28,30,0.04)] backdrop-blur-md overflow-hidden">
              <div className="flex items-center justify-between bg-surface px-6 py-4 border-b border-surface-dim/30">
                <h2 className="text-lg font-bold text-primary">Assigned Tasks</h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                  {assignedTasks.length} task{assignedTasks.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="divide-y divide-surface-low">
                {assignedTasks.map((task: any) => {
                  const formatted = formatTask(task);
                  return (
                    <div key={task.id} className="p-6 hover:bg-surface transition-colors duration-200">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-base font-bold text-primary">{formatted.patientName}</h3>
                            {task.acknowledged && (
                              <CheckCircle2 className="size-4 text-green-600 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-sm text-on-surface-variant">
                            Task: <span className="font-semibold">{task.title}</span>
                          </p>
                          <p className="text-xs text-on-surface-variant mt-1">
                            Assigned by: {formatted.createdBy}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <StatusBadge
                            label={formatted.priority}
                            tone={formatted.priority === "Critical" ? "danger" : "warning"}
                          />
                          <span className="text-xs font-semibold text-on-surface-variant">
                            Due: {formatted.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {assignedTasks.length === 0 && (
            <div className="rounded-xl bg-surface-lowest p-6 shadow-[0_8px_32px_rgba(25,28,30,0.04)]">
              <p className="text-sm text-on-surface-variant">No tasks assigned at this time.</p>
            </div>
          )}

          <section className="rounded-xl bg-surface-lowest shadow-[0_8px_32px_rgba(25,28,30,0.04)] backdrop-blur-md overflow-hidden">
            <div className="px-6 pt-5 pb-2 border-b border-surface-low flex items-center gap-2">
              <AlertTriangle className="size-4 text-secondary" />
              <h2 className="text-lg font-bold text-primary">Alert Queue</h2>
              {nurseAlerts.length > 0 && (
                <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-secondary/10 text-secondary">
                  {nurseAlerts.length}
                </span>
              )}
            </div>
            <div className="p-6 space-y-3">
              {nurseAlerts.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No active alerts.</p>
              ) : (
                nurseAlerts.map((alert: any) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-lg border-l-2 border-secondary bg-secondary/5 text-sm text-on-surface"
                  >
                    <p className="font-semibold">{alert.alert_type ?? "Alert"}</p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {alert.patient_id} · {alert.message?.slice(0, 80)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
