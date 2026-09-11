import Constants from 'expo-constants';

export const DEFAULT_WEB_PORT = '3000';

/**
 * Address computed on the dev machine in app.config.ts. This is the only
 * reliable source in cloud dev environments (Codespaces, Gitpod), where each
 * port is a separate public hostname rather than a port on a LAN address.
 */
function configuredUrl(): string | null {
  const fromConfig = Constants.expoConfig?.extra?.webAppUrl;
  return typeof fromConfig === 'string' && fromConfig ? fromConfig : null;
}

/**
 * Where Expo Go loaded this bundle from, e.g. "192.168.1.42:8081" or
 * "my-codespace-8081.app.github.dev".
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
 * Rewrite a forwarded-port hostname to point at a different port.
 * Codespaces encodes the port as a name suffix ("name-8081.app.github.dev"),
 * Gitpod as a prefix ("8081-workspace.gitpod.io") - in both cases the result
 * is HTTPS with no port number.
 */
function rewriteForwardedHost(hostname: string, fromPort: string): string | null {
  if (/\.(app\.github\.dev|githubpreview\.dev)$/i.test(hostname)) {
    const rewritten = hostname.replace(new RegExp(`-${fromPort}\\.`), `-${DEFAULT_WEB_PORT}.`);
    return rewritten === hostname ? null : `https://${rewritten}`;
  }

  if (/\.gitpod\.(io|dev)$/i.test(hostname)) {
    const rewritten = hostname.replace(new RegExp(`^${fromPort}-`), `${DEFAULT_WEB_PORT}-`);
    return rewritten === hostname ? null : `https://${rewritten}`;
  }

  return null;
}

/**
 * The web app almost always runs on the same machine as Metro, just on a
 * different port - so the address can be derived instead of typed in.
 */
export function detectWebAppUrl(): string | null {
  const configured = configuredUrl();
  if (configured) return configured;

  const host = metroHost();
  if (!host) return null;

  const [hostname, port] = host.split(':');
  if (!hostname) return null;

  // A tunnelled session isn't on the LAN, so a derived address would be wrong.
  if (hostname.includes('exp.direct') || hostname.includes('exp.host')) return null;

  const forwarded = rewriteForwardedHost(hostname, port || '8081');
  if (forwarded) return forwarded;

  // A forwarded host we can't rewrite is not a LAN address either - guessing
  // "https://host:3000" would just fail confusingly.
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(hostname) && hostname !== 'localhost') return null;

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
        reason: `The web server answered with HTTP ${response.status}. It is running, but the page failed - check the terminal running the dev server.`,
      };
    }

    // A forwarded port that is still private answers with a login page.
    const isForwarded = /app\.github\.dev|githubpreview\.dev|gitpod\.(io|dev)/i.test(url);
    if (isForwarded && (response.status === 401 || response.status === 403)) {
      return {
        ok: false,
        status: response.status,
        reason:
          'That address is asking for a login, which means the forwarded port is still private. In the PORTS tab, right-click port 3000 and set Port Visibility to Public.',
      };
    }

    // 2xx, 3xx and even 404 mean we reached the app; let the WebView render it.
    return { ok: true, status: response.status };
  } catch (error) {
    const aborted = error instanceof Error && error.name === 'AbortError';
    return {
      ok: false,
      reason: aborted
        ? 'The server did not answer within 8 seconds. Usually a firewall is blocking the port, the phone is on a different network than the computer, or a forwarded port is still private.'
        : 'Could not connect. Nothing is answering at that address from this phone.',
    };
  } finally {
    clearTimeout(timer);
  }
}
