const fs = require('fs');
const path = require('path');

const uploads = [
  {
    filePath: path.join(__dirname, '../public/master-og-preview.png'),
    url: 'https://mcp.figma.com/mcp/upload/f5e324c4-0f46-459f-9797-ac957e772683/submit?scaleMode=FILL&currentPageId=0%3A1',
    contentType: 'image/png',
    fileName: 'master-og-preview.png'
  },
  {
    filePath: path.join(__dirname, '../public/master-story-template.png'),
    url: 'https://mcp.figma.com/mcp/upload/569e3a52-6983-48fe-8897-6068e521e9fb/submit?scaleMode=FILL&currentPageId=0%3A1',
    contentType: 'image/png',
    fileName: 'master-story-template.png'
  }
];

async function run() {
  for (const item of uploads) {
    console.log(`Uploading ${item.fileName}...`);
    const fileBytes = fs.readFileSync(item.filePath);
    
    const form = new FormData();
    const blob = new Blob([fileBytes], { type: item.contentType });
    form.append('file', blob, item.fileName);

    const res = await fetch(item.url, {
      method: 'POST',
      body: form
    });

    const resText = await res.text();
    console.log(`Uploaded ${item.fileName}: Status ${res.status} - ${resText}`);
  }
}

run().catch(err => {
  console.error('Upload failed:', err);
  process.exit(1);
});
