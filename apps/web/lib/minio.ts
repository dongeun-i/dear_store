import { Client } from 'minio'

export const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT ?? 'localhost',
  port: Number(process.env.MINIO_PORT ?? 9000),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY ?? 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY ?? 'minioadmin',
})

export const BUCKETS = {
  QC_PHOTOS: process.env.MINIO_BUCKET_QC ?? 'qc-photos',
  PRODUCT_IMAGES: process.env.MINIO_BUCKET_PRODUCTS ?? 'product-images',
} as const

export async function ensureBuckets() {
  for (const bucket of Object.values(BUCKETS)) {
    const exists = await minioClient.bucketExists(bucket)
    if (!exists) {
      await minioClient.makeBucket(bucket)
    }
  }
}
