import type { ZodTypeAny } from 'zod'
import type { Resolver } from 'react-hook-form'

// ponytail: resolver เล็ก ๆ แทนการเพิ่ม dependency @hookform/resolvers
export function zodResolver(schema: ZodTypeAny): Resolver<any> {
  return async (values) => {
    const parsed = schema.safeParse(values)
    if (parsed.success) return { values: parsed.data, errors: {} }
    const errors: Record<string, { type: string; message: string }> = {}
    for (const issue of parsed.error.issues) {
      const key = issue.path.join('.') || '_root'
      if (!errors[key]) errors[key] = { type: issue.code, message: issue.message }
    }
    return { values: {}, errors: errors as any }
  }
}
