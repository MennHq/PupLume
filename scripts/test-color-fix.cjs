const fs = require('fs');
const path = require('path');
const { Resvg } = require('@resvg/resvg-js');

async function main() {
  const dogJpgPath = 'C:\\Users\\AHSAN HAROON\\.gemini\\antigravity\\brain\\4ddb26e3-d523-42ab-9697-966bb647edaa\\original-dog.jpg';
  const dogJpg = fs.readFileSync(dogJpgPath);
  const b64 = dogJpg.toString('base64');
  const dataUri = `data:image/jpeg;base64,${b64}`;

  // In the green dog image, Green channel is the brightness. Red and Blue are suppressed.
  // If we map Green luminance to warm Golden Retriever fur:
  // Red = 1.15 * G, Green = 0.95 * G, Blue = 0.65 * G (warm amber / golden coat)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="500" viewBox="0 0 500 500">
    <defs>
      <filter id="warmGold">
        <!-- Convert green dominant image into grayscale luminance first -->
        <feColorMatrix type="matrix" values="
          0 1.0 0 0 0
          0 1.0 0 0 0
          0 1.0 0 0 0
          0 0   0 1 0
        " result="lum" />
        <!-- Tint luminance to golden retriever warm coat (Rich caramel/golden honey) -->
        <feColorMatrix in="lum" type="matrix" values="
          1.18 0 0 0 0.05
          0.98 0 0 0 0.02
          0.72 0 0 0 -0.05
          0    0 0 1 0
        " result="gold" />
      </filter>
    </defs>
    <image href="${dataUri}" width="500" height="500" filter="url(#warmGold)" preserveAspectRatio="xMidYMid slice" />
  </svg>`;

  const resvg = new Resvg(svg);
  const pngData = resvg.render().asPng();
  fs.writeFileSync(path.join(__dirname, '../public/warm-dog-test.png'), pngData);
  console.log('Warm dog generated successfully!');
}

main().catch(console.error);
