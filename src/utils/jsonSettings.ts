import { HalftoneOptions } from '../types';
import { DEFAULT_OPTIONS } from './presets';

export { DEFAULT_OPTIONS };

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
          cmykEnabled: {
            ...DEFAULT_OPTIONS.cmykEnabled,
            ...(parsed.cmykEnabled || {}),
          },
          cmykColors: {
            ...DEFAULT_OPTIONS.cmykColors,
            ...(parsed.cmykColors || {}),
          },
          cmykGain: {
            ...DEFAULT_OPTIONS.cmykGain,
            ...(parsed.cmykGain || {}),
          },
          rgbAngles: {
            ...DEFAULT_OPTIONS.rgbAngles,
            ...(parsed.rgbAngles || {}),
          },
          rgbEnabled: {
            ...DEFAULT_OPTIONS.rgbEnabled,
            ...(parsed.rgbEnabled || {}),
          },
          rgbColors: {
            ...DEFAULT_OPTIONS.rgbColors,
            ...(parsed.rgbColors || {}),
          },
          rgbGain: {
            ...DEFAULT_OPTIONS.rgbGain,
            ...(parsed.rgbGain || {}),
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
