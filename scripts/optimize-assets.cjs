const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const MASCOT_DIR = path.join(__dirname, '..', 'public', 'mascot');
const MASCOT_ORIGINALS_DIR = path.join(MASCOT_DIR, 'originals');
const PATTERN_DIR = path.join(__dirname, '..', 'public', 'pattern');
const PATTERN_ORIGINALS_DIR = path.join(PATTERN_DIR, 'originals');

if (!fs.existsSync(MASCOT_ORIGINALS_DIR)) {
  fs.mkdirSync(MASCOT_ORIGINALS_DIR, { recursive: true });
}
if (!fs.existsSync(PATTERN_ORIGINALS_DIR)) {
  fs.mkdirSync(PATTERN_ORIGINALS_DIR, { recursive: true });
}

async function optimizeMascotImages() {
  console.log('=== Optimizing Mascot Images ===');
  const files = fs.readdirSync(MASCOT_DIR).filter(f => f.endsWith('.png'));
  
  let totalOrigBytes = 0;
  let totalNewPngBytes = 0;
  let totalWebpBytes = 0;

  for (const file of files) {
    const srcPath = path.join(MASCOT_DIR, file);
    const backupPath = path.join(MASCOT_ORIGINALS_DIR, file);
    const webpPath = path.join(MASCOT_DIR, file.replace(/\.png$/, '.webp'));

    // 1. Back up original if not already backed up
    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(srcPath, backupPath);
    }

    const origStat = fs.statSync(backupPath);
    totalOrigBytes += origStat.size;

    // Use backup as source to avoid re-compressing an already compressed file
    const image = sharp(backupPath);
    const meta = await image.metadata();

    // Determine target dimensions
    let resizeOptions = null;
    if (meta.width && meta.height) {
      if (meta.width > meta.height) {
        // Landscape (e.g., doors.png, make.png)
        if (meta.width > 1200) {
          resizeOptions = { width: 1200, fit: 'inside', withoutEnlargement: true };
        }
      } else {
        // Portrait or square (e.g. saaed.png, foods.png, logo.png)
        if (meta.height > 900) {
          resizeOptions = { height: 900, fit: 'inside', withoutEnlargement: true };
        } else if (meta.width > 600) {
          resizeOptions = { width: 600, fit: 'inside', withoutEnlargement: true };
        }
      }
    }

    // Generate WebP
    let webpPipeline = sharp(backupPath);
    if (resizeOptions) webpPipeline = webpPipeline.resize(resizeOptions);
    const webpBuffer = await webpPipeline.webp({ quality: 82, effort: 6 }).toBuffer();
    fs.writeFileSync(webpPath, webpBuffer);
    totalWebpBytes += webpBuffer.length;

    // Generate Optimized PNG
    let pngPipeline = sharp(backupPath);
    if (resizeOptions) pngPipeline = pngPipeline.resize(resizeOptions);
    const pngBuffer = await pngPipeline.png({
      quality: 85,
      compressionLevel: 9,
      palette: true,
      effort: 7,
    }).toBuffer();
    fs.writeFileSync(srcPath, pngBuffer);
    totalNewPngBytes += pngBuffer.length;

    const origKB = (origStat.size / 1024).toFixed(1);
    const pngKB = (pngBuffer.length / 1024).toFixed(1);
    const webpKB = (webpBuffer.length / 1024).toFixed(1);
    const savings = (((origStat.size - webpBuffer.length) / origStat.size) * 100).toFixed(1);

    console.log(
      `${file.padEnd(18)} : Orig ${origKB.padStart(6)} KB -> PNG ${pngKB.padStart(5)} KB | WebP ${webpKB.padStart(5)} KB (-${savings}%)`
    );
  }

  // Also make sure welcome.png exists (symlink/copy of welcoming.png)
  const welcomingPng = path.join(MASCOT_DIR, 'welcoming.png');
  const welcomePng = path.join(MASCOT_DIR, 'welcome.png');
  if (fs.existsSync(welcomingPng) && !fs.existsSync(welcomePng)) {
    fs.copyFileSync(welcomingPng, welcomePng);
    console.log('Created alias: welcome.png -> welcoming.png');
  }
  const welcomingWebp = path.join(MASCOT_DIR, 'welcoming.webp');
  const welcomeWebp = path.join(MASCOT_DIR, 'welcome.webp');
  if (fs.existsSync(welcomingWebp) && !fs.existsSync(welcomeWebp)) {
    fs.copyFileSync(welcomingWebp, welcomeWebp);
    console.log('Created alias: welcome.webp -> welcoming.webp');
  }

  return { totalOrigBytes, totalNewPngBytes, totalWebpBytes };
}

