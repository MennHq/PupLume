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

  const fonts = [
    path.join(__dirname, '..', 'fonts', 'Grandstander-Black.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-ExtraBold.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-Bold.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-SemiBold.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-Medium.ttf'),
    path.join(__dirname, '..', 'fonts', 'Grandstander-Regular.ttf'),
  ];

  const concepts = [
    {
      svgFile: 'concept-1.svg',
      outFile: 'concept-1.png',
      replaceTarget: '<text id="c1PhotoPlaceholder" x="225" y="275" font-size="140" text-anchor="middle">🐶</text>',
      imageTag: `<image href="${dataUri}" width="450" height="470" preserveAspectRatio="xMidYMid slice" />`
    },
    {
      svgFile: 'concept-2.svg',
      outFile: 'concept-2.png',
      replaceTarget: '<text id="c2PhotoPlaceholder" x="220" y="300" font-size="140" text-anchor="middle">🐶</text>',
      imageTag: `<image href="${dataUri}" width="440" height="500" preserveAspectRatio="xMidYMid slice" />`
    },
    {
      svgFile: 'concept-3.svg',
      outFile: 'concept-3.png',
      replaceTarget: '<text id="c3PhotoPlaceholder" x="230" y="300" font-size="160" text-anchor="middle">🐶</text>',
      imageTag: `<image href="${dataUri}" x="20" y="30" width="420" height="420" preserveAspectRatio="xMidYMid slice" />`
    }
  ];

  for (const c of concepts) {
    const svgPath = path.join(__dirname, '..', 'public', c.svgFile);
    let svg = fs.readFileSync(svgPath, 'utf8');
    svg = svg.replace(c.replaceTarget, c.imageTag);

    const resvg = new Resvg(svg, {
      fitTo: { mode: 'width', value: 1200 },
      font: {
        fontFiles: fonts,
        defaultFontFamily: 'Grandstander'
      }
    });
    const png = resvg.render().asPng();
    const outPath = path.join(__dirname, '..', 'public', c.outFile);
    fs.writeFileSync(outPath, png);
    console.log(`Rendered ${c.outFile} (${png.length} bytes)`);
  }
}

main().catch(console.error);
