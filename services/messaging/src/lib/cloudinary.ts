import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadMedia(file: string | Buffer) {
  try {
    const result = await cloudinary.uploader.upload(file as string, {
      folder: 'whatsapp_bulk',
    })
    return result.secure_url
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    throw error
  }
}

export async function getMediaUrl(publicId: string) {
  return cloudinary.url(publicId)
}
