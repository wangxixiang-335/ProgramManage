import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vntvrdkjtfdcnvwgrubo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudHZyZGtqdGZkY252d2dydWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODkzNDYsImV4cCI6MjA3OTI2NTM0Nn0.j-7YWagbcUaKKDskzgkNpZMAXvEZJAiJ1B5zxL_sRew'
);

async function checkStorage() {
  try {
    console.log('Checking storage buckets...');
    
    // List all buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }
    
    console.log('Available buckets:');
    if (buckets && buckets.length > 0) {
      buckets.forEach(bucket => {
        console.log(`- ${bucket.name} (public: ${bucket.public})`);
      });
    } else {
      console.log('No buckets found');
    }
    
    // Check specific buckets we need
    const requiredBuckets = ['achievement-images', 'achievement-videos'];
    
    for (const bucketName of requiredBuckets) {
      console.log(`\nChecking ${bucketName} bucket...`);
      try {
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket(bucketName);
        if (bucketError) {
          console.error(`${bucketName} bucket error:`, bucketError.message);
          
          // If bucket doesn't exist, provide creation SQL
          if (bucketError.message.includes('not found') || bucketError.message.includes('does not exist')) {
            console.log(`\nSQL to create ${bucketName} bucket:`);
            console.log(`-- Create ${bucketName} storage bucket`);
            console.log(`INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)`);
            console.log(`VALUES (`);
            console.log(`  '${bucketName}',`);
            console.log(`  '${bucketName}',`);
            console.log(`  true,`);
            console.log(`  ${bucketName.includes('video') ? '209715200' : '5242880'},`);
            console.log(`  ${bucketName.includes('video') ? 
              "ARRAY['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']" : 
              "ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']"}`);
            console.log(`)`);
            console.log(`ON CONFLICT (id) DO NOTHING;`);
            console.log(`\n-- Set public access policies`);
            console.log(`CREATE POLICY "Public ${bucketName.includes('video') ? 'videos' : 'images'} are viewable by everyone" ON storage.objects`);
            console.log(`FOR SELECT USING (bucket_id = '${bucketName}');`);
            console.log(`\nCREATE POLICY "Users can upload their own ${bucketName.includes('video') ? 'videos' : 'images'}" ON storage.objects`);
            console.log(`FOR INSERT WITH CHECK (bucket_id = '${bucketName}' AND auth.role() = 'authenticated');`);
            console.log(`\nCREATE POLICY "Users can update their own ${bucketName.includes('video') ? 'videos' : 'images'}" ON storage.objects`);
            console.log(`FOR UPDATE USING (bucket_id = '${bucketName}' AND auth.role() = 'authenticated');`);
          }
        } else {
          console.log(`${bucketName} bucket exists:`, bucketData);
        }
      } catch (err) {
        console.error(`Error checking ${bucketName} bucket:`, err.message);
      }
    }
    
  } catch (err) {
    console.error('Error:', err.message);
  }
}

checkStorage();