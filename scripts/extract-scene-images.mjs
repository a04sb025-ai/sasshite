import { mkdir, readFile, writeFile } from 'node:fs/promises'

const scenes = ['train', 'elevator', 'karaage', 'meeting', 'ending']
const outDir = new URL('../public/scenes/', import.meta.url)

await mkdir(outDir, { recursive: true })

for (const scene of scenes) {
  const svgUrl = new URL(`../src/assets/scene-${scene}.svg`, import.meta.url)
  const svg = await readFile(svgUrl, 'utf8')
  const match = svg.match(/data:image\/jpeg;base64,([^"']+)/)

  if (!match) {
    throw new Error(`Embedded JPEG was not found in ${svgUrl.pathname}`)
  }

  const jpg = Buffer.from(match[1], 'base64')
  await writeFile(new URL(`${scene}.jpg`, outDir), jpg)
  console.log(`Extracted ${scene}.jpg (${jpg.length} bytes)`)
}
