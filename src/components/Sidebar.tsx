import React, { useState, useRef } from 'react';
import { HalftoneOptions, PatternType, ColorMode, Preset } from '../types';
import {
  Grid,
  Circle,
  Square,
  Minus,
  RotateCw,
  Sun,
  Palette,
  Upload,
  Sparkles,
  RotateCcw,
  Hexagon,
  Star,
  Layers,
  Archive,
  FileJson,
  Download,
  Sliders,
  Contrast,
  Droplets,
  ImagePlus,
  ArrowDownUp,
  X,
  Compass,
  Triangle,
  Heart,
  Disc,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';
import { SAMPLE_IMAGES } from '../utils/sampleImages';
import { PRESETS } from '../utils/presets';

interface SidebarProps {
  options: HalftoneOptions;
  onChange: (newOptions: HalftoneOptions) => void;
  onImageUpload: (file: File) => void;
  onSelectSampleImage: (url: string) => void;
  onResetOptions: () => void;
  onApplyPreset: (preset: Preset) => void;
  onOpenBatch?: () => void;
  onExportJson?: () => void;
  onImportJson?: (file: File) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  options,
  onChange,
  onImageUpload,
  onSelectSampleImage,
  onResetOptions,
  onApplyPreset,
  onOpenBatch,
  onExportJson,
  onImportJson,
}) => {
  const [activeTab, setActiveTab] = useState<'pattern' | 'colors' | 'image' | 'presets'>('pattern');
  const [isDropzoneDragOver, setIsDropzoneDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonSidebarInputRef = useRef<HTMLInputElement>(null);

  const handleJsonSidebarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onImportJson) {
      onImportJson(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleDropzoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropzoneDragOver(true);
  };

  const handleDropzoneDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropzoneDragOver(false);
  };

  const handleDropzoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDropzoneDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    }
  };

  const updateOption = <K extends keyof HalftoneOptions>(key: K, value: HalftoneOptions[K]) => {
    onChange({
      ...options,
      [key]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const patternIcons: { type: PatternType; label: string; icon: React.ReactNode }[] = [
    { type: 'circle', label: 'Kreise', icon: <Circle className="w-4 h-4" /> },
    { type: 'square', label: 'Quadrate', icon: <Square className="w-4 h-4" /> },
    { type: 'diamond', label: 'Rauten', icon: <Square className="w-4 h-4 rotate-45 scale-90" /> },
    { type: 'triangle', label: 'Dreiecke', icon: <Triangle className="w-4 h-4" /> },
    { type: 'hexagon', label: 'Waben', icon: <Hexagon className="w-4 h-4" /> },
    { type: 'line', label: 'Linien', icon: <Minus className="w-4 h-4 stroke-[3]" /> },
    {
      type: 'cross',
      label: 'Kreuze',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8V2z" />
        </svg>
      ),
    },
    { type: 'star', label: 'Sterne', icon: <Star className="w-4 h-4" /> },
    { type: 'ring', label: 'Ringe', icon: <Disc className="w-4 h-4" /> },
    { type: 'heart', label: 'Herzen', icon: <Heart className="w-4 h-4" /> },
    { type: 'cmyk', label: 'CMYK Druck', icon: <Layers className="w-4 h-4" /> },
  ];

  // Helper for Solo-ing a separation channel
  const handleSoloPlate = (mode: 'cmyk' | 'rgb', key: 'c' | 'm' | 'y' | 'k' | 'r' | 'g' | 'b') => {
    if (options.activePlate === key) {
      updateOption('activePlate', 'all');
    } else {
      updateOption('activePlate', key);
    }
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col h-full overflow-hidden shrink-0 z-10 text-slate-800">
      {/* Top Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/50 p-2 gap-1 shrink-0 text-xs font-medium">
        <button
          onClick={() => setActiveTab('pattern')}
          className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'pattern'
              ? 'bg-black text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-black hover:bg-slate-100'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Raster</span>
        </button>

        <button
          onClick={() => setActiveTab('colors')}
          className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'colors'
              ? 'bg-black text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-black hover:bg-slate-100'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Farben</span>
        </button>

        <button
          onClick={() => setActiveTab('image')}
          className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'image'
              ? 'bg-black text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-black hover:bg-slate-100'
          }`}
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Tonwert</span>
        </button>

        <button
          onClick={() => setActiveTab('presets')}
          className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'presets'
              ? 'bg-black text-white font-bold shadow-sm'
              : 'text-slate-600 hover:text-black hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stile</span>
        </button>
      </div>

      {/* Main Tab Content Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs scrollbar-thin scrollbar-thumb-slate-300">
        {/* TAB 1: RASTER & GEOMETRIE */}
        {activeTab === 'pattern' && (
          <div className="space-y-5">
            {/* Pattern Type Selector */}
            <div className="space-y-2">
              <label className="text-slate-900 font-bold uppercase tracking-wider text-[11px] flex items-center justify-between">
                <span>Rastermuster (Punktform)</span>
                <span className="text-[10px] text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase font-semibold">
                  {options.pattern}
                </span>
              </label>

              <div className="grid grid-cols-4 gap-1.5">
                {patternIcons.map((p) => {
                  const isSelected = options.pattern === p.type;
                  return (
                    <button
                      key={p.type}
                      onClick={() => updateOption('pattern', p.type as PatternType)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-black text-white border-black font-semibold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-black hover:border-slate-300'
                      }`}
                      title={`Form wählen: ${p.label}`}
                    >
                      {p.icon}
                      <span className="text-[9px] text-center leading-tight truncate w-full">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Punktdichte / Density (Spacing) */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-slate-800 font-semibold text-xs">
                  Punktdichte (Rasterabstand)
                </label>
                <span className="text-black font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">{options.spacing} px</span>
              </div>

              <input
                type="range"
                min="4"
                max="60"
                step="1"
                value={options.spacing}
                onChange={(e) => updateOption('spacing', parseFloat(e.target.value))}
                className="w-full accent-black bg-slate-200 rounded-lg h-1.5 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Fein (Hohe Dichte)</span>
                <span>Grob (Niedrige Dichte)</span>
              </div>

              {/* Punktdichte invertieren Button */}
              <div className="pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => updateOption('invert', !options.invert)}
                  className={`w-full py-2 px-3 rounded-lg border font-bold text-xs flex items-center justify-between transition-all cursor-pointer active:scale-98 shadow-xs ${
                    options.invert
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                  title="Flächen mit hoher Dichte und niedriger Dichte vertauschen"
                >
                  <div className="flex items-center gap-2">
                    <ArrowDownUp className="w-3.5 h-3.5" />
                    <span>Punktdichte invertieren</span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                      options.invert ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {options.invert ? 'Invertiert' : 'Normal'}
                  </span>
                </button>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-normal">
                  {options.invert
                    ? 'Invertiert: Helle Bildbereiche haben hohe Punktdichte, dunkle Bildbereiche niedrige Dichte.'
                    : 'Normal: Dunkle Bildbereiche haben hohe Punktdichte, helle Bildbereiche niedrige Dichte.'}
                </p>
              </div>
            </div>

            {/* Punktgröße / Dot Scale */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-slate-800 font-semibold text-xs">Punktgröße (Skalierung)</label>
                <span className="text-black font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">{(options.maxDotSize * 100).toFixed(0)}%</span>
              </div>

              <input
                type="range"
                min="0.1"
                max="2.5"
                step="0.05"
                value={options.maxDotSize}
                onChange={(e) => updateOption('maxDotSize', parseFloat(e.target.value))}
                className="w-full accent-black bg-slate-200 rounded-lg h-1.5 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.1x (Subtil)</span>
                <span>2.5x (Überlappend)</span>
              </div>
            </div>

            {/* Minimalgröße Cutoff */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-slate-800 font-semibold text-xs">Mindestgröße Cutoff</label>
                <span className="text-black font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">{options.minDotSize.toFixed(1)} px</span>
              </div>

              <input
                type="range"
                min="0"
                max="8"
                step="0.2"
                value={options.minDotSize}
                onChange={(e) => updateOption('minDotSize', parseFloat(e.target.value))}
                className="w-full accent-black bg-slate-200 rounded-lg h-1.5 cursor-pointer"
              />
              <p className="text-[10px] text-slate-500 leading-normal">
                Blendet sehr kleine Punkte im hellen/dunklen Bereich aus.
              </p>
            </div>

            {/* Grid Type (Square vs Hex) */}
            <div className="space-y-2">
              <label className="text-slate-900 font-bold uppercase tracking-wider text-[11px]">Rasteranordnung</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => updateOption('gridType', 'square')}
                  className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer text-xs ${
                    options.gridType === 'square'
                      ? 'bg-black text-white border-black font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Quadratisch
                </button>
                <button
                  onClick={() => updateOption('gridType', 'hex')}
                  className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer text-xs ${
                    options.gridType === 'hex'
                      ? 'bg-black text-white border-black font-bold'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  Waben / Versetzt
                </button>
              </div>
            </div>

            {/* Rasterwinkel / Angle with Visual Dial */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-slate-800 font-semibold text-xs flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-slate-800" />
                  <span>Rasterwinkel (Grid Angle)</span>
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="360"
                    value={options.angle}
                    onChange={(e) => updateOption('angle', Math.max(0, Math.min(360, parseInt(e.target.value) || 0)))}
                    className="w-14 text-center text-black font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-xs focus:outline-none focus:border-black"
                  />
                  <span className="text-slate-500 font-mono text-xs">°</span>
                </div>
              </div>

              {/* Slider & Quick Compass Dial Row */}
              <div className="flex items-center gap-3">
                {/* Interactive SVG Compass Dial */}
                <div
                  className="relative w-14 h-14 rounded-full bg-white border border-slate-300 shadow-inner flex items-center justify-center cursor-pointer select-none shrink-0 touch-none hover:border-black transition-colors group"
                  title="Klicke oder ziehe, um den Winkel intuitiv einzustellen"
                  onPointerDown={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const handleMove = (ev: PointerEvent) => {
                      const cx = rect.left + rect.width / 2;
                      const cy = rect.top + rect.height / 2;
                      let deg = Math.round((Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI);
                      if (deg < 0) deg += 360;
                      updateOption('angle', Math.round(deg / 5) * 5 % 360);
                    };
                    const handleUp = () => {
                      window.removeEventListener('pointermove', handleMove);
                      window.removeEventListener('pointerup', handleUp);
                    };
                    window.addEventListener('pointermove', handleMove);
                    window.addEventListener('pointerup', handleUp);
                    handleMove(e.nativeEvent);
                  }}
                >
                  <svg className="w-full h-full p-1" viewBox="0 0 100 100">
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((t) => {
                      const r = (t * Math.PI) / 180;
                      return (
                        <line
                          key={t}
                          x1={50 + 44 * Math.cos(r)}
                          y1={50 + 44 * Math.sin(r)}
                          x2={50 + 36 * Math.cos(r)}
                          y2={50 + 36 * Math.sin(r)}
                          stroke="#cbd5e1"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      );
                    })}
                    <circle cx="50" cy="50" r="3.5" fill="#0f172a" />
                    {(() => {
                      const rad = (options.angle * Math.PI) / 180;
                      const nx = 50 + 38 * Math.cos(rad);
                      const ny = 50 + 38 * Math.sin(rad);
                      return (
                        <>
                          <line x1="50" y1="50" x2={nx} y2={ny} stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
                          <circle cx={nx} cy={ny} r="4.5" fill="#0f172a" />
                        </>
                      );
                    })()}
                  </svg>
                </div>

                {/* Range Slider */}
                <div className="flex-1 space-y-1">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    step="5"
                    value={options.angle}
                    onChange={(e) => updateOption('angle', parseInt(e.target.value))}
                    className="w-full accent-black bg-slate-200 rounded-lg h-1.5 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>0°</span>
                    <span>90°</span>
                    <span>180°</span>
                    <span>270°</span>
                    <span>360°</span>
                  </div>
                </div>
              </div>

              {/* Angle Preset Quick Buttons */}
              <div className="flex gap-1 pt-1">
                {[0, 15, 30, 45, 60, 75, 90, 135].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => updateOption('angle', deg)}
                    className={`flex-1 py-1 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                      options.angle === deg
                        ? 'bg-black text-white font-bold border-black'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Shape Rotation */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-slate-800 font-semibold text-xs flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-slate-700" />
                  <span>Form-Eigenrotation (Shape Rotation)</span>
                </label>
                <span className="text-black font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">{options.shapeRotation}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={options.shapeRotation}
                onChange={(e) => updateOption('shapeRotation', parseInt(e.target.value))}
                className="w-full accent-black bg-slate-200 rounded-lg h-1.5 cursor-pointer"
              />
              <div className="flex gap-1.5">
                {[0, 45, 90, 180].map((deg) => (
                  <button
                    key={deg}
                    onClick={() => updateOption('shapeRotation', deg)}
                    className={`flex-1 py-1 rounded text-[10px] font-mono border transition-all cursor-pointer ${
                      options.shapeRotation === deg
                        ? 'bg-black text-white font-bold border-black'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {deg}°
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                Dreht jede einzelne Form unabhängig von der Ausrichtung des Rasters.
              </p>
            </div>

            {/* Line Thickness Ratio (when pattern is line) */}
            {options.pattern === 'line' && (
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 font-semibold text-xs">Liniendicke Faktor</label>
                  <span className="text-black font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                    {options.lineThicknessRatio.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="2.5"
                  step="0.1"
                  value={options.lineThicknessRatio}
                  onChange={(e) => updateOption('lineThicknessRatio', parseFloat(e.target.value))}
                  className="w-full accent-black bg-slate-200 rounded-lg h-1.5 cursor-pointer"
                />
              </div>
            )}
          </div>
        )}

        {/* TAB 2: FARBEN & FARBAUSZUG (COLOR SEPARATION) */}
        {activeTab === 'colors' && (
          <div className="space-y-5">
            {/* Color Mode Selector */}
            <div className="space-y-2">
              <label className="text-slate-900 font-bold uppercase tracking-wider text-[11px]">Farbmodus & Farbauszug</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { mode: 'monochrome', label: 'Monochrom (2 Farben)', desc: 'Klassisches Raster' },
                  { mode: 'original', label: 'Originalfarben', desc: 'Farben pro Punkt' },
                  { mode: 'duotone', label: 'Duotone Verlauf', desc: 'Schatten / Lichter' },
                  { mode: 'cmyk', label: 'CMYK Farbauszug', desc: '4-Farb Druckkanäle' },
                  { mode: 'rgb', label: 'RGB Farbauszug', desc: '3-Kanal Additiv (Screen)' },
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => {
                      updateOption('colorMode', item.mode as ColorMode);
                      // If switching to RGB, suggest dark background if currently pure white
                      if (item.mode === 'rgb' && options.bgColor.toLowerCase() === '#ffffff') {
                        updateOption('bgColor', '#05070f');
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      options.colorMode === item.mode
                        ? 'bg-black text-white border-black font-bold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-bold text-xs">{item.label}</div>
                    <div className={`text-[9px] mt-0.5 ${options.colorMode === item.mode ? 'text-slate-300' : 'text-slate-400'}`}>
                      {item.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Monochrome Color Pickers */}
            {options.colorMode === 'monochrome' && (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 font-medium text-xs">Punktfarbe (Vordergrund)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={options.fgColor}
                      onChange={(e) => updateOption('fgColor', e.target.value)}
                      className="w-7 h-7 rounded-lg cursor-pointer border border-slate-300 bg-white"
                    />
                    <span className="font-mono text-[11px] text-slate-600 uppercase bg-white px-2 py-0.5 rounded border border-slate-200">{options.fgColor}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <label className="text-slate-800 font-medium text-xs">Hintergrundfarbe</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={options.bgColor}
                      onChange={(e) => updateOption('bgColor', e.target.value)}
                      disabled={options.transparentBg}
                      className="w-7 h-7 rounded-lg cursor-pointer border border-slate-300 bg-white disabled:opacity-30"
                    />
                    <span className="font-mono text-[11px] text-slate-600 uppercase bg-white px-2 py-0.5 rounded border border-slate-200">{options.bgColor}</span>
                  </div>
                </div>

                {/* Transparent BG Toggle */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <label className="text-slate-800 font-medium text-xs">Transparenter Hintergrund</label>
                  <input
                    type="checkbox"
                    checked={options.transparentBg}
                    onChange={(e) => updateOption('transparentBg', e.target.checked)}
                    className="w-4 h-4 accent-black cursor-pointer rounded"
                  />
                </div>
              </div>
            )}

            {/* Duotone Pickers */}
            {options.colorMode === 'duotone' && (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-slate-800 font-medium text-xs">Dunkle Farbtöne (Schatten)</label>
                  <input
                    type="color"
                    value={options.duotoneColor1}
                    onChange={(e) => updateOption('duotoneColor1', e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border border-slate-300 bg-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <label className="text-slate-800 font-medium text-xs">Helle Farbtöne (Lichter)</label>
                  <input
                    type="color"
                    value={options.duotoneColor2}
                    onChange={(e) => updateOption('duotoneColor2', e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border border-slate-300 bg-white"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <label className="text-slate-800 font-medium text-xs">Hintergrundfarbe</label>
                  <input
                    type="color"
                    value={options.bgColor}
                    onChange={(e) => updateOption('bgColor', e.target.value)}
                    className="w-7 h-7 rounded-lg cursor-pointer border border-slate-300 bg-white"
                  />
                </div>
              </div>
            )}

            {/* CMYK 4-COLOR SEPARATION PANEL */}
            {(options.colorMode === 'cmyk' || options.pattern === 'cmyk') && (
              <div className="space-y-4">
                {/* Information Badge */}
                <div className="p-3 bg-cyan-50/50 border border-cyan-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-cyan-700" />
                      <span>CMYK Farbauszug (Druckplatten)</span>
                    </span>
                    <span className="text-[10px] bg-cyan-100 text-cyan-900 font-mono font-bold px-1.5 py-0.5 rounded">
                      Subtraktiv
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    Echter 4-Platten-Druckraster mit individuellen Winkeln, Intensität und Kanaltrennung (Multiply-Blend).
                  </p>
                </div>

                {/* Real-Time Plate Inspection Selector */}
                <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">Echtzeit Platten-Vorschau</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {options.activePlate === 'all' ? 'Alle Kanäle aktiv' : `Platte [${options.activePlate.toUpperCase()}] isoliert`}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    <button
                      onClick={() => updateOption('activePlate', 'all')}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        options.activePlate === 'all'
                          ? 'bg-black text-white border-black shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Alle
                    </button>
                    {[
                      { key: 'c' as const, label: 'C Cyan', color: 'border-cyan-400 bg-cyan-50 text-cyan-800' },
                      { key: 'm' as const, label: 'M Mag', color: 'border-pink-400 bg-pink-50 text-pink-800' },
                      { key: 'y' as const, label: 'Y Yel', color: 'border-amber-400 bg-amber-50 text-amber-800' },
                      { key: 'k' as const, label: 'K Key', color: 'border-slate-400 bg-slate-100 text-slate-900' },
                    ].map((btn) => (
                      <button
                        key={btn.key}
                        onClick={() => handleSoloPlate('cmyk', btn.key)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          options.activePlate === btn.key
                            ? 'bg-black text-white border-black ring-2 ring-black/20 shadow-xs'
                            : `${btn.color} hover:brightness-95`
                        }`}
                      >
                        {btn.key.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CMYK Angle Presets */}
                <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 text-[11px] block">Winkel-Presets (Moiré-Vermeidung)</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { name: 'Standard Litho', angles: { c: 15, m: 75, y: 0, k: 45 } },
                      { name: 'Moiré-Frei 30°', angles: { c: 15, m: 45, y: 75, k: 105 } },
                      { name: 'Orthogonal', angles: { c: 0, m: 30, y: 60, k: 90 } },
                      { name: 'Parallel (45°)', angles: { c: 45, m: 45, y: 45, k: 45 } },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => updateOption('cmykAngles', preset.angles)}
                        className="py-1 px-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[10px] transition-colors cursor-pointer text-left"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Global Separation Angle Offset */}
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-800 font-semibold text-xs flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5 text-slate-700" />
                      <span>Separations-Winkelversatz (Global)</span>
                    </label>
                    <span className="text-black font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      +{options.separationOffsetAngle}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    step="5"
                    value={options.separationOffsetAngle}
                    onChange={(e) => updateOption('separationOffsetAngle', parseInt(e.target.value))}
                    className="w-full accent-black bg-slate-200 rounded-lg h-1.5 cursor-pointer"
                  />
                  <p className="text-[10px] text-slate-500 leading-normal">
                    Dreht alle 4 Farbplatten gleichzeitig, ohne die relativen Moiré-Abstände zu verändern.
                  </p>
                </div>

                {/* Individual CMYK Channel Cards */}
                <div className="space-y-2.5">
                  {[
                    {
                      key: 'c' as const,
                      label: 'Cyan (C)',
                      badgeBg: 'bg-cyan-500',
                      textColor: 'text-cyan-700',
                      borderColor: 'border-cyan-200',
                    },
                    {
                      key: 'm' as const,
                      label: 'Magenta (M)',
                      badgeBg: 'bg-pink-500',
                      textColor: 'text-pink-700',
                      borderColor: 'border-pink-200',
                    },
                    {
                      key: 'y' as const,
                      label: 'Yellow (Y)',
                      badgeBg: 'bg-yellow-400',
                      textColor: 'text-amber-800',
                      borderColor: 'border-amber-200',
                    },
                    {
                      key: 'k' as const,
                      label: 'Key / Schwarz (K)',
                      badgeBg: 'bg-slate-900',
                      textColor: 'text-slate-900',
                      borderColor: 'border-slate-300',
                    },
                  ].map((ch) => {
                    const isEnabled = options.cmykEnabled?.[ch.key] ?? true;
                    const angle = options.cmykAngles[ch.key];
                    const color = options.cmykColors?.[ch.key] || '#000000';
                    const gain = options.cmykGain?.[ch.key] ?? 1.0;

                    return (
                      <div
                        key={ch.key}
                        className={`p-3 rounded-xl border bg-slate-50/70 transition-all space-y-2 ${ch.borderColor} ${
                          !isEnabled ? 'opacity-40' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateOption('cmykEnabled', {
                                  ...options.cmykEnabled,
                                  [ch.key]: !isEnabled,
                                })
                              }
                              className={`p-1 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                isEnabled ? 'bg-black text-white' : 'bg-slate-200 text-slate-500'
                              }`}
                              title={isEnabled ? 'Kanal deaktivieren' : 'Kanal aktivieren'}
                            >
                              {isEnabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </button>
                            <span className={`font-bold text-xs ${ch.textColor}`}>{ch.label}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Solo Button */}
                            <button
                              type="button"
                              onClick={() => handleSoloPlate('cmyk', ch.key)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-colors cursor-pointer border ${
                                options.activePlate === ch.key
                                  ? 'bg-black text-white border-black'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              Solo
                            </button>

                            {/* Color picker */}
                            <input
                              type="color"
                              value={color}
                              onChange={(e) =>
                                updateOption('cmykColors', {
                                  ...options.cmykColors,
                                  [ch.key]: e.target.value,
                                })
                              }
                              className="w-5 h-5 rounded cursor-pointer border border-slate-300 bg-white"
                              title="Druckfarbe anpassen"
                            />

                            <span className="font-mono text-[11px] font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {angle}°
                            </span>
                          </div>
                        </div>

                        {/* Angle Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Rasterwinkel Platte</span>
                            <span>{angle}°</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="180"
                            step="5"
                            value={angle}
                            onChange={(e) =>
                              updateOption('cmykAngles', {
                                ...options.cmykAngles,
                                [ch.key]: parseInt(e.target.value),
                              })
                            }
                            className="w-full accent-black bg-slate-200 rounded h-1.5 cursor-pointer"
                          />
                        </div>

                        {/* Gain / Intensity Slider */}
                        <div className="space-y-1 pt-1 border-t border-slate-200">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Farbdichte / Gain</span>
                            <span className="font-mono">{(gain * 100).toFixed(0)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.2"
                            max="1.8"
                            step="0.05"
                            value={gain}
                            onChange={(e) =>
                              updateOption('cmykGain', {
                                ...options.cmykGain,
                                [ch.key]: parseFloat(e.target.value),
                              })
                            }
                            className="w-full accent-black bg-slate-200 rounded h-1 cursor-pointer"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* RGB 3-COLOR SEPARATION PANEL */}
            {options.colorMode === 'rgb' && (
              <div className="space-y-4">
                {/* Information Badge */}
                <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-700" />
                      <span>RGB Farbauszug (Additiv / Screen)</span>
                    </span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-900 font-mono font-bold px-1.5 py-0.5 rounded">
                      Additiv
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-600 leading-relaxed">
                    3-Kanal Lichtfarbentrennung (Rot, Grün, Blau) mit additivem Screen-Blending. Ideal auf dunklem Hintergrund für Monitor- & Neon-Optik.
                  </p>
                </div>

                {/* Real-Time Plate Inspection Selector */}
                <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">Echtzeit Kanal-Vorschau</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {options.activePlate === 'all' ? 'Alle Kanäle aktiv' : `Kanal [${options.activePlate.toUpperCase()}] isoliert`}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    <button
                      onClick={() => updateOption('activePlate', 'all')}
                      className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        options.activePlate === 'all'
                          ? 'bg-black text-white border-black shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      Alle
                    </button>
                    {[
                      { key: 'r' as const, label: 'R Rot', color: 'border-red-400 bg-red-50 text-red-800' },
                      { key: 'g' as const, label: 'G Grün', color: 'border-emerald-400 bg-emerald-50 text-emerald-800' },
                      { key: 'b' as const, label: 'B Blau', color: 'border-blue-400 bg-blue-50 text-blue-800' },
                    ].map((btn) => (
                      <button
                        key={btn.key}
                        onClick={() => handleSoloPlate('rgb', btn.key)}
                        className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                          options.activePlate === btn.key
                            ? 'bg-black text-white border-black ring-2 ring-black/20 shadow-xs'
                            : `${btn.color} hover:brightness-95`
                        }`}
                      >
                        {btn.key.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Background Color & Dark Mode Helper for RGB */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-800 font-medium text-xs">Hintergrundfarbe (Canvas)</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={options.bgColor}
                        onChange={(e) => updateOption('bgColor', e.target.value)}
                        className="w-7 h-7 rounded-lg cursor-pointer border border-slate-300 bg-white"
                      />
                      <span className="font-mono text-[11px] text-slate-600 uppercase bg-white px-2 py-0.5 rounded border border-slate-200">
                        {options.bgColor}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => updateOption('bgColor', '#05070f')}
                      className="flex-1 py-1 px-2 rounded-lg bg-black text-white text-[10px] font-bold cursor-pointer"
                    >
                      Schwarz (#05070f)
                    </button>
                    <button
                      type="button"
                      onClick={() => updateOption('bgColor', '#0f172a')}
                      className="flex-1 py-1 px-2 rounded-lg bg-slate-900 text-white text-[10px] font-bold cursor-pointer"
                    >
                      Dunkelblau (#0f172a)
                    </button>
                  </div>
                </div>

                {/* RGB Angle Presets */}
                <div className="space-y-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="font-bold text-slate-800 text-[11px] block">RGB Winkel-Presets</span>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { name: 'Standard 30°', angles: { r: 15, g: 75, b: 0 } },
                      { name: 'Triad 60°', angles: { r: 0, g: 60, b: 120 } },
                      { name: 'Orthogonal', angles: { r: 0, g: 45, b: 90 } },
                      { name: 'Parallel (45°)', angles: { r: 45, g: 45, b: 45 } },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => updateOption('rgbAngles', preset.angles)}
                        className="py-1 px-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[10px] transition-colors cursor-pointer text-left"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Global Separation Angle Offset for RGB */}
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-slate-800 font-semibold text-xs flex items-center gap-1.5">
                      <RotateCw className="w-3.5 h-3.5 text-slate-700" />
                      <span>RGB Winkelversatz (Global)</span>
                    </label>
                    <span className="text-black font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                      +{options.separationOffsetAngle}°
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="180"
                    step="5"
                    value={options.separationOffsetAngle}
                    onChange={(e) => updateOption('separationOffsetAngle', parseInt(e.target.value))}
                    className="w-full accent-black bg-slate-200 rounded-lg h-1.5 cursor-pointer"
                  />
                </div>

                {/* Individual RGB Channel Cards */}
                <div className="space-y-2.5">
                  {[
                    {
                      key: 'r' as const,
                      label: 'Rot (R)',
                      textColor: 'text-red-700',
                      borderColor: 'border-red-200',
                    },
                    {
                      key: 'g' as const,
                      label: 'Grün (G)',
                      textColor: 'text-emerald-700',
                      borderColor: 'border-emerald-200',
                    },
                    {
                      key: 'b' as const,
                      label: 'Blau (B)',
                      textColor: 'text-blue-700',
                      borderColor: 'border-blue-200',
                    },
                  ].map((ch) => {
                    const isEnabled = options.rgbEnabled?.[ch.key] ?? true;
                    const angle = options.rgbAngles?.[ch.key] ?? (ch.key === 'r' ? 15 : ch.key === 'g' ? 75 : 0);
                    const color = options.rgbColors?.[ch.key] || (ch.key === 'r' ? '#ff1744' : ch.key === 'g' ? '#00e676' : '#2979ff');
                    const gain = options.rgbGain?.[ch.key] ?? 1.0;

                    return (
                      <div
                        key={ch.key}
                        className={`p-3 rounded-xl border bg-slate-50/70 transition-all space-y-2 ${ch.borderColor} ${
                          !isEnabled ? 'opacity-40' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateOption('rgbEnabled', {
                                  ...options.rgbEnabled,
                                  [ch.key]: !isEnabled,
                                })
                              }
                              className={`p-1 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all ${
                                isEnabled ? 'bg-black text-white' : 'bg-slate-200 text-slate-500'
                              }`}
                              title={isEnabled ? 'Kanal deaktivieren' : 'Kanal aktivieren'}
                            >
                              {isEnabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </button>
                            <span className={`font-bold text-xs ${ch.textColor}`}>{ch.label}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSoloPlate('rgb', ch.key)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono transition-colors cursor-pointer border ${
                                options.activePlate === ch.key
                                  ? 'bg-black text-white border-black'
                                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              Solo
                            </button>

                            <input
                              type="color"
                              value={color}
                              onChange={(e) =>
                                updateOption('rgbColors', {
                                  ...options.rgbColors,
                                  [ch.key]: e.target.value,
                                })
                              }
                              className="w-5 h-5 rounded cursor-pointer border border-slate-300 bg-white"
                              title="Kanal-Lichtfarbe anpassen"
                            />

                            <span className="font-mono text-[11px] font-bold text-slate-800 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              {angle}°
                            </span>
                          </div>
                        </div>

                        {/* Angle Slider */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Rasterwinkel</span>
                            <span>{angle}°</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="180"
                            step="5"
                            value={angle}
                            onChange={(e) =>
                              updateOption('rgbAngles', {
                                ...options.rgbAngles,
                                [ch.key]: parseInt(e.target.value),
                              })
                            }
                            className="w-full accent-black bg-slate-200 rounded h-1.5 cursor-pointer"
                          />
                        </div>

                        {/* Gain / Intensity Slider */}
                        <div className="space-y-1 pt-1 border-t border-slate-200">
                          <div className="flex justify-between text-[10px] text-slate-500">
                            <span>Kanal-Intensität</span>
                            <span className="font-mono">{(gain * 100).toFixed(0)}%</span>
                          </div>
                          <input
                            type="range"
                            min="0.2"
                            max="1.8"
                            step="0.05"
                            value={gain}
                            onChange={(e) =>
                              updateOption('rgbGain', {
                                ...options.rgbGain,
                                [ch.key]: parseFloat(e.target.value),
                              })
                            }
                            className="w-full accent-black bg-slate-200 rounded h-1 cursor-pointer"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: BILD & TONANPASSUNG */}
        {activeTab === 'image' && (
          <div className="space-y-5">
            {/* Upload & Sample Quick Image Picker */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-slate-900 font-bold uppercase tracking-wider text-[11px]">Neues Bild laden</label>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Primary "Bild import" button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-4 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
                title="Eigenes Bild von deinem Gerät importieren"
              >
                <ImagePlus className="w-4 h-4" />
                <span>Bild import</span>
              </button>

              <div
                onDragOver={handleDropzoneDragOver}
                onDragLeave={handleDropzoneDragLeave}
                onDrop={handleDropzoneDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-5 px-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center shadow-sm ${
                  isDropzoneDragOver
                    ? 'bg-black text-white border-black scale-[1.02] shadow-md'
                    : 'bg-white hover:bg-slate-50 border-slate-300 hover:border-black text-slate-800'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isDropzoneDragOver ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <ImagePlus className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs">
                    {isDropzoneDragOver ? 'Bild jetzt hier ablegen' : 'Bild per Drag & Drop reindrücken'}
                  </p>
                  <p
                    className={`text-[10px] mt-0.5 ${
                      isDropzoneDragOver ? 'text-slate-200' : 'text-slate-500'
                    }`}
                  >
                    oder klicken zum Auswählen (JPG, PNG, WebP)
                  </p>
                </div>

                {isDropzoneDragOver && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropzoneDragOver(false);
                    }}
                    className="mt-1 px-3 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[10px] font-bold border border-white/40 cursor-pointer flex items-center gap-1 active:scale-95"
                    title="Vorgang abbrechen"
                  >
                    <X className="w-3 h-3" />
                    <span>Abbrechen</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 pt-1">
                <span className="text-[11px] text-slate-500 font-semibold">Oder Beispielbild wählen:</span>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_IMAGES.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => onSelectSampleImage(sample.url)}
                      className="p-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-400 transition-all text-left flex items-center gap-2 cursor-pointer group shadow-sm"
                    >
                      <img
                        src={sample.url}
                        alt={sample.title}
                        className="w-9 h-9 rounded-lg object-cover bg-slate-100 border border-slate-200 group-hover:scale-105 transition-transform"
                      />
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-900 text-[11px] truncate">{sample.title}</p>
                        <p className="text-[9px] text-slate-500 truncate">{sample.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Image Pre-Processing Controls Group */}
            <div className="space-y-3.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <label className="text-slate-900 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-800" />
                  <span>Bild-Vorverarbeitung</span>
                </label>
                {(options.contrast !== 0 || options.brightness !== 0 || options.saturation !== 0) && (
                  <button
                    onClick={() => {
                      onChange({
                        ...options,
                        contrast: 0,
                        brightness: 0,
                        saturation: 0,
                      });
                    }}
                    className="text-[10px] text-slate-600 hover:text-black font-semibold flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-slate-200 transition-colors"
                    title="Vorverarbeitung zurücksetzen"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Contrast */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-slate-800 font-semibold text-xs flex items-center gap-1.5">
                    <Contrast className="w-3.5 h-3.5 text-slate-600" />
                    <span>Kontrast</span>
                  </label>
                  <span className="text-black font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                    {options.contrast > 0 ? `+${options.contrast}` : options.contrast}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={options.contrast}
                  onChange={(e) => updateOption('contrast', parseInt(e.target.value))}
                  className="w-full accent-black bg-slate-200 rounded-lg h-1.5 cursor-pointer"
                />
              </div>

              {/* Brightness */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-slate-800 font-semibold text-xs flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-slate-600" />
                    <span>Helligkeit</span>
                  </label>
                  <span className="text-black font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                    {options.brightness > 0 ? `+${options.brightness}` : options.brightness}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={options.brightness}
                  onChange={(e) => updateOption('brightness', parseInt(e.target.value))}
                  className="w-full accent-black bg-slate-200 rounded-lg h-1.5 cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-slate-800 font-semibold text-xs flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-slate-600" />
                    <span>Sättigung</span>
                  </label>
                  <span className="text-black font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                    {options.saturation > 0 ? `+${options.saturation}` : options.saturation}
                  </span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={options.saturation}
                  onChange={(e) => updateOption('saturation', parseInt(e.target.value))}
                  className="w-full accent-black bg-slate-200 rounded-lg h-1.5 cursor-pointer"
                />
              </div>

              {/* Quick Adjustment Presets */}
              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] text-slate-500 font-medium block mb-1.5">Schnelloptionen:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => updateOption('saturation', -100)}
                    className={`py-1 px-1.5 rounded text-[10px] font-semibold border transition-all cursor-pointer text-center ${
                      options.saturation === -100
                        ? 'bg-black text-white border-black font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Monochrom
                  </button>
                  <button
                    onClick={() => updateOption('saturation', 50)}
                    className={`py-1 px-1.5 rounded text-[10px] font-semibold border transition-all cursor-pointer text-center ${
                      options.saturation === 50
                        ? 'bg-black text-white border-black font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Kräftig (+50)
                  </button>
                  <button
                    onClick={() => updateOption('contrast', 35)}
                    className={`py-1 px-1.5 rounded text-[10px] font-semibold border transition-all cursor-pointer text-center ${
                      options.contrast === 35
                        ? 'bg-black text-white border-black font-bold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Kontrast (+35)
                  </button>
                </div>
              </div>
            </div>

            {/* Punktdichte / Invert Toggle Button */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-800 font-semibold text-xs">Punktdichte & Tonwert</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    options.invert ? 'bg-black text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {options.invert ? 'Invertiert' : 'Normal'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => updateOption('invert', !options.invert)}
                className={`w-full py-2 px-3 rounded-lg border font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-xs ${
                  options.invert
                    ? 'bg-black text-white border-black'
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                }`}
                title="Flächen mit hoher Dichte und niedriger Dichte vertauschen"
              >
                <ArrowDownUp className="w-3.5 h-3.5" />
                <span>Punktdichte invertieren</span>
              </button>
              <p className="text-[10px] text-slate-500 leading-normal">
                {options.invert
                  ? 'Aktiv: Helle Flächen = hohe Punktdichte, dunkle Flächen = niedrige Punktdichte.'
                  : 'Standard: Dunkle Flächen = hohe Punktdichte, helle Flächen = niedrige Punktdichte.'}
              </p>
            </div>

            {/* Gamma */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <label className="text-slate-800 font-semibold text-xs">Gamma (Mitteltöne)</label>
                <span className="text-black font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">{options.gamma.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="3.0"
                step="0.05"
                value={options.gamma}
                onChange={(e) => updateOption('gamma', parseFloat(e.target.value))}
                className="w-full accent-black bg-slate-200 rounded-lg h-1.5 cursor-pointer"
              />
            </div>

            {/* Threshold */}
            <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex justify-between">
                <label className="text-slate-800 font-semibold text-xs">Schwellenwert Cutoff</label>
                <span className="text-black font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">{options.threshold}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={options.threshold}
                onChange={(e) => updateOption('threshold', parseInt(e.target.value))}
                className="w-full accent-black bg-slate-200 rounded-lg h-1.5 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* TAB 4: PRESETS GALLERY */}
        {activeTab === 'presets' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Stil-Presets & Vorlagen</h3>
            <div className="space-y-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => onApplyPreset(preset)}
                  className="w-full p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-black text-left transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      {preset.name}
                    </span>
                    <span className="text-[9px] px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-mono font-semibold">
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                    {preset.description}
                  </p>
                </button>
              ))}
            </div>

            {/* JSON Config Cards */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5 pt-3">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <FileJson className="w-3.5 h-3.5 text-slate-800" />
                <span>JSON-Konfiguration</span>
              </h4>
              <p className="text-[10px] text-slate-500 leading-normal">
                Speichere dein aktuelles Profil als .json Datei ab oder lade ein existierendes Profil.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onExportJson}
                  className="flex-1 py-2 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 font-semibold text-[11px] text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JSON Export</span>
                </button>

                <button
                  onClick={() => jsonSidebarInputRef.current?.click()}
                  className="flex-1 py-2 px-3 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 font-semibold text-[11px] text-slate-800 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>JSON Import</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden input for sidebar JSON import */}
      <input
        ref={jsonSidebarInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleJsonSidebarChange}
        className="hidden"
      />

      {/* Bottom Action Bar */}
      <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onResetOptions}
            className="text-slate-600 hover:text-black text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer py-1.5 px-2 rounded-lg hover:bg-slate-200/60"
            title="Zurücksetzen"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
            title="Eigenes Bild importieren"
          >
            <ImagePlus className="w-3.5 h-3.5 text-slate-700" />
            <span>Bild import</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onExportJson}
            className="p-1.5 rounded-lg text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
            title="Einstellungen als JSON exportieren"
          >
            <FileJson className="w-3.5 h-3.5 text-slate-800" />
            <span className="hidden sm:inline">JSON</span>
          </button>

          {onOpenBatch && (
            <button
              onClick={onOpenBatch}
              className="px-2.5 py-1.5 rounded-lg bg-black hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1 transition-all cursor-pointer shadow-sm"
              title="Stapelverarbeitung mehrerer Bilder"
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Stapel (ZIP)</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
