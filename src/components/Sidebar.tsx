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
  FileImage,
  ImagePlus,
  ArrowDownUp,
  X,
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
    { type: 'line', label: 'Linien', icon: <Minus className="w-4 h-4 stroke-[3]" /> },
    { type: 'diamond', label: 'Rauten', icon: <Square className="w-4 h-4 rotate-45" /> },
    { type: 'hexagon', label: 'Hexagon', icon: <Hexagon className="w-4 h-4" /> },
    { type: 'star', label: 'Sterne', icon: <Star className="w-4 h-4" /> },
    { type: 'cmyk', label: 'CMYK Druck', icon: <Layers className="w-4 h-4" /> },
  ] as any;

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
                <span>Rastermuster</span>
                <span className="text-[10px] text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 uppercase font-semibold">
                  {options.pattern}
                </span>
              </label>

              <div className="grid grid-cols-4 gap-2">
                {patternIcons.map((p) => {
                  const isSelected = options.pattern === p.type;
                  return (
                    <button
                      key={p.type}
                      onClick={() => updateOption('pattern', p.type as PatternType)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-black text-white border-black font-semibold shadow-sm'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-black hover:border-slate-300'
                      }`}
                    >
                      {p.icon}
                      <span className="text-[10px] text-center leading-tight truncate w-full">{p.label}</span>
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

            {/* Rasterwinkel / Angle */}
            <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-slate-800 font-semibold text-xs flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-slate-700" />
                  <span>Rasterwinkel</span>
                </label>
                <span className="text-black font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200">{options.angle}°</span>
              </div>

              <input
                type="range"
                min="0"
                max="360"
                step="5"
                value={options.angle}
                onChange={(e) => updateOption('angle', parseInt(e.target.value))}
                className="w-full accent-black bg-slate-200 rounded-lg h-1.5 cursor-pointer"
              />

              {/* Angle Preset Quick Buttons */}
              <div className="flex gap-1.5 pt-1">
                {[0, 15, 30, 45, 60, 75, 90].map((deg) => (
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

        {/* TAB 2: FARBEN & STIL */}
        {activeTab === 'colors' && (
          <div className="space-y-5">
            {/* Color Mode Selector */}
            <div className="space-y-2">
              <label className="text-slate-900 font-bold uppercase tracking-wider text-[11px]">Farbmodus</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { mode: 'monochrome', label: 'Monochrom (2 Farben)' },
                  { mode: 'original', label: 'Originalfarben' },
                  { mode: 'duotone', label: 'Duotone Verlauf' },
                  { mode: 'cmyk', label: 'CMYK Druckkanäle' },
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => updateOption('colorMode', item.mode as ColorMode)}
                    className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                      options.colorMode === item.mode
                        ? 'bg-black text-white border-black font-bold shadow-sm'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.label}
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

            {/* CMYK Specific Fine-Tuning Angles */}
            {(options.colorMode === 'cmyk' || options.pattern === 'cmyk') && (
              <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <h4 className="font-semibold text-slate-900 text-xs flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-slate-800" />
                  <span>CMYK Rasterwinkel Justierung</span>
                </h4>

                {[
                  { label: 'Cyan (C)', key: 'c' as const, color: 'text-cyan-600' },
                  { label: 'Magenta (M)', key: 'm' as const, color: 'text-pink-600' },
                  { label: 'Yellow (Y)', key: 'y' as const, color: 'text-yellow-600' },
                  { label: 'Key / Schwarz (K)', key: 'k' as const, color: 'text-slate-900' },
                ].map((ch) => (
                  <div key={ch.key} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className={`font-bold ${ch.color}`}>{ch.label}</span>
                      <span className="font-mono text-slate-700">{options.cmykAngles[ch.key]}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="180"
                      value={options.cmykAngles[ch.key]}
                      onChange={(e) =>
                        updateOption('cmykAngles', {
                          ...options.cmykAngles,
                          [ch.key]: parseInt(e.target.value),
                        })
                      }
                      className="w-full accent-black bg-slate-200 rounded h-1.5 cursor-pointer"
                    />
                  </div>
                ))}
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
