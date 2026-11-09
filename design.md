---
project: PupLume
version: 2.4.0
status: Production Design System
figmaFile: https://www.figma.com/design/E0KmafEHfevt19bgluINtV
figjamFlow: https://www.figma.com/board/qbVW75HXS8gNdrfYZkodnW
colors:
  primary: "#8B5E3C"
  primaryDark: "#5F3E29"
  primaryLight: "#A06C47"
  text: "#2C211B"
  muted: "#766A63"
  cream: "#FFF9F2"
  creamHighlight: "#FFFDF9"
  border: "#E8DDD3"
  beige: "#F3E7DA"
  sage: "#A8B59A"
  peach: "#E9B89C"
  emeraldVerified: "#059669"
  amberGold: "#F59E0B"
typography:
  brand: "Grandstander"
  ui: "Plus Jakarta Sans"
  mono: "JetBrains Mono, monospace"
spacing:
  radiusCard: "24px"
  radiusButton: "16px"
  radiusStoryCard: "44px"
---

# 🐾 PupLume Design System & Brand Identity

> **"The digital companion for happy, healthy puppies."**  
> PupLume rejects cold, sterile, clinical SaaS aesthetics in favor of tactile warmth, editorial beauty, and reassuring friendliness.

---

## 1. Brand Philosophy & Core Design Pillars

1. **Tactile Earthiness, Never Sterile:**  
   Puppy care is physical, warm, and emotional. Every screen breathes with rich creams (`#FFF9F2`), baked clay (`#8B5E3C`), and soft organic borders (`#E8DDD3`), avoiding harsh `#000000` blacks or hospital-white backgrounds.

2. **Zero Layout Shifts (Skullet Timed Motion Engine):**  
   Every route has a 1-to-1 matching Skullet skeleton loader with calibrated 0.2s to 0.5s measurement transitions. Loading states are an intentional, reassuring extension of the brand.

3. **Reunification & Digital Pet Passport:**  
   The puppy profile is not just a dashboard; it is a legally sound, scannable **Verified Digital Pet Passport** designed for instant physical collar scanning and high-visibility social sharing.

---

## 2. Color Tokens & Semantic System

| Token Name | Hex | HSL / RGB | Semantic Usage |
| :--- | :--- | :--- | :--- |
| **`brand-primary`** | `#8B5E3C` | `rgb(139, 94, 60)` | Primary CTAs, active tab accents, hero brand panels |
| **`brand-dark`** | `#5F3E29` | `rgb(95, 62, 41)` | High-contrast button hover, dark mode boundaries |
| **`brand-roast`** | `#2C211B` | `rgb(44, 33, 27)` | Primary typography, headers, passport titles |
| **`brand-cream`** | `#FFF9F2` | `rgb(255, 249, 242)` | Root background surface across the entire application |
| **`brand-highlight`**| `#FFFDF9` | `rgb(255, 253, 249)`| Elevated cards, input fields, modal canvas |
| **`brand-border`** | `#E8DDD3` | `rgb(232, 221, 211)`| Micro-borders, dividers, card boundaries |
| **`verified-green`** | `#059669` | `rgb(5, 150, 105)` | Medical verification badges, active microchip status |
| **`amber-gold`** | `#F59E0B` | `rgb(245, 158, 11)` | Academy star achievements, AI magic sparkle |
| **`warm-clay`** | `#766A63` | `rgb(118, 106, 99)` | Muted secondary copy, metadata, timestamps |

---

## 3. Typography & Hierarchy

### Primary Brand Face: `Grandstander`
* **Wordmark & Big H1s:** 900 Weight. Completely rounded, playful curves with flared finials on letters `u`, `m`, and `e`.
* **Headings (H2/H3):** 700 / 800 Weight. Generous line-height (`1.2`), tight letter-spacing (`-0.02em`).

### UI & Body Face: `Plus Jakarta Sans` / `Grandstander 500`
* **Interactive UI:** Clean, legible geometric grotesque ensuring numbers, medical doses, and weights are instantly readable.
* **Passport Code Monospace:** `JetBrains Mono` / `Courier` for Microchip RFID tags (`985-141-002348-A`) and Passport Serial Numbers (`#PL-84920`).

---

