# Embedded Lab Website - Requirements for Antigravity (CodeGraph MCP)

## Project Overview
Build a **tech blog + education platform** for an Embedded Engineer with a physical RF/EMC lab.
Focus: Embedded Systems, AIoT, FPGA, RF/EMC testing.
Audience: Embedded engineers, firmware developers, hardware engineers, students.

---

## Tech Stack (Fixed - Do Not Change)
- **Framework**: Next.js 15 App Router + TypeScript (strict)
- **Styling**: Tailwind CSS v4 + CSS Custom Properties (design tokens)
- **Content**: MDX + contentlayer (source files in `src/content/`)
- **Syntax Highlighting**: Shiki (VS Code grammars, line numbers, focus lines)
- **Search**: Pagefind (static, no backend)
- **Email**: Resend + React Email (newsletter, course enrollment)
- **Auth** (future): NextAuth v5 (GitHub OAuth + email/password)
- **Deployment**: Vercel (custom domain via Cloudflare Tunnel)
- **Package Manager**: pnpm

---

## Design System (Dark Mode Primary)

### Color Tokens (CSS Variables in `src/app/globals.css`)
```css
:root {
  /* Dark mode (default) - Embedded engineers live in terminals */
  --bg-primary: #08090a;        /* Near-black canvas */
  --bg-panel: #0f1011;          /* Sidebar, cards */
  --bg-elevated: #191a1b;       /* Modals, dropdowns */
  --bg-code: #0d0e10;           /* Code blocks */

  --text-primary: #f7f8f8;      /* Near-white */
  --text-secondary: #d0d6e0;    /* Silver */
  --text-muted: #8a8f98;        /* Tertiary */
  --text-disabled: #62666d;     /* Quaternary */

  /* Accent - Linear Indigo (professional, technical) */
  --accent: #5e6ad2;
  --accent-hover: #7170ff;
  --accent-muted: rgba(94, 106, 210, 0.15);

  /* Semantic */
  --success: #10b981;
  --warning: #fbbf24;
  --error: #ef4444;

  /* Borders - whisper thin */
  --border: rgba(255, 255, 255, 0.08);
  --border-subtle: rgba(255, 255, 255, 0.05);
  --border-strong: rgba(255, 255, 255, 0.15);

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 16px 32px rgba(0,0,0,0.5);

  /* Fonts */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
}

/* Light mode (optional toggle) */
@media (prefers-color-scheme: light) {
  :root:not(.dark) {
    --bg-primary: #ffffff;
    --bg-panel: #fafafa;
    --bg-elevated: #ffffff;
    --bg-code: #f5f5f5;
    --text-primary: #0d0d0d;
    --text-secondary: #333333;
    --text-muted: #666666;
    --border: rgba(0, 0, 0, 0.08);
    --border-subtle: rgba(0, 0, 0, 0.05);
  }
}
```

### Typography Scale
| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Display Hero | Inter | 48px | 510 | 1.00 | -1.056px |
| Section Heading | Inter | 32px | 400 | 1.13 | -0.704px |
| Card Title | Inter | 20px | 590 | 1.33 | -0.24px |
| Body Large | Inter | 18px | 400 | 1.60 | -0.165px |
| Body | Inter | 16px | 400 | 1.50 | normal |
| Body Medium | Inter | 16px | 510 | 1.50 | normal |
| Caption | Inter | 13px | 510 | 1.50 | -0.13px |
| Code | JetBrains Mono | 14px | 400 | 1.50 | normal |
| Code Label | JetBrains Mono | 12px | 500 | 1.40 | 0.6px (uppercase) |
| Button | Inter | 14px | 510 | 1.43 | normal |

### Component Specifications

#### Button
```tsx
// Primary (solid accent)
bg: var(--accent), text: white, padding: 8px 16px, radius: var(--radius-sm)
// Hover: var(--accent-hover)

// Ghost (outline)
bg: transparent, text: var(--text-primary), border: 1px solid var(--border), radius: var(--radius-sm)
// Hover: bg: var(--accent-muted)

// Pill (CTA)
radius: var(--radius-pill)
```

