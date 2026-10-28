import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().max(10_000).default(''),
});

export const updateNoteSchema = createNoteSchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  { message: 'At least one field is required' },
);

export type CreateNoteDto = z.infer<typeof createNoteSchema>;
export type UpdateNoteDto = z.infer<typeof updateNoteSchema>;
