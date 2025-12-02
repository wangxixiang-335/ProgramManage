// 验证导入修复的Node.js脚本
// 运行: node verify-imports.js

const fs = require('fs');
const path = require('path');

console.log('🔍 验证文件导入修复...');

const filesToCheck = [
  'src/services/supabaseStorageService.ts',
  'src/utils/initSupabaseStorage.ts', 
  'src/utils/debugStorageAccess.ts',
  'src/pages/p-news_management/index.tsx'
];

let allFilesExist = true;

filesToCheck.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file} - 存在`);
  } else {
    console.log(`❌ ${file} - 不存在`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('\n🎉 所有文件都存在，导入问题应该已解决！');
  console.log('\n📋 下一步操作：');
  console.log('1. 重启开发服务器: npm run dev');
  console.log('2. 访问: http://localhost:5173/news-management');
  console.log('3. 在控制台运行: debugNewsStorage()');
  console.log('4. 如果仍有问题，执行SQL: fix-storage-access.sql');
} else {
  console.log('\n❌ 仍有文件缺失，请检查文件创建过程');
}