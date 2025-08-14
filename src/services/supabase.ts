import { env } from "@/env.ts";
import { ClientError } from "@/http/_errors/client-error.ts";
import { MultipartFile } from "@fastify/multipart";
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_KEY
)

type SupabaseResponse = {
  downloadURL: string
}

export async function uploadImage(file: MultipartFile, fileKey: string): Promise<SupabaseResponse> {
  const buffer = await file.toBuffer()
  const extension = file.mimetype.split('/')[1]
  const filePath = `uploads/${fileKey}.${extension}`

  const { error } = await supabase
    .storage
    .from('imagepush')
    .upload(filePath, buffer, {
      contentType: file.mimetype
    })

  if (error) {
    console.error('Error uploading image:', error);
    throw new ClientError(`Failed to upload image: ${error.message}`);
  }

  const { data: publicURLData } = supabase.storage.from('imagepush').getPublicUrl(filePath)

  return { downloadURL: publicURLData.publicUrl }
}

export async function getPublicURLFromKeyName(keyName: string): Promise<SupabaseResponse> {

  const filePath = `uploads/${keyName}`

  const { data, error } = await supabase
    .storage
    .from('imagepush')
    .createSignedUrl(filePath, 60 * 60) //1h

  if (error || !data) {
    console.error('Error getting public URL:', error);
    throw new ClientError(`Failed to get public URL: ${error.message}`);
  }

  // console.log(data.signedUrl)

  return { downloadURL: data.signedUrl }
}