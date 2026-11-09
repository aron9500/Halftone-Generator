import { HalftoneOptions, ColorMode, PatternType } from '../types';

export interface SampledPoint {
  x: number;
  y: number;
  size: number;
  luminance: number; // 0 to 1
  color: string;     // hex or rgb
  r: number;
  g: number;
  b: number;
  c?: number;        // CMYK values 0..1
  m?: number;
  yVal?: number;
  k?: number;
}

// Convert RGB to HEX
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert HEX to RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleanHex = hex.replace('#', '');
  if (cleanHex.length === 3) {
    cleanHex = cleanHex.split('').map(c => c + c).join('');
  }
  const num = parseInt(cleanHex, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Linear interpolation for duotone
function interpolateColor(color1: string, color2: string, factor: number): string {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  const r = rgb1.r + factor * (rgb2.r - rgb1.r);
  const g = rgb1.g + factor * (rgb2.g - rgb1.g);
  const b = rgb1.b + factor * (rgb2.b - rgb1.b);
  return rgbToHex(r, g, b);
}

// Get image pixel data offscreen
export function getImagePixelData(
  image: HTMLImageElement,
  options: HalftoneOptions
): { imageData: ImageData; width: number; height: number; canvas: HTMLCanvasElement } {
  const canvas = document.createElement('canvas');
  const width = image.naturalWidth || image.width || 800;
  const height = image.naturalHeight || image.height || 600;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d context');

  // Draw image
  ctx.drawImage(image, 0, 0, width, height);

  // Optional blur pre-filter
  if (options.blur > 0) {
    ctx.filter = `blur(${options.blur}px)`;
    ctx.drawImage(canvas, 0, 0);
    ctx.filter = 'none';
  }

  const imageData = ctx.getImageData(0, 0, width, height);
  return { imageData, width, height, canvas };
}

// Apply pre-processing adjustments (Saturation, Contrast, Brightness) to raw RGB values
function applyImageAdjustments(
  rawR: number,
  rawG: number,
  rawB: number,
  options: HalftoneOptions
): { r: number; g: number; b: number } {
  let r = rawR;
  let g = rawG;
  let b = rawB;

  // 1. Saturation adjustment (-100 to 100)
  if (options.saturation !== 0) {
    const satFactor = 1 + options.saturation / 100;
    const gray = 0.299 * r + 0.587 * g + 0.114 * b;
    r = gray + (r - gray) * satFactor;
    g = gray + (g - gray) * satFactor;
    b = gray + (b - gray) * satFactor;
  }

  // 2. Contrast adjustment (-100 to 100)
  if (options.contrast !== 0) {
    const factor = (259 * (options.contrast + 255)) / (255 * (259 - options.contrast));
    r = factor * (r - 128) + 128;
    g = factor * (g - 128) + 128;
    b = factor * (b - 128) + 128;
  }

  // 3. Brightness adjustment (-100 to 100)
  if (options.brightness !== 0) {
    const brightOffset = (options.brightness / 100) * 255;
    r += brightOffset;
    g += brightOffset;
    b += brightOffset;
  }

  // Clamp 0 to 255
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return { r, g, b };
}

// Calculate adjusted brightness/luminance value and pre-processed RGB from pixel
function processPixelValue(
  rawR: number,
  rawG: number,
  rawB: number,
  options: HalftoneOptions
): { darkness: number; normLum: number; hex: string; r: number; g: number; b: number } {
  const { r, g, b } = applyImageAdjustments(rawR, rawG, rawB, options);

  // Standard perceptual luminance
  let lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Gamma correction
  if (options.gamma !== 1.0) {
    lum = Math.pow(lum, options.gamma);
  }

  // Clamp 0 to 1
  lum = Math.max(0, Math.min(1, lum));

  // Threshold cutoff
  if (options.threshold > 0) {
    const threshNorm = options.threshold / 100;
    lum = lum < threshNorm ? 0 : lum;
  }

  // Invert logic
  let darkness = options.invert ? lum : 1 - lum;

  return {
    darkness: Math.max(0, Math.min(1, darkness)),
    normLum: lum,
    hex: rgbToHex(r, g, b),
    r,
    g,
    b,
  };
}

// Sample points on a rotated grid
export function sampleGridPoints(
  imageData: ImageData,
  width: number,
  height: number,
  options: HalftoneOptions,
  overrideAngle?: number
): SampledPoint[] {
  const pixels = imageData.data;
  const points: SampledPoint[] = [];

  const angleRad = ((overrideAngle ?? options.angle) * Math.PI) / 180;
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  const spacing = Math.max(2, options.spacing);
  const cx = width / 2;
  const cy = height / 2;

  // Diagonal bound to cover canvas rotation fully
  const diag = Math.sqrt(width * width + height * height);
  const minU = -diag / 2;
  const maxU = diag / 2;
  const minV = -diag / 2;
  const maxV = diag / 2;

  const isHex = options.gridType === 'hex';

  let vIndex = 0;
  for (let v = minV; v <= maxV; v += spacing) {
    vIndex++;
    const uOffset = isHex && vIndex % 2 === 1 ? spacing * 0.5 : 0;

    for (let u = minU; u <= maxU; u += spacing) {
      const currentU = u + uOffset;

      // Rotate grid coordinate back to image space centered at (cx, cy)
      const x = Math.round(cx + currentU * cos - v * sin);
      const y = Math.round(cy + currentU * sin + v * cos);

      // Bounds check
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const pixelIdx = (y * width + x) * 4;
        const r = pixels[pixelIdx];
        const g = pixels[pixelIdx + 1];
        const b = pixels[pixelIdx + 2];
        const a = pixels[pixelIdx + 3];

        if (a < 10) continue; // Skip transparent pixel areas

        const { darkness, normLum, hex, r: adjR, g: adjG, b: adjB } = processPixelValue(r, g, b, options);

        // Dot size calculation
        let rawSize = darkness * spacing * options.maxDotSize;
        if (rawSize < options.minDotSize) {
          rawSize = 0;
        }

        // Determine color based on color mode
        let dotColor = options.fgColor;
        if (options.colorMode === 'original') {
          dotColor = hex;
        } else if (options.colorMode === 'duotone') {
          dotColor = interpolateColor(options.duotoneColor1, options.duotoneColor2, normLum);
        }

        // CMYK conversion values from pre-processed RGB
        const cVal = 1 - adjR / 255;
        const mVal = 1 - adjG / 255;
        const yVal = 1 - adjB / 255;
        const kVal = Math.min(cVal, mVal, yVal);

        points.push({
          x,
          y,
          size: rawSize,
          luminance: normLum,
          color: dotColor,
          r: adjR,
          g: adjG,
          b: adjB,
          c: Math.max(0, cVal - kVal),
          m: Math.max(0, mVal - kVal),
          yVal: Math.max(0, yVal - kVal),
          k: kVal,
        });
      }
    }
  }

  return points;
}

