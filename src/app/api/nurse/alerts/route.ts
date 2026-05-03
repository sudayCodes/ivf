import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function GET() {
  try {
    const { data } = await supabaseServer
      .from("alerts")
      .select("*")
      .eq("visible_to_nurses", true)
      .order("created_at", { ascending: false })
      .limit(20);

    return NextResponse.json({ data: data ?? [] });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
