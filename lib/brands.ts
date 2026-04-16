import 'server-only'
import { Redis } from '@upstash/redis'
import { nanoid } from 'nanoid'
import type { BrandInput, BrandResult, LogoType } from './types'

const redis = Redis.fromEnv()

export const FREE_TIER_BRAND_LIMIT = 3

export interface SavedBrand {
  id: string
  userId: string
  name: string                  // selectedName
  industry: string              // from BrandInput
  brandInput: BrandInput
  brandResult: BrandResult
  selectedLogoUrl: string       // Vercel Blob URL
  selectedLogoType: LogoType
  mockupUrls: { templateId: string; url: string }[]
  createdAt: number
  updatedAt: number
}

interface CreateArgs {
  userId: string
  name: string
  industry: string
  brandInput: BrandInput
  brandResult: BrandResult
  selectedLogoUrl: string
  selectedLogoType: LogoType
  mockupUrls: { templateId: string; url: string }[]
}

const brandKey = (userId: string, brandId: string) => `brand:${userId}:${brandId}`
const userIndexKey = (userId: string) => `brands:by-user:${userId}`

export async function saveBrand(args: CreateArgs): Promise<SavedBrand> {
  const id = nanoid(12)
  const now = Date.now()
  const record: SavedBrand = { id, ...args, createdAt: now, updatedAt: now }
  await redis.set(brandKey(args.userId, id), record)
  await redis.zadd(userIndexKey(args.userId), { score: now, member: id })
  return record
}

export async function listBrands(userId: string): Promise<SavedBrand[]> {
  // Newest first
  const ids = await redis.zrange<string[]>(userIndexKey(userId), 0, -1, { rev: true })
  if (!ids.length) return []
  const records = await Promise.all(
    ids.map((id) => redis.get<SavedBrand>(brandKey(userId, id)))
  )
  return records.filter((r): r is SavedBrand => r !== null)
}

export async function getBrand(userId: string, brandId: string): Promise<SavedBrand | null> {
  return redis.get<SavedBrand>(brandKey(userId, brandId))
}

export async function deleteBrand(userId: string, brandId: string): Promise<void> {
  await redis.del(brandKey(userId, brandId))
  await redis.zrem(userIndexKey(userId), brandId)
}

export async function countBrands(userId: string): Promise<number> {
  return (await redis.zcard(userIndexKey(userId))) ?? 0
}