#### Card
```tsx
bg: var(--bg-panel), border: 1px solid var(--border), radius: var(--radius-md)
padding: 24px, shadow: var(--shadow-sm)
// Hover: border: var(--border-strong)
```

#### Code Block
```tsx
bg: var(--bg-code), border: 1px solid var(--border), radius: var(--radius-md)
font: var(--font-mono), 14px, line-height: 1.6
// Line numbers on hover, copy button top-right
```

#### Badge/Tag
```tsx
bg: var(--accent-muted), text: var(--accent), radius: var(--radius-pill)
padding: 2px 10px, font: var(--font-mono), 11px, uppercase, tracking: 0.6px
```

---

## Project Structure
```
embedded-lab-web/
├── src/
│   ├── app/
│   │   ├── (marketing)/           # Public pages
│   │   │   ├── blog/
│   │   │   │   ├── [slug]/page.tsx
│   │   │   │   ├── tags/[tag]/page.tsx
│   │   │   │   └── page.tsx       # Blog index with filters
│   │   │   ├── courses/
│   │   │   │   ├── [slug]/page.tsx
│   │   │   │   └── page.tsx       # Course catalog
│   │   │   ├── field-atlas/
│   │   │   │   ├── [topic]/page.tsx
│   │   │   │   └── page.tsx       # Topic graph
│   │   │   ├── resources/page.tsx # Downloads, cheatsheets
│   │   │   ├── newsletter/page.tsx
│   │   │   ├── layout.tsx         # Root layout
│   │   │   ├── page.tsx           # Homepage
│   │   │   └── globals.css        # Design tokens + Tailwind v4
│   │   ├── api/
│   │   │   ├── newsletter/route.ts
│   │   │   └── search/route.ts
│   │   ├── rss.xml/route.ts
│   │   └── sitemap.ts
│   ├── components/
│   │   ├── ui/                    # Primitive components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Tag.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Search.tsx
│   │   │   ├── TOC.tsx            # Table of Contents
│   │   │   └── ThemeToggle.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx        # Blog sidebar: tags, recent, newsletter
│   │   │   └── MobileNav.tsx
│   │   ├── blog/
│   │   │   ├── PostCard.tsx
│   │   │   ├── PostHeader.tsx
│   │   │   ├── PostContent.tsx    # MDX renderer + Shiki
│   │   │   ├── TagList.tsx
│   │   │   └── SeriesNav.tsx
│   │   ├── courses/
│   │   │   ├── CourseCard.tsx
│   │   │   ├── Curriculum.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   └── EnrollButton.tsx
│   │   └── field-atlas/
│   │       ├── TopicNode.tsx
│   │       └── TopicGraph.tsx
│   ├── content/
│   │   ├── blog/                  # .mdx files
│   │   ├── courses/               # .mdx files
│   │   └── field-atlas/           # .mdx files
│   ├── lib/
│   │   ├── content.ts             # contentlayer config
│   │   ├── utils.ts               # slugify, date, reading time
│   │   ├── search.ts              # Pagefind client
│   │   └── constants.ts           # Site config, nav items
│   └── styles/
│       └── shiki-themes/          # Custom Shiki themes
├── public/
│   ├── images/
│   └── fonts/
├── contentlayer.config.ts
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
├── package.json
└── pnpm-lock.yaml
```

---

## Content Schemas (contentlayer)

### Blog Post (`src/content/blog/*.mdx`)
```yaml
---
title: "String (required)"
slug: "String (required, unique)"
date: "ISO 8601 (required)"
updated: "ISO 8601 (optional)"
tags: "String[] (required)"
series: "String (optional)"
seriesOrder: "Number (optional)"
coverImage: "String (optional)"
coverAlt: "String (optional)"
excerpt: "String (required, max 300 chars)"
readingTime: "Number (auto-generated)"
author: "String (default: 'Lab Author')"
githubUrl: "String (optional)"
demoUrl: "String (optional)"
featured: "Boolean (default: false)"
draft: "Boolean (default: false)"
---
```

