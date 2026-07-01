// Hand-written to mirror supabase/schema.sql. Regenerate with the Supabase CLI
// (`supabase gen types typescript`) if the schema drifts from this file.

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "open" | "done";

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

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          camp_name: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          due_date: string | null;
          priority: TaskPriority;
          status: TaskStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tasks"]["Row"]> & {
          user_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Row"]>;
        Relationships: [];
      };
      knowledge_base: {
        Row: {
          id: string;
          user_id: string;
          category: KnowledgeCategory;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["knowledge_base"]["Row"]> & {
          user_id: string;
          title: string;
          content: string;
        };
        Update: Partial<Database["public"]["Tables"]["knowledge_base"]["Row"]>;
        Relationships: [];
      };
      guardians: {
        Row: {
          id: string;
          user_id: string;
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
          user_id: string;
          first_name: string;
          last_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["guardians"]["Row"]>;
        Relationships: [];
      };
      campers: {
        Row: {
          id: string;
          user_id: string;
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
          user_id: string;
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
          user_id: string;
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
          user_id: string;
          first_name: string;
          last_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["staff"]["Row"]>;
        Relationships: [];
      };
      email_drafts: {
        Row: {
          id: string;
          user_id: string;
          original_email: string;
          sender_name: string | null;
          sender_email: string | null;
          category: EmailCategory | null;
          urgency: EmailUrgency | null;
          ai_summary: string | null;
          ai_draft: string | null;
          edited_draft: string | null;
          status: EmailDraftStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["email_drafts"]["Row"]> & {
          user_id: string;
          original_email: string;
        };
        Update: Partial<Database["public"]["Tables"]["email_drafts"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
