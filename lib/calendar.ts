// Server-only Google Calendar REST client. Only the calendar.events scope is
// requested: the app reads and writes events on the camp's calendar and has
// no access to mail or to other Google data.

import { buildAuthUrl as buildGoogleAuthUrl, isGoogleConfigured } from "@/lib/google";

const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

export const CALENDAR_SCOPES = "https://www.googleapis.com/auth/calendar.events";

export function isCalendarConfigured(): boolean {
  return isGoogleConfigured();
}

export function buildCalendarAuthUrl(redirectUri: string, state: string): string {
  return buildGoogleAuthUrl({ redirectUri, state, scopes: CALENDAR_SCOPES });
}

async function calendarFetch(accessToken: string, path: string, init?: RequestInit) {
  const res = await fetch(`${CALENDAR_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`Calendar API ${path} failed: ${res.status} ${await res.text()}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

/** The signed-in account's own address, used to label the connection. */
export async function getCalendarAddress(accessToken: string): Promise<string> {
  const data = await calendarFetch(accessToken, "/calendars/primary");
  return (data?.id as string) ?? "primary";
}

export interface CalendarEvent {
  id: string;
  summary: string;
  location: string | null;
  /** ISO date (all-day) or date-time. */
  start: string;
  end: string;
  allDay: boolean;
  htmlLink: string | null;
}

interface RawEvent {
  id: string;
  summary?: string;
  location?: string;
  htmlLink?: string;
  start?: { date?: string; dateTime?: string };
  end?: { date?: string; dateTime?: string };
}

function toEvent(raw: RawEvent): CalendarEvent {
  const allDay = Boolean(raw.start?.date);
  return {
    id: raw.id,
    summary: raw.summary ?? "(no title)",
    location: raw.location ?? null,
    start: raw.start?.dateTime ?? raw.start?.date ?? "",
    end: raw.end?.dateTime ?? raw.end?.date ?? "",
    allDay,
    htmlLink: raw.htmlLink ?? null,
  };
}

export async function listUpcomingEvents(
  accessToken: string,
  calendarId: string,
  options: { days?: number; maxResults?: number } = {}
): Promise<CalendarEvent[]> {
  const days = options.days ?? 14;
  const timeMin = new Date().toISOString();
  const timeMax = new Date(Date.now() + days * 86_400_000).toISOString();

  const params = new URLSearchParams({
    timeMin,
    timeMax,
    singleEvents: "true",
    orderBy: "startTime",
    maxResults: String(options.maxResults ?? 10),
  });

  const data = await calendarFetch(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`
  );

  return ((data?.items ?? []) as RawEvent[]).map(toEvent);
}

export interface BookingEventInput {
  summary: string;
  description?: string | null;
  /** All-day dates, YYYY-MM-DD. The end date is exclusive in Google's API. */
  startDate: string;
  endDate: string;
}

function eventBody(input: BookingEventInput) {
  // Google treats an all-day event's end date as exclusive, so a group that
  // leaves on the 8th needs an end of the 9th to show across the 8th.
  const endExclusive = new Date(`${input.endDate}T00:00:00Z`);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

  return {
    summary: input.summary,
    description: input.description ?? undefined,
    start: { date: input.startDate },
    end: { date: endExclusive.toISOString().slice(0, 10) },
  };
}

export async function createEvent(
  accessToken: string,
  calendarId: string,
  input: BookingEventInput
): Promise<string> {
  const data = await calendarFetch(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events`,
    { method: "POST", body: JSON.stringify(eventBody(input)) }
  );
  return data.id as string;
}

export async function updateEvent(
  accessToken: string,
  calendarId: string,
  eventId: string,
  input: BookingEventInput
): Promise<void> {
  await calendarFetch(
    accessToken,
    `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    { method: "PATCH", body: JSON.stringify(eventBody(input)) }
  );
}

export async function deleteEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<void> {
  const res = await fetch(
    `${CALENDAR_API}/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
    { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } }
  );
  // A 404/410 means it is already gone, which is the state we wanted.
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw new Error(`Calendar delete failed: ${res.status}`);
  }
}
