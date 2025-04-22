import fs from 'fs';
import path from 'path';
import slugify from 'slugify';

const outputDir = 'data/pages';
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

export function savePage({ url, title, content }) {
  const slug = slugify(url, { lower: true, strict: true }).slice(0, 100);
  const filePath = path.join(outputDir, `${slug}.json`);
  const data = { url, title, content };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ Saved: ${filePath}`);
}