// Render Halftone effect onto an HTML5 Canvas for real-time preview
export function renderHalftoneCanvas(
  targetCtx: CanvasRenderingContext2D,
  imageData: ImageData,
  width: number,
  height: number,
  options: HalftoneOptions
) {
  // Clear canvas
  targetCtx.clearRect(0, 0, width, height);

  // Background fill
  if (!options.transparentBg) {
    targetCtx.fillStyle = options.bgColor;
    targetCtx.fillRect(0, 0, width, height);
  }

  // Handle CMYK 4-Color Screen mode
  if (options.colorMode === 'cmyk' || options.pattern === 'cmyk') {
    renderCMYKCanvas(targetCtx, imageData, width, height, options);
    return;
  }

  // Standard Single Channel / Duotone / Original sampling
  const points = sampleGridPoints(imageData, width, height, options);

  const shapeRotRad = (options.shapeRotation * Math.PI) / 180;

  targetCtx.save();

  points.forEach((pt) => {
    if (pt.size <= 0) return;

    targetCtx.fillStyle = pt.color;
    targetCtx.strokeStyle = pt.color;

    targetCtx.save();
    targetCtx.translate(pt.x, pt.y);
    if (shapeRotRad !== 0) {
      targetCtx.rotate(shapeRotRad);
    }

    drawShapeOnCtx(targetCtx, options.pattern, pt.size, options.spacing, options.lineThicknessRatio);

    targetCtx.restore();
  });

  targetCtx.restore();
}

// CMYK Canvas Renderer
function renderCMYKCanvas(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  width: number,
  height: number,
  options: HalftoneOptions
) {
  const cmykChannels = [
    { name: 'C', color: '#00ffff', angle: options.cmykAngles.c, key: 'c' as const },
    { name: 'M', color: '#ff00ff', angle: options.cmykAngles.m, key: 'm' as const },
    { name: 'Y', color: '#ffff00', angle: options.cmykAngles.y, key: 'yVal' as const },
    { name: 'K', color: '#000000', angle: options.cmykAngles.k, key: 'k' as const },
  ];

  ctx.globalCompositeOperation = 'multiply';

  cmykChannels.forEach((ch) => {
    const points = sampleGridPoints(imageData, width, height, options, ch.angle);

    ctx.fillStyle = ch.color;

    points.forEach((pt) => {
      const channelVal = pt[ch.key] || 0;
      const channelSize = channelVal * options.spacing * options.maxDotSize;

      if (channelSize < options.minDotSize || channelSize <= 0) return;

      ctx.beginPath();
      ctx.arc(pt.x, pt.y, channelSize / 2, 0, Math.PI * 2);
      ctx.fill();
    });
  });

  ctx.globalCompositeOperation = 'source-over';
}

