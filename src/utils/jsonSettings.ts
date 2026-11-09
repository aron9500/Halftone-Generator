import { HalftoneOptions } from '../types';

export const DEFAULT_OPTIONS: HalftoneOptions = {
  spacing: 12,
  maxDotSize: 1.0,
  minDotSize: 0.5,
  pattern: 'circle',
  gridType: 'square',
  angle: 45,
  shapeRotation: 0,
  invert: false,
  brightness: 0,
  contrast: 0,
  saturation: 0,
  gamma: 1.0,
  threshold: 0,
  blur: 0,
  colorMode: 'monochrome',
  fgColor: '#000000',
  bgColor: '#ffffff',
  transparentBg: false,
  duotoneColor1: '#0f172a',
  duotoneColor2: '#38bdf8',
  cmykAngles: {
    c: 15,
    m: 75,
    y: 0,
    k: 45,
  },
  lineThicknessRatio: 1.0,
};

/**
 * Export current HalftoneOptions to a formatted .json file download
 */
export function exportSettingsAsJSON(options: HalftoneOptions, filename = 'halftone-settings.json') {
  const jsonString = JSON.stringify(options, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Read and parse JSON file into HalftoneOptions with safety fallback
 */
export function importSettingsFromJSON(file: File): Promise<HalftoneOptions> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);

        // Sanity check and merge with DEFAULT_OPTIONS
        const merged: HalftoneOptions = {
          ...DEFAULT_OPTIONS,
          ...parsed,
          cmykAngles: {
            ...DEFAULT_OPTIONS.cmykAngles,
            ...(parsed.cmykAngles || {}),
          },
        };

        resolve(merged);
      } catch (err) {
        reject(new Error('Ungültiges JSON-Einstellungsformat'));
      }
    };
    reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
    reader.readAsText(file);
  });
}
