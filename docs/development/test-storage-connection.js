import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://vntvrdkjtfdcnvwgrubo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudHZyZGtqdGZkY252d2dydWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODkzNDYsImV4cCI6MjA3OTI2NTM0Nn0.j-7YWagbcUaKKDskzgkNpZMAXvEZJAiJ1B5zxL_sRew'
);

async function testConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test database connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (testError) {
      console.error('Database connection failed:', testError.message);
    } else {
      console.log('✅ Database connection successful');
    }
    
    // Test storage connection
    console.log('\nTesting storage connection...');
    const { data: buckets, error: storageError } = await supabase.storage.listBuckets();
    
    if (storageError) {
      console.error('❌ Storage connection failed:', storageError.message);
      console.error('Storage error details:', storageError);
    } else {
      console.log('✅ Storage connection successful');
      console.log('Available buckets:', buckets ? buckets.length : 0);
      if (buckets && buckets.length > 0) {
        buckets.forEach(bucket => {
          console.log(`  - ${bucket.name} (public: ${bucket.public})`);
        });
      }
    }
    
    // Test creating a simple bucket
    console.log('\nTesting bucket creation...');
    try {
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('test-bucket', {
        public: true,
        fileSizeLimit: 1048576
      });
      
      if (createError) {
        console.error('❌ Bucket creation failed:', createError.message);
        console.error('Bucket creation error details:', createError);
      } else {
        console.log('✅ Bucket creation successful');
        
        // Clean up test bucket
        await supabase.storage.deleteBucket('test-bucket');
        console.log('✅ Test bucket cleaned up');
      }
    } catch (err) {
      console.error('❌ Bucket creation exception:', err.message);
    }
    
  } catch (err) {
    console.error('❌ Connection test failed:', err.message);
  }
}

testConnection();