### Course (`src/content/courses/*.mdx`)
```yaml
---
title: "String"
slug: "String"
description: "String"
level: "beginner | intermediate | advanced"
duration: "String (e.g., '6 hours')"
lessons: "Number"
prerequisites: "String[]"
tags: "String[]"
price: "free | paid"
thumbnail: "String"
githubRepo: "String (optional)"
curriculum:
  - module: "String"
    lessons:
      - title: "String"
        slug: "String"
        duration: "String"
        free: "Boolean"
---
```

### Field Atlas Topic (`src/content/field-atlas/*.mdx`)
```yaml
---
title: "String"
slug: "String"
category: "rf | fpga | embedded | aiot | tools"
description: "String"
relatedTopics: "String[]"
resources:
  - title: "String"
    url: "String"
    type: "article | video | tool | datasheet | book"
---
```

---

## Key Features to Implement

### 1. Homepage
- Hero: Lab mission statement + email capture (pill button)
- Featured: Latest 3 blog posts, Top 3 courses, Field Atlas categories
- Social proof: GitHub stars, newsletter count, lab equipment photos

### 2. Blog
- **Listing**: Grid + list toggle, tag filter, series filter, search (Pagefind)
- **Post Page**: TOC (sticky right), reading progress, code copy, share buttons
- **Series Navigation**: Previous/Next in series at bottom
- **Related Posts**: By tags (max 3)
- **RSS Feed**: Full content

### 3. Courses
- **Catalog**: Filter by level, tag, free/paid
- **Course Page**: Curriculum sidebar (sticky), progress tracking (localStorage), lesson navigation
- **Lesson Page**: MDX content + embedded video placeholder, code sandbox link
- **Enrollment**: Free = email capture → redirect to lesson 1; Paid = Stripe (future)

### 4. Field Atlas (Unique Differentiator)
- **Topic Graph**: Force-directed graph (D3.js or Cytoscape) showing topic relationships
- **Topic Page**: Curated resources, related topics, "Start Here" learning path
- **Categories**: RF/EMC, FPGA, Embedded Linux, AIoT, Tools, Protocols

### 5. Newsletter
- **Signup**: Inline form (hero, sidebar, post bottom, exit intent)
- **Double Opt-in**: Confirmation email
- **Archive**: `/newsletter` page with past issues
- **Frequency**: Weekly (Friday)

### 6. Search
- **Pagefind Index**: Built at build time
- **UI**: Cmd+K / Ctrl+K shortcut, dropdown results
- **Filters**: Content type (blog, course, atlas), tags

### 7. Performance & SEO
- **Static Generation**: All blog, course, atlas pages at build time
- **Images**: Next/Image with WebP/AVIF, blur placeholders
- **Fonts**: `next/font` (Inter + JetBrains Mono), preload
- **Metadata**: Open Graph, Twitter Card, JSON-LD (Article, Course, Organization)
- **Sitemap**: Auto-generated
- **Lighthouse**: > 90 all categories

---

## Domain & Branding

### Recommended Domains (Available Check Needed)
| Domain | Style | Reasoning |
|--------|-------|-----------|
| `embeddedlab.io` | Technical, .io = dev | Short, memorable, lab focus |
| `rfembedded.com` | RF + Embedded | Your unique combo (RF lab + embedded) |
| `aiotlab.dev` | AIoT focus | Modern, .dev TLD |
| `fpgalab.vn` | Local + FPGA | Vietnam TLD, FPGA specialty |
| `hardwarefirmware.com` | Descriptive | Clear value prop |
| `signalsandlogic.com` | Poetic | RF signals + digital logic |
| `embeddedfieldnotes.com` | Personal | "Field notes" = lab journal vibe |
| `labnotes.dev` | Minimal | Short, dev-focused |

