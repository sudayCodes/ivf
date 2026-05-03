"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  CalendarDays,
  FlaskConical,
  Heart,
  MessageSquareText,
  Microscope,
  Pill,
  Sparkles,
  Stethoscope,
  Upload,
} from "lucide-react";

import { MedicationCard } from "@/components/patient/medication-card";
import { StatusBadge } from "@/components/patient/status-badge";
import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AuroraBackground = dynamic(
  () => import("@/components/ui/aurora-background").then((m) => m.AuroraBackground),
  { ssr: false }
);
const RatingInteraction = dynamic(
  () => import("@/components/ui/emoji-rating").then((m) => m.RatingInteraction),
  { ssr: false }
);
const RadialOrbitalTimeline = dynamic(
  () => import("@/components/ui/radial-orbital-timeline"),
  { ssr: false }
);

const cycleTimelineData = [
  {
    id: 1,
    title: "Consultation",
    date: "Sep 15, 2026",
    content:
      "Initial fertility consultation completed. Full hormone panel reviewed. Protocol designed by Dr. S. Miller.",
    category: "Planning",
    icon: Stethoscope,
    relatedIds: [2],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "Stimulation",
    date: "Oct 4 – Oct 14, 2026",
    content:
      "Day 8 of stimulation. Gonal-F 300 IU + Menopur 75 IU daily. Follicles responding well. E2 trending up.",
    category: "Active",
    icon: Activity,
    relatedIds: [1, 3],
    status: "in-progress" as const,
    energy: 72,
  },
  {
    id: 3,
    title: "Retrieval",
    date: "Est. Oct 16, 2026",
    content:
      "Oocyte retrieval scheduled pending trigger confirmation. Target: 8–12 mature follicles.",
    category: "Upcoming",
    icon: Microscope,
    relatedIds: [2, 4],
    status: "pending" as const,
    energy: 30,
  },
  {
    id: 4,
    title: "Transfer",
    date: "Est. Oct 21, 2026",
    content:
      "Embryo transfer planned for Day 5 blastocyst. Endometrial lining to be confirmed via scan.",
    category: "Upcoming",
    icon: Heart,
    relatedIds: [3, 5],
    status: "pending" as const,
    energy: 15,
  },
  {
    id: 5,
    title: "Result",
    date: "Est. Nov 1, 2026",
    content:
      "Beta hCG blood test scheduled 10 days post-transfer. This is the final phase of your October Protocol.",
    category: "Final",
    icon: Sparkles,
    relatedIds: [4],
    status: "pending" as const,
    energy: 8,
  },
];

