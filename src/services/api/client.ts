import type { z } from "zod";

type ApiOptions<T> = Omit<RequestInit, "body"> & {
  schema?: z.ZodType<T, z.ZodTypeDef, unknown>;
  body?: unknown;
};

export async function api<T>(
  path: string,
  opts: ApiOptions<T> = {},
): Promise<T> {
  const { body, schema, ...rest } = opts;
  const res = await fetch(path, {
    ...rest,
    body:
      body !== undefined
        ? typeof body === "string"
          ? body
          : JSON.stringify(body)
        : undefined,

    headers: { "Content-Type": "application/json", ...(rest.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText);
  }
  if (res.status === 204 || res.status === 205) return undefined as T;
  const data = await res.json();
  return schema ? schema.parse(data) : data;
}
