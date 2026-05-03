import { Search } from "lucide-react";

import { supabaseServer } from "@/lib/supabase";
import { StatusBadge } from "@/components/patient/status-badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function NurseLabReportsPage() {
  const { data: results } = await supabaseServer
    .from("medical_results")
    .select("id, result_type, result_date, interpretation, patients(first_name, last_name)")
    .order("result_date", { ascending: false })
    .limit(20);

  const queue = (results ?? []).map((r: any) => {
    const patient = r.patients as { first_name: string; last_name: string } | null;
    const hasInterpretation = !!r.interpretation;
    return {
      id: r.id,
      file: `${r.result_type ?? "LabResult"}_${r.id.slice(0, 6).toUpperCase()}.pdf`,
      patient: patient ? `${patient.first_name} ${patient.last_name}` : "Unknown Patient",
      mrn: r.id.slice(0, 8).toUpperCase(),
      status: hasInterpretation ? "Ready for Review" : "Processing",
      action: hasInterpretation ? "Forward to Doctor" : "Processing",
    };
  });

  const ready = queue.filter((q) => q.status === "Ready for Review").length;
  const inProgress = queue.filter((q) => q.status === "Processing").length;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-extrabold tracking-tight text-[#000666]">
          Lab Report Uploader
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Submit diagnostics for physician review and protocol adjustment.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <article className="space-y-6 rounded-xl bg-slate-100 p-6 lg:col-span-5">
          <div>
            <h3 className="text-lg font-bold text-[#1A237E]">Patient Context</h3>
            <div className="mt-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  className="w-full rounded-lg bg-white py-3 pl-10 pr-3 text-sm"
                  placeholder="Select Patient (MRN/Name)"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-slate-200 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Ordered By</p>
                  <p className="text-sm font-semibold text-slate-800">Dr. Attending</p>
                </div>
                <div className="rounded-lg bg-slate-200 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Priority</p>
                  <StatusBadge label="Routine" tone="neutral" />
                </div>
              </div>
            </div>
          </div>

          <div className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-white p-10 text-center hover:bg-[#e0e0ff]/40">
            <p className="text-lg font-bold text-slate-800">Drag & Drop Lab Results</p>
            <p className="mt-1 text-xs text-slate-500">PDF, HL7, or DICOM up to 50MB</p>
            <Button className="mt-6 rounded-lg bg-[#1A237E] hover:bg-[#111a63]">
              Browse Files
            </Button>
          </div>
        </article>

        <article className="space-y-5 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1A237E]">Parsing Queue</h2>
            <div className="flex gap-2">
              <StatusBadge label={`${inProgress} In Progress`} tone="warning" />
              <StatusBadge label={`${ready} Ready`} tone="success" />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100 hover:bg-slate-100">
                  <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Document</TableHead>
                  <TableHead className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Patient / MRN</TableHead>
                  <TableHead className="px-4 py-4 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Parsing Status</TableHead>
                  <TableHead className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.15em] text-slate-500">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queue.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">
                      No lab results in queue.
                    </td>
                  </tr>
                ) : (
                  queue.map((row) => (
                    <TableRow key={row.id} className="hover:bg-slate-50">
                      <TableCell className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{row.file}</p>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <p className="text-sm font-semibold text-slate-800">{row.patient}</p>
                        <p className="text-[10px] font-bold text-slate-500">{row.mrn}</p>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <StatusBadge
                          label={row.status}
                          tone={row.status === "Ready for Review" ? "success" : "warning"}
                        />
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <button className="rounded-md bg-[#1A237E] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-white hover:bg-[#111a63]">
                          {row.action}
                        </button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-xl bg-[#1A237E] p-6 text-white">
            <h4 className="text-lg font-bold">Clinic Protocol Note</h4>
            <p className="mt-2 text-sm text-indigo-100">
              Ensure hormone panel results are forwarded directly to the nursing
              lead for dosage adjustments. STAT flags trigger physician alerts.
            </p>
          </div>
        </article>
      </section>
    </div>
  );
}
