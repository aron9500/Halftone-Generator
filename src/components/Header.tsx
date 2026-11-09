import React, { useRef } from 'react';
import { Download, Sparkles, Image as ImageIcon, Archive, FileJson, Upload, ImagePlus } from 'lucide-react';

interface HeaderProps {
  onOpenExport: () => void;
  onOpenPresets: () => void;
  onOpenSamples: () => void;
  onOpenBatch: () => void;
  onExportJson: () => void;
  onImportJson: (file: File) => void;
  onImageUpload: (file: File) => void;
  onReset: () => void;
  hasImage: boolean;
  activePresetName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenExport,
  onOpenPresets,
  onOpenSamples,
  onOpenBatch,
  onExportJson,
  onImportJson,
  onImageUpload,
  hasImage,
  activePresetName,
}) => {
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleJsonChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportJson(e.target.files[0]);
      e.target.value = '';
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between text-slate-900 z-20 shrink-0">
      {/* Brand Logo & Name */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
          <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
        </div>
        <div className="flex items-center space-x-2">
          <h1 className="text-base font-bold tracking-tight text-slate-900 uppercase">
            HALFTONE.PRO
          </h1>
          <span className="hidden sm:inline-block text-[10px] text-slate-400 font-semibold uppercase tracking-widest px-2 py-0.5 bg-slate-100 rounded">
            Vector Studio
          </span>
        </div>
      </div>

      {/* Middle Bar: Preset, Samples, Batch & Config Launchers */}
      <div className="hidden lg:flex items-center space-x-2">
        <button
          onClick={onOpenPresets}
          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 border border-slate-200 transition-all flex items-center space-x-2 cursor-pointer shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-900" />
          <span>Presets & Stile</span>
          {activePresetName && (
            <span className="ml-1 px-2 py-0.5 text-[10px] bg-slate-100 text-slate-800 rounded font-semibold uppercase tracking-wide">
              {activePresetName}
            </span>
          )}
        </button>

        <button
          onClick={onOpenSamples}
          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 border border-slate-200 transition-all flex items-center space-x-2 cursor-pointer shadow-sm"
        >
          <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>Beispielbilder</span>
        </button>

        <button
          onClick={() => imageInputRef.current?.click()}
          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 border border-slate-200 transition-all flex items-center space-x-2 cursor-pointer shadow-sm"
          title="Eigenes Bild importieren (JPG, PNG, WebP)"
        >
          <ImagePlus className="w-3.5 h-3.5 text-slate-900" />
          <span>Bild import</span>
        </button>

        <button
          onClick={onOpenBatch}
          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-xs font-bold text-slate-900 border border-slate-200 transition-all flex items-center space-x-2 cursor-pointer shadow-sm"
          title="Mehrere Bilder als ZIP stapelweise konvertieren"
        >
          <Archive className="w-3.5 h-3.5 text-slate-900" />
          <span>Stapelverarbeitung (ZIP)</span>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 md:space-x-3">
        {/* Hidden Image Input */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        {/* Dedicated "Bild import" Action Button */}
        <button
          onClick={() => imageInputRef.current?.click()}
          className="px-3 py-1.5 md:py-2 rounded-lg bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center space-x-1.5 cursor-pointer transition-all shadow-sm active:scale-95"
          title="Eigenes Bild von deinem Gerät importieren"
        >
          <ImagePlus className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
          <span>Bild import</span>
        </button>

        {/* JSON Export/Import Dropdown or Buttons */}
        <div className="flex items-center space-x-1 border-r border-slate-200 pr-2 md:pr-3">
          <button
            onClick={onExportJson}
            className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm"
            title="Einstellungen als JSON exportieren"
          >
            <FileJson className="w-3.5 h-3.5 text-slate-800" />
            <span className="hidden sm:inline">JSON Export</span>
          </button>

          <input
            ref={jsonInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleJsonChange}
            className="hidden"
          />

          <button
            onClick={() => jsonInputRef.current?.click()}
            className="p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm"
            title="Einstellungen aus JSON-Datei importieren"
          >
            <Upload className="w-3.5 h-3.5 text-slate-800" />
            <span className="hidden sm:inline">JSON Import</span>
          </button>
        </div>

        {hasImage && (
          <button
            onClick={onOpenExport}
            className="px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-lg text-xs md:text-sm font-semibold flex items-center space-x-2 cursor-pointer transition-all shadow-sm active:scale-95"
          >
            <span>Grafik Exportieren</span>
            <Download className="w-4 h-4 stroke-[2]" />
          </button>
        )}
      </div>
    </header>
  );
};
