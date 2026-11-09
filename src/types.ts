export type PatternType = 
  | 'circle' 
  | 'square' 
  | 'diamond' 
  | 'triangle'
  | 'hexagon' 
  | 'line' 
  | 'cross' 
  | 'star' 
  | 'ring'
  | 'heart'
  | 'cmyk';

export type ColorMode = 'monochrome' | 'original' | 'duotone' | 'cmyk' | 'rgb';

export type GridType = 'square' | 'hex' | 'radial' | 'spiral';

export type SeparationPlate = 'all' | 'c' | 'm' | 'y' | 'k' | 'r' | 'g' | 'b';

export interface HalftoneOptions {
  // Grid & Scale
  spacing: number;        // Punktdichte / Grid step in px (4 to 60)
  maxDotSize: number;     // Punktgröße scale factor (0.1 to 3.0)
  minDotSize: number;     // Minimal size cutoff in px (0 to 10)
  pattern: PatternType;   // Rastermuster
  gridType: GridType;     // Anordnung der Punkte
  angle: number;          // Rasterwinkel in degrees (0 to 360)
  shapeRotation: number;  // Individual shape rotation (0 to 360)

  // Tone & Image Adjustments
  invert: boolean;        // Invert luminance
  brightness: number;     // -100 to 100
  contrast: number;       // -100 to 100
  saturation: number;     // -100 to 100
  gamma: number;          // 0.2 to 3.0
  threshold: number;      // 0 to 100 (cutoff darks)
  blur: number;           // 0 to 10px preview blur before sampling

  // Colors
  colorMode: ColorMode;
  fgColor: string;        // Dot color
  bgColor: string;        // Background color
  transparentBg: boolean; // Is background transparent?
  duotoneColor1: string;  // Dark tone color
  duotoneColor2: string;  // Light tone color

  // CMYK Color Separation Options
  cmykAngles: {
    c: number; // Cyan angle (default 15)
    m: number; // Magenta angle (default 75)
    y: number; // Yellow angle (default 0)
    k: number; // Key/Black angle (default 45)
  };
  cmykEnabled: {
    c: boolean;
    m: boolean;
    y: boolean;
    k: boolean;
  };
  cmykColors: {
    c: string; // '#00ffff'
    m: string; // '#ff00ff'
    y: string; // '#ffff00'
    k: string; // '#000000'
  };
  cmykGain: {
    c: number; // 0.2 to 2.0 (default 1.0)
    m: number;
    y: number;
    k: number;
  };

  // RGB Color Separation Options
  rgbAngles: {
    r: number; // Red angle (default 15)
    g: number; // Green angle (default 75)
    b: number; // Blue angle (default 0)
  };
  rgbEnabled: {
    r: boolean;
    g: boolean;
    b: boolean;
  };
  rgbColors: {
    r: string; // '#ff0000'
    g: string; // '#00ff00'
    b: string; // '#0000ff'
  };
  rgbGain: {
    r: number; // 0.2 to 2.0 (default 1.0)
    g: number;
    b: number;
  };

  // Separation Global Angle Shift & Live Plate Inspection
  separationOffsetAngle: number; // Shift all separation channels in sync (0 to 360)
  activePlate: SeparationPlate;  // Live preview plate isolation ('all' or specific plate)

  // Line Pattern Specifics
  lineThicknessRatio: number; // 0.1 to 2.0
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  category: 'Classic' | 'PopArt' | 'Vector' | 'CMYK' | 'Artistic';
  options: Partial<HalftoneOptions>;
}

export interface SampleImage {
  id: string;
  title: string;
  category: string;
  url: string;
}

export interface ExportSettings {
  format: 'svg' | 'png';
  scaleFactor: number; // 1x, 2x, 4x, 8x
  includeBackground: boolean;
  optimizeSvgPath: boolean; // Merge dots into single compound <path d="..." /> for faster performance in vector tools
  fileName: string;
}
