/**
 * Pure TypeScript QR Code Generator (ISO/IEC 18004 compliant)
 * Zero external dependencies, zero CJS/Webpack bundling issues.
 * Generates boolean[][] matrix for SVG and Canvas rendering.
 */

// GF(256) Math
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(() => {
  let val = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = val;
    GF_EXP[i + 255] = val;
    GF_LOG[val] = i;
    val = (val << 1) ^ (val >= 128 ? 0x11d : 0);
  }
})();

function gfMul(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF_EXP[GF_LOG[x] + GF_LOG[y]];
}

// Reed-Solomon Generator Polynomial
function rsGeneratorPoly(numEc: number): Uint8Array {
  let poly = new Uint8Array([1]);
  for (let i = 0; i < numEc; i++) {
    const next = new Uint8Array(poly.length + 1);
    const root = GF_EXP[i];
    for (let j = 0; j < poly.length; j++) {
      next[j] ^= gfMul(poly[j], root);
      next[j + 1] ^= poly[j];
    }
    poly = next;
  }
  return poly;
}

function rsCompute(data: Uint8Array, numEc: number): Uint8Array {
  const gen = rsGeneratorPoly(numEc);
  const remainder = new Uint8Array(numEc);

  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    remainder.copyWithin(0, 1);
    remainder[numEc - 1] = 0;
    if (factor !== 0) {
      for (let j = 0; j < numEc; j++) {
        remainder[j] ^= gfMul(gen[j], factor);
      }
    }
  }
  return remainder;
}

// QR Table: [TotalCodewords, DataCodewordsLevelM, EcCodewordsPerBlock, NumBlocks]
// Versions 1 to 6 (sufficient for all standard workshop URLs)
interface QrVersionInfo {
  version: number;
  size: number;
  totalCw: number;
  dataCw: number;
  ecPerBlock: number;
  blocks: number;
  alignment: number[];
}

const QR_VERSIONS: QrVersionInfo[] = [
  { version: 1, size: 21, totalCw: 26, dataCw: 16, ecPerBlock: 10, blocks: 1, alignment: [] },
  { version: 2, size: 25, totalCw: 44, dataCw: 28, ecPerBlock: 16, blocks: 1, alignment: [6, 18] },
  { version: 3, size: 29, totalCw: 70, dataCw: 44, ecPerBlock: 26, blocks: 1, alignment: [6, 22] },
  { version: 4, size: 33, totalCw: 100, dataCw: 64, ecPerBlock: 18, blocks: 2, alignment: [6, 26] },
  { version: 5, size: 37, totalCw: 134, dataCw: 86, ecPerBlock: 24, blocks: 2, alignment: [6, 30] },
  { version: 6, size: 41, totalCw: 172, dataCw: 108, ecPerBlock: 16, blocks: 4, alignment: [6, 34] },
];

export interface QrMatrix {
  size: number;
  modules: boolean[][];
}

/**
 * Encodes text into a standard QR Code boolean matrix
 */
