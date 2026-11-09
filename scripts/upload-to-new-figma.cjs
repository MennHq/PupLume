const fs = require('fs');
const path = require('path');

const uploads = [
  {
    filePath: path.join(__dirname, '../public/master-og-preview.png'),
    url: 'https://mcp.figma.com/mcp/upload/0e69d65c-34c0-4f17-b0ea-09a4a883eb15/submit?scaleMode=FILL',
    contentType: 'image/png',
    fileName: 'master-og-preview.png'
  },
  {
    filePath: path.join(__dirname, '../public/master-og-preview.svg'),
    url: 'https://mcp.figma.com/mcp/upload/c8146c77-f8f7-455f-8184-743d7bf32332/submit?scaleMode=FILL',
    contentType: 'image/svg+xml',
    fileName: 'master-og-preview.svg'
  },
  {
    filePath: path.join(__dirname, '../public/master-story-template.png'),
    url: 'https://mcp.figma.com/mcp/upload/54df4a31-6a6e-4e13-95af-61f4ca2069af/submit?scaleMode=FILL',
    contentType: 'image/png',
    fileName: 'master-story-template.png'
  },
  {
    filePath: path.join(__dirname, '../public/master-story-template.svg'),
    url: 'https://mcp.figma.com/mcp/upload/1d267bb6-796e-4e2d-becb-576c059cdbb1/submit?scaleMode=FILL',
    contentType: 'image/svg+xml',
    fileName: 'master-story-template.svg'
  }
];

async function run() {
  for (const item of uploads) {
    console.log(`Uploading ${item.fileName}...`);
    const fileBytes = fs.readFileSync(item.filePath);
    
    // Using multipart/form-data with FormData so Figma keeps the clean layer filename
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
