import { NextResponse, type NextRequest } from "next/server";
import { requireCamp } from "@/lib/auth";
import { exchangeCodeForTokens, getGmailAddress } from "@/lib/gmail";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const storedState = request.cookies.get("gmail_oauth_state")?.value;

  const fail = (message: string) =>
    NextResponse.redirect(
      new URL("/settings?error=" + encodeURIComponent(message), request.url)
    );

  if (!code || !state || !storedState || state !== storedState) {
    return fail("Gmail connection was cancelled or the request expired. Please try again.");
  }

  try {
    const { supabase, campId, userId } = await requireCamp();

    const redirectUri = new URL("/api/gmail/callback", request.url).toString();
    const tokens = await exchangeCodeForTokens(code, redirectUri);

    if (!tokens.refresh_token) {
      return fail(
        "Google didn't grant offline access. Remove CampFlow from your Google account permissions and try connecting again."
      );
    }

    const email = await getGmailAddress(tokens.access_token);
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString();

    await supabase.from("gmail_accounts").upsert({
      camp_id: campId,
      email,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: expiresAt,
      connected_by: userId,
    });

    const response = NextResponse.redirect(
      new URL(
        "/settings?notice=" + encodeURIComponent(`Gmail connected: ${email}`),
        request.url
      )
    );
    response.cookies.delete("gmail_oauth_state");
    return response;
  } catch {
    return fail("Couldn't complete the Gmail connection. Please try again.");
  }
}
