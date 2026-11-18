/**
 * Same-origin R2 proxy (leazi-style).
 *
 * The browser uploads to `/api/r2?url=<presigned url>` on this Nuxt server instead of
 * PUT-ing to R2 directly. Because the browser only talks to its own origin there is no
 * CORS preflight, so the R2 bucket needs no CORS policy. The server forwards the request
 * to R2 server-side, where CORS does not apply.
 */
const R2_HOST_SUFFIX = '.r2.cloudflarestorage.com'

export default defineEventHandler(async (event) => {
  // Same-origin only: no CORS headers on purpose, so other sites cannot use this as an upload relay.
  const query = getQuery(event)
  const r2Url = query.url as string

  if (!r2Url) {
    throw createError({ statusCode: 400, statusMessage: 'R2 URL is required' })
  }

  let target: URL
  try {
    target = new URL(r2Url)
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid R2 URL' })
  }

  // Only ever forward to our R2 bucket, never an arbitrary host.
  if (target.protocol !== 'https:' || !target.hostname.endsWith(R2_HOST_SUFFIX)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid R2 URL' })
  }

  const method = event.node.req.method || 'GET'
  const init: RequestInit = { method }

  if (method === 'PUT') {
    // Read as a raw Buffer (not utf8) so binary files such as PDFs are not corrupted.
    const body = await readRawBody(event, false)
    init.body = body as unknown as BodyInit
    init.headers = { 'Content-Type': getHeader(event, 'content-type') || 'application/octet-stream' }
  }

  const response = await fetch(target.toString(), init)

  if (!response.ok) {
    throw createError({
      statusCode: response.status,
      statusMessage: `R2 request failed: ${response.statusText}`
    })
  }

  if (method === 'GET') {
    const contentType = response.headers.get('content-type')
    if (contentType) {
      setHeader(event, 'Content-Type', contentType)
    }
    return new Uint8Array(await response.arrayBuffer())
  }

  return { success: true }
})