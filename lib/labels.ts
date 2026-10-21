import type {
  BookingStatus,
  EmailCategory,
  EmailUrgency,
  KnowledgeCategory,
  TaskPriority,
} from "@/lib/supabase/database.types";

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const TASK_PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: "bg-surface-muted text-muted",
  medium: "bg-warning-soft text-warning",
  high: "bg-danger-soft text-danger",
};

export const KNOWLEDGE_CATEGORY_LABELS: Record<KnowledgeCategory, string> = {
  rules: "Camp Rules",
  pickup_times: "Pickup Times",
  packing_list: "Packing List",
  policy: "Policy",
  retreat: "Retreats & Rentals",
  other: "Other",
};

export const EMAIL_CATEGORY_LABELS: Record<EmailCategory, string> = {
  pickup: "Pickup / Drop-off",
  medical: "Medical",
  behavior: "Behavior",
  billing: "Billing",
  logistics: "Logistics",
  general: "General",
  retreat: "Retreat Booking",
  registration: "Registration",
  donation: "Donation",
  other: "Other",
};

export const EMAIL_URGENCY_LABELS: Record<EmailUrgency, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export const EMAIL_URGENCY_STYLES: Record<EmailUrgency, string> = {
  low: "bg-surface-muted text-muted",
  medium: "bg-warning-soft text-warning",
  high: "bg-accent-soft text-accent",
  urgent: "bg-danger-soft text-danger",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  inquiry: "Inquiry",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export const BOOKING_STATUS_STYLES: Record<BookingStatus, string> = {
  inquiry: "bg-warning-soft text-warning",
  confirmed: "bg-primary-soft text-primary",
  completed: "bg-surface-muted text-muted",
  cancelled: "bg-danger-soft text-danger",
};
