import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal pure-Node PNG encoder without external dependencies
function createPng(width, height, getPixelRGBA) {
  const bytesPerPixel = 4;
  const scanlineLength = width * bytesPerPixel + 1; // +1 for filter byte
  const buffer = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const lineOffset = y * scanlineLength;
    buffer[lineOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixelRGBA(x, y, width, height);
      const pixelOffset = lineOffset + 1 + x * bytesPerPixel;
      buffer[pixelOffset] = r;
      buffer[pixelOffset + 1] = g;
      buffer[pixelOffset + 2] = b;
      buffer[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(buffer);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: RGBA (6)
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);
  const idatChunk = createChunk('IDAT', deflated);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function crc32(buf) {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  table[i] = c;
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(body), 0);

  return Buffer.concat([length, body, crcBuf]);
}

// Generate Candy Gradient Apple / PWA Icon
function generateIconPixel(x, y, width, height) {
  // Normalize coords [0, 1]
  const nx = x / width;
  const ny = y / height;

  // Background candy gradient: #007dab (Blue) to #af0a78 (Pink)
  const rBg = Math.round(0 + (175 - 0) * ((nx + ny) / 2));
  const gBg = Math.round(125 + (10 - 125) * ((nx + ny) / 2));
  const bBg = Math.round(171 + (120 - 171) * ((nx + ny) / 2));

  // Center heart & circle badge
  const cx = nx - 0.5;
  const cy = ny - 0.48;
  const dist = Math.sqrt(cx * cx + cy * cy);

  // Heart formula: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
  const hx = (nx - 0.5) * 2.8;
  const hy = -(ny - 0.5) * 2.8 + 0.15;
  const a = hx * hx + hy * hy - 0.7;
  const isHeart = a * a * a - hx * hx * hy * hy * hy <= 0;

  if (isHeart) {
    // White heart with soft gloss
    return [255, 255, 255, 255];
  }

  // Soft gloss on top left
  if (dist < 0.45 && ny < 0.4) {
    const gloss = Math.max(0, 1 - dist / 0.45) * 0.25;
    const r = Math.min(255, Math.round(rBg + 255 * gloss));
    const g = Math.min(255, Math.round(gBg + 255 * gloss));
    const b = Math.min(255, Math.round(bBg + 255 * gloss));
    return [r, g, b, 255];
  }

  return [rBg, gBg, bBg, 255];
}

const iconsDir = path.resolve('public/icons');
if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

// 1. apple-touch-icon.png (180x180)
const appleIcon = createPng(180, 180, generateIconPixel);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), appleIcon);

// 2. icon-192.png (192x192)
const pwa192 = createPng(192, 192, generateIconPixel);
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), pwa192);

// 3. icon-512.png (512x512)
const pwa512 = createPng(512, 512, generateIconPixel);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), pwa512);

console.log('✅ Generated crisp PWA and Apple Touch PNG icons successfully!');
