---
name: ui-ux-mcp-redesign
description: >-
  Researches, discovers, and upgrades UI/UX components and layouts in the project
  using MCP servers (21st.dev, Mobbin, Puppeteer) to create high-impact, modern,
  and polished React/Next.js/Tailwind interfaces.
---

# UI/UX Research & Redesign Skill

Use this workflow to automatically research UI/UX inspiration and integrate modern components into the `embedded-lab-web` project.

---

## 🎯 1. Identify Target & Context
1. **Locate Target Component/Page:**
   - Check the file being redesigned (e.g., `src/app/page.tsx`, `src/components/blog/`, `src/components/layout/`).
   - Check current design system, Tailwind classes, color scheme (dark mode, neon/cyber accents, typography).
2. **Determine the Desired Aesthetic:**
   - Premium tech/lab aesthetic (glowing borders, glassmorphism, subtle grid patterns, smooth micro-interactions, bento grids, sleek typography).

---

## 🔍 2. Research & Discover via MCP Tools

### Option A: 21st.dev MCP (Best for React/Tailwind Components)
- Use 21st MCP to search for modern, production-grade components:
  * *Hero Sections* (animated background, gradient glow, badge tags)
  * *Bento Grids / Feature Cards* (for lab experiments, blog posts, hardware projects)
  * *Interactive Buttons & Navbars* (floating docks, hover effects)
  * *Code Snippets / Syntax Highlighting Cards*

### Option B: Mobbin MCP (Best for UX Flows & Layout Inspiration)
- Query Mobbin for mobile/web flow patterns:
  * Tech blogs, engineering dashboards, documentation hubs, showcase galleries.

### Option C: Puppeteer MCP (Best for Live Website Analysis)
- Navigate to reference sites (e.g. `linear.app`, `vercel.com`, `raycast.com`) to inspect DOM structures, color palettes, and animation curves.

---

## 🛠️ 3. Adapt & Integrate into Codebase
1. **Match Tech Stack:**
   - **Framework:** Next.js (App Router, Server/Client components with `'use client'` when needed)
   - **Styling:** Tailwind CSS (or inline CSS variables matching the design system)
   - **Icons:** `lucide-react` (or matching icon set already in `package.json`)
   - **Animations:** `framer-motion` or pure Tailwind / CSS keyframes.
2. **Preserve Existing Data & Logic:**
   - Keep dynamic data bindings (e.g. blog post props, routing, metadata).
   - Ensure responsive layout (mobile, tablet, desktop).

---

## ✅ 4. Verification
1. Verify TypeScript types and ensure no missing dependencies.
2. Check that the new UI renders seamlessly with the rest of the application.
