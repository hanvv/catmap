import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { CatLikes } from '@/features/cat_likes'

const catLikesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/cat_likes/')({
  validateSearch: catLikesSearchSchema,
  component: CatLikes,
})
