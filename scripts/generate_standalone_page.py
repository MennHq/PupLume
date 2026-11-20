import os
import base64

with open('graxzo_avatar.png', 'rb') as f:
    avatar_b64 = base64.b64encode(f.read()).decode('utf-8')

html_content = f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>Graxzo — Digital Pet Passport | PupLume</title>
  <meta name="description" content="Official PupLume Pet Passport and Emergency Tag for Graxzo (German Shepherd)." />

  <!-- Google Fonts: Grandstander, Outfit, Plus Jakarta Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Grandstander:wght@400;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet">

  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {{
      theme: {{
        extend: {{
          fontFamily: {{
            grandstander: ["'Grandstander'", 'cursive', 'sans-serif'],
            outfit: ["'Outfit'", 'sans-serif'],
            jakarta: ["'Plus Jakarta Sans'", 'sans-serif'],
            mono: ["ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"]
          }},
          boxShadow: {{
            'card': '0 8px 30px rgba(44,33,27,0.04)',
            '2xs': '0 1px 2px rgba(44,33,27,0.03)'
          }}
        }}
      }}
    }}
  </script>

  <style>
    body {{
      font-family: 'Outfit', sans-serif;
      background-color: #FFF9F2;
      color: #2C211B;
      -webkit-tap-highlight-color: transparent;
    }}
    .font-grandstander {{
      font-family: 'Grandstander', cursive;
    }}
    @keyframes heartBurst {{
      0% {{ opacity: 0; transform: translateY(0) scale(0.6); }}
      50% {{ opacity: 1; transform: translateY(-16px) scale(1.2); }}
      100% {{ opacity: 0; transform: translateY(-30px) scale(0.9); }}
    }}
    .heart-burst {{
      animation: heartBurst 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }}
    @keyframes pulseGlow {{
      0%, 100% {{ opacity: 1; transform: scale(1); }}
      50% {{ opacity: 0.5; transform: scale(1.15); }}
    }}
    .pulse-dot {{
      animation: pulseGlow 2s ease-in-out infinite;
    }}
  </style>
