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

  // Handle RGB Additive Screen Separation
  if (options.colorMode === 'rgb') {
    renderRGBCanvas(targetCtx, imageData, width, height, options);
    return;
  }

  // Handle CMYK 4-Color Subtractive Screen mode
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

// CMYK Subtractive Color Separation Canvas Renderer
function renderCMYKCanvas(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  width: number,
  height: number,
  options: HalftoneOptions
) {
  const activeShape = options.pattern === 'cmyk' ? 'circle' : options.pattern;
  const rotOffset = options.separationOffsetAngle || 0;

  const cmykChannels = [
    {
      name: 'Cyan',
      plateId: 'c' as const,
      color: options.cmykColors?.c || '#00ffff',
      angle: (options.cmykAngles.c + rotOffset) % 360,
      key: 'c' as const,
      enabled: options.cmykEnabled?.c ?? true,
      gain: options.cmykGain?.c ?? 1.0,
    },
    {
      name: 'Magenta',
      plateId: 'm' as const,
      color: options.cmykColors?.m || '#ff00ff',
      angle: (options.cmykAngles.m + rotOffset) % 360,
      key: 'm' as const,
      enabled: options.cmykEnabled?.m ?? true,
      gain: options.cmykGain?.m ?? 1.0,
    },
    {
      name: 'Yellow',
      plateId: 'y' as const,
      color: options.cmykColors?.y || '#ffff00',
      angle: (options.cmykAngles.y + rotOffset) % 360,
      key: 'yVal' as const,
      enabled: options.cmykEnabled?.y ?? true,
      gain: options.cmykGain?.y ?? 1.0,
    },
    {
      name: 'Key',
      plateId: 'k' as const,
      color: options.cmykColors?.k || '#000000',
      angle: (options.cmykAngles.k + rotOffset) % 360,
      key: 'k' as const,
      enabled: options.cmykEnabled?.k ?? true,
      gain: options.cmykGain?.k ?? 1.0,
    },
  ];

  // Plate filter for real-time inspection
  const activeChannels = cmykChannels.filter((ch) => {
    if (!ch.enabled) return false;
    if (options.activePlate && options.activePlate !== 'all') {
      return options.activePlate === ch.plateId;
    }
    return true;
  });

  // Use multiply blending for realistic subtractive ink overprinting
  ctx.globalCompositeOperation = 'multiply';

  const shapeRotRad = (options.shapeRotation * Math.PI) / 180;

  activeChannels.forEach((ch) => {
    const points = sampleGridPoints(imageData, width, height, options, ch.angle);

    ctx.fillStyle = ch.color;
    ctx.strokeStyle = ch.color;

    points.forEach((pt) => {
      const channelVal = (pt[ch.key] || 0) * ch.gain;
      const channelSize = channelVal * options.spacing * options.maxDotSize;

      if (channelSize < options.minDotSize || channelSize <= 0) return;

      ctx.save();
      ctx.translate(pt.x, pt.y);
      if (shapeRotRad !== 0) {
        ctx.rotate(shapeRotRad);
      }
      drawShapeOnCtx(ctx, activeShape, channelSize, options.spacing, options.lineThicknessRatio);
      ctx.restore();
    });
  });

  ctx.globalCompositeOperation = 'source-over';
}

