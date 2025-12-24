import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { User } from '@/features/user'

const userSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/user/')({
  validateSearch: userSearchSchema,
  component: User,
})