**My Top Pick**: `embeddedlab.io` or `rfembedded.com` - combines your RF lab + embedded expertise uniquely.

---

## Lab-Specific Content Ideas (First 10 Articles)

1. **"Setting Up a Professional RF Lab on a Budget"** - Equipment list, photos, vendor links
2. **"EMC Pre-Compliance Testing: My $500 Setup"** - Near-field probes, spectrum analyzer hacks
3. **"Bringing Up a Custom STM32H7 Board: From Schematic to First Blink"** - Schematics, BOM, bring-up log
4. **"FPGA-Accelerated ML Inference on Embedded: Xilinx Vitis AI Tutorial"** - Step-by-step
5. **"Zephyr RTOS vs FreeRTOS: Migration Guide for STM32 Projects"** - Code comparison
6. **"AIoT Edge Inference: Running YOLOv8 on ESP32-S3 with ESP-DL"** - Benchmarks, optimization
7. **"Debugging Hard Faults on Cortex-M: A Systematic Approach"** - GDB, linker map, stack analysis
8. **"Impedance Matching for 2.4GHz PCB Antennas: Smith Chart in Practice"** - VNA measurements
9. **"CI/CD for Embedded: GitHub Actions + Docker + QEMU + Hardware-in-Loop"** - Pipeline YAML
10. **"My Embedded Engineering Reading List: 20 Books That Shaped My Career"** - Personal curation

---

## Development Workflow

### Commands
```bash
# Install
pnpm install

# Dev
pnpm dev                    # Next.js dev server
pnpm dev:content            # Contentlayer watch mode

# Build
pnpm build                  # Next.js build + contentlayer + Pagefind
pnpm preview                # Preview production build

# Lint/Typecheck
pnpm lint
pnpm typecheck

# Content
pnpm content:validate       # Validate all MDX frontmatter
```

### Git Hooks (Husky)
- pre-commit: lint-staged (Prettier, ESLint)
- commit-msg: conventional commits

---

## Deployment Checklist
- [ ] Vercel project linked to GitHub repo
- [ ] Environment variables: RESEND_API_KEY, NEXT_PUBLIC_SITE_URL
- [ ] Custom domain: `embeddedlab.io` → Cloudflare Tunnel → Vercel
- [ ] Analytics: Vercel Analytics + Plausible (privacy-friendly)
- [ ] Security headers: CSP, HSTS, X-Frame-Options
- [ ] RSS feed accessible at `/rss.xml`
- [ ] Sitemap at `/sitemap.xml`
- [ ] 404 page with search link
- [ ] Offline support (Service Worker - optional)

---

## Notes for Antigravity
1. **Use `src/` directory structure** with `@/*` path alias
2. **Strict TypeScript** - no `any`, strict null checks
3. **Server Components by default** - only `'use client'` for interactivity
4. **No external UI library** - build primitives from scratch (Button, Card, etc.)
5. **Accessibility**: Semantic HTML, focus states, ARIA labels, color contrast
6. **Responsive**: Mobile-first, breakpoints at 640px, 1024px, 1280px
7. **Content is king** - optimize for reading experience (line length ~65ch, generous whitespace)
8. **Code blocks must be exceptional** - copy button, line highlight, file tabs, terminal simulation

---

## Future Phases (Post-MVP)
- Membership area (paid courses, private Discord)
- Interactive simulators (Smith chart, FFT visualizer, state machine)
- Hardware project showcase with 3D viewer (Three.js)
- Job board for embedded engineers
- Podcast integration (embedded.fm style)
- Multi-language (VN/EN)

---

**Contact**: For questions, refer to this file and the design tokens in `globals.css`.
**Priority**: Blog + Courses + Field Atlas MVP in 4 weeks.