// RGB Additive Color Separation Canvas Renderer
function renderRGBCanvas(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  width: number,
  height: number,
  options: HalftoneOptions
) {
  const activeShape = options.pattern === 'cmyk' ? 'circle' : options.pattern;
  const rotOffset = options.separationOffsetAngle || 0;

  const rgbChannels = [
    {
      name: 'Red',
      plateId: 'r' as const,
      color: options.rgbColors?.r || '#ff1744',
      angle: ((options.rgbAngles?.r ?? 15) + rotOffset) % 360,
      key: 'r' as const,
      enabled: options.rgbEnabled?.r ?? true,
      gain: options.rgbGain?.r ?? 1.0,
    },
    {
      name: 'Green',
      plateId: 'g' as const,
      color: options.rgbColors?.g || '#00e676',
      angle: ((options.rgbAngles?.g ?? 75) + rotOffset) % 360,
      key: 'g' as const,
      enabled: options.rgbEnabled?.g ?? true,
      gain: options.rgbGain?.g ?? 1.0,
    },
    {
      name: 'Blue',
      plateId: 'b' as const,
      color: options.rgbColors?.b || '#2979ff',
      angle: ((options.rgbAngles?.b ?? 0) + rotOffset) % 360,
      key: 'b' as const,
      enabled: options.rgbEnabled?.b ?? true,
      gain: options.rgbGain?.b ?? 1.0,
    },
  ];

  // Plate filter for real-time inspection
  const activeChannels = rgbChannels.filter((ch) => {
    if (!ch.enabled) return false;
    if (options.activePlate && options.activePlate !== 'all') {
      return options.activePlate === ch.plateId;
    }
    return true;
  });

  // Screen additive blending for RGB light / display halftones
  ctx.globalCompositeOperation = 'screen';

  const shapeRotRad = (options.shapeRotation * Math.PI) / 180;

  activeChannels.forEach((ch) => {
    const points = sampleGridPoints(imageData, width, height, options, ch.angle);

    ctx.fillStyle = ch.color;
    ctx.strokeStyle = ch.color;

    points.forEach((pt) => {
      // In RGB, luminance of each channel dictates dot size (or inverse if inverted)
      const rawIntensity = pt[ch.key] / 255;
      const intensity = options.invert ? (1 - rawIntensity) : rawIntensity;
      const channelSize = intensity * options.spacing * options.maxDotSize * ch.gain;

      if (channelSize < options.minDotSize || channelSize <= 0) return;

      ctx.save();
      ctx.translate(pt.x, pt.y);
      if (shapeRotRad !== 0) {
        ctx.rotate(shapeRotRad);
      }
      drawShapeOnCtx(ctx, activeShape, channelSize, options.spacing, options.lineThicknessRatio);
      ctx.restore();
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
    case 'cmyk':
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

    case 'triangle': {
      ctx.beginPath();
      const h = r * 1.732; // sqrt(3)
      ctx.moveTo(0, -r);
      ctx.lineTo(r, r * 0.732);
      ctx.lineTo(-r, r * 0.732);
      ctx.closePath();
      ctx.fill();
      break;
    }

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
      const th = Math.max(1, size * 0.28);
      ctx.fillRect(-r, -th / 2, size, th);
      ctx.fillRect(-th / 2, -r, th, size);
      break;
    }

    case 'star': {
      ctx.beginPath();
      const outerR = r;
      const innerR = r * 0.42;
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

    case 'ring': {
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(0.5, r), 0, Math.PI * 2);
      ctx.arc(0, 0, Math.max(0.2, r * 0.52), 0, Math.PI * 2, true);
      ctx.fill();
      break;
    }

    case 'heart': {
      ctx.beginPath();
      const top = -r * 0.45;
      ctx.moveTo(0, r * 0.85);
      ctx.bezierCurveTo(-r * 1.15, r * 0.2, -r * 1.15, top, -r * 0.5, top);
      ctx.bezierCurveTo(-r * 0.1, top, 0, -r * 0.05, 0, -r * 0.05);
      ctx.bezierCurveTo(0, -r * 0.05, r * 0.1, top, r * 0.5, top);
      ctx.bezierCurveTo(r * 1.15, top, r * 1.15, r * 0.2, 0, r * 0.85);
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
  // Handle RGB Additive Screen Separation SVG
  if (options.colorMode === 'rgb') {
    return generateRGBSVG(imageData, width, height, options, optimizePath);
  }

  // Handle CMYK Subtractive Screen Separation SVG
  if (options.colorMode === 'cmyk' || options.pattern === 'cmyk') {
    return generateCMYKSVG(imageData, width, height, options, optimizePath);
  }

  const points = sampleGridPoints(imageData, width, height, options);

  let svgElements: string[] = [];

  // Background
  if (!options.transparentBg) {
    svgElements.push(`<rect width="${width}" height="${height}" fill="${options.bgColor}"/>`);
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
    const canCompound = optimizePath && (
      options.pattern === 'circle' || 
      options.pattern === 'square' || 
      options.pattern === 'diamond' ||
      options.pattern === 'triangle' ||
      options.pattern === 'ring'
    ) && options.shapeRotation === 0;

    if (canCompound) {
      // Create single compound path d="..." string
      const pathSegments: string[] = [];

      pts.forEach((pt) => {
        const r = pt.size / 2;
        if (options.pattern === 'circle') {
          pathSegments.push(
            `M ${(pt.x - r).toFixed(2)},${pt.y.toFixed(2)} a ${r.toFixed(2)},${r.toFixed(2)} 0 1,0 ${(r * 2).toFixed(2)},0 a ${r.toFixed(2)},${r.toFixed(2)} 0 1,0 -${(r * 2).toFixed(2)},0`
          );
        } else if (options.pattern === 'square') {
          pathSegments.push(
            `M ${(pt.x - r).toFixed(2)},${(pt.y - r).toFixed(2)} h ${pt.size.toFixed(2)} v ${pt.size.toFixed(2)} h -${pt.size.toFixed(2)} Z`
          );
        } else if (options.pattern === 'diamond') {
          pathSegments.push(
            `M ${pt.x.toFixed(2)},${(pt.y - r).toFixed(2)} L ${(pt.x + r).toFixed(2)},${pt.y.toFixed(2)} L ${pt.x.toFixed(2)},${(pt.y + r).toFixed(2)} L ${(pt.x - r).toFixed(2)},${pt.y.toFixed(2)} Z`
          );
        } else if (options.pattern === 'triangle') {
          pathSegments.push(
            `M ${pt.x.toFixed(2)},${(pt.y - r).toFixed(2)} L ${(pt.x + r).toFixed(2)},${(pt.y + r * 0.732).toFixed(2)} L ${(pt.x - r).toFixed(2)},${(pt.y + r * 0.732).toFixed(2)} Z`
          );
        } else if (options.pattern === 'ring') {
          const innerR = r * 0.52;
          pathSegments.push(
            `M ${(pt.x - r).toFixed(2)},${pt.y.toFixed(2)} a ${r.toFixed(2)},${r.toFixed(2)} 0 1,0 ${(r * 2).toFixed(2)},0 a ${r.toFixed(2)},${r.toFixed(2)} 0 1,0 -${(r * 2).toFixed(2)},0 M ${(pt.x - innerR).toFixed(2)},${pt.y.toFixed(2)} a ${innerR.toFixed(2)},${innerR.toFixed(2)} 0 1,1 ${(innerR * 2).toFixed(2)},0 a ${innerR.toFixed(2)},${innerR.toFixed(2)} 0 1,1 -${(innerR * 2).toFixed(2)},0`
          );
        }
      });

      svgElements.push(`<path fill="${color}" fill-rule="evenodd" d="${pathSegments.join(' ')}"/>`);
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
          case 'triangle': {
            const tx1 = pt.x.toFixed(2);
            const ty1 = (pt.y - r).toFixed(2);
            const tx2 = (pt.x + r).toFixed(2);
            const ty2 = (pt.y + r * 0.732).toFixed(2);
            const tx3 = (pt.x - r).toFixed(2);
            const ty3 = (pt.y + r * 0.732).toFixed(2);
            shapeElements.push(`<polygon points="${tx1},${ty1} ${tx2},${ty2} ${tx3},${ty3}"${transformAttr}/>`);
            break;
          }
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
          case 'cross': {
            const th = Math.max(1, pt.size * 0.28);
            shapeElements.push(`<g${transformAttr}><rect x="${(pt.x - r).toFixed(2)}" y="${(pt.y - th / 2).toFixed(2)}" width="${pt.size.toFixed(2)}" height="${th.toFixed(2)}"/><rect x="${(pt.x - th / 2).toFixed(2)}" y="${(pt.y - r).toFixed(2)}" width="${th.toFixed(2)}" height="${pt.size.toFixed(2)}"/></g>`);
            break;
          }
          case 'star': {
            const starPts: string[] = [];
            const outerR = r;
            const innerR = r * 0.42;
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
          case 'ring': {
            const innerR = r * 0.52;
            shapeElements.push(`<path fill-rule="evenodd" d="M ${(pt.x - r).toFixed(2)},${pt.y.toFixed(2)} a ${r.toFixed(2)},${r.toFixed(2)} 0 1,0 ${(r * 2).toFixed(2)},0 a ${r.toFixed(2)},${r.toFixed(2)} 0 1,0 -${(r * 2).toFixed(2)},0 M ${(pt.x - innerR).toFixed(2)},${pt.y.toFixed(2)} a ${innerR.toFixed(2)},${innerR.toFixed(2)} 0 1,1 ${(innerR * 2).toFixed(2)},0 a ${innerR.toFixed(2)},${innerR.toFixed(2)} 0 1,1 -${(innerR * 2).toFixed(2)},0"${transformAttr}/>`);
            break;
          }
          case 'heart': {
            const top = -r * 0.45;
            shapeElements.push(`<path d="M ${pt.x.toFixed(2)},${(pt.y + r * 0.85).toFixed(2)} C ${(pt.x - r * 1.15).toFixed(2)},${(pt.y + r * 0.2).toFixed(2)} ${(pt.x - r * 1.15).toFixed(2)},${(pt.y + top).toFixed(2)} ${(pt.x - r * 0.5).toFixed(2)},${(pt.y + top).toFixed(2)} C ${(pt.x - r * 0.1).toFixed(2)},${(pt.y + top).toFixed(2)} ${pt.x.toFixed(2)},${(pt.y - r * 0.05).toFixed(2)} ${pt.x.toFixed(2)},${(pt.y - r * 0.05).toFixed(2)} C ${pt.x.toFixed(2)},${(pt.y - r * 0.05).toFixed(2)} ${(pt.x + r * 0.1).toFixed(2)},${(pt.y + top).toFixed(2)} ${(pt.x + r * 0.5).toFixed(2)},${(pt.y + top).toFixed(2)} C ${(pt.x + r * 1.15).toFixed(2)},${(pt.y + top).toFixed(2)} ${(pt.x + r * 1.15).toFixed(2)},${(pt.y + r * 0.2).toFixed(2)} ${pt.x.toFixed(2)},${(pt.y + r * 0.85).toFixed(2)} Z"${transformAttr}/>`);
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
  options: HalftoneOptions,
  optimizePath: boolean = true
): string {
  const activeShape = options.pattern === 'cmyk' ? 'circle' : options.pattern;
  const rotOffset = options.separationOffsetAngle || 0;

  const cmykChannels = [
    {
      name: 'cyan',
      plateId: 'c' as const,
      color: options.cmykColors?.c || '#00ffff',
      angle: (options.cmykAngles.c + rotOffset) % 360,
      key: 'c' as const,
      enabled: options.cmykEnabled?.c ?? true,
      gain: options.cmykGain?.c ?? 1.0,
    },
    {
      name: 'magenta',
      plateId: 'm' as const,
      color: options.cmykColors?.m || '#ff00ff',
      angle: (options.cmykAngles.m + rotOffset) % 360,
      key: 'm' as const,
      enabled: options.cmykEnabled?.m ?? true,
      gain: options.cmykGain?.m ?? 1.0,
    },
    {
      name: 'yellow',
      plateId: 'y' as const,
      color: options.cmykColors?.y || '#ffff00',
      angle: (options.cmykAngles.y + rotOffset) % 360,
      key: 'yVal' as const,
      enabled: options.cmykEnabled?.y ?? true,
      gain: options.cmykGain?.y ?? 1.0,
    },
    {
      name: 'black',
      plateId: 'k' as const,
      color: options.cmykColors?.k || '#000000',
      angle: (options.cmykAngles.k + rotOffset) % 360,
      key: 'k' as const,
      enabled: options.cmykEnabled?.k ?? true,
      gain: options.cmykGain?.k ?? 1.0,
    },
  ];

  const activeChannels = cmykChannels.filter((ch) => {
    if (!ch.enabled) return false;
    if (options.activePlate && options.activePlate !== 'all') {
      return options.activePlate === ch.plateId;
    }
    return true;
  });

  let channelGroups: string[] = [];

  if (!options.transparentBg) {
    channelGroups.push(`<rect width="${width}" height="${height}" fill="${options.bgColor}"/>`);
  }

  activeChannels.forEach((ch) => {
    const points = sampleGridPoints(imageData, width, height, options, ch.angle);
    const shapeElements: string[] = [];

    points.forEach((pt) => {
      const channelVal = (pt[ch.key] || 0) * ch.gain;
      const channelSize = channelVal * options.spacing * options.maxDotSize;

      if (channelSize < options.minDotSize || channelSize <= 0) return;

      const r = channelSize / 2;
      const transformAttr = options.shapeRotation !== 0 ? ` transform="rotate(${options.shapeRotation} ${pt.x} ${pt.y})"` : '';

      switch (activeShape) {
        case 'circle':
          shapeElements.push(`<circle cx="${pt.x.toFixed(2)}" cy="${pt.y.toFixed(2)}" r="${r.toFixed(2)}"${transformAttr}/>`);
          break;
        case 'square':
          shapeElements.push(`<rect x="${(pt.x - r).toFixed(2)}" y="${(pt.y - r).toFixed(2)}" width="${channelSize.toFixed(2)}" height="${channelSize.toFixed(2)}"${transformAttr}/>`);
          break;
        case 'diamond':
          shapeElements.push(`<rect x="${(pt.x - r).toFixed(2)}" y="${(pt.y - r).toFixed(2)}" width="${channelSize.toFixed(2)}" height="${channelSize.toFixed(2)}" transform="rotate(${options.shapeRotation + 45} ${pt.x} ${pt.y})"/>`);
          break;
        case 'triangle':
          shapeElements.push(`<polygon points="${pt.x.toFixed(2)},${(pt.y - r).toFixed(2)} ${(pt.x + r).toFixed(2)},${(pt.y + r * 0.732).toFixed(2)} ${(pt.x - r).toFixed(2)},${(pt.y + r * 0.732).toFixed(2)}"${transformAttr}/>`);
          break;
        case 'hexagon': {
          const hexPoints: string[] = [];
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const hx = pt.x + r * Math.cos(angle);
            const hy = pt.y + r * Math.sin(angle);
            hexPoints.push(`${hx.toFixed(2)},${hy.toFixed(2)}`);
          }
          shapeElements.push(`<polygon points="${hexPoints.join(' ')}"${transformAttr}/>`);
          break;
        }
        case 'star': {
          const starPts: string[] = [];
          const outerR = r;
          const innerR = r * 0.42;
          for (let i = 0; i < 10; i++) {
            const radius = i % 2 === 0 ? outerR : innerR;
            const angle = (i * Math.PI) / 5 - Math.PI / 2;
            const sx = pt.x + radius * Math.cos(angle);
            const sy = pt.y + radius * Math.sin(angle);
            starPts.push(`${sx.toFixed(2)},${sy.toFixed(2)}`);
          }
          shapeElements.push(`<polygon points="${starPts.join(' ')}"${transformAttr}/>`);
          break;
        }
        default:
          shapeElements.push(`<circle cx="${pt.x.toFixed(2)}" cy="${pt.y.toFixed(2)}" r="${r.toFixed(2)}"${transformAttr}/>`);
      }
    });

    channelGroups.push(
      `<g id="${ch.name}" fill="${ch.color}" style="mix-blend-mode: multiply;">${shapeElements.join('')}</g>`
    );
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  ${channelGroups.join('\n  ')}
</svg>`;
}

// Generate RGB Additive Color Separation SVG String
function generateRGBSVG(
  imageData: ImageData,
  width: number,
  height: number,
  options: HalftoneOptions,
  optimizePath: boolean = true
): string {
  const activeShape = options.pattern === 'cmyk' ? 'circle' : options.pattern;
  const rotOffset = options.separationOffsetAngle || 0;

  const rgbChannels = [
    {
      name: 'red',
      plateId: 'r' as const,
      color: options.rgbColors?.r || '#ff1744',
      angle: ((options.rgbAngles?.r ?? 15) + rotOffset) % 360,
      key: 'r' as const,
      enabled: options.rgbEnabled?.r ?? true,
      gain: options.rgbGain?.r ?? 1.0,
    },
    {
      name: 'green',
      plateId: 'g' as const,
      color: options.rgbColors?.g || '#00e676',
      angle: ((options.rgbAngles?.g ?? 75) + rotOffset) % 360,
      key: 'g' as const,
      enabled: options.rgbEnabled?.g ?? true,
      gain: options.rgbGain?.g ?? 1.0,
    },
    {
      name: 'blue',
      plateId: 'b' as const,
      color: options.rgbColors?.b || '#2979ff',
      angle: ((options.rgbAngles?.b ?? 0) + rotOffset) % 360,
      key: 'b' as const,
      enabled: options.rgbEnabled?.b ?? true,
      gain: options.rgbGain?.b ?? 1.0,
    },
  ];

  const activeChannels = rgbChannels.filter((ch) => {
    if (!ch.enabled) return false;
    if (options.activePlate && options.activePlate !== 'all') {
      return options.activePlate === ch.plateId;
    }
    return true;
  });

  let channelGroups: string[] = [];

  if (!options.transparentBg) {
    channelGroups.push(`<rect width="${width}" height="${height}" fill="${options.bgColor}"/>`);
  }

  activeChannels.forEach((ch) => {
    const points = sampleGridPoints(imageData, width, height, options, ch.angle);
    const shapeElements: string[] = [];

    points.forEach((pt) => {
      const rawIntensity = pt[ch.key] / 255;
      const intensity = options.invert ? (1 - rawIntensity) : rawIntensity;
      const channelSize = intensity * options.spacing * options.maxDotSize * ch.gain;

      if (channelSize < options.minDotSize || channelSize <= 0) return;

      const r = channelSize / 2;
      const transformAttr = options.shapeRotation !== 0 ? ` transform="rotate(${options.shapeRotation} ${pt.x} ${pt.y})"` : '';

      switch (activeShape) {
        case 'circle':
          shapeElements.push(`<circle cx="${pt.x.toFixed(2)}" cy="${pt.y.toFixed(2)}" r="${r.toFixed(2)}"${transformAttr}/>`);
          break;
        case 'square':
          shapeElements.push(`<rect x="${(pt.x - r).toFixed(2)}" y="${(pt.y - r).toFixed(2)}" width="${channelSize.toFixed(2)}" height="${channelSize.toFixed(2)}"${transformAttr}/>`);
          break;
        case 'diamond':
          shapeElements.push(`<rect x="${(pt.x - r).toFixed(2)}" y="${(pt.y - r).toFixed(2)}" width="${channelSize.toFixed(2)}" height="${channelSize.toFixed(2)}" transform="rotate(${options.shapeRotation + 45} ${pt.x} ${pt.y})"/>`);
          break;
        case 'triangle':
          shapeElements.push(`<polygon points="${pt.x.toFixed(2)},${(pt.y - r).toFixed(2)} ${(pt.x + r).toFixed(2)},${(pt.y + r * 0.732).toFixed(2)} ${(pt.x - r).toFixed(2)},${(pt.y + r * 0.732).toFixed(2)}"${transformAttr}/>`);
          break;
        case 'hexagon': {
          const hexPoints: string[] = [];
          for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI) / 3;
            const hx = pt.x + r * Math.cos(angle);
            const hy = pt.y + r * Math.sin(angle);
            hexPoints.push(`${hx.toFixed(2)},${hy.toFixed(2)}`);
          }
          shapeElements.push(`<polygon points="${hexPoints.join(' ')}"${transformAttr}/>`);
          break;
        }
        case 'star': {
          const starPts: string[] = [];
          const outerR = r;
          const innerR = r * 0.42;
          for (let i = 0; i < 10; i++) {
            const radius = i % 2 === 0 ? outerR : innerR;
            const angle = (i * Math.PI) / 5 - Math.PI / 2;
            const sx = pt.x + radius * Math.cos(angle);
            const sy = pt.y + radius * Math.sin(angle);
            starPts.push(`${sx.toFixed(2)},${sy.toFixed(2)}`);
          }
          shapeElements.push(`<polygon points="${starPts.join(' ')}"${transformAttr}/>`);
          break;
        }
        default:
          shapeElements.push(`<circle cx="${pt.x.toFixed(2)}" cy="${pt.y.toFixed(2)}" r="${r.toFixed(2)}"${transformAttr}/>`);
      }
    });

    channelGroups.push(
      `<g id="${ch.name}" fill="${ch.color}" style="mix-blend-mode: screen;">${shapeElements.join('')}</g>`
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
