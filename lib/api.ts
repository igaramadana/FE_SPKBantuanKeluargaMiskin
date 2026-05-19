// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL belum diset.");
}

type QueryValue = string | number | boolean | null | undefined;

function bikinUrl(endpoint: string, query?: Record<string, QueryValue>) {
  const url = new URL(`${API_URL}${endpoint}`);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "detail" in data
        ? String(data.detail)
        : "Terjadi kesalahan pada server.";

    throw new Error(message);
  }

  return data as T;
}

export async function apiGet<T>(
  endpoint: string,
  query?: Record<string, QueryValue>
): Promise<T> {
  const response = await fetch(bikinUrl(endpoint, query), {
    method: "GET",
    cache: "no-store",
  });

  return handleResponse<T>(response);
}

export async function apiPost<TResponse, TBody>(
  endpoint: string,
  body: TBody
): Promise<TResponse> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse<TResponse>(response);
}

export async function apiPut<TResponse, TBody>(
  endpoint: string,
  body: TBody
): Promise<TResponse> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse<TResponse>(response);
}

export async function apiPatch<TResponse, TBody>(
  endpoint: string,
  body: TBody
): Promise<TResponse> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse<TResponse>(response);
}

export async function apiDelete<TResponse>(endpoint: string): Promise<TResponse> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "DELETE",
  });

  return handleResponse<TResponse>(response);
}

export async function apiUpload<TResponse>(
  endpoint: string,
  formData: FormData
): Promise<TResponse> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    body: formData,
  });

  return handleResponse<TResponse>(response);
}