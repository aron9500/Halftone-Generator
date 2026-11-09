import React, { useRef, useEffect, useState, useCallback } from 'react';
import { HalftoneOptions, SeparationPlate } from '../types';
import {
  renderHalftoneCanvas,
  getImagePixelData,
  generateHalftoneSVG,
} from '../utils/halftoneEngine';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Columns,
  Code,
  Sparkles,
  Upload,
  Image as ImageIcon,
  ImagePlus,
  ArrowDownUp,
  Layers,
  Compass,
} from 'lucide-react';

interface PreviewCanvasProps {
  image: HTMLImageElement | null;
  options: HalftoneOptions;
  onImageUpload: (file: File) => void;
  onOpenSamples: () => void;
  onToggleInvert?: () => void;
  onSelectPlate?: (plate: SeparationPlate) => void;
}

export const PreviewCanvas: React.FC<PreviewCanvasProps> = ({
  image,
  options,
  onImageUpload,
  onOpenSamples,
  onToggleInvert,
  onSelectPlate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // View state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Compare Split View
  const [showCompare, setShowCompare] = useState<boolean>(false);
  const [splitPos, setSplitPos] = useState<number>(50); // percentage 0 - 100
  const [isDraggingSplit, setIsDraggingSplit] = useState<boolean>(false);

  // Vector SVG mode vs Canvas
  const [viewMode, setViewMode] = useState<'canvas' | 'svg'>('canvas');
  const [svgContent, setSvgContent] = useState<string>('');

  // Performance & Metadata
  const [renderTimeMs, setRenderTimeMs] = useState<number>(0);
  const [approxDotCount, setApproxDotCount] = useState<number>(0);

  // Offscreen Pixel Cache
  const pixelDataCache = useRef<{
    imageData: ImageData;
    width: number;
    height: number;
  } | null>(null);

  // Drag & drop file upload state
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Update pixel cache when image changes
  useEffect(() => {
    if (image) {
      try {
        const { imageData, width, height } = getImagePixelData(image, options);
        pixelDataCache.current = { imageData, width, height };

        // Calculate estimated dots count
        const gridArea = Math.max(2, options.spacing) ** 2;
        const totalDots = Math.round((width * height) / gridArea);
        setApproxDotCount(totalDots);

        // Reset view center
        setPan({ x: 0, y: 0 });
        setZoom(1);
      } catch (err) {
        console.error('Error extracting image pixel data:', err);
      }
    } else {
      pixelDataCache.current = null;
    }
  }, [image]);

  // Main Render Loop
  const renderEffect = useCallback(() => {
    if (!image || !canvasRef.current) return;

    const startTime = performance.now();

    try {
      if (!pixelDataCache.current) {
        const { imageData, width, height } = getImagePixelData(image, options);
        pixelDataCache.current = { imageData, width, height };
      }

      const { imageData, width, height } = pixelDataCache.current;

      const canvas = canvasRef.current;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }

      const ctx = canvas.getContext('2d');
      if (ctx) {
        renderHalftoneCanvas(ctx, imageData, width, height, options);
      }

      // If SVG mode is active, also render vector SVG string
      if (viewMode === 'svg') {
        const svgStr = generateHalftoneSVG(imageData, width, height, options, true);
        setSvgContent(svgStr);
      }

      const gridArea = Math.max(2, options.spacing) ** 2;
      setApproxDotCount(Math.round((width * height) / gridArea));
    } catch (err) {
      console.error('Render error:', err);
    } finally {
      const endTime = performance.now();
      setRenderTimeMs(Math.round(endTime - startTime));
    }
  }, [image, options, viewMode]);

  // Debounced render on options update
  useEffect(() => {
    const timer = setTimeout(() => {
      renderEffect();
    }, 16); // ~60fps request
    return () => clearTimeout(timer);
  }, [options, renderEffect, viewMode]);

  // Handle Drag & Drop File Upload
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  };

  // Panning & Mouse Wheel Zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && !isDraggingSplit) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    } else if (isDraggingSplit && image) {
      const rect = e.currentTarget.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(100, (relativeX / rect.width) * 100));
      setSplitPos(pct);
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setIsDraggingSplit(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom((prev) => Math.max(0.2, Math.min(6.0, prev * zoomFactor)));
  };

  const width = pixelDataCache.current?.width || 800;
  const height = pixelDataCache.current?.height || 600;

  return (
    <div
      className="relative flex-1 bg-slate-100 flex flex-col items-center justify-center overflow-hidden select-none"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* Background Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#000000_1px,transparent_1px)] [background-size:20px_20px]" />

      {/* Drag & Drop Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md border-4 border-dashed border-white z-50 flex flex-col items-center justify-center text-white gap-3">
          <Upload className="w-12 h-12 animate-bounce" />
          <p className="font-bold text-lg uppercase tracking-wider">Bild hier loslassen</p>
          <p className="text-xs text-slate-300">Wandle dein Bild direkt in Vektor-Halftone um</p>
        </div>
      )}

      {/* Empty State when no image is loaded */}
      {!image && (
        <div className="flex flex-col items-center justify-center p-8 max-w-md text-center z-10 space-y-4">
          <div className="w-20 h-20 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-md">
            <ImageIcon className="w-8 h-8 text-slate-800" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Lade dein Bild hoch</h2>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              Erstelle hochauflösende Rastergrafiken und Vektorkunstwerke aus deinen Fotos oder Grafiken.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
            <label className="flex-1 py-3 px-4 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95">
              <ImagePlus className="w-4 h-4 stroke-[2]" />
              <span>Bild import</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files && e.target.files[0] && onImageUpload(e.target.files[0])}
                className="hidden"
              />
            </label>

            <button
              onClick={onOpenSamples}
              className="py-3 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-slate-700" />
              <span>Beispielbilder</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Preview Viewport */}
      {image && (
        <div
          className="relative transition-transform duration-75 cursor-grab active:cursor-grabbing flex items-center justify-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          }}
        >
          {/* Main Halftone Output View */}
          {viewMode === 'canvas' ? (
            <canvas
              ref={canvasRef}
              className="max-w-none shadow-2xl rounded-lg border-4 border-white bg-white"
              style={{
                backgroundColor: options.transparentBg ? 'transparent' : options.bgColor,
              }}
            />
          ) : (
            <div
              ref={svgContainerRef}
              className="max-w-none shadow-2xl rounded-lg border-4 border-white bg-white overflow-hidden"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          )}

          {/* Compare View Overlay (Split screen with original image) */}
          {showCompare && (
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg border-r-2 border-black shadow-2xl"
              style={{ width: `${splitPos}%` }}
            >
              <img
                src={image.src}
                alt="Original"
                className="max-w-none h-full w-auto object-cover"
                style={{ width: `${width}px`, height: `${height}px` }}
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 bg-black text-white rounded text-[10px] font-bold uppercase tracking-wider shadow">
                Original
              </div>
            </div>
          )}

          {/* Split Draggable Divider handle */}
          {showCompare && (
            <div
              className="absolute top-0 bottom-0 w-1 bg-black cursor-ew-resize z-30 flex items-center justify-center"
              style={{ left: `${splitPos}%` }}
              onMouseDown={(e) => {
                e.stopPropagation();
                setIsDraggingSplit(true);
              }}
            >
              <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center shadow-lg cursor-ew-resize border-2 border-white">
                <Columns className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Left Floating Configuration Status Badge */}
      {image && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full px-3.5 py-1.5 text-[11px] font-mono text-slate-800 flex items-center gap-2 z-20 shadow-md">
          <div className="flex items-center gap-1.5 font-bold">
            <span className="capitalize">{options.pattern}</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="flex items-center gap-1">
            <Compass className="w-3 h-3 text-slate-600" />
            <span>{options.angle}°</span>
          </div>
          <span className="text-slate-300">|</span>
          <div className="text-slate-600 font-semibold uppercase text-[10px]">
            {options.colorMode === 'cmyk'
              ? 'CMYK Auszug'
              : options.colorMode === 'rgb'
              ? 'RGB Auszug'
              : options.colorMode}
          </div>
        </div>
      )}

      {/* Real-time Color Separation Plate Inspector Bar */}
      {image && onSelectPlate && (options.colorMode === 'cmyk' || options.colorMode === 'rgb' || options.pattern === 'cmyk') && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md border border-slate-300 rounded-full p-1.5 flex items-center gap-1 shadow-lg z-30 text-xs">
          <div className="flex items-center gap-1.5 pl-2 pr-1 text-[11px] font-bold text-slate-700">
            <Layers className="w-3.5 h-3.5 text-slate-900" />
            <span>Platte:</span>
          </div>

          <button
            onClick={() => onSelectPlate('all')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              options.activePlate === 'all'
                ? 'bg-black text-white shadow-xs'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Alle Kanäle
          </button>

          {(options.colorMode === 'cmyk' || options.pattern === 'cmyk') && (
            <>
              {[
                { id: 'c' as const, label: 'Cyan', colorClass: 'bg-cyan-500' },
                { id: 'm' as const, label: 'Magenta', colorClass: 'bg-pink-500' },
                { id: 'y' as const, label: 'Yellow', colorClass: 'bg-yellow-400' },
                { id: 'k' as const, label: 'Key (K)', colorClass: 'bg-slate-900' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectPlate(options.activePlate === p.id ? 'all' : p.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    options.activePlate === p.id
                      ? 'bg-black text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  title={`Platte [${p.label}] isolieren`}
                >
                  <span className={`w-2 h-2 rounded-full ${p.colorClass}`} />
                  <span>{p.label}</span>
                </button>
              ))}
            </>
          )}

          {options.colorMode === 'rgb' && (
            <>
              {[
                { id: 'r' as const, label: 'Rot (R)', colorClass: 'bg-red-500' },
                { id: 'g' as const, label: 'Grün (G)', colorClass: 'bg-emerald-500' },
                { id: 'b' as const, label: 'Blau (B)', colorClass: 'bg-blue-500' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => onSelectPlate(options.activePlate === p.id ? 'all' : p.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    options.activePlate === p.id
                      ? 'bg-black text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                  title={`Kanal [${p.label}] isolieren`}
                >
                  <span className={`w-2 h-2 rounded-full ${p.colorClass}`} />
                  <span>{p.label}</span>
                </button>
              ))}
            </>
          )}
        </div>
      )}

      {/* Floating Toolbar Controls */}
      {image && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-white border border-slate-200 rounded-full p-1.5 flex items-center gap-1 shadow-xl z-30 text-xs">
          {/* Zoom Controls */}
          <button
            onClick={() => setZoom((z) => Math.max(0.2, z - 0.2))}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Verkleinern"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <span className="font-mono text-slate-900 text-xs px-2 font-bold min-w-[3.5rem] text-center">
            {Math.round(zoom * 100)}%
          </span>

          <button
            onClick={() => setZoom((z) => Math.min(6, z + 0.2))}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Vergrößern"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              setZoom(1);
              setPan({ x: 0, y: 0 });
            }}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Ansicht zurücksetzen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-slate-200 my-auto mx-1" />

          {/* Mode Switch: Canvas vs Vector SVG */}
          <button
            onClick={() => setViewMode(viewMode === 'canvas' ? 'svg' : 'canvas')}
            className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'svg'
                ? 'bg-black text-white shadow-sm'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Echtzeit Vektor-SVG Vorschau umschalten"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Vektor (SVG)</span>
          </button>

          {/* Split Compare Switch */}
          <button
            onClick={() => setShowCompare(!showCompare)}
            className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              showCompare
                ? 'bg-black text-white shadow-sm'
                : 'hover:bg-slate-100 text-slate-700'
            }`}
            title="Vorher / Nachher Vergleichsmodus"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Vergleich</span>
          </button>

          {/* Invert Punktdichte Button */}
          {onToggleInvert && (
            <button
              onClick={onToggleInvert}
              className={`px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                options.invert
                  ? 'bg-black text-white shadow-sm'
                  : 'hover:bg-slate-100 text-slate-700'
              }`}
              title="Punktdichte invertieren: Hohe Dichte ↔ Niedrige Dichte umkehren"
            >
              <ArrowDownUp className="w-3.5 h-3.5" />
              <span>Dichte invertieren</span>
              {options.invert && (
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/20 text-white ml-0.5 font-bold">
                  Aktiv
                </span>
              )}
            </button>
          )}

          <div className="w-px h-5 bg-slate-200 my-auto mx-1" />

          {/* Quick Bild import button */}
          <label
            className="px-3 py-1.5 rounded-full font-semibold flex items-center gap-1.5 hover:bg-slate-100 text-slate-800 transition-all cursor-pointer"
            title="Neues Bild auswählen und importieren"
          >
            <ImagePlus className="w-3.5 h-3.5 text-slate-900" />
            <span>Bild import</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  onImageUpload(e.target.files[0]);
                  e.target.value = '';
                }
              }}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Top Right Floating Stats Info Badge */}
      {image && (
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md border border-slate-200 rounded-full px-4 py-2 text-[11px] font-mono text-slate-800 flex items-center gap-3 z-20 shadow-md">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{width} × {height} px</span>
          </div>
          <div className="text-slate-300">|</div>
          <div>~{approxDotCount.toLocaleString('de-DE')} Punkte</div>
          <div className="text-slate-300">|</div>
          <div className="text-black font-bold">{renderTimeMs} ms</div>
        </div>
      )}
    </div>
  );
};
