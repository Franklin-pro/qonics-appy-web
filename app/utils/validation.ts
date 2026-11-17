import { z, type ZodType } from 'zod'

/**
 * Adapter so VeeValidate 4 can consume Zod 4 schemas (the official
 * @vee-validate/zod package targets Zod 3). Errors are keyed by dot-path.
 */
export function zodSchema<T>(schema: ZodType<T>) {
  return {
    __type: 'VVTypedSchema' as const,
    async parse(values: unknown) {
      const result = await schema.safeParseAsync(values)
      if (result.success) return { value: result.data, errors: [] }
      const byPath = new Map<string, string[]>()
      for (const issue of result.error.issues) {
        const path = issue.path.join('.')
        byPath.set(path, [...(byPath.get(path) ?? []), issue.message])
      }
      return { errors: [...byPath].map(([path, errors]) => ({ path, errors })) }
    }
  }
}

export function passwordScore(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++
  if (/\d/.test(pw)) score++
  if (/[^A-Za-z0-9]/.test(pw)) score++
  return score
}

export const optionalUrl = (label: string) =>
  z.string().trim().refine(v => v === '' || /^https?:\/\/\S+\.\S+/.test(v), `${label} must be a full URL starting with http(s)://`)
