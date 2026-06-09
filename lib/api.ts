const API_URL = process.env.NEXT_PUBLIC_API_URL || "/backend-api";

type QueryValue = string | number | boolean | null | undefined;

function getAppOrigin() {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  return "http://localhost:3000";
}

function isAbsoluteUrl(url: string) {
  return url.startsWith("http://") || url.startsWith("https://");
}

function gabungUrl(endpoint: string) {
  const baseUrl = API_URL.replace(/\/$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullPath = `${baseUrl}${cleanEndpoint}`;

  if (isAbsoluteUrl(fullPath)) {
    return fullPath;
  }

  if (typeof window === "undefined") {
    return `${getAppOrigin()}${fullPath}`;
  }

  return fullPath;
}

function bikinUrl(endpoint: string, query?: Record<string, QueryValue>) {
  const fullUrl = gabungUrl(endpoint);

  const url = isAbsoluteUrl(fullUrl)
    ? new URL(fullUrl)
    : new URL(fullUrl, getAppOrigin());

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }

  if (typeof window !== "undefined" && API_URL.startsWith("/")) {
    return `${url.pathname}${url.search}`;
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
        : typeof data === "string" && data
          ? data
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

export async function apiPost<TResponse, TBody = unknown>(
  endpoint: string,
  body: TBody
): Promise<TResponse> {
  const response = await fetch(gabungUrl(endpoint), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse<TResponse>(response);
}

export async function apiPut<TResponse, TBody = unknown>(
  endpoint: string,
  body: TBody
): Promise<TResponse> {
  const response = await fetch(gabungUrl(endpoint), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse<TResponse>(response);
}

export async function apiPatch<TResponse, TBody = unknown>(
  endpoint: string,
  body: TBody
): Promise<TResponse> {
  const response = await fetch(gabungUrl(endpoint), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return handleResponse<TResponse>(response);
}

export async function apiDelete<T>(endpoint: string): Promise<T> {
  const response = await fetch(gabungUrl(endpoint), {
    method: "DELETE",
  });

  return handleResponse<T>(response);
}

export async function apiUpload<T>(
  endpoint: string,
  formData: FormData
): Promise<T> {
  const response = await fetch(gabungUrl(endpoint), {
    method: "POST",
    body: formData,
  });

  return handleResponse<T>(response);
}