async function optimizePatterns() {
  console.log('\n=== Optimizing Pattern Images ===');
  const files = ['pat2.png', 'pat3.png'];

  let totalOrigBytes = 0;
  let totalNewPngBytes = 0;
  let totalWebpBytes = 0;

  for (const file of files) {
    const srcPath = path.join(PATTERN_DIR, file);
    if (!fs.existsSync(srcPath)) continue;

    const backupPath = path.join(PATTERN_ORIGINALS_DIR, file);
    const webpPath = path.join(PATTERN_DIR, file.replace(/\.png$/, '.webp'));

    if (!fs.existsSync(backupPath)) {
      fs.copyFileSync(srcPath, backupPath);
    }

    const origStat = fs.statSync(backupPath);
    totalOrigBytes += origStat.size;

    // Pattern WebP
    const webpBuffer = await sharp(backupPath)
      .webp({ quality: 80, effort: 6 })
      .toBuffer();
    fs.writeFileSync(webpPath, webpBuffer);
    totalWebpBytes += webpBuffer.length;

    // Pattern PNG
    const pngBuffer = await sharp(backupPath)
      .png({ quality: 80, compressionLevel: 9, palette: true, effort: 7 })
      .toBuffer();
    fs.writeFileSync(srcPath, pngBuffer);
    totalNewPngBytes += pngBuffer.length;

    const origKB = (origStat.size / 1024).toFixed(1);
    const pngKB = (pngBuffer.length / 1024).toFixed(1);
    const webpKB = (webpBuffer.length / 1024).toFixed(1);
    const savings = (((origStat.size - webpBuffer.length) / origStat.size) * 100).toFixed(1);

    console.log(
      `${file.padEnd(18)} : Orig ${origKB.padStart(6)} KB -> PNG ${pngKB.padStart(5)} KB | WebP ${webpKB.padStart(5)} KB (-${savings}%)`
    );
  }

  return { totalOrigBytes, totalNewPngBytes, totalWebpBytes };
}

async function main() {
  const startTime = Date.now();
  console.log('Starting full asset optimization...\n');

  const mascotRes = await optimizeMascotImages();
  const patternRes = await optimizePatterns();

  const totalOrigMB = ((mascotRes.totalOrigBytes + patternRes.totalOrigBytes) / (1024 * 1024)).toFixed(2);
  const totalNewPngMB = ((mascotRes.totalNewPngBytes + patternRes.totalNewPngBytes) / (1024 * 1024)).toFixed(2);
  const totalWebpMB = ((mascotRes.totalWebpBytes + patternRes.totalWebpBytes) / (1024 * 1024)).toFixed(2);

  const pngReduction = (((mascotRes.totalOrigBytes + patternRes.totalOrigBytes - (mascotRes.totalNewPngBytes + patternRes.totalNewPngBytes)) / (mascotRes.totalOrigBytes + patternRes.totalOrigBytes)) * 100).toFixed(1);
  const webpReduction = (((mascotRes.totalOrigBytes + patternRes.totalOrigBytes - (mascotRes.totalWebpBytes + patternRes.totalWebpBytes)) / (mascotRes.totalOrigBytes + patternRes.totalOrigBytes)) * 100).toFixed(1);

  console.log('\n=======================================');
  console.log(`Initial total size:  ${totalOrigMB} MB`);
  console.log(`Optimized PNG size:  ${totalNewPngMB} MB (saved ${pngReduction}%)`);
  console.log(`WebP size:           ${totalWebpMB} MB (saved ${webpReduction}%)`);
  console.log(`Finished in:         ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
  console.log('=======================================');
}

main().catch(err => {
  console.error('Error during optimization:', err);
  process.exit(1);
});
