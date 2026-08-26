import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function uploadImage(buffer: Buffer, filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: 'fleetflow/vehicles',
        public_id: filename.replace(/\.[^/.]+$/, ''),
        overwrite: true,
        resource_type: 'image',
        transformation: [{ width: 800, height: 600, crop: 'fill', quality: 'auto' }],
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result!.secure_url)
      }
    ).end(buffer)
  })
}

export async function deleteImage(url: string): Promise<void> {
  try {
    const publicId = url.split('/').slice(-2).join('/').replace(/\.[^/.]+$/, '')
    await cloudinary.uploader.destroy(`fleetflow/vehicles/${publicId.split('/').pop()}`)
  } catch (err) {
    console.error('Erro ao deletar imagem do Cloudinary:', err)
  }
}

export default cloudinary
