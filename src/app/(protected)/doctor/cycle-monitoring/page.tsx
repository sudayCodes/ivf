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
const cycleTimeline = ["Day 1", "Day 4", "Day 7", "Day 9", "Today", "Trigger", "Retrieval"] as const;

const hormoneSeries = {
  e2: [20, 35, 45, 65, 90],
  p4: [10, 12, 15, 18, 22],
  lh: [20, 18, 22, 25, 28],
};

const embryoRows = [
  { id: "#EMB-001", d1: "2PN", d3: "8-Cell Grade A", d5: "Expanded", d6: "4AA" },
  { id: "#EMB-002", d1: "2PN", d3: "Fragmentation 20%", d5: "Delayed", d6: "3BC" },
  { id: "#EMB-003", d1: "2PN", d3: "10-Cell Grade A", d5: "Hatching", d6: "5AB" },
];

function MiniTrend({ values }: { values: readonly number[] }) {
  return (
    <div className="flex h-10 w-full items-end overflow-hidden rounded bg-slate-200">
      {values.map((v, idx) => (
        <div
          key={idx}
          className="mx-[1px] flex-1 bg-teal-700/70"
          style={{ height: `${v}%` }}
        />
      ))}
    </div>
  );
}

export default function DoctorCycleMonitoringPage() {
  return (
    <div className="space-y-10 bg-slate-50 text-slate-900">
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Cycle Progression</h2>
          <StatusBadge label="Stimulation Phase" tone="warning" />
        </div>

        <div className="rounded-lg bg-slate-100 p-6">
          <div className="flex items-center">
            {cycleTimeline.map((day, idx) => (
              <div key={day} className="flex flex-1 items-center">
                <div className="flex flex-col items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase ${day === "Today" ? "text-teal-700" : "text-slate-500"}`}>
                    {day}
                  </span>
                  <span
                    className={`size-4 rounded-full ${
                      day === "Today"
                        ? "bg-teal-700 ring-4 ring-teal-100"
                        : day === "Trigger" || day === "Retrieval"
                          ? "border-2 border-slate-300"
                          : "bg-slate-300"
                    }`}
                  />
                </div>
                {idx < cycleTimeline.length - 1 ? (
                  <div
                    className={`mx-2 h-1 flex-1 ${
                      day === "Today" ? "bg-teal-300" : "bg-slate-300"
                    }`}
                  />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-12 gap-6">
        <article className="col-span-12 rounded bg-white p-8 shadow-sm lg:col-span-8">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-slate-900">
                Follicle Growth Distribution
              </h3>
              <p className="text-xs text-slate-600">Daily ultrasound measurement trend (mm)</p>
            </div>
            <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-teal-700" /> Left Ovary
              </span>
              <span className="flex items-center gap-1">
                <span className="size-2 rounded-full bg-slate-900" /> Right Ovary
              </span>
            </div>
          </div>

          <div className="h-64 rounded bg-slate-100 p-4">
            <svg className="h-full w-full" viewBox="0 0 800 200">
              <line x1="0" y1="40" x2="800" y2="40" stroke="#d9dde2" strokeDasharray="4" />
              <line x1="0" y1="80" x2="800" y2="80" stroke="#d9dde2" strokeDasharray="4" />
              <line x1="0" y1="120" x2="800" y2="120" stroke="#d9dde2" strokeDasharray="4" />
              <line x1="0" y1="160" x2="800" y2="160" stroke="#d9dde2" strokeDasharray="4" />
              <path d="M0,180 Q100,175 200,160 T400,120 T600,60 T800,20" fill="none" stroke="#006a6a" strokeWidth="3" />
              <path d="M0,185 Q120,170 240,150 T480,100 T720,50 T800,40" fill="none" stroke="#001736" strokeWidth="3" />
            </svg>
          </div>
        </article>

        <aside className="col-span-12 space-y-4 lg:col-span-4">
          <article className="rounded bg-slate-100 p-6">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-900">
              Hormone Trends
            </h3>
            <div className="space-y-5">
              <div>
                <div className="mb-2 flex items-end justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Estradiol (E2)</span>
                  <span className="text-sm font-bold text-slate-900">2,450 pg/mL</span>
                </div>
                <MiniTrend values={hormoneSeries.e2} />
              </div>
              <div>
                <div className="mb-2 flex items-end justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Progesterone (P4)</span>
                  <span className="text-sm font-bold text-slate-900">0.85 ng/mL</span>
                </div>
                <MiniTrend values={hormoneSeries.p4} />
              </div>
              <div>
                <div className="mb-2 flex items-end justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">LH Surge Track</span>
                  <span className="text-sm font-bold text-slate-900">4.2 mIU/mL</span>
                </div>
                <MiniTrend values={hormoneSeries.lh} />
              </div>
            </div>
          </article>

          <article className="rounded border-l-4 border-teal-700 bg-white p-6 shadow-sm">
            <h4 className="text-sm font-bold text-slate-900">Decision Prompt: Trigger Shot Ready?</h4>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
              Metrics suggest optimal maturity window. Lead follicle &gt; 18mm and
              E2 levels are consistent with egg count.
            </p>
            <div className="mt-4 space-y-2">
              <Button className="w-full rounded bg-slate-900 hover:bg-slate-800">
                Schedule Trigger (Ovidrel)
              </Button>
              <Button variant="secondary" className="w-full rounded">
                Wait 24h & Re-Scan
              </Button>
            </div>
          </article>
        </aside>
      </section>

      <section className="rounded bg-white p-8 shadow-sm">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight">Embryo Development Laboratory</h3>
            <p className="text-sm text-slate-600">Historical Batch Control: #EL-2024-JAN-01</p>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-slate-200 bg-slate-50 hover:bg-slate-50">
              <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Sample ID</TableHead>
              <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Day 1 (Fert)</TableHead>
              <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Day 3 (Cleave)</TableHead>
              <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Day 5 (Blast)</TableHead>
              <TableHead className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Day 6 (Grade)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {embryoRows.map((row) => (
              <TableRow key={row.id} className="border-slate-200/60 hover:bg-slate-50">
                <TableCell className="px-4 py-5 font-bold text-slate-900">{row.id}</TableCell>
                <TableCell className="px-4 py-5 text-slate-700">{row.d1}</TableCell>
                <TableCell className="px-4 py-5 text-slate-700">{row.d3}</TableCell>
                <TableCell className="px-4 py-5 text-slate-700">{row.d5}</TableCell>
                <TableCell className="px-4 py-5 font-bold text-teal-700">{row.d6}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>
    </div>
  );
}
