// 测试环境变量
console.log('Environment variables:');
console.log('VITE_SUPABASE_URL:', import.meta.env?.VITE_SUPABASE_URL || 'NOT FOUND');
console.log('VITE_SUPABASE_ANON_KEY:', import.meta.env?.VITE_SUPABASE_ANON_KEY ? 'FOUND' : 'NOT FOUND');

// 测试直接从.env.local读取
import fs from 'fs';
import path from 'path';

try {
  const envPath = path.join(process.cwd(), '.env.local');
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('\n.env.local file content:');
  console.log(envContent.split('\n').filter(line => line.includes('SUPABASE')).join('\n'));
} catch (error) {
  console.log('Failed to read .env.local:', error.message);
}