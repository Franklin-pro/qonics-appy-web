import type { FetchOptions } from 'ofetch'

export const SESSION_COOKIE = 'qonics_session'

/** True when no backend URL is configured: services then use the labelled demo data in ./mock. */
export function isDemoMode() {
  return !useRuntimeConfig().public.apiBase
}

export class ApiError extends Error {
  constructor(message: string, public status = 0) {
    super(message)
    this.name = 'ApiError'
  }
}

/** Thin $fetch wrapper: base URL from env, bearer token from the session cookie, normalised errors. */
export async function api<T>(path: string, options: FetchOptions<'json'> = {}): Promise<T> {
  const config = useRuntimeConfig()
  const session = useCookie<{ token: string } | null>(SESSION_COOKIE)
  try {
    // Nitro's $fetch overloads reject a loosely-typed `method`; this wrapper accepts any ofetch options.
    const request = $fetch as unknown as (url: string, opts: FetchOptions<'json'>) => Promise<T>
    return await request(path, {
      baseURL: config.public.apiBase as string,
      ...options,
      headers: {
        Accept: 'application/json',
        ...(session.value?.token ? { Authorization: `Bearer ${session.value.token}` } : {}),
        ...(options.headers as Record<string, string> | undefined)
      }
    })
  } catch (e: unknown) {
    const err = e as { statusCode?: number; data?: { message?: string }; message?: string }
    throw new ApiError(err.data?.message ?? err.message ?? 'Request failed', err.statusCode ?? 0)
  }
}
