import type { createClient } from "@/lib/supabase/server";
import { refreshAccessToken } from "@/lib/gmail";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export interface GmailConnection {
  email: string;
  accessToken: string;
  lastSyncedAt: string | null;
}

// Returns a usable access token for the camp's connected Gmail account,
// refreshing and persisting it if expired. Null when not connected.
export async function getGmailConnection(
  supabase: Supabase,
  campId: string
): Promise<GmailConnection | null> {
  const { data: account } = await supabase
    .from("gmail_accounts")
    .select("*")
    .eq("camp_id", campId)
    .maybeSingle();

  if (!account) return null;

  const expiresAt = new Date(account.expires_at).getTime();
  const needsRefresh = expiresAt - Date.now() < 60_000;

  if (!needsRefresh) {
    return {
      email: account.email,
      accessToken: account.access_token,
      lastSyncedAt: account.last_synced_at,
    };
  }

  const refreshed = await refreshAccessToken(account.refresh_token);
  const newExpiry = new Date(Date.now() + refreshed.expires_in * 1000).toISOString();

  await supabase
    .from("gmail_accounts")
    .update({
      access_token: refreshed.access_token,
      // Google occasionally rotates the refresh token too.
      ...(refreshed.refresh_token ? { refresh_token: refreshed.refresh_token } : {}),
      expires_at: newExpiry,
    })
    .eq("camp_id", campId);

  return {
    email: account.email,
    accessToken: refreshed.access_token,
    lastSyncedAt: account.last_synced_at,
  };
}
