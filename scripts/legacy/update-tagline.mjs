import { readFileSync, writeFileSync } from 'node:fs';

const replaceTagline = (path, oldText, newText) => {
  try {
    let content = readFileSync(path, 'utf8');
    content = content.replace(new RegExp(oldText, 'g'), newText);
    writeFileSync(path, content);
    console.log(`Updated ${path}`);
  } catch (e) {
    console.log(`Could not update ${path}: ${e.message}`);
  }
}

// 1. Update Main App Logo
replaceTagline(
  'src/components/common/PupLumeLogo.tsx',
  'AI Puppy Manager',
  'Your Puppy Digital Home'
);

// 2. Update Marketing App Logo
replaceTagline(
  '../puplume-marketing/src/components/common/PupLumeLogo.tsx',
  'AI Puppy Manager',
  'Your Puppy Digital Home'
);

// 3. Update Main App index.html metadata
replaceTagline(
  'index.html',
  'PupLume \\\\?" AI Puppy Manager',
  'PupLume ?" Your Puppy Digital Home'
);
replaceTagline(
  'index.html',
  'PupLume - AI Puppy Manager',
  'PupLume - Your Puppy Digital Home'
);

// 4. Update Marketing App layout.tsx metadata
replaceTagline(
  '../puplume-marketing/src/app/layout.tsx',
  'PupLume \\| AI Puppy Manager',
  'PupLume | Your Puppy Digital Home'
);

