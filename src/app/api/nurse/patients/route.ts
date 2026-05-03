import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("sb-auth-token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: authData } = await supabaseServer.auth.getUser(token);
    if (!authData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabaseServer
      .from("user_profiles")
      .select("id, role")
      .eq("auth_id", authData.user.id)
      .single();

    if (!profile || (profile.role !== "NURSE" && profile.role !== "DOCTOR")) {
      return NextResponse.json({ error: "Only nurses and doctors can onboard patients" }, { status: 403 });
    }

    const body = await request.json();
    const {
      firstName, lastName, email, phone, dateOfBirth, gender, bloodType, maritalStatus,
      allergies, medicalNotes, emergencyContactName, emergencyContactPhone,
      doctorId, protocol, startDate, cycleNotes,
    } = body;

    if (!firstName || !lastName || !email || !dateOfBirth) {
      return NextResponse.json(
        { error: "Required fields: firstName, lastName, email, dateOfBirth" },
        { status: 400 }
      );
    }

    const { data: patient, error: patientError } = await supabaseServer
      .from("patients")
      .insert({
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        date_of_birth: dateOfBirth,
        gender: gender || null,
        blood_type: bloodType || null,
        marital_status: maritalStatus || null,
        allergies: allergies ? allergies.split(",").map((s: string) => s.trim()).filter(Boolean) : null,
        medical_history: medicalNotes ? { notes: medicalNotes, emergency_contact: emergencyContactName, emergency_phone: emergencyContactPhone } : {},
      })
      .select()
      .single();

    if (patientError) {
      return NextResponse.json({ error: patientError.message }, { status: 400 });
    }

    // Create nurse assignment
    if (profile.role === "NURSE") {
      await supabaseServer.from("nurse_patient_assignments").insert({
        nurse_id: profile.id,
        patient_id: patient.id,
      }).select();
    }

    // Create doctor assignment if a doctor was selected
    if (doctorId) {
      await supabaseServer.from("doctor_patient_assignments").insert({
        doctor_id: doctorId,
        patient_id: patient.id,
        status: "ACTIVE",
      }).select();

      // Create initial IVF cycle if protocol info provided
      if (protocol && startDate) {
        await supabaseServer.from("ivf_cycles").insert({
          patient_id: patient.id,
          doctor_id: doctorId,
          protocol,
          status: "PLANNING",
          start_date: startDate,
          notes: cycleNotes ? { initial: cycleNotes } : {},
        }).select();
      }
    }

    await supabaseServer.from("audit_log").insert({
      user_id: profile.id,
      action: "NURSE_ONBOARD_PATIENT",
      table_name: "patients",
      record_id: patient.id,
      new_data: { first_name: firstName, last_name: lastName, email },
    });

    return NextResponse.json({ success: true, data: patient }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