export default function PatientDashboardPage() {
  const [firstName, setFirstName] = useState("there");
  const [upcomingAppointment, setUpcomingAppointment] = useState<any>(null);
  const [labReports, setLabReports] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [meRes, apptsRes, resultsRes, medsRes] = await Promise.allSettled([
        fetch("/api/auth/me"),
        fetch("/api/patient/appointments"),
        fetch("/api/patient/results"),
        fetch("/api/patient/medications"),
      ]);

      if (meRes.status === "fulfilled" && meRes.value.ok) {
        const data = await meRes.value.json();
        if (data.user?.firstName) setFirstName(data.user.firstName);
      }

      if (apptsRes.status === "fulfilled" && apptsRes.value.ok) {
        const data = await apptsRes.value.json();
        const upcoming = (data.data ?? []).find(
          (a: any) => a.status === "SCHEDULED" && new Date(a.scheduled_date) >= new Date()
        );
        setUpcomingAppointment(upcoming ?? null);
      }

      if (resultsRes.status === "fulfilled" && resultsRes.value.ok) {
        const data = await resultsRes.value.json();
        setLabReports((data.data ?? []).slice(0, 3));
      }

      if (medsRes.status === "fulfilled" && medsRes.value.ok) {
        const data = await medsRes.value.json();
        setMedications((data.data ?? []).slice(0, 3));
      }
    };

    fetchAll();
  }, []);

  const medCards = medications.map((m: any, idx: number) => ({
    id: m.id,
    name: m.medication_name ?? "Medication",
    dose: m.dose ?? "—",
    route: m.route ?? "Oral",
    time: m.frequency ?? (idx === 0 ? "08:00 AM" : "09:00 PM"),
    status: (m.medication_adherence?.[0]?.status === "TAKEN" ? "taken" : "upcoming") as "taken" | "upcoming",
    note: m.medication_adherence?.[0]?.status === "TAKEN" ? "Confirmed today" : undefined,
  }));

  const apptDateLabel = upcomingAppointment
    ? new Date(upcomingAppointment.scheduled_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "No upcoming";
  const apptTimeLabel = upcomingAppointment
    ? new Date(upcomingAppointment.scheduled_date).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "—";
  const apptWeekday = upcomingAppointment
    ? new Date(upcomingAppointment.scheduled_date).toLocaleDateString("en-US", { weekday: "long" })
    : "—";

  return (
    <div className="space-y-0">
      <AuroraBackground className="min-h-[220px] rounded-2xl" showRadialGradient>
        <div className="relative z-10 px-8 py-10 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-emerald-700">
            Current Status · Active Cycle
          </p>
          <h1 className="text-3xl font-extrabold text-slate-900">
            Good morning, {firstName}. You&apos;re doing great.
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Keep following your medication schedule and stay hydrated.
          </p>
          <span className="mt-4 inline-flex rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-800">
            Active IVF Protocol
          </span>
        </div>
      </AuroraBackground>

      <section className="space-y-3 pt-6">
        <div className="px-1">
          <h2 className="text-xl font-bold text-slate-900">Your IVF Journey</h2>
          <p className="text-sm text-slate-500">
            Click any node to explore that phase of your treatment.
          </p>
        </div>
        <div className="overflow-hidden rounded-2xl">
          <RadialOrbitalTimeline timelineData={cycleTimelineData} />
        </div>
      </section>

      <div className="space-y-6 pt-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <Card className="lg:col-span-5 rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-slate-900">
                Next Appointment
              </CardTitle>
              <p className="text-xs text-slate-500">
                {upcomingAppointment?.appointment_type ?? "No appointment scheduled"}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAppointment ? (
                <>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-xl bg-emerald-700 px-5 py-3 text-white">
                      <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">Date</p>
                      <p className="text-sm font-extrabold">{apptDateLabel}</p>
                    </div>
                    <div>
                      <p className="text-xl font-extrabold text-slate-800">{apptTimeLabel}</p>
                      <p className="text-xs text-slate-500">{apptWeekday}</p>
                    </div>
                    <Button variant="secondary" className="ml-auto rounded-full text-xs">
                      Reschedule
                    </Button>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-800">Clinic Appointment</p>
                    <p className="text-xs text-slate-500">{upcomingAppointment.location ?? "Main Clinic"}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-500">No upcoming appointments. Visit the appointments page to schedule one.</p>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-3 rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold text-slate-900">
                How are you feeling?
              </CardTitle>
              <p className="text-xs text-slate-500">Daily wellbeing check-in</p>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-4">
              <RatingInteraction />
            </CardContent>
          </Card>

          <Card className="lg:col-span-4 rounded-2xl border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900">
                  Recent Lab Reports
                </CardTitle>
                <button className="text-xs font-bold text-emerald-700 hover:text-emerald-600 transition-colors">
                  View All
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {labReports.length === 0 ? (
                <p className="text-sm text-slate-500">No lab results yet.</p>
              ) : (
                labReports.map((report: any) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-3 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FlaskConical className="size-3.5 text-slate-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-slate-900">{report.result_type ?? "Lab Result"}</p>
                        <p className="text-[10px] text-slate-400">
                          {new Date(report.result_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <StatusBadge
                      label={report.interpretation ? "Ready" : "Pending"}
                      tone={report.interpretation ? "success" : "neutral"}
                    />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Pill className="size-4 text-emerald-600" />
              <CardTitle className="text-base font-bold text-slate-900">
                Today&apos;s Medications
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {medCards.length === 0 ? (
              <p className="text-sm text-slate-500">No medications prescribed yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {medCards.map((medication) => (
                  <MedicationCard key={medication.id} {...medication} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3 pb-4">
          <Button className="rounded-full bg-emerald-700 hover:bg-emerald-600 shadow-sm">
            <MessageSquareText className="size-4" />
            Log Symptom
          </Button>
          <Button
            variant="secondary"
            className="rounded-full bg-emerald-100 text-emerald-900 hover:bg-emerald-200 shadow-sm"
          >
            <Upload className="size-4" />
            Upload Report
          </Button>
          <Button variant="secondary" className="rounded-full shadow-sm">
            <CalendarDays className="size-4" />
            Message Nurse
          </Button>
        </div>
      </div>
    </div>
  );
}
