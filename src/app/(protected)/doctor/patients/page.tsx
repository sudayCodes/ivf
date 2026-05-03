"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, UserPlus, ChevronRight } from "lucide-react";

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
};

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/doctor/patients")
      .then((r) => r.json())
      .then((d) => setPatients(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter((p) => {
    const q = query.toLowerCase();
    return (
      !q ||
      p.first_name.toLowerCase().includes(q) ||
      p.last_name.toLowerCase().includes(q) ||
      p.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#000666]">My Patients</h1>
          <p className="mt-1 text-sm text-slate-500">
            {patients.length} patient{patients.length !== 1 ? "s" : ""} assigned to you
          </p>
        </div>
        <Link
          href="/doctor/dashboard"
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <UserPlus className="size-4" />
          Back to Dashboard
        </Link>
      </header>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm focus:border-[#1A237E] focus:outline-none focus:ring-2 focus:ring-[#1A237E]/20"
          placeholder="Search by name or email…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Patient list */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-12 border-b border-slate-100 bg-slate-50 px-6 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-500">
          <div className="col-span-4">Patient</div>
          <div className="col-span-2">Date of Birth</div>
          <div className="col-span-2">Gender</div>
          <div className="col-span-2">Blood Type</div>
          <div className="col-span-2" />
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">Loading patients…</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-slate-400">
            {query ? "No patients match your search." : "No patients assigned to you yet."}
          </div>
        ) : (
          filtered.map((p) => (
            <Link
              key={p.id}
              href={`/doctor/patients/${p.id}`}
              className="grid grid-cols-12 items-center border-b border-slate-100 px-6 py-4 transition-colors hover:bg-slate-50"
            >
              <div className="col-span-4 flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#1A237E]/10 text-xs font-bold text-[#1A237E]">
                  {p.first_name[0]}{p.last_name[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{p.first_name} {p.last_name}</p>
                  <p className="text-xs text-slate-500">{p.email}</p>
                </div>
              </div>
              <div className="col-span-2 text-sm text-slate-600">
                {p.date_of_birth
                  ? new Date(p.date_of_birth).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "—"}
                {p.age ? <span className="ml-1 text-slate-400">({p.age}y)</span> : null}
              </div>
              <div className="col-span-2 text-sm text-slate-600 capitalize">
                {p.gender ? p.gender.toLowerCase() : "—"}
              </div>
              <div className="col-span-2">
                {p.blood_type ? (
                  <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-600">{p.blood_type}</span>
                ) : (
                  <span className="text-sm text-slate-400">Unknown</span>
                )}
              </div>
              <div className="col-span-2 flex justify-end">
                <span className="flex items-center gap-1 text-xs font-semibold text-[#1A237E]">
                  View EHR <ChevronRight className="size-3.5" />
                </span>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
