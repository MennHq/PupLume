const fs = require('fs');
const path = require('path');

async function main() {
  const items = [
    // 4 SVGs (Editable Vector Node Trees)
    {
      file: 'pro-og-preview-1.svg',
      mime: 'image/svg+xml',
      url: 'https://mcp.figma.com/mcp/upload/03737527-3cdd-4655-8351-977fcc801c67/submit?scaleMode=FILL',
      title: '✨ [VECTOR] Master Passport Card Preview (1200x630)'
    },
    {
      file: 'pro-og-preview-2.svg',
      mime: 'image/svg+xml',
      url: 'https://mcp.figma.com/mcp/upload/0e1e8c15-e671-4c98-956e-ae2fbefff84f/submit?scaleMode=FILL',
      title: '✨ [VECTOR] Clean Editorial Preview (1200x630)'
    },
    {
      file: 'pro-story-1.svg',
      mime: 'image/svg+xml',
      url: 'https://mcp.figma.com/mcp/upload/a4c8ab5b-6089-405c-8232-e760552ffd26/submit?scaleMode=FILL',
      title: '✨ [VECTOR] Master Spotify-Style Story (1080x1920)'
    },
    {
      file: 'pro-story-2.svg',
      mime: 'image/svg+xml',
      url: 'https://mcp.figma.com/mcp/upload/34bca4da-ae7f-485f-ad33-98f69b9c382c/submit?scaleMode=FILL',
      title: '✨ [VECTOR] Canine Passport Story (1080x1920)'
    },

    // 4 PNGs (Pixel-Perfect Rendered Frames)
    {
      file: 'pro-og-preview-1.png',
      mime: 'image/png',
      url: 'https://mcp.figma.com/mcp/upload/9b6fb727-5db5-4bd7-a9df-621bf9143e2d/submit?scaleMode=FILL',
      title: '🖼️ [FRAME] Master Passport Card Preview (1200x630)'
    },
    {
      file: 'pro-og-preview-2.png',
      mime: 'image/png',
      url: 'https://mcp.figma.com/mcp/upload/542b7114-258a-4f88-bbad-3891adc8dbf8/submit?scaleMode=FILL',
      title: '🖼️ [FRAME] Clean Editorial Preview (1200x630)'
    },
    {
      file: 'pro-story-1.png',
      mime: 'image/png',
      url: 'https://mcp.figma.com/mcp/upload/6e643e15-d024-484e-a02c-b1c3a3edf4d5/submit?scaleMode=FILL',
      title: '🖼️ [FRAME] Master Spotify-Style Story (1080x1920)'
    },
    {
      file: 'pro-story-2.png',
      mime: 'image/png',
      url: 'https://mcp.figma.com/mcp/upload/788909e8-6fed-48d9-8a2c-2ff4d4d76db9/submit?scaleMode=FILL',
      title: '🖼️ [FRAME] Canine Passport Story (1080x1920)'
    }
  ];

  for (const item of items) {
    const filePath = path.join(__dirname, '..', 'public', item.file);
    const fileBytes = fs.readFileSync(filePath);
    console.log(`Uploading ${item.file} (${fileBytes.length} bytes) to Figma...`);

    const blob = new Blob([fileBytes], { type: item.mime });
    const formData = new FormData();
    const ext = item.mime === 'image/svg+xml' ? '.svg' : '.png';
    formData.append('file', blob, item.title + ext);

    const response = await fetch(item.url, {
      method: 'POST',
      body: formData
    });

    const resText = await response.text();
    console.log(`Uploaded ${item.file}: Status ${response.status}`, resText);
  }
}

main().catch(console.error);
