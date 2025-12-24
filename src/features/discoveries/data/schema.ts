import { z } from 'zod'

// 基于数据库表 discoveries 自动生成

const discoverieSchema = z.object({
  id: z.number(), // 发现ID
  userId: z.number(), // 提交用户ID
  type: z.coerce.date(), // 类型:新猫/状态更新
  lat: z.number(), // 纬度
  lng: z.number(), // 经度
  description: z.string().nullable().optional(), // 描述
  status: z.enum(['pending', 'approved', 'rejected']).nullable().optional(), // 审核状态
  createdAt: z.coerce.date().nullable().optional(), // 创建时间
  updatedAt: z.coerce.date().nullable().optional(), // 更新时间
  deleted: z.unknown(), // 1: deleted, 0: normal
  createUser: z.number().nullable().optional(), // 创建人
  modifyUser: z.number().nullable().optional(), // 修改人
})

export type Discoverie = z.infer<typeof discoverieSchema>

export const discoverieListSchema = z.array(discoverieSchema)
