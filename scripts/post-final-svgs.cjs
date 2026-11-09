const fs = require('fs');
const path = require('path');

const uploads = [
  {
    filePath: path.join(__dirname, '../public/master-og-preview.svg'),
    url: 'https://mcp.figma.com/mcp/upload/f7048041-02df-4378-bd75-df8e493d14ad/submit?scaleMode=FILL&currentPageId=0%3A1',
    contentType: 'image/svg+xml',
    fileName: 'master-og-preview-vector.svg'
  },
  {
    filePath: path.join(__dirname, '../public/master-story-template.svg'),
    url: 'https://mcp.figma.com/mcp/upload/af4cac49-68e5-40db-91b3-42c670940e51/submit?scaleMode=FILL&currentPageId=0%3A1',
    contentType: 'image/svg+xml',
    fileName: 'master-story-template-vector.svg'
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