export function generateQrMatrix(text: string): QrMatrix {
  const utf8 = new TextEncoder().encode(text);
  const dataLen = utf8.length;

  // Find lowest version that can hold data in Byte mode (4 bit mode + 8 bit count + data)
  let chosenVersion: QrVersionInfo | null = null;
  for (const v of QR_VERSIONS) {
    if (dataLen + 2 <= v.dataCw) {
      chosenVersion = v;
      break;
    }
  }

  if (!chosenVersion) {
    chosenVersion = QR_VERSIONS[QR_VERSIONS.length - 1];
  }

  const { size, dataCw, ecPerBlock, blocks, alignment } = chosenVersion;

  // 1. Bitstream assembly: Mode (Byte = 0100) + Count (8 bits) + Data
  const bits: number[] = [];
  const pushBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  };

  pushBits(0b0100, 4); // Byte mode
  pushBits(Math.min(dataLen, dataCw - 2), 8); // Character count
  for (let i = 0; i < Math.min(dataLen, dataCw - 2); i++) {
    pushBits(utf8[i], 8);
  }

  // Terminator
  const maxBits = dataCw * 8;
  const termLen = Math.min(4, maxBits - bits.length);
  pushBits(0, termLen);

  // Pad to byte
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // Pad bytes: alternating 0xEC, 0x11
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (bits.length < maxBits) {
    pushBits(padBytes[padIdx % 2], 8);
    padIdx++;
  }

  // Convert bits to data bytes
  const dataBytes = new Uint8Array(dataCw);
  for (let i = 0; i < dataCw; i++) {
    let b = 0;
    for (let j = 0; j < 8; j++) {
      b = (b << 1) | bits[i * 8 + j];
    }
    dataBytes[i] = b;
  }

  // 2. Error Correction Codewords per Block
  const dataBlockLen = Math.floor(dataCw / blocks);
  const allDataBlocks: Uint8Array[] = [];
  const allEcBlocks: Uint8Array[] = [];

  for (let b = 0; b < blocks; b++) {
    const start = b * dataBlockLen;
    const end = b === blocks - 1 ? dataCw : start + dataBlockLen;
    const blockData = dataBytes.slice(start, end);
    allDataBlocks.push(blockData);
    allEcBlocks.push(rsCompute(blockData, ecPerBlock));
  }

  // Interleave data and EC codewords
  const finalCodewords: number[] = [];
  const maxBlockLen = Math.max(...allDataBlocks.map((b) => b.length));

  for (let i = 0; i < maxBlockLen; i++) {
    for (let b = 0; b < blocks; b++) {
      if (i < allDataBlocks[b].length) {
        finalCodewords.push(allDataBlocks[b][i]);
      }
    }
  }

  for (let i = 0; i < ecPerBlock; i++) {
    for (let b = 0; b < blocks; b++) {
      finalCodewords.push(allEcBlocks[b][i]);
    }
  }

  // 3. Grid setup and function patterns
  const matrix: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));
  const isFunction: boolean[][] = Array.from({ length: size }, () => Array(size).fill(false));

  const setModule = (r: number, c: number, val: boolean) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = val;
      isFunction[r][c] = true;
    }
  };

  // Finder pattern (7x7 with 1 border)
  const drawFinder = (top: number, left: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = top + r;
        const nc = left + c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (r >= 0 && r <= 6 && c >= 0 && c <= 6) {
            const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
            const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
            setModule(nr, nc, isBorder || isCenter);
          } else {
            setModule(nr, nc, false); // Separator
          }
        }
      }
    }
  };

  drawFinder(0, 0); // Top-left
  drawFinder(0, size - 7); // Top-right
  drawFinder(size - 7, 0); // Bottom-left

  // Alignment patterns
  if (alignment.length > 0) {
    for (const r of alignment) {
      for (const c of alignment) {
        // Skip if overlaps with finders
        if ((r === 6 && c === 6) || (r === 6 && c === size - 7) || (r === size - 7 && c === 6)) {
          continue;
        }
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2;
            const isCenter = dr === 0 && dc === 0;
            setModule(r + dr, c + dc, isBorder || isCenter);
          }
        }
      }
    }
  }

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    setModule(6, i, i % 2 === 0);
    setModule(i, 6, i % 2 === 0);
  }

  // Dark module
  setModule(size - 8, 8, true);

  // Reserve format info area
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      isFunction[8][i] = true;
      isFunction[i][8] = true;
    }
  }
  for (let i = 0; i < 8; i++) {
    isFunction[8][size - 1 - i] = true;
    isFunction[size - 1 - i][8] = true;
  }

  // 4. Place Data Codewords (Zigzag 2-column traversal)
  const dataBits: number[] = [];
  for (const cw of finalCodewords) {
    for (let i = 7; i >= 0; i--) {
      dataBits.push((cw >> i) & 1);
    }
  }

  let bitIdx = 0;
  let upwards = true;

  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing pattern
    for (let vert = 0; vert < size; vert++) {
      const r = upwards ? size - 1 - vert : vert;
      for (let c = right; c > right - 2; c--) {
        if (!isFunction[r][c]) {
          const bit = bitIdx < dataBits.length ? dataBits[bitIdx++] === 1 : false;
          // Apply standard Mask 0: (r + c) % 2 === 0
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = bit !== mask;
        }
      }
    }
    upwards = !upwards;
  }

  // 5. Format Information: Mask 0, EC Level M (00) -> 00 000 with BCH -> 0x5412 XORed
  // Pre-calculated Format Bits for Level M, Mask 0: 101010000010010
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];

  for (let i = 0; i < 6; i++) matrix[8][i] = formatBits[i] === 1;
  matrix[8][7] = formatBits[6] === 1;
  matrix[8][8] = formatBits[7] === 1;
  matrix[7][8] = formatBits[8] === 1;
  for (let i = 9; i < 15; i++) matrix[14 - i][8] = formatBits[i] === 1;

  for (let i = 0; i < 8; i++) matrix[size - 1 - i][8] = formatBits[i] === 1;
  for (let i = 8; i < 15; i++) matrix[8][size - 15 + i] = formatBits[i] === 1;

  return { size, modules: matrix };
}
