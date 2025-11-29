import { createClient } from '@supabase/supabase-js';

// 使用服务端密钥以获得管理员权限
const supabase = createClient(
  'https://vntvrdkjtfdcnvwgrubo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudHZyZGtqdGZkY252d2dydWJvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzY4OTM0NiwiZXhwIjoyMDc5MjY1MzQ2fQ.FB1JYsYTq5_3rXr_xHg2-tRu2w0bH1tYu1PUH4s3dK4'
);

async function createBuckets() {
  try {
    console.log('Creating storage buckets...');

    // Create achievement-images bucket
    console.log('Creating achievement-images bucket...');
    const { error: imagesError } = await supabase.storage.createBucket('achievement-images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    });

    if (imagesError) {
      console.error('Error creating achievement-images bucket:', imagesError.message);
    } else {
      console.log('achievement-images bucket created successfully');
    }

    // Create achievement-videos bucket
    console.log('Creating achievement-videos bucket...');
    const { error: videosError } = await supabase.storage.createBucket('achievement-videos', {
      public: true,
      fileSizeLimit: 209715200, // 200MB
      allowedMimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
    });

    if (videosError) {
      console.error('Error creating achievement-videos bucket:', videosError.message);
    } else {
      console.log('achievement-videos bucket created successfully');
    }

    // List buckets to verify
    console.log('\nVerifying buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('Error listing buckets:', listError);
    } else {
      console.log('Available buckets:');
      if (buckets && buckets.length > 0) {
        buckets.forEach(bucket => {
          console.log(`- ${bucket.name} (public: ${bucket.public})`);
        });
      }
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

createBuckets();