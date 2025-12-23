import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Cats } from '@/features/cats'

const catsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/cats/')({
  validateSearch: catsSearchSchema,
  component: Cats,
})
