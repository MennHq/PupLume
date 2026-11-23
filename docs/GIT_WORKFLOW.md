# Git Mastery: Modern Engineering Workflow & Multi-Domain Architecture

A production-grade guide to Git branch management, atomic conventional commits, and single-repo multi-domain deployments on Vercel.

---

## 1. The Core Philosophy: Trunk-Based Development

High-velocity engineering teams (Notion, Linear, Stripe, Vercel) **do not maintain separate long-lived branches** for different pages (e.g. `main` for app vs `MarketingPage` for landing). 

### Why Long-Lived Separate Branches Hurt
- **Branch Drift:** Bug fixes made on `main` don't reach `MarketingPage`, and marketing redesigns don't reach `main`.
- **Merge Hell:** Merging diverging branches after weeks leads to hundreds of conflicting lines.
- **Double Overhead:** Developers have to run two builds, push twice, and manage two separate Vercel deployments.

### The Modern Industry Solution: Single Trunk (`main`) + Multi-Domain Routing
- **One Repository, One Primary Branch (`main`):** All code (landing page, web app, public dog safety pages, legal docs) lives in `main`.
- **Multi-Domain Mapping in Vercel:** Point both `puplume.pet` and `app.puplume.pet` to the **same** Vercel project connected to `main`.
- **Runtime Domain Switching:** The application detects the hostname at runtime:
  - `puplume.pet` &rarr; Serves `<MarketingLanding />` & public dog safety cards (`/:slug`).
  - `app.puplume.pet` &rarr; Serves the authenticated Puppy Dashboard & `<SignIn />`.
  - Preview & Localhost &rarr; Supports `?view=marketing` / `?view=app` query overrides or path overrides (`/marketing`).

---

## 2. Conventional Commits Standard

Every commit in the repository must communicate its purpose clearly to other engineers, changelog generators, and CI/CD pipelines.

### Format
```text
<type>(<scope>): <concise imperative description in lowercase>

[optional body explaining motivation or details]
```

### Approved Types
| Type | When to Use | Example |
| :--- | :--- | :--- |
| `feat` | New user-facing feature or view | `feat(routing): add subdomain detection for marketing vs app` |
| `fix` | Bug fix or regression patch | `fix(auth): prevent onboarding flash on cold reload` |
| `perf` | Speed or memory optimization | `perf(shimmer): slow skeleton animation to 1.6s for smoother feel` |
| `style` | Layout, CSS, spacing, typography | `style(profile): enforce concentric border radii per UI skill` |
| `refactor`| Code restructuring without behavior change | `refactor(domain): extract getDomainContext into dedicated module` |
| `docs` | Documentation, README, or skills | `docs(skills): add git-mastery workflow reference` |
| `chore` | Build tools, packages, dependencies | `chore(deps): update vite and tailwindcss` |

---

## 3. The Daily 4-Step Push Protocol

Always follow this exact 4-step sequence before pushing code to remote:

### Step 1: Inspect Changes
```bash
git status
git diff --stat
```

### Step 2: Verification Before Commit
```bash
npm run build
```

### Step 3: Atomic Staging & Commit
```bash
git add src/App.tsx src/lib/domain.ts
git commit -m "feat(routing): route root domain to marketing landing and app subdomain to core dashboard"
```

### Step 4: Rebase Pull & Push
```bash
git pull --rebase origin main
git push origin main
```

---

## 4. Vercel Multi-Domain Configuration Guide

To serve both your marketing site and web app from the single `main` branch:

1. **Open Vercel Dashboard** &rarr; Select your `PupLume` project.
2. Go to **Settings** &rarr; **Domains**.
3. Add your custom domains to the **same** project:
   - `puplume.pet` (Primary production domain &rarr; serves marketing + dog safety QR cards)
   - `www.puplume.pet` (Redirects to `puplume.pet` or serves root)
   - `app.puplume.pet` (Subdomain &rarr; serves core web app)
4. Ensure all domains are assigned to the **Production** environment (branch `main`).
5. **No second Vercel project needed!** Every time you push to `main`, both `puplume.pet` and `app.puplume.pet` are deployed simultaneously in under 60 seconds with zero downtime.
