import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vntvrdkjtfdcnvwgrubo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudHZyZGtqdGZkY252d2dydWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2ODkzNDYsImV4cCI6MjA3OTI2NTM0Nn0.j-7YWagbcUaKKDskzgNpZMAXvEZJAiJ1B5zxL_sRew';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkUsers() {
  try {
    console.log('Checking users in database...');
    
    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) {
      console.error('Failed to fetch users:', error.message);
      return;
    }
    
    console.log(`Found ${users?.length || 0} users:`);
    users?.forEach(user => {
      console.log(`- ID: ${user.id}`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Created: ${user.created_at}`);
      console.log('---');
    });
    
    // Check specific test users
    const testStudentId = '72ee2ee4-b41a-4389-a6a0-e2b59fb5980b';
    const testInstructorId = '7a482e3f-93c3-467c-9f4a-7fea2084b093';
    
    const studentExists = users?.find(u => u.id === testStudentId);
    const instructorExists = users?.find(u => u.id === testInstructorId);
    
    console.log('\nTest Users Check:');
    console.log(`Test Student (${testStudentId}):`, studentExists ? '✅ EXISTS' : '❌ NOT FOUND');
    if (studentExists) {
      console.log(`  Name: ${studentExists.username}, Role: ${studentExists.role}`);
    }
    
    console.log(`Test Instructor (${testInstructorId}):`, instructorExists ? '✅ EXISTS' : '❌ NOT FOUND');
    if (instructorExists) {
      console.log(`  Name: ${instructorExists.username}, Role: ${instructorExists.role}`);
    }
    
    // Check achievement types
    const { data: types, error: typesError } = await supabase
      .from('achievement_types')
      .select('*');
    
    if (typesError) {
      console.log('\nAchievement types table error:', typesError.message);
    } else {
      console.log(`\nFound ${types?.length || 0} achievement types:`);
      types?.forEach(type => {
        console.log(`- ID: ${type.id}, Name: ${type.name}`);
      });
    }
    
  } catch (error) {
    console.error('Check failed:', error.message);
  }
}

checkUsers();