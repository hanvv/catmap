import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { UserStats } from '@/features/user_stats'

const userStatsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/user_stats/')({
  validateSearch: userStatsSearchSchema,
  component: UserStats,
})
