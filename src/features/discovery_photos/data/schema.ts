import { z } from 'zod'

// 基于数据库表 discovery_photos 自动生成

const discoveryPhotoSchema = z.object({
  id: z.number(), // 主键ID
  discoveryId: z.number(), // 探索ID
  url: z.string(), // 照片URL
  createdAt: z.coerce.date().nullable().optional(), // 创建时间
  deleted: z.unknown(), // 1: deleted, 0: normal
  createUser: z.number().nullable().optional(), // 创建人
  modifyUser: z.number().nullable().optional(), // 修改人
})

export type DiscoveryPhoto = z.infer<typeof discoveryPhotoSchema>

export const discoveryPhotoListSchema = z.array(discoveryPhotoSchema)
