import { readFileSync, writeFileSync } from 'node:fs';

const cssPath = 'src/index.css';
let css = readFileSync(cssPath, 'utf8');

if (!css.includes('@theme inline')) {
  css = css.replace(
    /@import "tailwindcss";/,
    `@import "tailwindcss";

@theme inline {
  --font-sans: "Grandstander", cursive, system-ui, sans-serif;
  --font-serif: "Grandstander", cursive, system-ui, sans-serif;
  --font-mono: "Grandstander", cursive, system-ui, sans-serif;
}
`
  );
  writeFileSync(cssPath, css);
  console.log('Injected @theme block into main app index.css to force Grandstander');
}
