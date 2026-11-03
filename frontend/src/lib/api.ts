const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function api<T>(path: string, options?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error("API URL is not configured");

  const response = await fetch(`${API_URL}/api/v1${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers }
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "API request failed");
  return result.data;
}