## 4. Instagram Story 9:16 Design Specification (1080 × 1920)

PupLume provides an in-app Story Studio in [`ShareModal.tsx`](file:///c:/Users/AHSAN%20HAROON/antigravity/PupLume/src/components/common/ShareModal.tsx) backed by the 2D canvas pipeline in [`storyCardGenerator.ts`](file:///c:/Users/AHSAN%20HAROON/antigravity/PupLume/src/lib/storyCardGenerator.ts).

### Safe Zone Constraints (Instagram Stories):
* **Top 150px:** Reserved for Instagram Story user handle, close button, and timestamp.
* **Bottom 240px:** Reserved for Instagram reply message bar and share button.
* **Interactive Core Zone:** `y = 150px` to `y = 1680px` (Width: `880px` centered, `x = 100px` to `980px`).

### Three Scratch Design Directions Created for User Approval:

#### 🌟 Variant A: The Editorial Pet Passport (Warm Skin / Organic Modern)
* **Canvas File:** `public/instagram-story-variant-a.png` (235 KB)
* **Aesthetic:** Warm cream background with radiant peach/golden ambient orbs. Zero boxy container clunkiness.
* **Hero Photo:** `880 × 800px` organic soft-rounded frame (`rx: 44px`) with custom emerald verified seal (`#059669`).
* **Passport Card:** Embedded scannable QR card with high scan contrast, ID serial number, and direct tap CTA.
* **Instagram Link Sticker Area:** Centered pill at `y = 1750px` prompting `puplume.pet/pup/[name]`.

#### ☀️ Variant B: The Vibrant Sunset Story (Social Spotlight / Energetic)
* **Canvas File:** `public/instagram-story-variant-b.png` (485 KB)
* **Aesthetic:** Honey peach & sunset gold gradient with radiant center glow.
* **Hero Photo:** Bold circular frame (`r: 300px`) with dashed golden badge ring.
* **Personality Stickers:** Angled floating stickers: `🏆 100% Good Boy`, `⭐ Academy Star`, `🎾 Ball Fetcher`.
* **CTA:** High-visibility banner for social followers to open the verified live passport.

#### 🏛️ Variant C: Minimalist Swiss Luxury (Technical Precision)
* **Canvas File:** `public/instagram-story-variant-c.png` (107 KB)
* **Aesthetic:** Ultra-refined sand `#FBF8F4` canvas with fine technical grid lines and deep roast typography.
* **Grid Data Table:** Structured rows for Breed, Sex/Weight, Age, RFID Microchip, Vet Clinic, and Vaccination Status.
* **Scan Card:** High-contrast geometric scanner block with bold border alignment.

---

## 5. Live Figma & FigJam Workspace Links

* **🎨 Figma Design File:**  
  [PupLume - App Designs & UI System](https://www.figma.com/design/E0KmafEHfevt19bgluINtV)  
  *Contains design tokens, mobile viewports, components, and export assets.*

* **🗺️ FigJam Flow Architecture:**  
  [PupLume Instagram Story & Digital Passport Flow](https://www.figma.com/board/qbVW75HXS8gNdrfYZkodnW?utm_source=other&utm_content=edit_in_figjam&oai_id=&request_id=9ce81ee5-6047-4d8d-8bd2-4db3b9fb497c)  
  *Interactive diagram mapping the canvas 2D pipeline from pet profile to Instagram Story camera deep-linking.*

---

## 6. Component Anatomy & Elevation Standards

```
┌────────────────────────────────────────────────────────┐
│  PupLume Card Standard (Border: 1.5px #E8DDD3)        │
│  Radius: 24px (Mobile) / 32px (Desktop/Story)          │
│  Shadow: 0 8px 30px rgba(44, 33, 27, 0.06)            │
│                                                        │
│  [Hero Image / Squircle Badge / Verified Chip]         │
│  Title: Grandstander 900 (Color: #2C211B)              │
│  Subtitle: Grandstander 700 (Color: #8B5E3C)           │
│  Meta: Plus Jakarta Sans 600 (Color: #766A63)          │
│                                                        │
│  [Button: bg-[#8B5E3C] text-white radius-16 shadow-xs] │
└────────────────────────────────────────────────────────┘
```
