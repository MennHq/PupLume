const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

async function main() {
  const photoUrl = 'https://res.cloudinary.com/puplume/image/upload/v1792845578/puplume/pets/j76lqhakqxgczyplknen.jpg';
  const res = await fetch(photoUrl);
  const buf = await res.arrayBuffer();
  const b64 = Buffer.from(buf).toString('base64');
  const dataUri = `data:image/jpeg;base64,${b64}`;

  const svgPath = path.join(__dirname, '..', 'public', 'og-pup-preview.svg');
  let svg = fs.readFileSync(svgPath, 'utf8');

  // Embed Graxzo's real photo with rounded clipping inside photo frame
  const imageTag = `<defs><clipPath id="graxzoPhotoClip"><rect x="20" y="20" width="360" height="380" rx="24" /></clipPath></defs><image href="${dataUri}" x="20" y="20" width="360" height="380" preserveAspectRatio="xMidYMid slice" clip-path="url(#graxzoPhotoClip)" />`;
  svg = svg.replace('<text x="200" y="235" font-size="130" text-anchor="middle">🐶</text>', imageTag);
  svg = svg.replace('>Bella<', '>Graxzo<');
  svg = svg.replace('>Golden Retriever • 6 months old<', '>German Shepherd • 12 lbs<');
  svg = svg.replace('>Friendly, highly energetic, loves children<', '>Playful, affectionate, and learning fast<');
  svg = svg.replace('985-141-002-841-920', '985-GRAXZO-2025-PUP');

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } });
  const pngData = resvg.render().asPng();

  const outPath = path.join(__dirname, '..', 'public', 'og-graxzo.png');
  fs.writeFileSync(outPath, pngData);
  console.log('Successfully generated Light Mode Graxzo card:', outPath, 'Bytes:', pngData.length);
}

main().catch(console.error);
