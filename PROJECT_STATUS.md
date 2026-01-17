# ETF Compass - Project Status Documentation

## Project Overview

**ETF Compass** is an AI-powered ETF analysis platform built with:
- **Next.js 16** with App Router and Turbopack
- **TypeScript** for type safety
- **Tailwind CSS 4** with `@theme inline` for dark theme
- **shadcn/ui** components (17 installed)
- **Prisma 7** ORM with PostgreSQL
- **AI Integration**: OpenAI GPT-4o-mini, Claude 3.5 Sonnet, xAI Grok-2 (hybrid mode)
- **Market Data**: Polygon.io integration

---

## Current State (January 17, 2026)

### Recently Completed Features

1. **Dashboard Home Page**
   - Root URL `/` redirects to `/dashboard`
   - Dashboard is the default landing page

2. **3D Cover Flow Carousel** (`components/dashboard/top-picks-carousel.tsx`)
   - 10 ETF cards with rankings
   - 5 cards visible (2 left, 1 center, 2 right)
   - Smooth 3D transitions with cubic-bezier easing
   - Touch/swipe support for mobile
   - Mouse drag support for desktop
   - Smart auto-play (pauses on interaction, resumes after 5 seconds)
   - Navigation arrows positioned on sides (middle vertical)
   - Pagination dots and status indicator (Auto/Paused)
   - Ranking display with color coding (≤3: teal, ≤6: amber, >6: gray)
   - AI Score display with conditional coloring

3. **Mobile Responsiveness**
   - Mobile header with hamburger menu for sidebar
   - Sidebar collapses as sheet/drawer on mobile
   - Carousel height adjusts: 340px (mobile) → 380px (tablet) → 440px (desktop)
   - Arrow buttons adjust size: 40px (mobile) → 48px (desktop)
   - Proper spacing and padding for mobile

4. **Dark Theme**
   - Default dark mode with colors:
     - Background: `#0a0f0e` (very dark teal)
     - Primary accent: `#2dd2b7` (teal/turquoise)
     - Foreground: `#a0b6b2` (light gray-green)
   - Applied globally via `@theme inline` in `globals.css`

---

## Known Fixes & Solutions

### Dark Theme Not Showing
**Problem**: App showing light theme despite `className="dark"` on html element
**Solution**:
- Moved `dark` class to `<body>` element in `layout.tsx`
- Changed `@theme inline` to use dark color values directly
- Made dark mode default by putting dark colors in `:root`

### Carousel Transparency Issues
**Problem**: Cards were transparent, overlapping information
**Solution**:
- Removed glossy overlay
- Changed to solid `backgroundColor: "rgb(22, 29, 28)"`
- Fixed all text colors to light (white, gray-300, gray-400)
- Changed chart background to `rgba(0, 0, 0, 0.2)`

### Carousel Transition Not Working
**Problem**: No smooth 3D effect between cards
**Solution**:
- Added `.carousel-card-3d` CSS class with proper transitions
- Used stable `key={card.id}` for React rendering
- Added `will-change: transform, opacity`

### Icon Import Errors
**Problem**: `ExpandMore`, `AutoAwesome`, `ArrowForward` don't exist in lucide-react
**Solution**: Replaced with `ChevronDown`, `Sparkles`, `ChevronRight`

### Auto-play Interference
**Problem**: Carousel auto-plays during user interaction
**Solution**:
- Created `pauseAutoPlay()` callback function
- Pauses on: touch start, mouse down, arrow clicks, pagination clicks
- Resumes after 5 seconds of no interaction

### Mobile Header Overlap
**Problem**: "Top AI Picks" header showing behind carousel cards on mobile
**Solution**:
- Added `relative z-20` to header container
- Used `isolate` CSS property on carousel wrapper
- Created proper stacking context separation

### Mobile Spacing
**Problem**: Not enough space between header and carousel on mobile
**Solution**: `pb-16 sm:pb-6` (64px mobile, 24px desktop)

---

## Project Structure

```
/Users/aumi/myProjects/ETF Compass/web/
├── app/
│   ├── dashboard/page.tsx          # Main dashboard (home page)
│   ├── explore/page.tsx             # ETF exploration with search
│   ├── portfolio/page.tsx           # Portfolio management
│   ├── insights/page.tsx            # AI insights
│   ├── deep-dive/[symbol]/page.tsx # Individual ETF details
│   ├── layout.tsx                   # Root layout with sidebar
│   ├── globals.css                  # Dark theme + animations
│   └── page.tsx                     # Redirects to /dashboard
│
├── components/
│   ├── dashboard/
│   │   ├── top-picks-carousel.tsx  # 3D carousel component
│   │   ├── kpi-cards.tsx            # KPI cards
│   │   └── performance-chart.tsx    # Performance charts
│   ├── shared/
│   │   ├── app-sidebar.tsx          # Sidebar component (mobile-responsive)
│   │   └── page-header.tsx          # Page header
│   └── ui/                          # shadcn/ui components (17 total)
│
├── lib/
│   ├── ai/                          # AI service layer
│   ├── db/                          # Database (Prisma)
│   └── utils.ts                     # Utility functions (cn helper)
│
└── prisma/
    ├── schema.prisma                # Database schema (11 models)
    └── prisma.config.ts             # Prisma 7 config
```

