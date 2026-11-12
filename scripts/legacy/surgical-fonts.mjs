import { readFileSync, writeFileSync } from 'node:fs';

// --- MAIN APP ---
const mainCssPath = 'src/index.css';
let mainCss = readFileSync(mainCssPath, 'utf8');

// Remove the @theme block that hijacked everything
mainCss = mainCss.replace(/@theme inline {[\s\S]*?}\n\n\n/, '');

// Reset body to Outfit/system sans
mainCss = mainCss.replace(
  /body {\n  font-family: 'Grandstander', cursive, system-ui, sans-serif;/g,
  "body {\n  font-family: 'Outfit', system-ui, sans-serif;"
);

// Reset headings to inherit or use Outfit
mainCss = mainCss.replace(
  /h1, h2, h3, h4, h5, h6, .brand-heading {\n  font-family: 'Grandstander', cursive, system-ui, sans-serif;\n}/g,
  "h1, h2, h3, h4, h5, h6, .brand-heading {\n  font-family: 'Outfit', system-ui, sans-serif;\n  font-weight: 700;\n}"
);

// Add a specific rule for buttons to use Grandstander
if (!mainCss.includes('button {') && !mainCss.includes('font-family: \'Grandstander\'')) {
  mainCss += `\n\nbutton, .btn, [role="button"] {\n  font-family: 'Grandstander', cursive;\n}\n`;
}

writeFileSync(mainCssPath, mainCss);
console.log('Main app CSS reverted. Buttons/Logo keep Grandstander, body goes back to clean sans.');

// Ensure Outfit is loaded in index.html!
const mainHtmlPath = 'index.html';
let mainHtml = readFileSync(mainHtmlPath, 'utf8');
if (!mainHtml.includes('Outfit')) {
  mainHtml = mainHtml.replace(
    /<link href="https:\/\/fonts.googleapis.com\/css2\?family=Grandstander[^>]+>/,
    `<link href="https://fonts.googleapis.com/css2?family=Grandstander:ital,wght@0,100..900;1,100..900&family=Outfit:wght@100..900&display=swap" rel="stylesheet">`
  );
  writeFileSync(mainHtmlPath, mainHtml);
  console.log('Added Outfit back to main app index.html');
}

// --- MARKETING SITE ---
const marketingCssPath = '../puplume-marketing/src/app/globals.css';
let marketingCss = readFileSync(marketingCssPath, 'utf8');

// Revert font-sans mapping
marketingCss = marketingCss.replace(
  /--font-sans: var\(--font-grandstander\);/g,
  "--font-sans: var(--font-geist-sans);\n  --font-brand: var(--font-grandstander);"
);

// Reset body
marketingCss = marketingCss.replace(
  /font-family: var\(--font-grandstander\), cursive, sans-serif;/g,
  "font-family: var(--font-sans), sans-serif;"
);

writeFileSync(marketingCssPath, marketingCss);
console.log('Marketing globals.css reverted to Geist. Grandstander available as --font-brand.');

// Marketing page.tsx: Apply font-brand to buttons and maybe the big hero headline
const marketingPagePath = '../puplume-marketing/src/app/page.tsx';
let marketingPage = readFileSync(marketingPagePath, 'utf8');

// The Logo is already hardcoded to Grandstander, so it's safe.
// Let's make buttons use Grandstander.
marketingPage = marketingPage.replace(
  /className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-\[#8B5E3C\]/g,
  'className="font-[family-name:var(--font-brand)] w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-[#8B5E3C]'
);
marketingPage = marketingPage.replace(
  /className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-\[#8B5E3C\] bg-white/g,
  'className="font-[family-name:var(--font-brand)] w-full sm:w-auto px-8 py-4 text-lg font-bold text-[#8B5E3C] bg-white'
);

// Make the hero headline use Grandstander so it pops? The user said "somewhere in marketing page".
marketingPage = marketingPage.replace(
  /<motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-black/,
  '<motion.h1 variants={fadeUp} className="font-[family-name:var(--font-brand)] text-5xl md:text-7xl font-black'
);

writeFileSync(marketingPagePath, marketingPage);
console.log('Applied font-brand to marketing buttons and hero heading.');
