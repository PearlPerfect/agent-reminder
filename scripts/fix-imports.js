// scripts/fix-imports.js
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = join(__dirname, '..', 'dist');

function fixImportsInFile(filePath) {
  try {
    let content = readFileSync(filePath, 'utf8');
    
    // Fix .js extensions for TypeScript files
    content = content.replace(/from\s+['"](\.\/.*?|\.\.\/.*?)['"]/g, (match, importPath) => {
      // Don't modify node_modules imports or absolute paths
      if (importPath.startsWith('.') && !importPath.endsWith('.js') && !importPath.endsWith('.json')) {
        return `from '${importPath}.js'`;
      }
      return match;
    });

    writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed imports in: ${relative(process.cwd(), filePath)}`);
  } catch (error) {
    console.error(`❌ Error fixing imports in ${filePath}:`, error.message);
  }
}

function processDirectory(dir) {
  try {
    // Check if directory exists
    if (!existsSync(dir)) {
      console.log(`📁 Directory doesn't exist: ${dir}`);
      return;
    }

    const files = readdirSync(dir);
    
    for (const file of files) {
      const fullPath = join(dir, file);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (file.endsWith('.js')) {
        fixImportsInFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Error processing directory ${dir}:`, error.message);
  }
}

console.log('🔧 Fixing import extensions in dist folder...');

// Check if dist directory exists before processing
if (existsSync(distDir)) {
  processDirectory(distDir);
  console.log('✅ Import fixing completed!');
} else {
  console.log('❌ dist folder does not exist. TypeScript compilation may have failed.');
  console.log('💡 Run "npx tsc --noEmit" to check for TypeScript errors.');
}