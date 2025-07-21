import { z } from "zod"
import { zValidator } from "@hono/zod-validator"

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const signupSchema = z.object({
  email: z.string().regex(emailRegex, { message: "Invalid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

export const signupValidator = zValidator("json", signupSchema, (result, c) => {
  if (!result.success) {
    return c.json(
      {
        // extract nested error messages from zod
        errors: result.error.issues.map((issue) => issue.message),
      },
      400
    )
  }
})
