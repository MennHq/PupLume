const fs = require('fs');
const path = require('path');

async function downloadGoogleFont(family, weights) {
  const url = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weights.join(';')}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  });
  const css = await res.text();
  
  const regex = /font-weight:\s*(\d+);[\s\S]*?src:\s*url\((https:\/\/fonts\.gstatic\.com\/[^\)]+)\)/g;
  let match;
  while ((match = regex.exec(css)) !== null) {
    const weight = match[1];
    const fontUrl = match[2];
    const fileName = `${family.replace(/\s+/g, '')}-${weight}.ttf`;
    const dest = path.join(__dirname, '../fonts', fileName);

    console.log(`Downloading ${family} weight ${weight} from ${fontUrl}...`);
    const fontRes = await fetch(fontUrl);
    const buf = await fontRes.arrayBuffer();
    fs.writeFileSync(dest, Buffer.from(buf));
    console.log(`Saved ${dest} (${buf.byteLength} bytes)`);
  }
}

async function main() {
  await downloadGoogleFont('Outfit', [400, 600, 700, 800, 900]);
  await downloadGoogleFont('Plus Jakarta Sans', [600, 700, 800]);
  console.log('Fonts downloaded successfully!');
}

main().catch(console.error);
