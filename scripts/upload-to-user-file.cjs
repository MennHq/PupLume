const fs = require('fs');
const path = require('path');

const uploads = [
  {
    filePath: path.join(__dirname, '../public/master-og-preview.png'),
    url: 'https://mcp.figma.com/mcp/upload/65290b27-e4a3-4f99-ac9a-befe9d570527/submit?scaleMode=FILL&currentPageId=0%3A1',
    contentType: 'image/png',
    fileName: 'master-og-preview.png'
  },
  {
    filePath: path.join(__dirname, '../public/master-og-preview.svg'),
    url: 'https://mcp.figma.com/mcp/upload/6fd20df4-a413-4c8b-b980-81e6973ea5f1/submit?scaleMode=FILL&currentPageId=0%3A1',
    contentType: 'image/svg+xml',
    fileName: 'master-og-preview.svg'
  },
  {
    filePath: path.join(__dirname, '../public/master-story-template.png'),
    url: 'https://mcp.figma.com/mcp/upload/c281c601-47a8-4684-a751-5ff83d6d632c/submit?scaleMode=FILL&currentPageId=0%3A1',
    contentType: 'image/png',
    fileName: 'master-story-template.png'
  },
  {
    filePath: path.join(__dirname, '../public/master-story-template.svg'),
    url: 'https://mcp.figma.com/mcp/upload/4a47e319-e20a-4692-8b40-39d0c788ad36/submit?scaleMode=FILL&currentPageId=0%3A1',
    contentType: 'image/svg+xml',
    fileName: 'master-story-template.svg'
  }
];

async function run() {
  for (const item of uploads) {
    console.log(`Uploading ${item.fileName} to user's file NkCf74n6HIFtxs396bFZkQ...`);
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
