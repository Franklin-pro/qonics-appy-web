import type { FetchOptions } from 'ofetch'

export const SESSION_COOKIE = 'qonics_session'

export class ApiError extends Error {
  constructor(message: string, public status = 0) {
    super(message)
    this.name = 'ApiError'
  }
}

/** Every API success is `{ status, message, data }`. */
interface Envelope<T> { status: number; message: string; data: T }

/**
 * Thin $fetch wrapper: base URL from env, bearer token from the session cookie, normalised errors.
 * Returns the envelope's `data` (undefined for endpoints that only answer with a message).
 */
export async function api<T = void>(path: string, options: FetchOptions<'json'> = {}): Promise<T> {
  const config = useRuntimeConfig()
  const session = useCookie<{ token: string } | null>(SESSION_COOKIE)
  const base = config.public.apiBase as string
  if (!base) throw new ApiError('The API address is not configured. Set NUXT_PUBLIC_API_BASE in .env.', 0)
  try {
    // Nitro's $fetch overloads reject a loosely-typed `method`; this wrapper accepts any ofetch options.
    const request = $fetch as unknown as (url: string, opts: FetchOptions<'json'>) => Promise<Envelope<T> | undefined>
    const res = await request(path, {
      baseURL: base,
      ...options,
      headers: {
        Accept: 'application/json',
        ...(session.value?.token ? { Authorization: `Bearer ${session.value.token}` } : {}),
        ...(options.headers as Record<string, string> | undefined)
      }
    })
    return res?.data as T
  } catch (e: unknown) {
    const err = e as { statusCode?: number; data?: { message?: string }; message?: string }
    throw new ApiError(err.data?.message ?? err.message ?? 'Request failed', err.statusCode ?? 0)
  }
}
