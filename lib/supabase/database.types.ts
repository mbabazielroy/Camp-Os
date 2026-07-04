// Hand-written to mirror supabase/schema.sql. Regenerate with the Supabase CLI
// (`supabase gen types typescript`) if the schema drifts from this file.

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "open" | "done";

export type MemberRole = "director" | "staff";

export type KnowledgeCategory =
  | "rules"
  | "pickup_times"
  | "packing_list"
  | "policy"
  | "other";

export type EmailCategory =
  | "pickup"
  | "medical"
  | "behavior"
  | "billing"
  | "logistics"
  | "general"
  | "other";

export type EmailUrgency = "low" | "medium" | "high" | "urgent";
export type EmailDraftStatus = "pending" | "approved" | "dismissed";
export type EmailSource = "manual" | "gmail";

export interface Database {
  public: {
    Tables: {
      camps: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["camps"]["Row"]> & {
          owner_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["camps"]["Row"]>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          camp_id: string | null;
          role: MemberRole;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      camp_invites: {
        Row: {
          id: string;
          camp_id: string;
          email: string;
          role: MemberRole;
          invited_by: string | null;
          accepted_at: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["camp_invites"]["Row"]> & {
          camp_id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["camp_invites"]["Row"]>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          camp_id: string;
          created_by: string | null;
          title: string;
          description: string | null;
          due_date: string | null;
          priority: TaskPriority;
          status: TaskStatus;
          source_email_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tasks"]["Row"]> & {
          camp_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Row"]>;
        Relationships: [];
      };
      knowledge_base: {
        Row: {
          id: string;
          camp_id: string;
          category: KnowledgeCategory;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["knowledge_base"]["Row"]> & {
          camp_id: string;
          title: string;
          content: string;
        };
        Update: Partial<Database["public"]["Tables"]["knowledge_base"]["Row"]>;
        Relationships: [];
      };
      guardians: {
        Row: {
          id: string;
          camp_id: string;
          first_name: string;
          last_name: string;
          email: string | null;
          phone: string | null;
          relationship: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["guardians"]["Row"]> & {
          camp_id: string;
          first_name: string;
          last_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["guardians"]["Row"]>;
        Relationships: [];
      };
      campers: {
        Row: {
          id: string;
          camp_id: string;
          first_name: string;
          last_name: string;
          cabin: string | null;
          age: number | null;
          guardian_id: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["campers"]["Row"]> & {
          camp_id: string;
          first_name: string;
          last_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["campers"]["Row"]>;
        Relationships: [
          {
            foreignKeyName: "campers_guardian_id_fkey";
            columns: ["guardian_id"];
            referencedRelation: "guardians";
            referencedColumns: ["id"];
          },
        ];
      };
      staff: {
        Row: {
          id: string;
          camp_id: string;
          first_name: string;
          last_name: string;
          role: string | null;
          email: string | null;
          phone: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["staff"]["Row"]> & {
          camp_id: string;
          first_name: string;
          last_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["staff"]["Row"]>;
        Relationships: [];
      };
      email_drafts: {
        Row: {
          id: string;
          camp_id: string;
          original_email: string;
          sender_name: string | null;
          sender_email: string | null;
          subject: string | null;
          source: EmailSource;
          gmail_message_id: string | null;
          gmail_thread_id: string | null;
          category: EmailCategory | null;
          urgency: EmailUrgency | null;
          ai_summary: string | null;
          ai_draft: string | null;
          edited_draft: string | null;
          suggested_task_title: string | null;
          suggested_task_due: string | null;
          suggested_task_accepted: boolean;
          status: EmailDraftStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["email_drafts"]["Row"]> & {
          camp_id: string;
          original_email: string;
        };
        Update: Partial<Database["public"]["Tables"]["email_drafts"]["Row"]>;
        Relationships: [];
      };
      gmail_accounts: {
        Row: {
          camp_id: string;
          email: string;
          access_token: string;
          refresh_token: string;
          expires_at: string;
          connected_by: string | null;
          last_synced_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["gmail_accounts"]["Row"]> & {
          camp_id: string;
          email: string;
          access_token: string;
          refresh_token: string;
          expires_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["gmail_accounts"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      user_camp_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
