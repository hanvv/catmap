import { z } from 'zod'

// 基于数据库表 cat_badges 自动生成

const catBadgeSchema = z.object({
  id: z.number(), // 主键ID
  catId: z.number(), // 猫ID
  badge: z.string(), // 徽章名称
  avatar: z.string().nullable().optional(), // 徽章URL
  createdAt: z.coerce.date().nullable().optional(), // 创建时间
  deleted: z.unknown(), // 1: deleted, 0: normal
  createUser: z.number().nullable().optional(), // 创建人
  modifyUser: z.number().nullable().optional(), // 修改人
})

export type CatBadge = z.infer<typeof catBadgeSchema>

export const catBadgeListSchema = z.array(catBadgeSchema)
