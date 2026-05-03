import { FlaskConical, Microscope, ShieldCheck, TestTube2 } from "lucide-react";

import { supabaseServer } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type CardItem = {
  id: string;
  testType: string;
  sampleDate: string;
  urgency: "high" | "normal";
  meta: string;
};

function UrgencyBadge({ urgency }: { urgency: CardItem["urgency"] }) {
  return urgency === "high" ? (
    <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-700">
      High
    </span>
  ) : (
    <span className="rounded-full bg-teal-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-700">
      Normal
    </span>
  );
}

function EmptyColumn({ label }: { label: string }) {
  return (
    <p className="py-8 text-center text-sm text-slate-500">No {label} results.</p>
  );
}

export default async function DoctorLabBoardPage() {
  const { data: results } = await supabaseServer
    .from("medical_results")
    .select("id, result_type, result_date, interpretation, doctor_id, patients(first_name, last_name)")
    .order("result_date", { ascending: false })
    .limit(40);

  const now = Date.now();
  const DAY = 86_400_000;

  const toCard = (r: any): CardItem => {
    const patient = r.patients as { first_name: string; last_name: string } | null;
    const name = patient ? `${patient.first_name} ${patient.last_name}` : "Unknown";
    return {
      id: r.id,
      testType: r.result_type ?? "Lab Result",
      sampleDate: new Date(r.result_date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      urgency: "normal",
      meta: name,
    };
  };

  const rows = results ?? [];
  const received = rows.filter((r: any) => now - new Date(r.result_date).getTime() < DAY).map(toCard);
  const processing = rows.filter((r: any) => {
    const age = now - new Date(r.result_date).getTime();
    return age >= DAY && age < 3 * DAY && !r.interpretation;
  }).map(toCard);
  const ready = rows.filter((r: any) => {
    const age = now - new Date(r.result_date).getTime();
    return age >= DAY && r.interpretation;
  }).map((r: any) => ({ ...toCard(r), meta: r.interpretation?.slice(0, 40) ?? toCard(r).meta }));
  const reviewed = rows.filter((r: any) => {
    const age = now - new Date(r.result_date).getTime();
    return age >= 3 * DAY && !r.interpretation;
  }).map(toCard);

  const cardClass = (base: string) =>
    `rounded-xl border ${base} p-4 shadow-sm hover:shadow-md transition-shadow`;

  return (
    <div className="space-y-6 bg-slate-50 text-slate-900">
      <header className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Lab Board</h2>
          <p className="text-sm text-slate-600">Embryology workflow in strict Kanban operations mode</p>
        </div>
      </header>

      <Tabs defaultValue="received">
        <TabsList>
          <TabsTrigger value="received" className="gap-1.5">
            <TestTube2 className="size-3.5" />
            Sample Received
            <span className="ml-1 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">{received.length}</span>
          </TabsTrigger>
          <TabsTrigger value="processing" className="gap-1.5">
            <Microscope className="size-3.5" />
            Processing
            <span className="ml-1 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-700">{processing.length}</span>
          </TabsTrigger>
          <TabsTrigger value="ready" className="gap-1.5">
            <FlaskConical className="size-3.5" />
            Results Ready
            <span className="ml-1 rounded-full bg-teal-100 px-1.5 py-0.5 text-[10px] font-bold text-teal-700">{ready.length}</span>
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="gap-1.5">
            <ShieldCheck className="size-3.5" />
            Reviewed
            <span className="ml-1 rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-bold text-green-700">{reviewed.length}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received">
          {received.length === 0 ? <EmptyColumn label="newly received" /> : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {received.map((card) => (
                <article key={card.id} className={cardClass("border-slate-200 bg-white")}>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-xs font-extrabold tracking-wide text-slate-900">{card.id.slice(0, 12)}</p>
                    <UrgencyBadge urgency={card.urgency} />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{card.testType}</p>
                  <p className="mt-2 text-xs text-slate-500">Sample: {card.sampleDate}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{card.meta}</p>
                </article>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="processing">
          {processing.length === 0 ? <EmptyColumn label="processing" /> : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {processing.map((card) => (
                <article key={card.id} className={cardClass("border-blue-100 bg-blue-50")}>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-xs font-extrabold tracking-wide text-slate-900">{card.id.slice(0, 12)}</p>
                    <UrgencyBadge urgency={card.urgency} />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{card.testType}</p>
                  <p className="mt-2 text-xs text-slate-500">Stage: {card.sampleDate}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{card.meta}</p>
                </article>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ready">
          {ready.length === 0 ? <EmptyColumn label="ready" /> : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ready.map((card) => (
                <article key={card.id} className={cardClass("border-teal-100 bg-teal-50")}>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-xs font-extrabold tracking-wide text-slate-900">{card.id.slice(0, 12)}</p>
                    <UrgencyBadge urgency={card.urgency} />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{card.testType}</p>
                  <p className="mt-2 text-xs text-slate-500">{card.sampleDate}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{card.meta}</p>
                </article>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="reviewed">
          {reviewed.length === 0 ? <EmptyColumn label="reviewed" /> : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {reviewed.map((card) => (
                <article key={card.id} className={cardClass("border-green-100 bg-green-50")}>
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="text-xs font-extrabold tracking-wide text-slate-900">{card.id.slice(0, 12)}</p>
                    <UrgencyBadge urgency={card.urgency} />
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{card.testType}</p>
                  <p className="mt-2 text-xs text-slate-500">{card.sampleDate}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{card.meta}</p>
                </article>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