// Draw shape on 2D Context centered at origin
function drawShapeOnCtx(
  ctx: CanvasRenderingContext2D,
  pattern: PatternType,
  size: number,
  spacing: number,
  lineRatio: number
) {
  const r = size / 2;

  switch (pattern) {
    case 'circle':
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(0.2, r), 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'square':
      ctx.fillRect(-r, -r, size, size);
      break;

    case 'diamond':
      ctx.save();
      ctx.rotate(Math.PI / 4);
      ctx.fillRect(-r, -r, size, size);
      ctx.restore();
      break;

    case 'line': {
      const thickness = Math.max(0.5, size * lineRatio);
      ctx.fillRect(-spacing / 2, -thickness / 2, spacing, thickness);
      break;
    }

    case 'hexagon': {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }

    case 'cross': {
      const th = Math.max(1, size * 0.25);
      ctx.fillRect(-r, -th / 2, size, th);
      ctx.fillRect(-th / 2, -r, th, size);
      break;
    }

    case 'star': {
      ctx.beginPath();
      const outerR = r;
      const innerR = r * 0.4;
      for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? outerR : innerR;
        const angle = (i * Math.PI) / 5 - Math.PI / 2;
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }

    default:
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(0.2, r), 0, Math.PI * 2);
      ctx.fill();
  }
}

