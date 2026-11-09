const fs = require('fs');
const path = require('path');

async function main() {
  const uploads = [
    {
      file: 'concept-1.png',
      url: 'https://mcp.figma.com/mcp/upload/61b13723-db73-438d-a29f-8fd5e8515ef1/submit?scaleMode=FILL',
      title: 'OG Preview - Concept 1 (Clean Editorial)'
    },
    {
      file: 'concept-2.png',
      url: 'https://mcp.figma.com/mcp/upload/6bf48cc5-14de-4b0b-969e-c6a836029c7e/submit?scaleMode=FILL',
      title: 'OG Preview - Concept 2 (Floating Passport Card)'
    },
    {
      file: 'concept-3.png',
      url: 'https://mcp.figma.com/mcp/upload/a3260f08-2173-470d-86b8-1d9a845cd7ce/submit?scaleMode=FILL',
      title: 'OG Preview - Concept 3 (Split Brand Hero)'
    },
    {
      file: 'story-template-1.png',
      url: 'https://mcp.figma.com/mcp/upload/5f1c04d1-5057-415d-9336-398d67afafb8/submit?scaleMode=FILL',
      title: 'Instagram Story - Template 1 (Spotify-Style)'
    },
    {
      file: 'story-template-2.png',
      url: 'https://mcp.figma.com/mcp/upload/c335b214-3238-4751-99d2-9d78d2267741/submit?scaleMode=FILL',
      title: 'Instagram Story - Template 2 (Minimal Passport ID)'
    },
    {
      file: 'story-template-3.png',
      url: 'https://mcp.figma.com/mcp/upload/68cdaf1c-b353-49ea-9cfd-5aad9f759cac/submit?scaleMode=FILL',
      title: 'Instagram Story - Template 3 (Emergency & Safety Tag)'
    }
  ];

  for (const item of uploads) {
    const filePath = path.join(__dirname, '..', 'public', item.file);
    const fileBytes = fs.readFileSync(filePath);
    console.log(`Uploading ${item.file} (${fileBytes.length} bytes)...`);

    const blob = new Blob([fileBytes], { type: 'image/png' });
    const formData = new FormData();
    formData.append('file', blob, item.title + '.png');

    const response = await fetch(item.url, {
      method: 'POST',
      body: formData
    });

    const resText = await response.text();
    console.log(`Uploaded ${item.file}: Status ${response.status}`, resText);
  }
}

main().catch(console.error);
