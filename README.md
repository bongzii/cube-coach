# Cube Coach

A Rubik's Cube OLL/PLL Trainer — Learn and practice algorithms with interactive 3D cube visualizations and a built-in stopwatch.

## Features

- **OLL Trainer**: Practice all 57 Orientation of Last Layer algorithms
- **PLL Trainer**: Practice all 21 Permutation of Last Layer algorithms
- **Interactive 3D Cube**: Visualize algorithms with interactive 3D cube (using `cubejs`)
- **Built-in Timer**: Built-in stopwatch with inspection time for practice solves
- **Algorithm Filtering**: Filter by difficulty, trigger, or search by name
- **Progress Tracking**: Track your learning progress and solve times
- **PWA Support**: Install as a web app, works offline
- **Dark/Light Theme**: Automatic system theme detection with manual toggle
- **Cross-platform**: Web, iOS (Capacitor), and Desktop (Electron)

## Tech Stack

- **React 19** + **TypeScript** + **Vite 6**
- **Tailwind CSS 4** (via `@tailwindcss/vite`)
- **Motion** (Framer Motion) for animations
- **Lucide React** for icons
- **Cube.js** for 3D cube visualization
- **Vite PWA** for offline support
- **Capacitor** for iOS/Android
- **Electron** for desktop

## Getting Started

### Prerequisites

- Node.js 20+
- npm/yarn/pnpm

### Install

```bash
npm install
```

### Development

```bash
# Web development server
npm run dev

# Electron development
npm run electron:dev

# iOS development (requires Xcode)
npm run ios:dev
```

### Build

```bash
# Web production build
npm run build

# Preview production build
npm run preview

# Electron build (macOS)
npm run electron:build
```

### Other Commands

```bash
# Type checking
npm run lint

# Generate scramble data
npm run generate-scrambles

# CLI tool
npm run cli
```

## Project Structure

```
src/
├── components/          # React components
│   ├── AlgorithmSelector.tsx
│   ├── CaseImage.tsx
│   ├── FilterBar.tsx
│   ├── ImageModal.tsx
│   ├── NotationLegend.tsx
│   ├── StatsCards.tsx
│   ├── TrainerControls.tsx
│   └── TrainerTimer.tsx
├── data/               # OLL/PLL algorithm data
│   ├── ollCases.ts
│   ├── ollAlgs.ts
│   ├── pllCases.ts
│   └── pllAlgs.ts
├── themes.ts           # Theme configuration
├── App.tsx             # Main app component
├── main.tsx            # Entry point
└── index.css           # Global styles + Tailwind

public/
├── olls numbered/      # OLL SVG images (numbered 1-57)
├── plls lettered/      # PLL SVG images (lettered)
├── logo.png            # App icon
└── manifest.webmanifest # PWA manifest (generated)

scripts/
├── generate-scrambles.mjs
├── gen-data.mjs
└── cli.py
```

## PWA / Offline Support

The app works offline via Service Worker (`vite-plugin-pwa`). Assets cached:
- All JS/CSS/HTML
- Logo and SVG algorithm images
- Google Fonts (Inter, Space Grotesk, JetBrains Mono)

## Theming

CSS custom properties in `index.html` and `src/themes.ts` define:
- Light theme (default): Yellow background (`#facc15`)
- Dark theme: Dark slate (`#0f172a`)
- Respects `prefers-color-scheme` and `prefers-reduced-motion`

## Deployment

### Netlify (configured)

```bash
npm run build
# Deploy dist/ folder
```

### GitHub Pages

Configure Vite `base: './'` in `vite.config.ts` (already set).

## License

MIT