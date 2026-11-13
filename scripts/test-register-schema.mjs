import { z } from 'zod'

const username = z.string().trim().regex(/^[a-zA-Z0-9_\-.]{3,32}$/, '账号需为 3—32 位').transform((s) => s.toLowerCase())
const nickname = z.string().trim().min(1).max(18)
const registerSchema = z.object({
  username,
  nickname,
  password: z.string().max(128).optional(),
  passwordless: z.boolean(),
  role: z.enum(['chef', 'diner']),
  adoptLegacy: z.boolean().default(false),
  inviteId: z.string().max(160).optional(),
})

const body = '{"username":"mp_smoke3","nickname":"smoke3","password":"test123456","passwordless":false,"role":"chef"}'
try {
  console.log('OK', JSON.stringify(registerSchema.parse(JSON.parse(body))))
} catch (e) {
  console.log('FAIL', e.issues ?? e.message)
}
