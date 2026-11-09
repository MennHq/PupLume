const fs = require('fs');
const path = require('path');

const uploads = [
  {
    filePath: path.join(__dirname, '../public/master-og-preview.png'),
    url: 'https://mcp.figma.com/mcp/upload/8ee1c262-4364-418c-b4f6-6427825e44e2/submit?scaleMode=FILL&currentPageId=0%3A1',
    contentType: 'image/png',
    fileName: 'master-og-preview-frame.png'
  },
  {
    filePath: path.join(__dirname, '../public/master-story-template.png'),
    url: 'https://mcp.figma.com/mcp/upload/3b78e956-30b0-419b-ad22-3843bc46509a/submit?scaleMode=FILL&currentPageId=0%3A1',
    contentType: 'image/png',
    fileName: 'master-story-template-frame.png'
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
