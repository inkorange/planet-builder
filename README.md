# 🌍 Planet Builder

An interactive web application that lets you create and explore custom planets by configuring their elemental composition, orbital parameters, and environmental conditions. Watch as your planet forms from a primordial gas cloud through a stunning 3D animation, then explore its detailed habitability analysis.

![Planet Builder Homepage](./public/homepage.jpg)

## 🎯 Overview

Planet Builder is an educational and entertaining tool that simulates realistic planet formation based on scientific principles. Configure everything from elemental composition to rotation speed, and see how these factors affect the resulting planet's type, atmosphere, and potential for life.

### ✨ Key Features

- **Interactive 3D Visualization** - Real-time rendering of primordial gas clouds and formed planets
- **Realistic Planet Classification** - Scientifically-based categorization (Earth-like, Gas Giant, Ice World, etc.)
- **Detailed Habitability Analysis** - 7-factor scoring system including temperature, atmosphere, water, magnetic fields, geology, chemistry, and rotation
- **Planet Presets** - Quick-start templates for Earth, Mars, Venus, Jupiter, and more
- **Dynamic Formation Animation** - 6-second cinematic planet formation sequence with particle effects
- **Comprehensive Results Panel** - Detailed breakdown of physical properties, composition, and habitability factors

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/planet-builder.git
cd planet-builder
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## 🛠 Technology Stack

### Frontend Framework
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router and Turbopack
- **[React 19](https://react.dev/)** - UI library with latest concurrent features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript

### 3D Graphics & Visualization
- **[Three.js](https://threejs.org/)** - WebGL 3D graphics library
- **[React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)** - React renderer for Three.js
- **[React Three Drei](https://github.com/pmndrs/drei)** - Useful helpers for R3F (OrbitControls, etc.)

### UI Components & Styling
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible component primitives
- **[Radix Themes](https://www.radix-ui.com/themes)** - Pre-styled component library
- **[SCSS/Sass](https://sass-lang.com/)** - CSS preprocessor for advanced styling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

### Code Quality & Development
- **[ESLint](https://eslint.org/)** - JavaScript/TypeScript linting
- **[@typescript-eslint](https://typescript-eslint.io/)** - TypeScript-specific linting rules
- **[eslint-plugin-import](https://github.com/import-js/eslint-plugin-import)** - Import/export validation

## 🎮 How to Use

### 1. Configure Your Planet

**Element Composition**
- Click element cards to adjust the composition (H, He, C, N, O, etc.)
- Total composition must not exceed 100 parts
- Real-time validation with visual feedback

**Environmental Parameters**
- **Distance from Star**: 0.1 - 10 AU (affects temperature)
- **Star Type**: Choose from O, B, A, F, G, K, M spectral classes
- **Initial Mass**: 0.1 - 10 Earth masses
- **Rotation Speed**: 1 - 2400 hours/day (affects habitability)

**Quick Start Presets**
- Earth - Habitable terrestrial planet
- Mars - Cold, thin atmosphere
- Venus - Hot, thick CO₂ atmosphere
- Jupiter - Gas giant
- Neptune - Ice giant
- Titan - Moon with methane atmosphere

### 2. Build Your Planet

Click the "Build Planet" button to watch the formation sequence:
1. Primordial gas cloud collapses (2 seconds)
2. Gravitational collapse accelerates
3. Bright flash at peak formation
4. Planet appears and stabilizes

### 3. Explore Results

The Results Panel shows:
- **Planet Classification**: Type (Earth-like, Gas Giant, etc.)
- **Habitability Score**: 0-100 rating with detailed factor breakdown
- **Physical Properties**: Mass, radius, temperature, rotation period
- **Orbital Environment**: Star type and distance
- **Atmosphere Composition**: Gas makeup and density
- **Surface Characteristics**: Description of terrain and conditions

### Keyboard Shortcuts
- **Ctrl+B** (Cmd+B on Mac): Build planet
- **Ctrl+R** (Cmd+R on Mac): Start over

## 🌐 Planet Types

The simulator can generate various planet classifications:

- **Earth-like** - Terrestrial planet with balanced conditions
- **Water World** - Ocean-covered planet
- **Ice World** - Frozen terrestrial planet
- **Lava World** - Volcanic, molten surface
- **Rocky Terrestrial** - Barren rocky planet
- **Venus-like** - Hot with thick atmosphere
- **Gas Giant** - Large hydrogen/helium planet
- **Ice Giant** - Cold giant with icy composition

## 📊 Habitability Factors

Planets are scored on 7 key factors (0-100 each):

1. **Temperature** - Surface temperature relative to liquid water range
2. **Atmosphere** - Composition and density for protection and breathing
3. **Water** - Presence and state of H₂O
4. **Magnetic Field** - Radiation protection
5. **Geology** - Tectonic activity for nutrient cycling
6. **Chemistry** - Presence of CHNOPS elements (building blocks of life)
7. **Rotation** - Day/night cycle and weather patterns

**Overall Rating**:
- 80-100: Highly Habitable
- 60-79: Habitable
- 40-59: Marginal
- 20-39: Extremely Harsh
- 0-19: Uninhabitable

## 🎨 Features by Phase

This project was built in 11 phases:

- **Phase 1-3**: Foundation, landing page, 3D gas cloud
- **Phase 4-5**: Element system and configuration panel
- **Phase 6**: Planet simulation engine and classification
- **Phase 7**: Planet materials and 3D rendering
- **Phase 8**: Atmospheric effects and visual polish
- **Phase 9**: Formation animation and particle effects
- **Phase 10**: Results panel and habitability scoring
- **Phase 11**: Performance optimization, accessibility, and UX refinement

## 🔧 Project Structure

```
planet-builder/
├── public/              # Static assets (images, stars texture)
├── src/
│   ├── app/            # Next.js App Router pages
│   │   ├── builder/    # Planet builder page
│   │   └── results/    # Results page (if standalone)
│   ├── components/     # React components
│   │   ├── builder/    # Builder-specific components
│   │   │   ├── ConfigurationPanel.tsx
│   │   │   ├── ResultsPanel.tsx
│   │   │   ├── PlanetScene.tsx
│   │   │   ├── Planet.tsx
│   │   │   ├── PrimordialGasCloud.tsx
│   │   │   └── materials/  # Custom Three.js shaders
│   │   └── layout/     # Layout components
│   ├── data/           # Static data (elements, presets)
│   ├── hooks/          # Custom React hooks
│   ├── utils/          # Utility functions
│   │   ├── planetSimulation.ts    # Core simulation logic
│   │   ├── habitabilityScore.ts   # Scoring system
│   │   └── planetCalculations.ts  # Physics calculations
│   └── types/          # TypeScript type definitions
```

## 🌟 Performance Optimizations

- Optimized particle count: 25,000 particles (reduced from 54,000)
- Efficient sphere geometry: 64x64 segments (reduced from 160x160)
- Memoized expensive calculations
- Lazy component loading
- Responsive image optimization

## ♿ Accessibility

- ARIA labels on all interactive controls
- Keyboard navigation support
- Screen reader friendly
- High contrast UI elements
- Semantic HTML structure

## 📱 Responsive Design

- **Desktop** (>1024px): Side-by-side layout
- **Tablet** (641-1024px): Stacked layout, 60/40 split
- **Mobile** (≤640px): Stacked layout, 50/50 split

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Planet classification based on real exoplanet science
- Three.js community for amazing 3D tools
- Radix UI team for accessible components
- Next.js team for the outstanding framework

## 📞 Contact

For questions, suggestions, or issues, please open an issue on GitHub.

---

Built with ❤️ using Next.js, Three.js, and React