</head>
<body class="min-h-screen bg-[#FFF9F2] text-[#2C211B] flex flex-col items-center selection:bg-[#8B5E3C] selection:text-white">

  <!-- Top Brand Navigation Bar -->
  <header class="w-full bg-white/90 backdrop-blur-md border-b border-[#EFE8E1] text-[#1C140E] sticky top-0 z-40 transition-colors">
    <div class="max-w-xl mx-auto px-4 h-16 flex items-center justify-between">
      <!-- PupLume Brand Logo -->
      <div class="flex items-center gap-2.5 select-none">
        <div class="inline-flex items-center gap-2.5">
          <!-- Mascot SVG -->
          <svg viewBox="0 0 100 100" width="34" height="34" class="flex-shrink-0 drop-shadow-xs">
            <g transform="translate(6, 4) scale(0.19)">
              <path d="M 220 80 C 130 80 70 140 70 240 C 70 330 140 380 220 380 C 300 380 370 330 370 240 C 370 140 310 80 220 80 Z" fill="#8B5E3C" />
              <path d="M 120 120 C 60 140 30 210 40 290 C 45 320 70 340 95 325 C 115 310 135 250 140 200 Z" fill="#5F3E29" />
              <path d="M 320 120 C 380 140 410 210 400 290 C 395 320 370 340 345 325 C 325 310 305 250 300 200 Z" fill="#5F3E29" />
              <ellipse cx="220" cy="275" rx="85" ry="70" fill="#FFF9F2" />
              <path d="M 195 240 C 195 230 245 230 245 240 C 245 258 228 272 220 272 C 212 272 195 258 195 240 Z" fill="#2C211B" />
              <ellipse cx="212" cy="238" rx="6" ry="3" fill="#FFFFFF" opacity="0.6" />
              <circle cx="165" cy="205" r="14" fill="#2C211B" />
              <circle cx="161" cy="201" r="5" fill="#FFFFFF" />
              <circle cx="275" cy="205" r="14" fill="#2C211B" />
              <circle cx="271" cy="201" r="5" fill="#FFFFFF" />
              <g transform="translate(295, 45)">
                <path d="M 40 0 C 40 22 58 40 80 40 C 58 40 40 58 40 80 C 40 58 22 40 0 40 C 22 40 40 22 40 0 Z" fill="#F59E0B" />
                <circle cx="40" cy="40" r="10" fill="#FFF9F2" />
              </g>
            </g>
          </svg>

          <!-- Wordmark -->
          <div class="flex flex-col leading-none">
            <div class="font-black tracking-tight text-[#2C211B] text-lg font-grandstander">
              Pup<span class="text-[#8B5E3C]">Lume</span>
            </div>
            <span class="font-bold uppercase text-[#766A63] text-[9px] tracking-[0.14em] hidden sm:block">
              YOUR PUPPY DIGITAL HOME
            </span>
          </div>
        </div>

        <span class="text-[10px] font-extrabold tracking-widest uppercase text-[#8B5E3C] bg-[#FAF6F0] border border-[#EFE8E1] px-2.5 py-1 rounded-full">
          DIGITAL PET PASSPORT
        </span>
      </div>

      <!-- Active Smart Tag Pill -->
      <div class="flex items-center gap-2">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-[11px] font-bold text-emerald-800 shadow-2xs">
          <span class="w-2 h-2 rounded-full bg-emerald-500 pulse-dot"></span>
          <span>Active Smart Tag</span>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Passport Container -->
  <main class="w-full max-w-xl px-4 py-5 sm:py-6 space-y-4 mb-16">

    <!-- ========================================== -->
    <!-- PASSPORT HERO CARD                         -->
    <!-- ========================================== -->
    <div class="bg-white rounded-[28px] border border-[#E8DDD3] shadow-[0_8px_30px_rgba(44,33,27,0.04)] p-6 sm:p-7 relative overflow-hidden">
      <!-- Ambient Circle Accent -->
      <div class="absolute -top-12 -right-12 w-44 h-44 rounded-full border-[10px] border-[#8B5E3C]/10 pointer-events-none"></div>

      <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
        <!-- Photo Frame + Verified Tag Badge -->
        <div class="relative shrink-0">
          <div class="w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-[#8B5E3C]/25 bg-[#FAF6F0] shadow-sm relative">
            <img
              src="data:image/png;base64,{avatar_b64}"
              alt="Graxzo"
              class="w-full h-full object-cover"
            />
          </div>

          <!-- Verified Tag Medallion -->
          <div class="absolute -bottom-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1 border border-emerald-600 font-sans">
            <svg class="w-3 h-3 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>VERIFIED TAG</span>
          </div>
        </div>

        <!-- Canine Identity Information -->
        <div class="flex-1 text-center sm:text-left space-y-2">
          <div class="flex items-center justify-center sm:justify-between gap-2">
            <span class="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#8B5E3C] font-sans">
              OFFICIAL PASSPORT • GRAXZO2
            </span>
          </div>

          <h1 class="font-grandstander text-4xl sm:text-5xl font-black text-[#2C211B] tracking-tight leading-none">
            Graxzo
          </h1>

          <!-- Breed, Age, Weight, Sex -->
          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-xs font-semibold text-[#5F4E44] pt-0.5 font-sans">
            <span class="bg-[#FAF6F0] border border-[#EFE8E1] text-[#2C211B] px-2.5 py-0.5 rounded-lg font-bold">
              German Shepherd
            </span>
            <span class="opacity-40">•</span>
            <span>1.7 yrs old</span>
            <span class="opacity-40">•</span>
            <span>12 lbs</span>
            <span class="opacity-40">•</span>
            <span>Male</span>
          </div>

          <!-- Temperament Note -->
          <p class="text-xs sm:text-sm text-[#5F4E44] font-medium pt-1 leading-relaxed">
            🎭 <span class="font-bold text-[#2C211B]">Temperament:</span> Playful, affectionate, and learning fast
          </p>

          <!-- Microchip Quick Copy -->
          <div class="pt-2 flex items-center justify-center sm:justify-start gap-2">
            <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#EFE8E1] bg-[#FAF6F0] text-[#2C211B] text-xs font-mono">
              <span class="text-[10px] font-sans font-extrabold uppercase text-[#8B5E3C]">MICROCHIP:</span>
              <span id="chipCode" class="font-bold">PL-BGX6EG-FUP</span>
            </div>
            <button
              id="copyChipBtn"
              onclick="handleCopyMicrochip()"
              class="px-2.5 py-1.5 rounded-xl border border-[#EFE8E1] hover:bg-[#FAF6F0] text-[#766A63] transition-all active:scale-[0.97] text-xs font-bold flex items-center gap-1 shadow-2xs cursor-pointer font-sans"
              title="Copy Microchip Serial"
            >
              <svg id="copyIcon" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              <span id="copyText">Copy</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- DIRECT EMERGENCY CONTACTS                  -->
    <!-- ========================================== -->
    <div class="space-y-2.5">
      <div class="flex items-center justify-between px-1">
        <h2 class="text-xs font-extrabold uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5 font-sans">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          Direct Emergency Contacts
        </h2>
        <span class="text-[11px] text-[#766A63] font-medium font-sans">Tap to connect directly</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 font-sans">
        <!-- Primary Call Owner Button -->
        <a
          href="tel:03181700000"
          class="p-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-sm transition-transform active:scale-[0.98] cursor-pointer bg-[#7C5036] hover:bg-[#68412B] text-white"
        >
          <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <span>Call Owner (0318 1700000)</span>
        </a>

        <!-- Send SMS Button -->
        <a
          href="sms:03181700000?&body=Hi!%20I%20found%20Graxzo.%20They%20are%20safe%20with%20me%20right%20now."
          class="p-4 rounded-2xl bg-[#FFF9F2] text-[#8B5E3C] hover:bg-[#F3E7DA] border border-[#E8DDD3] font-black text-sm flex items-center justify-center gap-2.5 shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
        >
          <svg class="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
          </svg>
          <span>Send SMS Message</span>
        </a>
      </div>

      <!-- ONE-TAP GPS LOCATION SHARING -->
      <div class="bg-white border border-[#E8DDD3] rounded-2xl p-4 shadow-2xs font-sans">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div class="text-center sm:text-left">
            <div class="text-xs font-bold text-[#2C211B] flex items-center justify-center sm:justify-start gap-1.5">
              <svg class="w-4 h-4 text-rose-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Send Live GPS Pin to Owner</span>
            </div>
            <p class="text-[11px] text-[#766A63] mt-0.5">
              Instantly sends your exact Google Maps pin via SMS so the owner can navigate straight to you.
            </p>
          </div>

          <button
            id="sendGpsBtn"
            onclick="handleShareLocation()"
            class="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-transform active:scale-[0.98] shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <svg id="gpsIcon" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="3 11 22 2 13 21 11 13 3 11" />
            </svg>
            <span id="gpsBtnText">Send GPS Pin</span>
          </button>
        </div>

        <div id="gpsOutput" class="hidden mt-3 p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 flex items-center justify-between gap-2">
          <span id="gpsLinkDisplay" class="truncate text-[11px] font-mono"></span>
          <button
            id="gpsCopyBtn"
            onclick="handleCopyGpsLink()"
            class="px-2 py-1 bg-blue-600 text-white rounded text-[10px] font-bold shrink-0 cursor-pointer hover:bg-blue-700"
          >
            Copy
          </button>
        </div>
        <div id="gpsError" class="hidden mt-2 text-[11px] text-red-500"></div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- SEND GRAXZO A TREAT                        -->
    <!-- ========================================== -->
    <div class="relative">
      <button
        type="button"
        id="treatBtn"
        onclick="handleSendTreat()"
        class="w-full py-3.5 px-4 rounded-2xl border border-[#E8DDD3] bg-white hover:bg-[#FFFDF9] text-[#8B5E3C] font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer shadow-xs font-sans relative"
      >
        <span class="text-base sm:text-lg select-none">🦴</span>
        <span>Send Graxzo a Treat</span>
        <span id="treatBadge" class="px-2.5 py-0.5 rounded-full text-[11px] font-black font-mono bg-[#FAF6F0] text-[#8B5E3C]">
          76 treats sent!
        </span>
        <span id="heartBurst" class="hidden absolute right-4 text-rose-500 font-black text-sm heart-burst select-none">
          ❤️ +1
        </span>
      </button>
    </div>

    <!-- ========================================== -->
    <!-- GRAXZO'S CURATED LINK TREE                 -->
    <!-- ========================================== -->
    <div class="space-y-3 pt-2">
      <div class="flex items-center justify-between px-1">
        <h2 class="text-xs font-black uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5 font-sans">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
          </svg>
          <span>Graxzo&apos;s Curated Link Tree</span>
        </h2>
        <span class="text-[11px] text-[#766A63] font-medium font-sans">2 destinations</span>
      </div>

      <div class="space-y-2.5">
        <!-- Link 1: Instagram Daily Adventures -->
        <a
          href="https://instagram.com/graxzo"
          target="_blank"
          rel="noopener noreferrer"
          class="group relative w-full p-4 rounded-2xl flex items-center justify-between gap-3.5 transition-all duration-200 cursor-pointer overflow-hidden active:scale-[0.98] bg-white hover:bg-[#FFFDF9] border border-[#E8DDD3] hover:border-[#8B5E3C]/40 shadow-[0_2px_12px_rgba(44,33,27,0.03)] hover:shadow-[0_6px_20px_rgba(44,33,27,0.06)]"
        >
          <div class="flex items-center gap-3.5 min-w-0 flex-1 relative z-10">
            <!-- Instagram Icon Box -->
            <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-[#E8DDD3] bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-2xs group-hover:scale-105 transition-transform">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </div>

            <!-- Content -->
            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="text-sm font-extrabold truncate text-[#1C140E] group-hover:text-[#8B5E3C] transition-colors">
                  Follow Graxzo&apos;s Daily Adventures
                </h4>
                <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-200">
                  <span class="font-black">#</span>
                  <span>OFFICIAL</span>
                </span>
              </div>
              <p class="text-xs mt-0.5 truncate font-medium text-[#766A63]">
                Reels, photos &amp; puppy updates
              </p>
            </div>
          </div>

          <!-- Trailing Arrow -->
          <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#FAF6F0] text-[#766A63] group-hover:text-[#8B5E3C] group-hover:bg-[#F3E7DA] transition-all">
            <svg class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </div>
        </a>

        <!-- Link 2: Puppy Gear -->
        <a
          href="https://puplume.pet/gear"
          target="_blank"
          rel="noopener noreferrer"
          class="group relative w-full p-4 rounded-2xl flex items-center justify-between gap-3.5 transition-all duration-200 cursor-pointer overflow-hidden active:scale-[0.98] bg-white hover:bg-[#FFFDF9] border border-[#E8DDD3] hover:border-[#8B5E3C]/40 shadow-[0_2px_12px_rgba(44,33,27,0.03)] hover:shadow-[0_6px_20px_rgba(44,33,27,0.06)]"
        >
          <div class="flex items-center gap-3.5 min-w-0 flex-1 relative z-10">
            <!-- Paw / Gear Icon Box -->
            <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-[#E8DDD3] bg-[#FAF6F0] text-[#8B5E3C] shadow-2xs group-hover:scale-105 transition-transform">
              <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="7.5" cy="9.5" r="2" />
                <circle cx="16.5" cy="9.5" r="2" />
                <circle cx="11.5" cy="6.5" r="2" />
                <path d="M12 11c-2.8 0-5 2-5 4.5 0 2.2 1.8 3.5 3.5 3.5 1 0 1.5-.5 1.5-.5s.5.5 1.5.5c1.7 0 3.5-1.3 3.5-3.5 0-2.5-2.2-4.5-5-4.5z" />
              </svg>
            </div>

            <!-- Content -->
            <div class="min-w-0 flex-1">
              <h4 class="text-sm font-extrabold truncate text-[#1C140E] group-hover:text-[#8B5E3C] transition-colors">
                Graxzo&apos;s Recommended Puppy Gear
              </h4>
              <p class="text-xs mt-0.5 truncate font-medium text-[#766A63]">
                Harness, training treats &amp; favorite toys
              </p>
            </div>
          </div>

          <!-- Trailing Arrow -->
          <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-[#FAF6F0] text-[#766A63] group-hover:text-[#8B5E3C] group-hover:bg-[#F3E7DA] transition-all">
            <svg class="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </div>
        </a>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- CRITICAL HEALTH & HANDLING INSTRUCTIONS    -->
    <!-- ========================================== -->
    <div class="bg-[#FFF7ED] border border-[#FED7AA] rounded-2xl p-4 sm:p-5 shadow-2xs space-y-1.5 font-sans">
      <div class="flex items-center gap-2 text-[#EA580C] font-bold text-xs uppercase tracking-wide">
        <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>Critical Health &amp; Handling Instructions</span>
      </div>
      <p class="text-xs sm:text-sm text-[#C2410C] leading-relaxed font-medium">
        Ayooooo
      </p>
    </div>

    <!-- ========================================== -->
    <!-- MEDICAL & VETERINARY RECORDS               -->
    <!-- ========================================== -->
    <div class="bg-white rounded-[24px] border border-[#E8DDD3] p-5 sm:p-6 shadow-2xs space-y-4 font-sans">
      <div class="flex items-center justify-between border-b border-[#EFE8E1] pb-3">
        <h3 class="text-xs font-black uppercase tracking-wider text-[#8B5E3C] flex items-center gap-1.5">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
            <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
            <circle cx="20" cy="10" r="2" />
          </svg>
          Medical &amp; Veterinary Records
        </h3>
        <span class="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
          Verified Records
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <!-- Primary Vet Clinic -->
        <div class="p-3.5 rounded-2xl bg-[#FAF6F0]/80 border border-[#EFE8E1] space-y-1">
          <div class="text-[10px] font-extrabold uppercase text-[#8B5E3C] tracking-wider">
            Primary Vet Clinic
          </div>
          <div class="text-xs font-black text-[#2C211B]">
            Emergency Animal Hospital
          </div>
          <div class="text-[11px] text-[#766A63]">
            24/7 Animal Emergency Care
          </div>
        </div>

        <!-- Microchip Database -->
        <div class="p-3.5 rounded-2xl bg-[#FAF6F0]/80 border border-[#EFE8E1] space-y-1">
          <div class="text-[10px] font-extrabold uppercase text-[#8B5E3C] tracking-wider">
            Microchip Database
          </div>
          <div class="text-xs font-black text-[#2C211B]">
            Universal Scanner Compatible
          </div>
          <div class="text-[11px] text-[#766A63]">
            Registered nationwide with ISO 11784
          </div>
        </div>
      </div>

      <!-- Alternate Direct Channels -->
      <div class="pt-2 border-t border-[#EFE8E1]">
        <span class="text-[11px] font-extrabold uppercase tracking-wider text-[#8B5E3C] block mb-2">
          Alternate Direct Channels:
        </span>
        <div class="flex flex-wrap gap-2">
          <a
            href="https://wa.me/923181700000"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EFE8E1] bg-[#FAF6F0] hover:bg-[#F3E7DA] text-[#1C140E] text-xs font-bold transition-colors"
          >
            <!-- WhatsApp Vector Icon -->
            <svg class="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.63c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.78 2.71 4.3 3.8 2.53 1.09 2.53.73 2.99.69.45-.04 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.29" />
            </svg>
            <span>WhatsApp</span>
            <svg class="w-3 h-3 text-[#766A63]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </a>
        </div>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- VIRAL SMART TAG CALLOUT                    -->
    <!-- ========================================== -->
    <div class="bg-white rounded-[24px] border border-[#E8DDD3] p-5 text-center space-y-3 relative overflow-hidden font-sans">
      <div class="w-11 h-11 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto text-xl border border-amber-500/20 shadow-2xs">
        🐾
      </div>
      <div class="space-y-1">
        <h4 class="text-sm font-black text-[#2C211B]">
          Loved meeting Graxzo?
        </h4>
        <p class="text-xs text-[#5F4E44] max-w-sm mx-auto leading-relaxed">
          Create a verified digital pet passport, link tree, and emergency QR collar tag for your puppy on PupLume.
        </p>
      </div>
      <a
        href="https://puplumepet.vercel.app/"
        target="_blank"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all active:scale-[0.98] shadow-sm cursor-pointer bg-[#8B5E3C] text-white hover:bg-[#5F3E29]"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        </svg>
        <span>Build Your Dog&apos;s Link Tree &amp; Passport</span>
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </a>
    </div>

    <!-- Footer -->
    <div class="pt-4 pb-8 text-center space-y-2 border-t border-[#E8DDD3] font-sans">
      <div class="flex items-center justify-center gap-2 text-xs font-bold text-[#766A63]">
        <svg class="w-4 h-4 text-[#8B5E3C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 2.756 1.937C6.015 12.095 8 10.5 8 9" />
          <path d="M14 5.172C14 3.782 15.577 2.679 17.5 3c2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-2.756 1.937C17.985 12.095 16 10.5 16 9" />
          <path d="M12 14v4" />
          <path d="M8 18v2" />
          <path d="M16 18v2" />
        </svg>
        <span>Powered by PupLume Smart Collar Network</span>
      </div>
      <p class="text-[11px] text-[#766A63] max-w-sm mx-auto">
        Free public emergency pet identification &amp; link tree system. Helping reunite lost puppies with their families quickly and safely.
      </p>
    </div>

  </main>

  <!-- Interactive JavaScript Logic -->
  <script>
    // 1. Copy Microchip Code
    function handleCopyMicrochip() {{
      const code = 'PL-BGX6EG-FUP';
      navigator.clipboard.writeText(code).then(() => {{
        const btn = document.getElementById('copyChipBtn');
        const text = document.getElementById('copyText');
        const icon = document.getElementById('copyIcon');
        
        text.textContent = 'Copied!';
        text.classList.add('text-emerald-600');
        icon.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';
        icon.classList.add('text-emerald-600');

        setTimeout(() => {{
          text.textContent = 'Copy';
          text.classList.remove('text-emerald-600');
          icon.innerHTML = '<rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />';
          icon.classList.remove('text-emerald-600');
        }}, 2200);
      }}).catch(err => {{
        console.error('Clipboard error:', err);
      }});
    }}

    // 2. Send Graxzo a Treat (Persistent + Heart Burst)
    let treatCount = parseInt(localStorage.getItem('puplume_treats_graxzo2') || '76', 10);
    const badge = document.getElementById('treatBadge');
    badge.textContent = `${{treatCount}} treats sent!`;

    function handleSendTreat() {{
      treatCount += 1;
      localStorage.setItem('puplume_treats_graxzo2', treatCount.toString());
      badge.textContent = `${{treatCount}} treats sent!`;

      const burst = document.getElementById('heartBurst');
      burst.classList.remove('hidden');
      burst.classList.remove('heart-burst');
      // trigger reflow
      void burst.offsetWidth;
      burst.classList.add('heart-burst');

      setTimeout(() => {{
        burst.classList.add('hidden');
      }}, 1200);
    }}

    // 3. One-Tap Live GPS Pin Sharing
    let currentGpsUrl = '';

    function handleShareLocation() {{
      const btn = document.getElementById('sendGpsBtn');
      const text = document.getElementById('gpsBtnText');
      const icon = document.getElementById('gpsIcon');
      const out = document.getElementById('gpsOutput');
      const errEl = document.getElementById('gpsError');
      const linkDisp = document.getElementById('gpsLinkDisplay');

      errEl.classList.add('hidden');

      if (!navigator.geolocation) {{
        errEl.textContent = 'Geolocation is not supported by your browser.';
        errEl.classList.remove('hidden');
        return;
      }}

      text.textContent = 'Getting GPS...';
      btn.disabled = true;

      navigator.geolocation.getCurrentPosition(
        (pos) => {{
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          currentGpsUrl = `https://maps.google.com/?q=${{lat}},${{lng}}`;

          text.textContent = 'GPS Pin Sent!';
          btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
          btn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
          icon.innerHTML = '<polyline points="20 6 9 17 4 12"></polyline>';

          linkDisp.textContent = currentGpsUrl;
          out.classList.remove('hidden');

          // Trigger SMS to owner
          const ownerPhone = '03181700000';
          const smsMsg = encodeURIComponent(`Hi! I found Graxzo! Here is my exact GPS location: ${{currentGpsUrl}}`);
          window.location.href = `sms:${{ownerPhone}}?&body=${{smsMsg}}`;
        }},
        (err) => {{
          console.error('GPS error:', err);
          text.textContent = 'Send GPS Pin';
          btn.disabled = false;
          errEl.textContent = 'Could not retrieve GPS. Please enable location permissions in browser settings.';
          errEl.classList.remove('hidden');
        }},
        {{ enableHighAccuracy: true, timeout: 10000 }}
      );
    }}

    function handleCopyGpsLink() {{
      if (!currentGpsUrl) return;
      navigator.clipboard.writeText(currentGpsUrl).then(() => {{
        const copyBtn = document.getElementById('gpsCopyBtn');
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {{
          copyBtn.textContent = 'Copy';
        }}, 2000);
      }});
    }}
  </script>
</body>
</html>
'''

os.makedirs('standalone', exist_ok=True)
with open('standalone/index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

with open('public/passport-preview.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print('Successfully generated standalone/index.html and public/passport-preview.html!')
