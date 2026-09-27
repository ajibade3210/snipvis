import { z } from "zod";
export async function api<T>(
  path: string,
  opts: RequestInit & { schema?: z.ZodType<T> } = {},
): Promise<T> {
  const res = await fetch(path, {
    ...opts,
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || res.statusText);
  }
  const data = await res.json();
  return opts.schema ? opts.schema.parse(data) : data;
}
