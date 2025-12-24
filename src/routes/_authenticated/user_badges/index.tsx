import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { UserBadges } from '@/features/user_badges'

const userBadgesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/user_badges/')({
  validateSearch: userBadgesSearchSchema,
  component: UserBadges,
})
