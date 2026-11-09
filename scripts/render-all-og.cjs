const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

const fonts = [
  path.join(__dirname, '..', 'fonts', 'Grandstander-Black.ttf'),
  path.join(__dirname, '..', 'fonts', 'Grandstander-ExtraBold.ttf'),
  path.join(__dirname, '..', 'fonts', 'Grandstander-Bold.ttf'),
  path.join(__dirname, '..', 'fonts', 'Grandstander-SemiBold.ttf'),
  path.join(__dirname, '..', 'fonts', 'Grandstander-Medium.ttf'),
  path.join(__dirname, '..', 'fonts', 'Grandstander-Regular.ttf'),
];

['og-marketing', 'og-pup-preview', 'og-pup-not-found'].forEach(name => {
  const svgPath = path.join(__dirname, '..', 'public', `${name}.svg`);
  const svg = fs.readFileSync(svgPath, 'utf8');

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
    font: {
      fontFiles: fonts,
      defaultFontFamily: 'Grandstander'
    }
  });

  const png = resvg.render().asPng();
  const outPath = path.join(__dirname, '..', 'public', `${name}.png`);
  fs.writeFileSync(outPath, png);
  console.log('Rendered skin-toned:', name, 'Bytes:', png.length);
});
