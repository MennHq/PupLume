const fs = require('fs');
const path = require('path');

const uploads = [
  {
    filePath: path.join(__dirname, '../public/master-og-preview.png'),
    url: 'https://mcp.figma.com/mcp/upload/13c756ca-6c5a-4bb1-bb01-b5a8c90f947a/submit?scaleMode=FILL',
    contentType: 'image/png',
    fileName: 'master-og-preview.png'
  },
  {
    filePath: path.join(__dirname, '../public/master-story-template.png'),
    url: 'https://mcp.figma.com/mcp/upload/61574003-1b29-4b5c-ade5-24aa071d1660/submit?scaleMode=FILL',
    contentType: 'image/png',
    fileName: 'master-story-template.png'
  }
];

async function run() {
  for (const item of uploads) {
    console.log(`Updating ${item.fileName} on target node...`);
    const fileBytes = fs.readFileSync(item.filePath);
    
    const form = new FormData();
    const blob = new Blob([fileBytes], { type: item.contentType });
    form.append('file', blob, item.fileName);

    const res = await fetch(item.url, {
      method: 'POST',
      body: form
    });

    const resText = await res.text();
    console.log(`Updated ${item.fileName}: Status ${res.status} - ${resText}`);
  }
}

run().catch(err => {
  console.error('Update failed:', err);
  process.exit(1);
});
