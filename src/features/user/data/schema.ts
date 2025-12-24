import { z } from 'zod'

// 基于数据库表 user 自动生成

const userSchema = z.object({
  id: z.number(), // 用户ID
  name: z.string(), // 昵称
  avatar: z.string().nullable().optional(), // 头像URL
  level: z.string().nullable().optional(), // 等级称号
  createdAt: z.coerce.date().nullable().optional(), // 创建时间
  updatedAt: z.coerce.date().nullable().optional(), // 更新时间
  deleted: z.unknown(), // 1: deleted, 0: normal
  createUser: z.number().nullable().optional(), // 创建人
  modifyUser: z.number().nullable().optional(), // 修改人
})

export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)
