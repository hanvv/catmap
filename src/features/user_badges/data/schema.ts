import { z } from 'zod'

// 基于数据库表 user_badges 自动生成

const userBadgeSchema = z.object({
  id: z.number(), // 主键ID
  userId: z.number(), // 用户ID
  badge: z.string(), // 徽章名称
  createdAt: z.coerce.date().nullable().optional(), // 创建时间
  deleted: z.unknown(), // 1: deleted, 0: normal
  createUser: z.number().nullable().optional(), // 创建人
  modifyUser: z.number().nullable().optional(), // 修改人
})

export type UserBadge = z.infer<typeof userBadgeSchema>

export const userBadgeListSchema = z.array(userBadgeSchema)
