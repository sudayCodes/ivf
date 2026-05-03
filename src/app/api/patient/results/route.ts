import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("sb-auth-token")?.value;
    if (!token) return NextResponse.json({ data: [] });

    const { data: authData } = await supabaseServer.auth.getUser(token);
    if (!authData.user) return NextResponse.json({ data: [] });

    const { data: profile } = await supabaseServer
      .from("user_profiles")
      .select("id")
      .eq("auth_id", authData.user.id)
      .single();

    if (!profile) return NextResponse.json({ data: [] });

    const { data: patient } = await supabaseServer
      .from("patients")
      .select("id")
      .eq("user_profile_id", profile.id)
      .single();

    if (!patient) return NextResponse.json({ data: [] });

    const { data: results } = await supabaseServer
      .from("medical_results")
      .select("*")
      .eq("patient_id", patient.id)
      .order("result_date", { ascending: false });

    return NextResponse.json({ data: results ?? [] });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
