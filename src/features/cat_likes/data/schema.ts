import { z } from 'zod'

// 基于数据库表 cat_likes 自动生成

const catLikeSchema = z.object({
  id: z.number(), // 主键ID
  userId: z.number(), // 用户ID
  catId: z.number(), // 猫ID
  liked: z.number(), // 是否点赞(1是0否)
  createdAt: z.coerce.date().nullable().optional(), // 创建时间
  updatedAt: z.coerce.date().nullable().optional(), // 更新时间
  deleted: z.unknown(), // 1: deleted, 0: normal
  createUser: z.number().nullable().optional(), // 创建人
  modifyUser: z.number().nullable().optional(), // 修改人
})

export type CatLike = z.infer<typeof catLikeSchema>

export const catLikeListSchema = z.array(catLikeSchema)
