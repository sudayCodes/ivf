import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// ── Browser client ──────────────────────────────────────────────────────────
// For use in Client Components ("use client"). Uses anon key, RLS enforced.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// ── Server / API-route client ───────────────────────────────────────────────
// For use in API routes (server-side only).
// Uses service role key when available (bypasses RLS); falls back to anon key.
export const supabaseServer = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// ── Type helpers ────────────────────────────────────────────────────────────
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          auth_id: string;
          first_name: string;
          last_name: string;
          role: "DOCTOR" | "NURSE" | "PATIENT";
          avatar_url: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["user_profiles"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["user_profiles"]["Row"]>;
      };
      patients: {
        Row: {
          id: string;
          user_profile_id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          date_of_birth: string;
          gender: "M" | "F" | "OTHER" | null;
          blood_type: string | null;
          marital_status: string | null;
          medical_history: Record<string, unknown>;
          allergies: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["patients"]["Row"], "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["patients"]["Row"]>;
      };
      ivf_cycles: {
        Row: {
          id: string;
          patient_id: string;
          doctor_id: string;
          protocol: string;
          status: "PLANNING" | "STIMULATION" | "RETRIEVAL" | "TRANSFER" | "COMPLETED" | "CANCELLED";
          start_date: string;
          end_date: string | null;
          baseline_scan_date: string | null;
          trigger_date: string | null;
          retrieval_date: string | null;
          transfer_date: string | null;
          notes: Record<string, unknown>;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["ivf_cycles"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["ivf_cycles"]["Row"]>;
      };
      medications: {
        Row: {
          id: string;
          patient_id: string;
          cycle_id: string;
          prescribed_by: string;
          medication_name: string;
          dose: string | null;
          route: string;
          frequency: string;
          start_date: string;
          end_date: string | null;
          instructions: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      medication_adherence: {
        Row: {
          id: string;
          medication_id: string;
          patient_id: string;
          adherence_date: string;
          status: "TAKEN" | "MISSED" | "HELD";
          notes: string | null;
          confirmed_by_nurse: string | null;
          confirmed_at: string | null;
          created_at: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          cycle_id: string | null;
          appointment_type: "ULTRASOUND" | "BLOODWORK" | "PROCEDURE" | "CONSULTATION" | "FOLLOW_UP";
          scheduled_date: string;
          completed_date: string | null;
          location: string | null;
          notes: string | null;
          status: "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
          created_at: string;
          updated_at: string;
        };
      };
      medical_results: {
        Row: {
          id: string;
          patient_id: string;
          cycle_id: string | null;
          appointment_id: string | null;
          result_type: string;
          result_date: string;
          result_data: Record<string, unknown>;
          interpretation: string | null;
          doctor_id: string;
          created_at: string;
        };
      };
      coordination_tasks: {
        Row: {
          id: string;
          patient_id: string;
          created_by: string;
          assigned_to: string;
          title: string;
          description: string | null;
          task_type: string;
          status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
          priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
          due_date: string | null;
          acknowledged: boolean;
          acknowledged_at: string | null;
          completed_at: string | null;
          completion_notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      patient_complaints: {
        Row: {
          id: string;
          patient_id: string;
          complaint_text: string;
          severity: "LOW" | "NORMAL" | "HIGH" | "URGENT";
          status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
          reported_to_nurse: string | null;
          reported_at: string | null;
          nurse_notes: string | null;
          reported_to_doctor: string | null;
          doctor_notes: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      cryo_samples: {
        Row: {
          id: string;
          patient_id: string;
          cycle_id: string | null;
          sample_type: "EMBRYO" | "SPERM" | "EGG";
          quantity: number | null;
          quality_grade: string | null;
          storage_location: string | null;
          storage_date: string;
          freeze_date: string;
          thaw_date: string | null;
          thaw_status: "FROZEN" | "THAWED" | null;
          viability_after_thaw: number | null;
          notes: Record<string, unknown>;
          created_at: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          patient_id: string;
          alert_type: string;
          message: string;
          severity: "INFO" | "WARNING" | "ALERT";
          visible_to_doctors: boolean;
          visible_to_nurses: boolean;
          visible_to_patient: boolean;
          read_at: string | null;
          created_at: string;
        };
      };
    };
  };
};
