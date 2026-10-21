import type { createClient } from "@/lib/supabase/server";
import { refreshAccessToken } from "@/lib/google";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export interface CalendarConnection {
  email: string;
  calendarId: string;
  accessToken: string;
  lastSyncedAt: string | null;
}

// Returns a usable access token for the camp's connected calendar, refreshing
// and persisting it when expired. Null when no calendar is connected.
export async function getCalendarConnection(
  supabase: Supabase,
  campId: string
): Promise<CalendarConnection | null> {
  const { data: account } = await supabase
    .from("calendar_accounts")
    .select("*")
    .eq("camp_id", campId)
    .maybeSingle();

  if (!account) return null;

  const expiresAt = new Date(account.expires_at).getTime();
  if (expiresAt - Date.now() >= 60_000) {
    return {
      email: account.email,
      calendarId: account.calendar_id,
      accessToken: account.access_token,
      lastSyncedAt: account.last_synced_at,
    };
  }

  const refreshed = await refreshAccessToken(account.refresh_token);
  const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

  await supabase
    .from("calendar_accounts")
    .update({
      access_token: refreshed.access_token,
      ...(refreshed.refresh_token ? { refresh_token: refreshed.refresh_token } : {}),
      expires_at: newExpiry,
    })
    .eq("camp_id", campId);

  return {
    email: account.email,
    calendarId: account.calendar_id,
    accessToken: refreshed.access_token,
    lastSyncedAt: account.last_synced_at,
  };
}
