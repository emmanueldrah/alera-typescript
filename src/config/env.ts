const parseBoolean = (value: string | boolean | undefined, fallback: boolean) => {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return fallback;

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
  return fallback;
};

const parseNumber = (value: string | undefined, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const rawApiBaseUrl = (
  import.meta.env.PROD
    ? '/api'
    : import.meta.env.VITE_API_URL?.trim()
      || import.meta.env.VITE_API_BASE_URL?.trim()
      || '/api'
);

export const frontendEnv = {
  appEnv: import.meta.env.VITE_APP_ENV?.trim() || (import.meta.env.PROD ? 'production' : 'development'),
  apiBaseUrl: trimTrailingSlash(rawApiBaseUrl),
  apiTimeoutMs: parseNumber(import.meta.env.VITE_API_TIMEOUT, 10000),
  enableAnalytics: parseBoolean(import.meta.env.VITE_ENABLE_ANALYTICS, false),
  enableErrorReporting: parseBoolean(import.meta.env.VITE_ENABLE_ERROR_REPORTING, false),
  enableSourceMaps: parseBoolean(import.meta.env.VITE_SOURCEMAP, !import.meta.env.PROD),
  dropConsoleInProduction: parseBoolean(import.meta.env.VITE_DROP_CONSOLE, true),
} as const;
