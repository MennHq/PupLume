const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');

const path = require('path');

const svg1 = `<svg width="400" height="100" xmlns="http://www.w3.org/2000/svg">
  <rect width="400" height="100" fill="#FFF9F2"/>
  <text x="20" y="65" font-family="Outfit" font-size="44" font-weight="900" fill="#1C140E">Graxzo Outfit</text>
</svg>`;

const resvg1 = new Resvg(svg1, {
  font: {
    fontFiles: [
      path.resolve(__dirname, '../fonts/Outfit-900.ttf'),
      path.resolve(__dirname, '../fonts/Outfit-700.ttf'),
      path.resolve(__dirname, '../fonts/Outfit-400.ttf')
    ],
    loadSystemFonts: false,
    defaultFontFamily: 'Outfit'
  }
});
fs.writeFileSync('public/test-outfit.png', resvg1.render().asPng());
console.log('test-outfit.png rendered with path.resolve!');
