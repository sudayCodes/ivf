import { supabaseServer } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TREND_POINTS = [15, 25, 40, 60, 78];

export default async function DoctorLabReportsPage() {
  const { data: results } = await supabaseServer
    .from("medical_results")
    .select("id, result_type, result_date, result_data, interpretation, patients(first_name, last_name)")
    .order("result_date", { ascending: false })
    .limit(3);

  const rows = results ?? [];

  const primaryResult = rows[0];
  const primaryPatient = (primaryResult as any)?.patients as { first_name: string; last_name: string } | null;
  const primaryName = primaryPatient
    ? `${primaryPatient.first_name} ${primaryPatient.last_name}`
    : "Unknown Patient";

  const extractedValues = primaryResult
    ? Object.entries((primaryResult as any).result_data ?? {}).slice(0, 3).map(([marker, val]) => ({
        marker,
        current: String(val),
        previous: "—",
        range: "—",
      }))
    : [
        { marker: "Result Type", current: (primaryResult as any)?.result_type ?? "—", previous: "—", range: "—" },
      ];

  const tabs = rows.map((r: any) => {
    const p = r.patients as { first_name: string; last_name: string } | null;
    const label = p ? `${p.first_name} ${p.last_name.charAt(0)}.` : "Unknown";
    return { id: r.id, label, date: new Date(r.result_date).toLocaleDateString() };
  });

  return (
    <div className="space-y-6 bg-slate-50 text-slate-900">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Lab Reports</h2>
          <p className="text-sm text-slate-600">Professional split-pane report verification workspace</p>
        </div>
        <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-teal-700">
          Live Verification
        </span>
      </header>

      <div className="flex flex-row gap-6">
        <section className="w-1/3 overflow-hidden rounded-lg border border-slate-300 bg-slate-200">
          <div className="flex items-center justify-between border-b border-slate-300 bg-slate-300 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-800">
              {primaryResult ? `REPORT_${primaryResult.id.slice(0, 8).toUpperCase()}.PDF` : "NO_REPORT"}
            </p>
            <div className="flex gap-2 text-slate-700">
              <button className="rounded px-2 py-1 text-xs hover:bg-slate-200">Zoom</button>
              <button className="rounded px-2 py-1 text-xs hover:bg-slate-200">Edit</button>
            </div>
          </div>
          <div className="flex min-h-[72vh] items-center justify-center p-6">
            <div className="aspect-[1/1.414] w-full max-w-sm rounded border border-slate-300 bg-white p-6 text-slate-800 shadow-md">
              <div className="mb-5 border-b border-slate-200 pb-3">
                <h3 className="text-base font-bold">Clinical Lab Report</h3>
                <p className="text-[11px] text-slate-500">Patient: {primaryName}</p>
              </div>
              {extractedValues.length === 0 ? (
                <p className="text-sm text-slate-500">No parsed values available.</p>
              ) : (
                <div className="space-y-2 text-sm">
                  {extractedValues.map((v) => (
                    <p key={v.marker} className="flex justify-between">
                      <span>{v.marker}</span>
                      <span>{v.current}</span>
                    </p>
                  ))}
                </div>
              )}
              {primaryResult && (primaryResult as any).interpretation && (
                <div className="mt-6 rounded border-l-4 border-sky-300 bg-sky-50 p-3 text-xs text-sky-900">
                  {(primaryResult as any).interpretation}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="w-2/3">
          <Tabs defaultValue={tabs[0]?.id ?? "none"} className="h-full rounded-lg border border-slate-200 bg-white p-4">
            <TabsList className="mb-2 w-full justify-start">
              {tabs.map((t) => (
                <TabsTrigger key={t.id} value={t.id}>
                  {t.label} · {t.date}
                </TabsTrigger>
              ))}
              {tabs.length === 0 && <TabsTrigger value="none">No Reports</TabsTrigger>}
            </TabsList>

            {tabs.map((t, idx) => (
              <TabsContent key={t.id} value={t.id} className="space-y-4">
                <article className="overflow-hidden rounded-lg border border-slate-200">
                  <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-700">Parsed Values</h3>
                  </div>
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600">
                      <tr>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest">Marker</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest">Current</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest">Previous</th>
                        <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest">Ref Range</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(idx === 0 ? extractedValues : []).map((row) => (
                        <tr key={row.marker} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-4 font-bold text-slate-900">{row.marker}</td>
                          <td className="px-4 py-4 font-black text-teal-700">{row.current}</td>
                          <td className="px-4 py-4 italic text-slate-500">{row.previous}</td>
                          <td className="px-4 py-4 text-slate-500">{row.range}</td>
                        </tr>
                      ))}
                      {idx !== 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                            Select a report to view parsed values.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </article>

                <article className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-700">Trend Comparison Chart</h3>
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-700">
                      E2 Tracking
                    </span>
                  </div>
                  <div className="relative h-48 rounded-md border border-slate-200 bg-white p-4">
                    <svg className="h-full w-full" viewBox="0 0 400 100">
                      <line x1="0" y1="80" x2="400" y2="80" stroke="#cbd5e1" strokeDasharray="2 2" strokeWidth="0.6" />
                      <line x1="0" y1="50" x2="400" y2="50" stroke="#cbd5e1" strokeDasharray="2 2" strokeWidth="0.6" />
                      <path d={`M0,90 Q50,85 100,70 T200,45 T300,30 T400,${100 - TREND_POINTS[4]}`} fill="none" stroke="#0d9488" strokeWidth="3" />
                      <circle cx="300" cy="30" r="4" fill="#14b8a6" />
                    </svg>
                  </div>
                </article>

                <div className="sticky bottom-0 rounded-lg border border-slate-200 bg-white p-4 shadow-md">
                  <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-8">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-700">Annotation</p>
                      <textarea
                        className="min-h-[100px] w-full rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 placeholder:text-slate-500"
                        placeholder="Add review note, variance comment, or physician handoff details..."
                      />
                    </div>
                    <div className="col-span-4 flex flex-col justify-end gap-3">
                      <Button className="h-11 rounded-md bg-rose-600 text-white hover:bg-rose-500">Flag</Button>
                      <Button className="h-11 rounded-md bg-teal-600 text-white hover:bg-teal-500">Approve</Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}

            {tabs.length === 0 && (
              <TabsContent value="none" className="pt-6 text-sm text-slate-600">
                No lab reports found in the system.
              </TabsContent>
            )}
          </Tabs>
        </section>
      </div>
    </div>
  );
}
