// src/ai/schemas/astro-response.schema.ts
// Zod schema for validating AI responses from Astro assistant.
// NO React, Zustand, or Phaser imports.

import { z } from 'zod'

export const AstroResponseSchema = z.object({
  explanation: z.string().min(10).max(500),
  scienceFact: z.string().max(300).optional(),
  suggestion: z.string().max(200).optional(),
  isGrounded: z.boolean(),
})

export type AstroResponse = z.infer<typeof AstroResponseSchema>
