const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const UNAUTHORIZED_EVENT = "taskos:unauthorized";

let csrfToken: string | null = null;
export const setCsrfToken = (token: string | null) => { csrfToken = token; };

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new ApiError("API URL is not configured", 0);

  const response = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(csrfToken && { "X-CSRF-Token": csrfToken }),
      ...options.headers
    }
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    throw new ApiError(result.message || "API request failed", response.status);
  }
  return result.data;
}

export const send = <T>(method: string, path: string, body?: unknown) =>
  api<T>(path, { method, body: body === undefined ? undefined : JSON.stringify(body) });
