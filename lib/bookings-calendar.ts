import type { createClient } from "@/lib/supabase/server";
import { getCalendarConnection } from "@/lib/calendar-account";
import { createEvent, deleteEvent, updateEvent } from "@/lib/calendar";

type Supabase = Awaited<ReturnType<typeof createClient>>;

interface BookingForSync {
  id: string;
  group_name: string;
  start_date: string | null;
  end_date: string | null;
  headcount: number | null;
  contact_name: string | null;
  status: string;
  notes: string | null;
  google_event_id: string | null;
}

function describe(booking: BookingForSync): string {
  return [
    booking.headcount ? `${booking.headcount} people` : null,
    booking.contact_name ? `Contact: ${booking.contact_name}` : null,
    booking.notes,
    "Added by Mill Stream Camp Office.",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Mirrors a booking onto the camp's Google Calendar.
 *
 * Only confirmed bookings with dates get an event - an enquiry that may never
 * happen shouldn't clutter the calendar - and an event is removed again if the
 * booking is cancelled or loses its dates. Failures never block the save: the
 * booking is the record of truth, the calendar is a convenience.
 */
export async function syncBookingToCalendar(
  supabase: Supabase,
  campId: string,
  bookingId: string
): Promise<void> {
  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "id, group_name, start_date, end_date, headcount, contact_name, status, notes, google_event_id"
    )
    .eq("id", bookingId)
    .eq("camp_id", campId)
    .maybeSingle();

  if (!booking) return;

  let connection;
  try {
    connection = await getCalendarConnection(supabase, campId);
  } catch {
    return; // Token refresh failed; leave the booking saved and move on.
  }
  if (!connection) return;

  const shouldHaveEvent =
    (booking.status === "confirmed" || booking.status === "completed") &&
    Boolean(booking.start_date);

  try {
    if (!shouldHaveEvent) {
      if (booking.google_event_id) {
        await deleteEvent(connection.accessToken, connection.calendarId, booking.google_event_id);
        await supabase
          .from("bookings")
          .update({ google_event_id: null })
          .eq("id", booking.id)
          .eq("camp_id", campId);
      }
      return;
    }

    const input = {
      summary: booking.group_name,
      description: describe(booking as BookingForSync),
      startDate: booking.start_date as string,
      endDate: (booking.end_date ?? booking.start_date) as string,
    };

    if (booking.google_event_id) {
      await updateEvent(
        connection.accessToken,
        connection.calendarId,
        booking.google_event_id,
        input
      );
    } else {
      const eventId = await createEvent(connection.accessToken, connection.calendarId, input);
      await supabase
        .from("bookings")
        .update({ google_event_id: eventId })
        .eq("id", booking.id)
        .eq("camp_id", campId);
    }

    await supabase
      .from("calendar_accounts")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("camp_id", campId);
  } catch {
    // Calendar is best-effort; the booking itself is already saved.
  }
}

export async function removeBookingFromCalendar(
  supabase: Supabase,
  campId: string,
  eventId: string | null
): Promise<void> {
  if (!eventId) return;
  try {
    const connection = await getCalendarConnection(supabase, campId);
    if (!connection) return;
    await deleteEvent(connection.accessToken, connection.calendarId, eventId);
  } catch {
    // Best-effort.
  }
}
