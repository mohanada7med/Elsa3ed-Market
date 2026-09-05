import fs from 'fs';

const content = fs.readFileSync('src/services/api.ts', 'utf-8');
const lines = content.split('\n');
lines.forEach((line, idx) => {
  if (line.includes('wahApi') || line.includes('getGovernorateBySlug') || line.includes('getCraftEncyclopedia')) {
    console.log(`Line ${idx + 1}: ${line}`);
  }
});
