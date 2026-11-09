const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

async function main() {
  const photoUrl = 'https://res.cloudinary.com/puplume/image/upload/v1792845578/puplume/pets/j76lqhakqxgczyplknen.jpg';
  console.log('Fetching Graxzo photo from Cloudinary...');
  const res = await fetch(photoUrl);
  const buf = await res.arrayBuffer();
  const b64 = Buffer.from(buf).toString('base64');
  const dataUri = `data:image/jpeg;base64,${b64}`;

  const svgPath = path.join(__dirname, '..', 'public', 'og-pup-preview.svg');
  let svg = fs.readFileSync(svgPath, 'utf8');

  // Embed Graxzo's real photo directly into the borderless hero photo clip
  const imageTag = `<image href="${dataUri}" width="440" height="470" preserveAspectRatio="xMidYMid slice" />`;
  svg = svg.replace(/<text id="heroPhotoEmoji"[\s\S]*?<\/text>/, imageTag);
  svg = svg.replace('>Bella<', '>Graxzo<');
  svg = svg.replace('>Golden Retriever • 6 months old<', '>German Shepherd • 12 lbs • 6 mo<');
  svg = svg.replace('>Friendly, energetic, and loves children<', '>Playful, affectionate, and learning fast<');
  svg = svg.replace('>985-141-002-841-920<', '>985-GRAXZO-2025-PUP<');

  const fonts = [
    path.join(__dirname, '..', 'fonts', 'Grandstander-Black.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-Bold.ttf'),
    path.join(__dirname, '..', 'fonts', 'Outfit-Bold.ttf'),
    path.join(__dirname, '..', 'fonts', 'Outfit-SemiBold.ttf'),
  ];

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    font: {
      fontFiles: fonts,
      defaultFontFamily: 'Grandstander'
    }
  });
  const pngData = resvg.render().asPng();

  const outPath = path.join(__dirname, '..', 'public', 'og-graxzo.png');
  fs.writeFileSync(outPath, pngData);
  console.log('Successfully generated Graxzo skin-toned OG card (Zero Boxes, Real Grandstander):', outPath, 'Bytes:', pngData.length);
}

main().catch(console.error);
