import { z } from 'zod'

// 基于数据库表 cats 自动生成

const catSchema = z.object({
  id: z.number(), // 猫ID
  name: z.string(), // 猫名
  avatar: z.string().nullable().optional(), // 头像URL
  coverImage: z.string().nullable().optional(), // 封面图URL
  lat: z.number(), // 纬度
  lng: z.number(), // 经度
  status: z.enum(['active', 'sleeping', 'hidden']), // 状态:活跃/睡觉/隐藏
  distanceM: z.number().nullable().optional(), // 距离(米，可选存预计算)
  friendliness: z.number().nullable().optional(), // 亲密度1-5
  sex: z.enum(['male', 'female', 'unknown']).nullable().optional(), // 性别
  description: z.string().nullable().optional(), // 描述
  lastSeenAt: z.coerce.date().nullable().optional(), // 最近出现时间
  createdAt: z.coerce.date().nullable().optional(), // 创建时间
  updatedAt: z.coerce.date().nullable().optional(), // 更新时间
  deleted: z.unknown(), // 1: deleted, 0: normal
  createUser: z.number().nullable().optional(), // 创建人
  modifyUser: z.number().nullable().optional(), // 修改人
})

export type Cat = z.infer<typeof catSchema>

export const catListSchema = z.array(catSchema)
