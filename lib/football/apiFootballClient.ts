import "server-only";

const DEFAULT_BASE_URL = "https://v3.football.api-sports.io";

export class ApiFootballConfigError extends Error {
  constructor() {
    super("API_FOOTBALL_KEY is missing. Add it to .env.local on the server.");
    this.name = "ApiFootballConfigError";
  }
}

type QueryValue = string | number | boolean | null | undefined;

function getConfig() {
  const apiKey = process.env.API_FOOTBALL_KEY;
  const baseUrl = process.env.API_FOOTBALL_BASE_URL || DEFAULT_BASE_URL;

  if (!apiKey) {
    throw new ApiFootballConfigError();
  }

  return {
    apiKey,
    baseUrl: baseUrl.replace(/\/$/, "")
  };
}

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const { baseUrl } = getConfig();
  const url = new URL(`${baseUrl}${path.startsWith("/") ? path : `/${path}`}`);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url;
}

export async function apiFootballRequest<T>(path: string, query?: Record<string, QueryValue>): Promise<T> {
  const { apiKey } = getConfig();
  const url = buildUrl(path, query);

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-apisports-key": apiKey
    },
    cache: "no-store"
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      errors: {
        http: `API-Football request failed with status ${response.status}`
      },
      response: payload
    } as T;
  }

  return payload as T;
}

export function apiFootballMissingKeyResponse() {
  return {
    errors: {
      config: "API_FOOTBALL_KEY is missing. Add API_FOOTBALL_KEY to .env.local. Do not expose it with NEXT_PUBLIC_."
    },
    response: []
  };
}