// Generate pure SVG vector string
export function generateHalftoneSVG(
  imageData: ImageData,
  width: number,
  height: number,
  options: HalftoneOptions,
  optimizePath: boolean = true
): string {
  const points = sampleGridPoints(imageData, width, height, options);

  let svgElements: string[] = [];

  // Background
  if (!options.transparentBg) {
    svgElements.push(`<rect width="${width}" height="${height}" fill="${options.bgColor}"/>`);
  }

  if (options.colorMode === 'cmyk' || options.pattern === 'cmyk') {
    return generateCMYKSVG(imageData, width, height, options);
  }

  // Group by color for path optimization if enabled
  const colorMap = new Map<string, SampledPoint[]>();

  points.forEach((pt) => {
    if (pt.size <= 0) return;
    if (!colorMap.has(pt.color)) {
      colorMap.set(pt.color, []);
    }
    colorMap.get(pt.color)!.push(pt);
  });

  const rotRad = (options.shapeRotation * Math.PI) / 180;

  colorMap.forEach((pts, color) => {
    if (optimizePath && (options.pattern === 'circle' || options.pattern === 'square' || options.pattern === 'diamond')) {
      // Create single compound path d="..." string
      const pathSegments: string[] = [];

      pts.forEach((pt) => {
        const r = pt.size / 2;
        if (options.pattern === 'circle') {
          // SVG circle arc path
          pathSegments.push(
            `M ${pt.x - r},${pt.y} a ${r},${r} 0 1,0 ${r * 2},0 a ${r},${r} 0 1,0 -${r * 2},0`
          );
        } else if (options.pattern === 'square') {
          pathSegments.push(
            `M ${pt.x - r},${pt.y - r} h ${pt.size} v ${pt.size} h -${pt.size} Z`
          );
        } else if (options.pattern === 'diamond') {
          pathSegments.push(
            `M ${pt.x},${pt.y - r} L ${pt.x + r},${pt.y} L ${pt.x},${pt.y + r} L ${pt.x - r},${pt.y} Z`
          );
        }
      });

      svgElements.push(`<path fill="${color}" d="${pathSegments.join(' ')}"/>`);
    } else {
      // Individual SVG shapes inside group
      const shapeElements: string[] = [];

      pts.forEach((pt) => {
        const r = pt.size / 2;
        const transformAttr = options.shapeRotation !== 0 ? ` transform="rotate(${options.shapeRotation} ${pt.x} ${pt.y})"` : '';

        switch (options.pattern) {
          case 'circle':
            shapeElements.push(`<circle cx="${pt.x.toFixed(2)}" cy="${pt.y.toFixed(2)}" r="${r.toFixed(2)}"${transformAttr}/>`);
            break;
          case 'square':
            shapeElements.push(`<rect x="${(pt.x - r).toFixed(2)}" y="${(pt.y - r).toFixed(2)}" width="${pt.size.toFixed(2)}" height="${pt.size.toFixed(2)}"${transformAttr}/>`);
            break;
          case 'diamond':
            shapeElements.push(`<rect x="${(pt.x - r).toFixed(2)}" y="${(pt.y - r).toFixed(2)}" width="${pt.size.toFixed(2)}" height="${pt.size.toFixed(2)}" transform="rotate(${options.shapeRotation + 45} ${pt.x} ${pt.y})"/>`);
            break;
          case 'line': {
            const th = Math.max(0.5, pt.size * options.lineThicknessRatio);
            shapeElements.push(`<rect x="${(pt.x - options.spacing / 2).toFixed(2)}" y="${(pt.y - th / 2).toFixed(2)}" width="${options.spacing}" height="${th.toFixed(2)}"${transformAttr}/>`);
            break;
          }
          case 'hexagon': {
            const hexPoints: string[] = [];
            for (let i = 0; i < 6; i++) {
              const angle = (i * Math.PI) / 3 + rotRad;
              const hx = pt.x + r * Math.cos(angle);
              const hy = pt.y + r * Math.sin(angle);
              hexPoints.push(`${hx.toFixed(2)},${hy.toFixed(2)}`);
            }
            shapeElements.push(`<polygon points="${hexPoints.join(' ')}"/>`);
            break;
          }
          case 'star': {
            const starPts: string[] = [];
            const outerR = r;
            const innerR = r * 0.4;
            for (let i = 0; i < 10; i++) {
              const radius = i % 2 === 0 ? outerR : innerR;
              const angle = (i * Math.PI) / 5 - Math.PI / 2 + rotRad;
              const sx = pt.x + radius * Math.cos(angle);
              const sy = pt.y + radius * Math.sin(angle);
              starPts.push(`${sx.toFixed(2)},${sy.toFixed(2)}`);
            }
            shapeElements.push(`<polygon points="${starPts.join(' ')}"/>`);
            break;
          }
          default:
            shapeElements.push(`<circle cx="${pt.x.toFixed(2)}" cy="${pt.y.toFixed(2)}" r="${r.toFixed(2)}"${transformAttr}/>`);
        }
      });

      svgElements.push(`<g fill="${color}">${shapeElements.join('')}</g>`);
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${svgElements.join('\n  ')}
</svg>`;
}

// Generate CMYK SVG String
function generateCMYKSVG(
  imageData: ImageData,
  width: number,
  height: number,
  options: HalftoneOptions
): string {
  const cmykChannels = [
    { name: 'cyan', color: '#00ffff', angle: options.cmykAngles.c, key: 'c' as const },
    { name: 'magenta', color: '#ff00ff', angle: options.cmykAngles.m, key: 'm' as const },
    { name: 'yellow', color: '#ffff00', angle: options.cmykAngles.y, key: 'yVal' as const },
    { name: 'black', color: '#000000', angle: options.cmykAngles.k, key: 'k' as const },
  ];

  let channelGroups: string[] = [];

  if (!options.transparentBg) {
    channelGroups.push(`<rect width="${width}" height="${height}" fill="${options.bgColor}"/>`);
  }

  cmykChannels.forEach((ch) => {
    const points = sampleGridPoints(imageData, width, height, options, ch.angle);
    const circleElements: string[] = [];

    points.forEach((pt) => {
      const channelVal = pt[ch.key] || 0;
      const channelSize = channelVal * options.spacing * options.maxDotSize;

      if (channelSize < options.minDotSize || channelSize <= 0) return;

      circleElements.push(
        `<circle cx="${pt.x.toFixed(2)}" cy="${pt.y.toFixed(2)}" r="${(channelSize / 2).toFixed(2)}"/>`
      );
    });

    channelGroups.push(
      `<g id="${ch.name}" fill="${ch.color}" style="mix-blend-mode: multiply;">${circleElements.join('')}</g>`
    );
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${channelGroups.join('\n  ')}
</svg>`;
}

// Generate high resolution PNG data URL
export function generateHighResPNG(
  image: HTMLImageElement,
  options: HalftoneOptions,
  scaleFactor: number = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const { imageData, width, height } = getImagePixelData(image, options);

      const targetWidth = width * scaleFactor;
      const targetHeight = height * scaleFactor;

      const exportCanvas = document.createElement('canvas');
      exportCanvas.width = targetWidth;
      exportCanvas.height = targetHeight;

      const ctx = exportCanvas.getContext('2d');
      if (!ctx) return reject('No context');

      // Scale options for export
      const scaledOptions: HalftoneOptions = {
        ...options,
        spacing: options.spacing * scaleFactor,
        minDotSize: options.minDotSize * scaleFactor,
        blur: options.blur * scaleFactor,
      };

      // We sample at higher density/resolution
      renderHalftoneCanvas(ctx, imageData, targetWidth, targetHeight, scaledOptions);

      resolve(exportCanvas.toDataURL('image/png'));
    } catch (err) {
      reject(err);
    }
  });
}
