import { readFileSync, writeFileSync } from 'node:fs';

const fixLogo = (path) => {
  let logo = readFileSync(path, 'utf8');
  // Add font-black (900 weight) back to the logo text so it's ultra bold and bubbly!
  logo = logo.replace(
    /className={\`tracking-tight text-\[#2C211B\] \$\{textSize\}\`}/g,
    'className={`font-black tracking-tight text-[#2C211B] ${textSize}`}'
  );
  logo = logo.replace(
    /className={\`font-extrabold tracking-tight text-\[#2C211B\] \$\{textSize\}\`}/g,
    'className={`font-black tracking-tight text-[#2C211B] ${textSize}`}'
  );
  
  // Also make sure the subSize (AI Puppy Manager) is bold
  logo = logo.replace(
    /font-semibold/g,
    'font-bold'
  );
  writeFileSync(path, logo);
}

try {
  fixLogo('src/components/common/PupLumeLogo.tsx');
  console.log('Fixed logo in main app');
} catch(e) {}

try {
  fixLogo('../puplume-marketing/src/components/common/PupLumeLogo.tsx');
  console.log('Fixed logo in marketing app');
} catch(e) {}
