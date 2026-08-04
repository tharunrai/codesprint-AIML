const fs = require('fs');
const path = require('path');

function walk(dir, cb) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, cb) : cb(dirPath);
  });
}

walk('./src', (filePath) => {
  if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) return;
  if (filePath.includes('mock-data.ts')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]@\/lib\/mock-data['"]/g, (match, p1) => {
     let types = [];
     let utils = [];
     let imports = p1.split(',').map(s => s.trim()).filter(Boolean);
     
     imports.forEach(i => {
       const clean = i.replace(/^type\s+/, '');
       if (['formatCTC', 'deadlineCountdown', 'getStageLabel', 'checkEligibility'].includes(clean)) {
         utils.push(i);
       } else if (['Drive', 'Application', 'User'].includes(clean)) {
         types.push(i); // We can fix these manually if they need to be Prisma imports
       } else {
         types.push(i);
       }
     });

     let res = [];
     if (types.length) res.push(`import { ${types.join(', ')} } from "@/lib/types";`);
     if (utils.length) res.push(`import { ${utils.join(', ')} } from "@/lib/utils";`);
     return res.join('\n');
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated', filePath);
  }
});
