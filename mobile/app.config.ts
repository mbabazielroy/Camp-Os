import type { ConfigContext, ExpoConfig } from 'expo/config';

const WEB_PORT = '3000';

/**
 * Work out the web app's address on the machine Expo is started from, so the
 * phone doesn't have to guess.
 *
 * Cloud dev environments (Codespaces, Gitpod) don't expose a LAN address at
 * all - they forward each port as its own public HTTPS hostname - so the
 * address has to be built here, where those environment variables exist.
 */
function resolveWebAppUrl(): string | null {
  if (process.env.EXPO_PUBLIC_APP_URL) {
    return process.env.EXPO_PUBLIC_APP_URL.replace(/\/+$/, '');
  }

  // GitHub Codespaces: https://<codespace>-<port>.app.github.dev
  const codespace = process.env.CODESPACE_NAME;
  const codespaceDomain = process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN;
  if (codespace && codespaceDomain) {
    return `https://${codespace}-${WEB_PORT}.${codespaceDomain}`;
  }

  // Gitpod: https://<port>-<workspace-host>
  const gitpodUrl = process.env.GITPOD_WORKSPACE_URL;
  if (gitpodUrl) {
    return gitpodUrl.replace('https://', `https://${WEB_PORT}-`).replace(/\/+$/, '');
  }

  // Locally the phone can reach the same LAN address Metro is served from,
  // so let the app derive it at runtime instead.
  return null;
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const webAppUrl = resolveWebAppUrl();

  return {
    ...config,
    name: config.name ?? 'Mill Stream',
    slug: config.slug ?? 'millstream-camp-office',
    extra: {
      ...config.extra,
      // Omitted entirely when unknown, so the app falls back to working the
      // address out from the host Expo served it from.
      ...(webAppUrl ? { webAppUrl } : {}),
    },
  };
};
