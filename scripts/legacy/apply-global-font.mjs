import { readFileSync, writeFileSync } from 'node:fs';

// 1. Update index.html
const htmlPath = 'index.html';
let html = readFileSync(htmlPath, 'utf8');

// The current font import has Fraunces, Outfit, and Grandstander.
// We will replace it with a single import for Grandstander.
html = html.replace(
  /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=[^"]+" rel="stylesheet">/,
  '<link href="https://fonts.googleapis.com/css2?family=Grandstander:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">'
);
writeFileSync(htmlPath, html);
console.log('Updated index.html to only import Grandstander');

// 2. Update src/index.css
const cssPath = 'src/index.css';
let css = readFileSync(cssPath, 'utf8');

// Replace Outfit with Grandstander in body
css = css.replace(
  /font-family: 'Outfit', sans-serif;/,
  "font-family: 'Grandstander', cursive;"
);

// Remove Fraunces from h1, h2, h3
css = css.replace(
  /h1, h2, h3 {\n  font-family: 'Fraunces', serif;\n}/,
  "h1, h2, h3 {\n  font-family: 'Grandstander', cursive;\n}"
);

writeFileSync(cssPath, css);
console.log('Updated index.css to use Grandstander everywhere');

// 3. Update design.md
const designPath = 'design.md';
let design = readFileSync(designPath, 'utf8');

design = design.replace(/headings: "Fraunces"/, 'headings: "Grandstander"');
design = design.replace(/body: "Outfit"/, 'body: "Grandstander"');

design = design.replace(
  /- \*\*Headings \(H1\/H2\/H3\):\*\* `Fraunces`[^\n]+/,
  '- **Headings (H1/H2/H3):** `Grandstander`. Using heavier weights for a bold, bubbly, incredibly friendly hierarchy.'
);
design = design.replace(
  /- \*\*Body & UI:\*\* `Outfit`[^\n]+/,
  '- **Body & UI:** `Grandstander`. Using lighter weights (400/500) to keep the app completely unified under one ultra-friendly, soft handwriting style.'
);

writeFileSync(designPath, design);
console.log('Updated design.md');

// 4. Update the SVG in the Assets folder
const svgPath = "C:\\abdullah's\\PupLume\\Antigravity-PupLume Assets\\PupLume-Brand-Identity.svg";
try {
  let svg = readFileSync(svgPath, 'utf8');
  // We'll just replace the CSS for the text classes in the SVG to all use Grandstander
  svg = svg.replace(/font-family: 'Fraunces', serif;/g, "font-family: 'Grandstander', cursive;");
  svg = svg.replace(/font-family: 'Outfit', sans-serif;/g, "font-family: 'Grandstander', cursive;");
  
  // Replace the names in the cards
  svg = svg.replace(/Fraunces/g, "Grandstander (Bold)");
  svg = svg.replace(/Outfit/g, "Grandstander (Regular)");
  svg = svg.replace(/Premium Vintage Serif/g, "Bouncy Display Weight");
  svg = svg.replace(/Geometric Sans Contrast/g, "Soft UI Weight");
  
  writeFileSync(svgPath, svg);
  console.log('Updated SVG');
} catch(e) {
  console.log("Could not update SVG", e.message);
}
