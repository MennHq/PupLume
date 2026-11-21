const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');

const CHROME_PATH = fs.existsSync("C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe")
  ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  : "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const ARTIFACT_DIR = "C:\\Users\\AHSAN HAROON\\.gemini\\antigravity\\brain\\0beb69f7-58c5-4413-99c9-8c1bb65d2b50";
const PORT = 9229;

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

const samplePupData = JSON.stringify({
  id: 'pup-graxzo-sample',
  name: 'Graxzo',
  breed: 'Golden Retriever',
  birthDate: '2024-04-12',
  sex: 'male',
  weightLbs: 34,
  photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=400',
  temperament: 'Playful, curious, friendly',
  microchipNumber: 'PL-GRXZ-981-PUP',
  slug: 'graxzo',
  pageTheme: 'puplume_classic',
  pageFont: 'grandstander',
  pageHeadline: 'The Adventurous Golden in Seattle 🌲',
  pageBio: 'Certified good boy, fetch champion, and treat connoisseur. Check out my gear and socials below!',
  ownerPhone: '+1 (555) 234-5678',
  customLinks: [
    {
      id: 'l1',
      title: "Follow Graxzo's Instagram Reels",
      url: 'https://instagram.com/graxzo',
      subtitle: 'Daily training, trail runs & puppy tricks',
      category: 'social',
      highlight: true,
      badgeText: 'Official'
    },
    {
      id: 'l2',
      title: 'Our Favorite Organic Salmon Treats',
      url: 'https://puplume.pet/gear',
      subtitle: '20% off with code GRAXZO20',
      category: 'gear',
      highlight: true,
      badgeText: '20% Off'
    },
    {
      id: 'l3',
      title: 'Seattle North Animal Hospital (24/7)',
      url: 'https://seattleanimalvet.com',
      subtitle: 'Primary clinic & emergency care records',
      category: 'service',
      highlight: false,
      badgeText: 'Primary Vet'
    }
  ]
});

async function main() {
  const tmpDir = path.join('C:\\tmp', 'chrome-cdp-sub-' + Date.now());
  fs.mkdirSync(tmpDir, { recursive: true });

  const proc = spawn(CHROME_PATH, [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${tmpDir}`,
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--hide-scrollbars',
    'http://localhost:3001/?mock=true'
  ]);

  await new Promise(r => setTimeout(r, 2500));

  try {
    const list = await fetchJson(`http://127.0.0.1:${PORT}/json/list`);
    const page = list.find(t => t.type === 'page') || list[0];
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.on('open', res); ws.on('error', rej); });

    let msgId = 1;
    function sendCommand(method, params = {}) {
      return new Promise((resolve) => {
        const id = msgId++;
        const handler = (raw) => {
          const res = JSON.parse(raw.toString());
          if (res.id === id) {
            ws.off('message', handler);
            resolve(res.result);
          }
        };
        ws.on('message', handler);
        ws.send(JSON.stringify({ id, method, params }));
      });
    }

    // Set mobile viewport (iPhone 14 Pro: 393 x 852)
    await sendCommand('Emulation.setDeviceMetricsOverride', {
      width: 393,
      height: 852,
      deviceScaleFactor: 2,
      mobile: true
    });

    // Populate localStorage on localhost:3001
    await sendCommand('Runtime.evaluate', {
      expression: `
        localStorage.setItem('puplume_puppy', ${JSON.stringify(samplePupData)});
        localStorage.setItem('puplume_puppies', JSON.stringify([${samplePupData}]));
        localStorage.setItem('puplume_local_puppies', JSON.stringify([${samplePupData}]));
        localStorage.setItem('puplume_smart_tag_pass_pup-graxzo-sample', 'true');
        localStorage.setItem('puplume_smart_tag_pass_pup-graxzo-1', 'true');
        localStorage.setItem('puplume_tour_completed', 'true');
        localStorage.setItem('hasCompletedChecklist', 'true');
        localStorage.setItem('hasCompletedOnboarding', 'true');
      `
    });

    // 1. Capture public puppy page (Full Page)
    await sendCommand('Page.navigate', { url: 'http://localhost:3001/pup/graxzo?mock=true' });
    await new Promise(r => setTimeout(r, 3000));

    const shot1 = await sendCommand('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    if (shot1 && shot1.data) {
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'after_unslop_public_pup_page.png'), Buffer.from(shot1.data, 'base64'));
      console.log('Saved shot 1: after_unslop_public_pup_page.png');
    }

    // 2. Capture pup profile view and switch to studio tab
    await sendCommand('Page.navigate', { url: 'http://localhost:3001/?mock=true' });
    await new Promise(r => setTimeout(r, 3000));

    // Dismiss tour if present
    await sendCommand('Runtime.evaluate', {
      expression: `
        const skipTourBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Skip Tour'));
        if (skipTourBtn) skipTourBtn.click();
      `
    });
    await new Promise(r => setTimeout(r, 800));

    // Click on Profile navigation item in bottom bar
    await sendCommand('Runtime.evaluate', {
      expression: `
        const navBtns = Array.from(document.querySelectorAll('nav button, button'));
        const profileBtn = navBtns.find(b => b.textContent && (b.textContent.includes('Profile') || b.textContent.includes('Pup') || b.textContent.includes('Graxzo')));
        if (profileBtn) profileBtn.click();
      `
    });
    await new Promise(r => setTimeout(r, 1500));

    // Switch to Studio tab
    await sendCommand('Runtime.evaluate', {
      expression: `
        const btns = Array.from(document.querySelectorAll('button'));
        const sBtn = btns.find(b => b.textContent && (b.textContent.includes('Studio') || b.textContent.includes('Page Studio')));
        if (sBtn) sBtn.click();
      `
    });
    await new Promise(r => setTimeout(r, 1500));

    const shot2 = await sendCommand('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    if (shot2 && shot2.data) {
      fs.writeFileSync(path.join(ARTIFACT_DIR, 'after_unslop_pup_manager_studio.png'), Buffer.from(shot2.data, 'base64'));
      console.log('Saved shot 2: after_unslop_pup_manager_studio.png');
    }

    ws.close();
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    proc.kill();
  }
}

main();
