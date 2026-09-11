import Constants from 'expo-constants';

export const DEFAULT_WEB_PORT = '3000';

/**
 * Where Expo Go loaded this bundle from, e.g. "192.168.1.42:8081".
 * Expo exposes it under different keys depending on how the app was started,
 * so try each in turn.
 */
function metroHost(): string | null {
  const candidates = [
    Constants.expoConfig?.hostUri,
    Constants.expoGoConfig?.debuggerHost,
    Constants.linkingUri,
  ];

  for (const candidate of candidates) {
    if (typeof candidate !== 'string' || !candidate) continue;
    // Strip any scheme ("exp://", "http://") and path/query.
    const withoutScheme = candidate.replace(/^[a-z+]+:\/\//i, '');
    const hostPort = withoutScheme.split('/')[0].split('?')[0];
    if (hostPort) return hostPort;
  }
  return null;
}

/**
 * The web app almost always runs on the same machine as Metro, just on a
 * different port - so we can derive its address instead of making the user
 * type an IP into a .env file.
 */
export function detectWebAppUrl(): string | null {
  const host = metroHost();
  if (!host) return null;

  const hostname = host.split(':')[0];
  if (!hostname) return null;

  // A tunnelled session (exp.host / .exp.direct) isn't on the LAN, so the
  // derived address would be wrong - better to say we don't know.
  if (hostname.includes('exp.direct') || hostname.includes('exp.host')) return null;

  return `http://${hostname}:${DEFAULT_WEB_PORT}`;
}

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `http://${trimmed}`;
}

export interface ReachabilityResult {
  ok: boolean;
  status?: number;
  reason?: string;
}

/**
 * Ask the server for the page before handing the URL to the WebView, so a
 * failure can be explained instead of showing a blank screen.
 */
export async function checkReachable(
  url: string,
  timeoutMs = 8000
): Promise<ReachabilityResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'text/html' },
    });

    if (response.status >= 500) {
      return {
        ok: false,
        status: response.status,
        reason: `The web server answered with HTTP ${response.status}. It is running, but the page crashed - check the terminal running the dev server.`,
      };
    }

    // 2xx, 3xx and even 401/404 mean we reached the app; let the WebView render it.
    return { ok: true, status: response.status };
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    return {
      ok: false,
      reason: aborted
        ? 'The server did not answer within 8 seconds. Usually this means a firewall is blocking the port, or the phone is on a different network than the computer.'
        : 'Could not connect. Nothing is answering at that address from this phone.',
    };
  } finally {
    clearTimeout(timer);
  }
}
