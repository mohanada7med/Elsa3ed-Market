import fs from 'fs';
import path from 'path';

// Canonical WAH Design System Color Mapping
const COLOR_REPLACEMENTS: Array<{ regex: RegExp; replacement: string; label: string }> = [
  // Primary brand colors -> #B24C2B (Light) / #E0633C (Dark) / #963E21 (Hover)
  { regex: /#9a3412\b/gi, replacement: '#B24C2B', label: 'Primary #9a3412 -> #B24C2B' },
  { regex: /#7c2d12\b/gi, replacement: '#963E21', label: 'Primary Hover #7c2d12 -> #963E21' },
  { regex: /#9E3C1B\b/gi, replacement: '#B24C2B', label: 'Map Primary #9E3C1B -> #B24C2B' },
  { regex: /#853216\b/gi, replacement: '#963E21', label: 'Map Primary Hover #853216 -> #963E21' },
  { regex: /#B45F42\b/gi, replacement: '#B24C2B', label: 'Legacy Terracotta #B45F42 -> #B24C2B' },
  { regex: /#C86548\b/gi, replacement: '#E0633C', label: 'Legacy Luminous Terracotta #C86548 -> #E0633C' },
  { regex: /#97381B\b/gi, replacement: '#963E21', label: 'Primary Hover #97381B -> #963E21' },

  // Text & headings -> #241E1A (Dark Earth)
  { regex: /#29221D\b/gi, replacement: '#241E1A', label: 'Text #29221D -> #241E1A' },
  { regex: /#1C1613\b/gi, replacement: '#241E1A', label: 'Text #1C1613 -> #241E1A' },

  // Backgrounds -> #FAF7F2 (Sand Light) / #110E0C (Basalt Dark)
  { regex: /#FAF6F0\b/gi, replacement: '#FAF7F2', label: 'Background #FAF6F0 -> #FAF7F2' },
  { regex: /#faf6f0\b/gi, replacement: '#FAF7F2', label: 'Background #faf6f0 -> #FAF7F2' },
  { regex: /#FDFBF7\b/gi, replacement: '#FAF7F2', label: 'Background #FDFBF7 -> #FAF7F2' },
  { regex: /#151210\b/gi, replacement: '#110E0C', label: 'Dark Bg #151210 -> #110E0C' },
  { regex: /#120F0D\b/gi, replacement: '#110E0C', label: 'Dark Bg #120F0D -> #110E0C' },

  // Borders -> #E5DDD3 (Clay Light) / #352B24 (Clay Dark)
  { regex: /#E8E1D9\b/gi, replacement: '#E5DDD3', label: 'Border #E8E1D9 -> #E5DDD3' },
  { regex: /#e8d5c4\b/gi, replacement: '#E5DDD3', label: 'Border #e8d5c4 -> #E5DDD3' },
  { regex: /#ecdccf\b/gi, replacement: '#E5DDD3', label: 'Border #ecdccf -> #E5DDD3' },
  { regex: /#D9CFC2\b/gi, replacement: '#E5DDD3', label: 'Border #D9CFC2 -> #E5DDD3' },
  { regex: /#E2D8CC\b/gi, replacement: '#E5DDD3', label: 'Border #E2D8CC -> #E5DDD3' },
  { regex: /#EFE8DF\b/gi, replacement: '#E5DDD3', label: 'Border #EFE8DF -> #E5DDD3' },
  { regex: /#382E27\b/gi, replacement: '#352B24', label: 'Dark Border #382E27 -> #352B24' },
  { regex: /#3D3028\b/gi, replacement: '#352B24', label: 'Dark Border #3D3028 -> #352B24' },

  // Subtle surfaces -> #F3ECE2 (Alabaster Light) / #26201B (Terracotta wash Dark)
  { regex: /#EFE9DF\b/gi, replacement: '#F3ECE2', label: 'Subtle Surface #EFE9DF -> #F3ECE2' },
  { regex: /#f5ebe1\b/gi, replacement: '#F3ECE2', label: 'Subtle Surface #f5ebe1 -> #F3ECE2' },
  { regex: /#251D18\b/gi, replacement: '#26201B', label: 'Dark Subtle #251D18 -> #26201B' },
  { regex: /#201814\b/gi, replacement: '#26201B', label: 'Dark Subtle #201814 -> #26201B' },
  { regex: /#251E1A\b/gi, replacement: '#26201B', label: 'Dark Subtle #251E1A -> #26201B' },
  { regex: /#25201D\b/gi, replacement: '#26201B', label: 'Dark Subtle #25201D -> #26201B' },
  { regex: /#28201B\b/gi, replacement: '#26201B', label: 'Dark Subtle #28201B -> #26201B' },

  // Muted text -> #73675B
  { regex: /#6e5d4f\b/gi, replacement: '#73675B', label: 'Muted Text #6e5d4f -> #73675B' },
  { regex: /#7A6F64\b/gi, replacement: '#73675B', label: 'Muted Text #7A6F64 -> #73675B' },
  { regex: /#665A4F\b/gi, replacement: '#73675B', label: 'Muted Text #665A4F -> #73675B' },
];

function getAllSourceFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
        files.push(...getAllSourceFiles(fullPath));
      }
    } else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) {
      files.push(fullPath);
    }
  }

  return files;
}

async function unifyColors() {
  console.log('🎨 Starting WAH Design System Color Harmonization...');

  const roots = [
    path.resolve(process.cwd(), 'src'),
    path.resolve(process.cwd(), 'app'),
  ];

  let totalReplacements = 0;
  let modifiedFilesCount = 0;

  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    const files = getAllSourceFiles(root);

    for (const filePath of files) {
      let content = fs.readFileSync(filePath, 'utf-8');
      let fileModified = false;
      let fileReplacements = 0;

      for (const { regex, replacement } of COLOR_REPLACEMENTS) {
        const matches = content.match(regex);
        if (matches && matches.length > 0) {
          content = content.replace(regex, replacement);
          fileReplacements += matches.length;
          fileModified = true;
        }
      }

      if (fileModified) {
        fs.writeFileSync(filePath, content, 'utf-8');
        modifiedFilesCount++;
        totalReplacements += fileReplacements;
        console.log(`  ✓ Updated ${path.relative(process.cwd(), filePath)} (${fileReplacements} colors aligned)`);
      }
    }
  }

  console.log('\n======================================================');
  console.log(`🎉 Harmonization Complete!`);
  console.log(`   Modified Files: ${modifiedFilesCount}`);
  console.log(`   Total Colors Replaced with Canonical WAH Tokens: ${totalReplacements}`);
  console.log('======================================================\n');
}

unifyColors();
