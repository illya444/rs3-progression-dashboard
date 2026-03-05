import { z } from "zod"

export const usernameSchema = z.object({
  username: z.string().min(1)
})
