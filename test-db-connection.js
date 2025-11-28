import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vntvrdkjtfdcnvwgrubo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudHZyZGtqdGZkY252d2dydWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODkzNDYsImV4cCI6MjA3OTI2NTM0Nn0.j-7YWagbcUaKKDskzgNpZMAXvEZJAiJ1B5zxL_sRew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    const { data, error } = await supabase
      .from('achievements')
      .select('count(*)')
      .limit(1);
    
    if (error) {
      console.error('Connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful');
    
    // Test users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, email, role')
      .limit(3);
    
    if (usersError) {
      console.error('Users table error:', usersError.message);
    } else {
      console.log('✅ Users table accessible, found:', users?.length || 0, 'users');
      users?.forEach(user => console.log(`- ${user.username} (${user.email}), Role: ${user.role}`));
    }
    
    // Test achievement types table
    const { data: types, error: typesError } = await supabase
      .from('achievement_types')
      .select('*')
      .limit(5);
    
    if (typesError) {
      console.log('⚠️ Achievement types table error:', typesError.message);
    } else {
      console.log('✅ Achievement types table accessible, found:', types?.length || 0, 'types');
      types?.forEach(type => console.log(`- ${type.name} (ID: ${type.id})`));
    }
    
    return true;
  } catch (error) {
    console.error('Test failed:', error.message);
    return false;
  }
}

testConnection().then(success => {
  console.log('\nFinal result:', success ? 'SUCCESS ✅' : 'FAILED ❌');
  process.exit(success ? 0 : 1);
});