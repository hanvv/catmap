import { z } from 'zod'

// 基于数据库表 user_stats 自动生成

const userStatSchema = z.object({
  userId: z.number(), // 用户ID
  stamps: z.number().nullable().optional(), // 盖章数
  photos: z.number().nullable().optional(), // 照片数
  level: z.string().nullable().optional(), // 等级称号
  streakDays: z.number().nullable().optional(), // 连续天数
  createdAt: z.coerce.date().nullable().optional(), // 创建时间
  updatedAt: z.coerce.date().nullable().optional(), // 更新时间
  deleted: z.unknown(), // 1: deleted, 0: normal
  createUser: z.number().nullable().optional(), // 创建人
  modifyUser: z.number().nullable().optional(), // 修改人
})

export type UserStat = z.infer<typeof userStatSchema>

export const userStatListSchema = z.array(userStatSchema)
