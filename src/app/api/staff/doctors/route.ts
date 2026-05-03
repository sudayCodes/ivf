import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function GET() {
  try {
    const { data } = await supabaseServer
      .from("user_profiles")
      .select("id, first_name, last_name, role")
      .eq("role", "DOCTOR")
      .order("first_name", { ascending: true });

    return NextResponse.json({ data: data ?? [] });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
