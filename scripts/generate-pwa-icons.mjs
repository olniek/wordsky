/**
 * Writes public/pwa-192.png and public/pwa-512.png (solid brand colors, maskable-safe).
 * Run after changing colors: node scripts/generate-pwa-icons.mjs
 */
import { writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PNG } from 'pngjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

/** Matches vite.config manifest background_color */
const BG = [0x05, 0x06, 0x0f]
/** Primary mark from favicon.svg */
const ACCENT = [0x86, 0x3b, 0xff]

function writeIcon(size, filename) {
  const png = new PNG({ width: size, height: size })
  const cx = (size - 1) / 2
  const cy = (size - 1) / 2
  /** Keep glyph inside ~72% circle for maskable safe zone */
  const radius = size * 0.36
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (size * y + x) << 2
      const dx = x - cx
      const dy = y - cy
      const dist = Math.hypot(dx, dy)
      const diamond = Math.abs(dx) * 0.92 + Math.abs(dy) * 0.92 < size * 0.34
      if (dist < radius && diamond) {
        png.data[i] = ACCENT[0]
        png.data[i + 1] = ACCENT[1]
        png.data[i + 2] = ACCENT[2]
        png.data[i + 3] = 255
      } else {
        png.data[i] = BG[0]
        png.data[i + 1] = BG[1]
        png.data[i + 2] = BG[2]
        png.data[i + 3] = 255
      }
    }
  }
  const buf = PNG.sync.write(png)
  writeFileSync(join(publicDir, filename), buf)
  console.warn('wrote', filename, `(${size}×${size})`)
}

writeIcon(192, 'pwa-192.png')
writeIcon(512, 'pwa-512.png')
