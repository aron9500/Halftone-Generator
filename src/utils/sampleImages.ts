import { SampleImage } from '../types';

// Helper to generate SVG data URLs for instant high-quality sample images
function createSvgDataUrl(svgString: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgString)}`;
}

// Sample 1: Antique Classical Sculpture Portrait (High contrast lighting, ideal for halftone)
const statueSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <radialGradient id="bg" cx="50%" cy="50%" r="75%">
      <stop offset="0%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <radialGradient id="face" cx="45%" cy="40%" r="40%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="45%" stop-color="#cbd5e1"/>
      <stop offset="80%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <linearGradient id="shadow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.9"/>
      <stop offset="50%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
  </defs>
  <!-- Background -->
  <rect width="800" height="800" fill="url(#bg)"/>
  
  <!-- Classic Bust Silhouette with Rich Tones -->
  <g transform="translate(400, 420)">
    <!-- Base Pedestal -->
    <path d="M-180 280 L180 280 L140 200 L-140 200 Z" fill="#334155"/>
    <!-- Shoulders -->
    <path d="M-260 220 Q-100 120 0 140 Q100 120 260 220 L180 280 L-180 280 Z" fill="url(#shadow)"/>
    <!-- Neck -->
    <path d="M-60 140 L-50 -20 Q0 -30 50 -20 L60 140 Z" fill="url(#face)"/>
    <!-- Face Head Oval -->
    <ellipse cx="0" cy="-120" rx="140" ry="180" fill="url(#face)"/>
    <!-- Hair Waves -->
    <path d="M-140 -180 C-120 -280 120 -280 140 -180 C110 -150 -110 -150 -140 -180 Z" fill="#1e293b"/>
    <circle cx="-60" cy="-210" r="45" fill="#e2e8f0"/>
    <circle cx="0" cy="-230" r="50" fill="#ffffff"/>
    <circle cx="60" cy="-210" r="45" fill="#94a3b8"/>
    <!-- Nose Shadow -->
    <polygon points="0,-160 -25,-80 10,-80" fill="#475569"/>
    <polygon points="0,-160 5,-80 10,-80" fill="#f8fafc"/>
    <!-- Eyes -->
    <ellipse cx="-45" cy="-130" rx="22" ry="12" fill="#0f172a"/>
    <ellipse cx="-45" cy="-130" rx="10" ry="10" fill="#f8fafc"/>
    <ellipse cx="45" cy="-130" rx="22" ry="12" fill="#0f172a"/>
    <ellipse cx="45" cy="-130" rx="10" ry="10" fill="#cbd5e1"/>
    <!-- Lips -->
    <path d="M-30 -40 Q0 -25 30 -40 Q0 -45 -30 -40 Z" fill="#334155"/>
    <path d="M-25 -40 Q0 -55 25 -40 Q0 -35 -25 -40 Z" fill="#e2e8f0"/>
  </g>
  <!-- Vignette Ring -->
  <circle cx="400" cy="400" r="360" fill="none" stroke="#64748b" stroke-width="8" opacity="0.4"/>
</svg>`;

// Sample 2: Cyberpunk Synthwave Sphere & Grid
const cyberpunkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <linearGradient id="cyberBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#030712"/>
      <stop offset="50%" stop-color="#1e1b4b"/>
      <stop offset="100%" stop-color="#4c0519"/>
    </linearGradient>
    <radialGradient id="sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="40%" stop-color="#f43f5e"/>
      <stop offset="100%" stop-color="#881337"/>
    </radialGradient>
  </defs>
  <rect width="800" height="800" fill="url(#cyberBg)"/>
  <circle cx="400" cy="350" r="220" fill="url(#sun)"/>
  <!-- Sun Cut Lines -->
  <rect x="150" y="320" width="500" height="12" fill="#1e1b4b"/>
  <rect x="150" y="350" width="500" height="18" fill="#1e1b4b"/>
  <rect x="150" y="390" width="500" height="26" fill="#1e1b4b"/>
  <rect x="150" y="440" width="500" height="36" fill="#1e1b4b"/>
  <!-- Mountain Silhouettes -->
  <polygon points="0,520 180,380 320,520" fill="#0f172a"/>
  <polygon points="220,520 450,320 620,520" fill="#1e293b"/>
  <polygon points="500,520 680,400 800,520" fill="#020617"/>
</svg>`;

// Sample 3: Architectural Graphic Geometry
const architectureSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <rect width="800" height="800" fill="#f8fafc"/>
  <g transform="translate(400, 400)">
    <!-- Concentric Architectural Rings -->
    <circle cx="0" cy="0" r="350" fill="#0f172a"/>
    <circle cx="0" cy="0" r="280" fill="#ffffff"/>
    <circle cx="0" cy="0" r="220" fill="#334155"/>
    <circle cx="0" cy="0" r="160" fill="#f1f5f9"/>
    <circle cx="0" cy="0" r="100" fill="#020617"/>
    <circle cx="0" cy="0" r="40" fill="#ffffff"/>
    
    <!-- Cross Beam Lines -->
    <rect x="-380" y="-15" width="760" height="30" fill="#475569"/>
    <rect x="-15" y="-380" width="30" height="760" fill="#475569"/>
    
    <polygon points="-250,-250 -180,-250 -250,-180" fill="#0f172a"/>
    <polygon points="250,250 180,250 250,180" fill="#0f172a"/>
    <polygon points="-250,250 -180,250 -250,180" fill="#0f172a"/>
    <polygon points="250,-250 180,-250 250,-180" fill="#0f172a"/>
  </g>
</svg>`;

// Sample 4: Pop Art Lion / Animal Portrait
const popArtSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <linearGradient id="popGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#06b6d4"/>
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#popGrad)"/>
  <g transform="translate(400,400) scale(1.2)" stroke="#000000" stroke-width="12" fill="none">
    <!-- Geometric Animal Silhouette -->
    <polygon points="0,-220 -150,-100 -200,80 -100,200 0,250 100,200 200,80 150,-100" fill="#0f172a" stroke="#ffffff"/>
    <polygon points="0,-220 -80,-60 0,40" fill="#ffffff"/>
    <polygon points="0,-220 80,-60 0,40" fill="#cbd5e1"/>
    <polygon points="-150,-100 -80,-60 -120,40" fill="#475569"/>
    <polygon points="150,-100 80,-60 120,40" fill="#64748b"/>
    <circle cx="-50" cy="-30" r="20" fill="#f8fafc"/>
    <circle cx="50" cy="-30" r="20" fill="#f8fafc"/>
    <circle cx="-50" cy="-30" r="8" fill="#0f172a"/>
    <circle cx="50" cy="-30" r="8" fill="#0f172a"/>
  </g>
</svg>`;

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'statue',
    title: 'Klassische Büste',
    category: 'Porträt & Licht',
    url: createSvgDataUrl(statueSvg),
  },
  {
    id: 'cyberpunk',
    title: 'Retro Synthwave',
    category: 'Farben & Verlauf',
    url: createSvgDataUrl(cyberpunkSvg),
  },
  {
    id: 'architecture',
    title: 'Geometrische Architektur',
    category: 'Muster & Formen',
    url: createSvgDataUrl(architectureSvg),
  },
  {
    id: 'popart',
    title: 'Pop-Art Abstraktion',
    category: 'Vektor & Kontrast',
    url: createSvgDataUrl(popArtSvg),
  },
];
