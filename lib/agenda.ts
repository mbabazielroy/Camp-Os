import type { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { getCalendarConnection } from "@/lib/calendar-account";
import { listUpcomingEvents, type CalendarEvent } from "@/lib/calendar";
import { demoCalendarEvents } from "@/lib/demo/calendar";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export interface Agenda {
  connected: boolean;
  events: CalendarEvent[];
}

/**
 * Upcoming calendar entries for the dashboard. Never throws: a calendar
 * problem should not take the dashboard down with it.
 */
export async function getAgenda(supabase: Supabase, campId: string): Promise<Agenda> {
  if (!isSupabaseConfigured()) {
    return { connected: true, events: demoCalendarEvents() };
  }

  try {
    const connection = await getCalendarConnection(supabase, campId);
    if (!connection) return { connected: false, events: [] };

    const events = await listUpcomingEvents(connection.accessToken, connection.calendarId, {
      days: 14,
      maxResults: 5,
    });
    return { connected: true, events };
  } catch {
    return { connected: false, events: [] };
  }
}

/** "Today, 3:00 PM" / "Nov 6 - Nov 8" for an all-day span. */
export function formatEventWhen(event: CalendarEvent): string {
  if (event.allDay) {
    const start = new Date(`${event.start}T00:00:00`);
    const end = new Date(`${event.end}T00:00:00`);
    const fmt = (d: Date) =>
      d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    // Google's all-day end date is exclusive.
    end.setDate(end.getDate() - 1);
    return end > start ? `${fmt(start)} - ${fmt(end)}` : fmt(start);
  }

  const start = new Date(event.start);
  const today = new Date();
  const sameDay = start.toDateString() === today.toDateString();
  const time = start.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

  if (sameDay) return `Today, ${time}`;

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (start.toDateString() === tomorrow.toDateString()) return `Tomorrow, ${time}`;

  return `${start.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}, ${time}`;
}
