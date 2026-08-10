import { mkdir, readFile, writeFile } from 'node:fs/promises'

const scenes = ['train', 'elevator', 'karaage', 'meeting', 'ending']
const outDir = new URL('../public/scenes/', import.meta.url)

await mkdir(outDir, { recursive: true })

for (const scene of scenes) {
  const source = new URL(`../scene-data-v2/${scene}.b64`, import.meta.url)
  const raw = (await readFile(source, 'utf8')).replace(/\s+/g, '')
  const bytes = Buffer.from(raw, 'base64')
  const isWebP =
    bytes.subarray(0, 4).toString('ascii') === 'RIFF' &&
    bytes.subarray(8, 12).toString('ascii') === 'WEBP'

  if (!isWebP) {
    throw new Error(`Invalid WebP source for ${scene}`)
  }

  await writeFile(new URL(`${scene}.webp`, outDir), bytes)
  console.log(`Wrote ${scene}.webp (${bytes.length} bytes)`)
}
