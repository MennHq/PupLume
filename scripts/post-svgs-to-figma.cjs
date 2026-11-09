const fs = require('fs');
const path = require('path');

async function main() {
  const uploads = [
    {
      file: 'concept-1.svg',
      url: 'https://mcp.figma.com/mcp/upload/0e3f9c6e-4207-4eb4-bf69-39d96085f5d9/submit?scaleMode=FILL',
      title: 'Editable Vector - OG Concept 1'
    },
    {
      file: 'concept-2.svg',
      url: 'https://mcp.figma.com/mcp/upload/bb8a3c42-1f1a-4c07-9ed3-79a5c7e8d0df/submit?scaleMode=FILL',
      title: 'Editable Vector - OG Concept 2'
    },
    {
      file: 'concept-3.svg',
      url: 'https://mcp.figma.com/mcp/upload/232c49a7-eec5-4bd6-b039-2e2c82129412/submit?scaleMode=FILL',
      title: 'Editable Vector - OG Concept 3'
    },
    {
      file: 'story-template-1.svg',
      url: 'https://mcp.figma.com/mcp/upload/37e56991-766b-436f-9ac9-f6ea7283abab/submit?scaleMode=FILL',
      title: 'Editable Vector - Story Template 1'
    },
    {
      file: 'story-template-2.svg',
      url: 'https://mcp.figma.com/mcp/upload/ec1ad9e4-19be-4944-84bd-25c66debf2a4/submit?scaleMode=FILL',
      title: 'Editable Vector - Story Template 2'
    },
    {
      file: 'story-template-3.svg',
      url: 'https://mcp.figma.com/mcp/upload/21494558-81c4-41ec-826c-bacb232c2081/submit?scaleMode=FILL',
      title: 'Editable Vector - Story Template 3'
    }
  ];

  for (const item of uploads) {
    const filePath = path.join(__dirname, '..', 'public', item.file);
    const fileBytes = fs.readFileSync(filePath);
    console.log(`Uploading SVG ${item.file} (${fileBytes.length} bytes)...`);

    const blob = new Blob([fileBytes], { type: 'image/svg+xml' });
    const formData = new FormData();
    formData.append('file', blob, item.title + '.svg');

    const response = await fetch(item.url, {
      method: 'POST',
      body: formData
    });

    const resText = await response.text();
    console.log(`Uploaded SVG ${item.file}: Status ${response.status}`, resText);
  }
}

main().catch(console.error);
