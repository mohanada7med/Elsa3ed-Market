import fs from 'fs';
import path from 'path';

const raw = fs.readFileSync(path.resolve('scripts', 'wah-content-backup-original.json'), 'utf-8');
const data = JSON.parse(raw);

console.log('Collections summary:');
for (const [col, docs] of Object.entries(data)) {
  console.log(`${col}: ${(docs as any[]).length} docs`);
}

// Check sample fields in wah_governorates
console.log('\n--- wah_governorates sample ---');
data['wah_governorates'].forEach((g: any) => {
  console.log(`ID: ${g.id} | Name: ${g.name} | ShortIntro: ${g.shortIntro}`);
});

// Check wah_food
console.log('\n--- wah_food sample ---');
data['wah_food'].forEach((f: any) => {
  console.log(`ID: ${f.id} | Title: ${f.title} | Desc: ${f.description}`);
});

// Check wah_local_people
console.log('\n--- wah_local_people sample ---');
data['wah_local_people'].forEach((p: any) => {
  console.log(`ID: ${p.id} | Name: ${p.name} | Role: ${p.titleOrRole} | Bio: ${p.biography?.substring(0, 80)}`);
});