---

## Important Configuration Details

### Tailwind CSS 4 Dark Theme
The dark theme is implemented using `@theme inline` with dark colors as default:

```css
@theme inline {
  --color-background: 180 15% 5%;   /* #0a0f0e */
  --color-foreground: 170 10% 90%;  /* #a0b6b2 */
  --color-primary: 172 85% 52%;      /* #2dd2b7 */
}

:root {
  /* Dark mode colors (default) */
  --background: 180 15% 5%;
  --foreground: 170 10% 90%;
}
```

### Prisma 7 Configuration
- Datasource URL configured in `prisma.config.ts`
- Schema has `datasource db { provider = "postgresql" }` (no url property)
- Client created in `lib/db/prisma.ts` without datasourceUrl parameter
- Use `npx prisma generate` after schema changes

### Next.js 16 App Router
- `params` prop in page components is now a Promise
- Use wrapper components for async params or make page async
- Example:
```tsx
async function ETFPageTitle({ params }: { params: Promise<{ symbol: string }> }) {
  const { symbol } = await params;
  return <PageTitle>{symbol} Deep Dive</PageTitle>;
}
```

### Mobile Sidebar
- Sidebar uses `collapsible="offcanvas"` variant
- On mobile (< 768px): shows as sheet/drawer
- `MobileHeader` component with hamburger menu
- Triggered by `SidebarTrigger` button

---

## How to Run

### Development Server
```bash
cd /Users/aumi/myProjects/ETF\ Compass/web
npm run dev
```
Access at: http://localhost:3000 or http://10.0.0.214:3000

### Build
```bash
npm run build
```

### Prisma
```bash
# Generate client after schema changes
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio
```

---

## Color Palette Reference

| Usage | Color | HSL | Hex |
|-------|-------|-----|-----|
| Background | Dark teal | 180 15% 5% | #0a0f0e |
| Primary | Teal accent | 172 85% 52% | #2dd2b7 |
| Foreground | Light gray | 170 10% 90% | #a0b6b2 |
| Card | Dark teal | 175 8% 12% | #161d1c |
| Border | Subtle | 175 15% 20% | rgba(45, 210, 183, 0.15) |

---

## Carousel Customization Parameters

Located in `components/dashboard/top-picks-carousel.tsx`:

```typescript
// 3D Transform parameters
const rotateY = offset * -40;        // Rotation angle per card
const translateX = offset * 160;     // Horizontal spacing (px)
const translateZ = -absOffset * 100; // Depth effect (px)
const scale = isCenter ? 1 : absOffset === 1 ? 0.9 : 0.8;  // Card sizes
const opacity = isCenter ? 1 : absOffset === 1 ? 0.95 : 0.7; // Opacity levels

// Card dimensions
width: 320px
height: 420px

// Auto-play
autoPlayInterval = 4000ms
pauseAfterInteraction = 5000ms
```

---

## Dependencies to Install

```bash
# Core
npm install next@latest react@latest react-dom@latest

# Styling
npm install tailwindcss@latest clsx tailwind-merge

# UI Components
npm install lucide-react class-variance-authority

# Database
npm install prisma@latest @prisma/client@latest

# AI
npm install openai @anthropic-ai/sdk xai

# Data fetching
npm install swr
```

---

## Tasks for Next Session

- [ ] Continue building out the remaining pages (Explore, Portfolio, Insights)
- [ ] Implement actual API integrations (Polygon.io, AI providers)
- [ ] Add real-time data updates
- [ ] Implement user authentication
- [ ] Add portfolio tracking features
- [ ] Build out the AI analysis engine
- [ ] Add chart customization options

---

## Common Issues & Quick Fixes

### Build Error: "Export XXX doesn't exist in lucide-react"
**Fix**: Check lucide-react icon names. Common replacements:
- `ExpandMore` → `ChevronDown`
- `AutoAwesome` → `Sparkles`
- `ArrowForward` → `ChevronRight`

### Next.js 16 Params Promise Error
**Fix**: Wrap component access in async function:
```tsx
async function Wrapper({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Component id={id} />;
}
```

### Prisma 7 Datasource Error
**Fix**: Remove `url` from datasource in schema.prisma, configure in prisma.config.ts

### Dark Theme Not Applying
**Fix**: Ensure `dark` class is on `<body>` not `<html>` in layout.tsx

---

## Network Access

- Local IP: 10.0.0.214
- Dev Server: http://10.0.0.214:3000
- 3D Carousel Demo: http://10.0.0.214:3001 (running in background)

---

*Last Updated: January 17, 2026*
*Session Summary: Dashboard page set as home, 3D carousel fully implemented with mobile responsiveness, dark theme issues resolved, auto-play smart pause implemented*
