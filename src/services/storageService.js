import { supabase } from '../supabase';

const BUCKET_NAME = 'fabric-images';

export async function uploadFabricImage(file, userId) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token || !userId) {
    throw new Error('Missing authenticated Supabase session for storage upload');
  }

  const fileExt = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const storagePath = `${userId}/${fileName}`;

  const { data, error: uploadError } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || 'image/jpeg',
    });

  if (uploadError) {
    console.error('Supabase storage upload failed', {
      bucket: BUCKET_NAME,
      storagePath,
      userId,
      fileName: file.name,
      fileType: file.type,
      uploadData: data,
      uploadError,
    });
    throw new Error(uploadError.message || uploadError.error || 'Failed to upload image');
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath);

  if (!publicUrlData?.publicUrl) {
    console.error('Supabase storage public URL generation failed', {
      bucket: BUCKET_NAME,
      storagePath,
      publicUrlData,
    });
    throw new Error('Failed to generate public image URL');
  }

  return {
    image_url: publicUrlData.publicUrl,
    storage_path: storagePath,
  };
}
