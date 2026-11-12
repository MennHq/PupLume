import { readFileSync, writeFileSync } from 'node:fs';

const cssPath = 'src/index.css';
let css = readFileSync(cssPath, 'utf8');

// Replace body font-family
css = css.replace(
  /font-family: 'Outfit'[^;]+;/,
  "font-family: 'Grandstander', cursive, system-ui, sans-serif;"
);

// Replace h1,h2,h3 font-family
css = css.replace(
  /font-family: 'Fraunces', serif;/,
  "font-family: 'Grandstander', cursive, system-ui, sans-serif;"
);

writeFileSync(cssPath, css);
console.log('Successfully updated index.css');
