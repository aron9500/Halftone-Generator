import React, { useState } from 'react';
import { HalftoneOptions } from '../types';
import {
  generateHalftoneSVG,
  generateHighResPNG,
  getImagePixelData,
} from '../utils/halftoneEngine';
import {
  Download,
  X,
  FileCode,
  Image as ImageIcon,
  Copy,
  Check,
  Loader2,
  FileText,
} from 'lucide-react';

interface ExportModalProps {
  image: HTMLImageElement;
  options: HalftoneOptions;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  image,
  options,
  onClose,
}) => {
  const [exportTab, setExportTab] = useState<'svg' | 'png'>('svg');
  const [scaleFactor, setScaleFactor] = useState<number>(2); // 2x default HD
  const [optimizeSvgPath, setOptimizeSvgPath] = useState<boolean>(true);
  const [includeBg, setIncludeBg] = useState<boolean>(!options.transparentBg);
  const [fileName, setFileName] = useState<string>('halftone-art');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const { width, height } = getImagePixelData(image, options);

  const getCleanFileName = (ext: 'svg' | 'png') => {
    let base = fileName.trim().replace(/[/\\?%*:|"<>]/g, '_');
    if (!base) {
      base = ext === 'svg' ? 'halftone-vector' : 'halftone-graphic';
    }
    // Remove trailing .svg or .png if typed by user
    const cleaned = base.replace(new RegExp(`\\.${ext}$`, 'i'), '');
    return `${cleaned}.${ext}`;
  };

  // SVG Export Handler
  const handleExportSVG = () => {
    setIsExporting(true);
    setTimeout(() => {
      try {
        const { imageData } = getImagePixelData(image, options);
        const exportOptions = {
          ...options,
          transparentBg: !includeBg,
        };

        const svgContent = generateHalftoneSVG(
          imageData,
          width,
          height,
          exportOptions,
          optimizeSvgPath
        );

        const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = getCleanFileName('svg');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('SVG Export error:', err);
      } finally {
        setIsExporting(false);
      }
    }, 50);
  };

  // Copy SVG Code
  const handleCopySVG = () => {
    try {
      const { imageData } = getImagePixelData(image, options);
      const exportOptions = { ...options, transparentBg: !includeBg };
      const svgContent = generateHalftoneSVG(
        imageData,
        width,
        height,
        exportOptions,
        optimizeSvgPath
      );
      navigator.clipboard.writeText(svgContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy error:', err);
    }
  };

  // High-Res PNG Export Handler
  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      const exportOptions = { ...options, transparentBg: !includeBg };
      const pngDataUrl = await generateHighResPNG(image, exportOptions, scaleFactor);

      const a = document.createElement('a');
      a.href = pngDataUrl;
      a.download = getCleanFileName('png');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error('PNG Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const exportWidth = width * scaleFactor;
  const exportHeight = height * scaleFactor;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col text-slate-900">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 uppercase tracking-tight">Grafik Exportieren</h3>
              <p className="text-xs text-slate-500">Exportiere als Vektor-SVG oder hochauflösendes PNG</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format Selector Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-100/50 p-2 gap-2 text-xs font-bold">
          <button
            onClick={() => setExportTab('svg')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              exportTab === 'svg'
                ? 'bg-black text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Vektorgrafik (.SVG)</span>
          </button>

          <button
            onClick={() => setExportTab('png')}
            className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
              exportTab === 'png'
                ? 'bg-black text-white font-bold shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Rasterbild (.PNG)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {/* Filename Customization */}
          <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <label className="text-slate-800 font-bold text-xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-700" />
                <span>Dateiname</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono font-medium">
                Endung: .{exportTab}
              </span>
            </div>
            <div className="relative flex items-center">
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="halftone-art"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs font-semibold focus:outline-none focus:border-black transition-all pr-12 shadow-xs"
              />
              <span className="absolute right-3 text-[11px] font-mono font-bold text-slate-400 pointer-events-none select-none">
                .{exportTab}
              </span>
            </div>
          </div>

          {/* Active Setup Summary */}
          <div className="flex flex-wrap items-center gap-2 p-2.5 bg-slate-100/80 rounded-xl border border-slate-200 text-[11px]">
            <span className="font-bold text-slate-800">Setup:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 uppercase font-bold text-[10px] text-slate-900">
              {options.pattern}
            </span>
            <span className="text-slate-400">•</span>
            <span className="font-mono text-slate-700 font-semibold">{options.angle}° Winkel</span>
            <span className="text-slate-400">•</span>
            <span className="font-bold text-slate-900">
              {options.colorMode === 'cmyk'
                ? 'CMYK (4 Platten)'
                : options.colorMode === 'rgb'
                ? 'RGB (3 Kanäle)'
                : options.colorMode === 'duotone'
                ? 'Duotone'
                : 'Monochrom'}
            </span>
          </div>

          {exportTab === 'svg' ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Vektoreigenschaften</span>
                  <span className="text-[10px] px-2 py-0.5 bg-white text-slate-700 font-mono rounded border border-slate-200 font-semibold">
                    Unbegrenzt skalierbar
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-slate-800 font-medium">Pfadoptimierung (Kombinierte Vektoren)</span>
                    <input
                      type="checkbox"
                      checked={optimizeSvgPath}
                      onChange={(e) => setOptimizeSvgPath(e.target.checked)}
                      className="w-4 h-4 accent-black rounded cursor-pointer"
                    />
                  </label>
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Fügt Punkte desselben Farbtons in ein einzelnes Pfadelement zusammen. Perfekt für Illustrator, Figma, Plotter und Lasercutter.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-800 font-medium">Hintergrund einbinden</span>
                  <input
                    type="checkbox"
                    checked={includeBg}
                    onChange={(e) => setIncludeBg(e.target.checked)}
                    className="w-4 h-4 accent-black rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Action Buttons for SVG */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCopySVG}
                  className="py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-300 shadow-sm"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                  <span>{copied ? 'Kopiert!' : 'SVG Code'}</span>
                </button>

                <button
                  onClick={handleExportSVG}
                  disabled={isExporting}
                  className="flex-1 py-3 px-4 rounded-xl bg-black hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isExporting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <Download className="w-4 h-4 stroke-[2]" />
                  )}
                  <span>SVG Datei herunterladen</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <label className="font-bold text-slate-900 block">Auflösung & Druckqualität</label>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { factor: 1, label: '1x', desc: 'Original' },
                    { factor: 2, label: '2x', desc: 'HD Quality' },
                    { factor: 4, label: '4x', desc: '4K Print' },
                    { factor: 8, label: '8x', desc: 'Poster Ultra' },
                  ].map((item) => (
                    <button
                      key={item.factor}
                      onClick={() => setScaleFactor(item.factor)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
                        scaleFactor === item.factor
                          ? 'bg-black text-white border-black font-bold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-sm font-mono">{item.label}</span>
                      <span className="text-[9px] opacity-75">{item.desc}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
                  <span className="text-slate-500">Berechnete Dimensionen:</span>
                  <span className="font-mono text-black font-bold">
                    {exportWidth} × {exportHeight} px
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-800 font-medium">Hintergrund einbinden</span>
                  <input
                    type="checkbox"
                    checked={includeBg}
                    onChange={(e) => setIncludeBg(e.target.checked)}
                    className="w-4 h-4 accent-black rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* PNG Download Button */}
              <button
                onClick={handleExportPNG}
                disabled={isExporting}
                className="w-full py-3.5 px-4 rounded-xl bg-black hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer active:scale-98 disabled:opacity-50"
              >
                {isExporting ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Download className="w-4 h-4 stroke-[2]" />
                )}
                <span>Hochauflösendes PNG herunterladen</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
