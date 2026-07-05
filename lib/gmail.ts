// Server-only Gmail REST client. Uses plain fetch against the Gmail API so we
// don't need the heavyweight googleapis SDK. Scopes are deliberately minimal:
// read the inbox + create drafts. There is NO gmail.send scope anywhere in
// this app - the AI physically cannot send email, only file drafts for the
// director to review and send from Gmail themselves.

const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me";

export const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.compose",
].join(" ");

export function isGmailConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function buildAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: GMAIL_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}

export async function exchangeCodeForTokens(
  code: string,
  redirectUri: string
): Promise<TokenResponse> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token exchange failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Google token refresh failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function gmailFetch(accessToken: string, path: string, init?: RequestInit) {
  const res = await fetch(`${GMAIL_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  if (!res.ok) {
    throw new Error(`Gmail API ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export async function getGmailAddress(accessToken: string): Promise<string> {
  const profile = await gmailFetch(accessToken, "/profile");
  return profile.emailAddress as string;
}

export interface GmailMessageSummary {
  id: string;
  threadId: string;
}

// Recent inbox messages likely to need a reply (primary inbox, last 7 days).
export async function listInboxMessages(
  accessToken: string,
  maxResults = 10
): Promise<GmailMessageSummary[]> {
  const q = encodeURIComponent("in:inbox category:primary newer_than:7d");
  const data = await gmailFetch(
    accessToken,
    `/messages?q=${q}&maxResults=${maxResults}`
  );
  return (data.messages ?? []) as GmailMessageSummary[];
}

export interface GmailMessage {
  id: string;
  threadId: string;
  from: string;
  fromName: string | null;
  fromEmail: string | null;
  subject: string;
  date: string;
  bodyText: string;
  messageIdHeader: string | null;
}

interface GmailPayloadPart {
  mimeType?: string;
  body?: { data?: string };
  parts?: GmailPayloadPart[];
}

function decodeBase64Url(data: string): string {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
}

function extractPlainText(payload: GmailPayloadPart | undefined): string {
  if (!payload) return "";
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    return decodeBase64Url(payload.body.data);
  }
  for (const part of payload.parts ?? []) {
    const text = extractPlainText(part);
    if (text) return text;
  }
  // Fall back to stripping tags from an HTML-only message.
  if (payload.mimeType === "text/html" && payload.body?.data) {
    return decodeBase64Url(payload.body.data)
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  return "";
}

function parseFromHeader(from: string): { name: string | null; email: string | null } {
  const match = from.match(/^\s*(?:"?([^"<]*)"?\s*)?<([^>]+)>\s*$/);
  if (match) {
    return { name: match[1]?.trim() || null, email: match[2].trim() };
  }
  return { name: null, email: from.trim() || null };
}

export async function getMessage(accessToken: string, id: string): Promise<GmailMessage> {
  const data = await gmailFetch(accessToken, `/messages/${id}?format=full`);
  const headers: { name: string; value: string }[] = data.payload?.headers ?? [];
  const header = (name: string) =>
    headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value ?? "";

  const from = header("From");
  const parsed = parseFromHeader(from);

  return {
    id: data.id,
    threadId: data.threadId,
    from,
    fromName: parsed.name,
    fromEmail: parsed.email,
    subject: header("Subject"),
    date: header("Date"),
    bodyText: extractPlainText(data.payload).slice(0, 20000),
    messageIdHeader: header("Message-ID") || null,
  };
}

// Creates a reply DRAFT in the user's Gmail. Never sends.
export async function createReplyDraft(
  accessToken: string,
  input: {
    threadId: string;
    to: string;
    subject: string;
    body: string;
    inReplyTo?: string | null;
  }
): Promise<{ draftId: string }> {
  const subject = input.subject.toLowerCase().startsWith("re:")
    ? input.subject
    : `Re: ${input.subject}`;

  const headers = [
    `To: ${input.to}`,
    `Subject: ${subject}`,
    'Content-Type: text/plain; charset="UTF-8"',
    "MIME-Version: 1.0",
  ];
  if (input.inReplyTo) {
    headers.push(`In-Reply-To: ${input.inReplyTo}`, `References: ${input.inReplyTo}`);
  }

  const raw = Buffer.from(`${headers.join("\r\n")}\r\n\r\n${input.body}`)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const data = await gmailFetch(accessToken, "/drafts", {
    method: "POST",
    body: JSON.stringify({
      message: { raw, threadId: input.threadId },
    }),
  });

  return { draftId: data.id as string };
}
