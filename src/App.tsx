import React, { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import { HalftoneOptions, Preset } from './types';
import { DEFAULT_OPTIONS, PRESETS } from './utils/presets';
import { SAMPLE_IMAGES } from './utils/sampleImages';
import { exportSettingsAsJSON, importSettingsFromJSON } from './utils/jsonSettings';
import { Header } from './components/Header';
import { PresetBar } from './components/PresetBar';
import { Sidebar } from './components/Sidebar';
import { PreviewCanvas } from './components/PreviewCanvas';
import { ExportModal } from './components/ExportModal';
import { SampleModal } from './components/SampleModal';
import { BatchModal } from './components/BatchModal';

export default function App() {
  const [options, setOptions] = useState<HalftoneOptions>(DEFAULT_OPTIONS);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [activePresetId, setActivePresetId] = useState<string | undefined>('newspaper');

  // Modals & Drag
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isSampleOpen, setIsSampleOpen] = useState<boolean>(false);
  const [isBatchOpen, setIsBatchOpen] = useState<boolean>(false);
  const [isGlobalDragOver, setIsGlobalDragOver] = useState<boolean>(false);

  const handleGlobalDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.types.includes('Files')) {
      setIsGlobalDragOver(true);
    }
  };

  const handleGlobalDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Only deactivate if leaving window boundaries
    if (e.clientX === 0 || e.clientY === 0 || e.clientX >= window.innerWidth || e.clientY >= window.innerHeight) {
      setIsGlobalDragOver(false);
    }
  };

  const handleGlobalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsGlobalDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleImageUpload(file);
      }
    }
  };

  // Load default initial image (Statue) on launch for immediate working app state
  useEffect(() => {
    const defaultSample = SAMPLE_IMAGES[0];
    if (defaultSample) {
      loadImageFromUrl(defaultSample.url);
    }
  }, []);

  // Listen for Escape key to cancel drag overlay or any active drag state
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsGlobalDragOver(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadImageFromUrl = (url: string) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImage(img);
    };
    img.src = url;
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        loadImageFromUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyPreset = (preset: Preset) => {
    setOptions((prev) => ({
      ...prev,
      ...preset.options,
    }));
    setActivePresetId(preset.id);
  };

  const handleResetOptions = () => {
    setOptions(DEFAULT_OPTIONS);
    setActivePresetId(undefined);
  };

  // JSON Import & Export handlers
  const handleExportJson = () => {
    exportSettingsAsJSON(options, `halftone-config-${Date.now()}`);
  };

  const handleImportJson = async (file: File) => {
    try {
      const importedOptions = await importSettingsFromJSON(file);
      setOptions(importedOptions);
      setActivePresetId(undefined);
    } catch (err: any) {
      alert(err?.message || 'Fehler beim Laden der JSON-Datei');
    }
  };

  const activePreset = PRESETS.find((p) => p.id === activePresetId);

  return (
    <div
      className="flex flex-col h-screen w-screen bg-slate-50 font-sans text-slate-900 overflow-hidden select-none relative"
      onDragOver={handleGlobalDragOver}
      onDragLeave={handleGlobalDragLeave}
      onDrop={handleGlobalDrop}
    >
      {/* Global Drag & Drop Overlay */}
      {isGlobalDragOver && (
        <div
          onClick={() => setIsGlobalDragOver(false)}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={handleGlobalDrop}
          className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex flex-col items-center justify-center text-white border-4 border-dashed border-white m-4 rounded-2xl transition-all animate-fade-in cursor-pointer"
        >
          {/* Top-Right Cancel Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsGlobalDragOver(false);
            }}
            className="absolute top-6 right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer active:scale-95 shadow-md flex items-center gap-1.5 text-xs font-semibold"
            title="Abbrechen (Esc)"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Schließen</span>
          </button>

          <div
            onClick={(e) => e.stopPropagation()}
            className="flex flex-col items-center justify-center max-w-md text-center px-6 pointer-events-auto"
          >
            <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-3">
              <Upload className="w-8 h-8 text-white animate-bounce" />
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-wider">Bild hier ablegen</h2>
            <p className="text-sm text-slate-300 mt-1">
              Wandle deine Bilddatei sofort in eine Halftone-Vektorgrafik um (JPG, PNG, WebP)
            </p>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => setIsGlobalDragOver(false)}
              className="mt-6 px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/30 backdrop-blur-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95 shadow-lg"
              title="Kein Bild ablegen und Vorgang abbrechen"
            >
              <X className="w-4 h-4" />
              <span>Abbrechen (Kein Bild ablegen)</span>
            </button>
          </div>
        </div>
      )}
      {/* Top Header */}
      <Header
        onOpenExport={() => setIsExportOpen(true)}
        onOpenPresets={() => {}}
        onOpenSamples={() => setIsSampleOpen(true)}
        onOpenBatch={() => setIsBatchOpen(true)}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
        onImageUpload={handleImageUpload}
        onReset={handleResetOptions}
        hasImage={!!image}
        activePresetName={activePreset?.name}
      />

      {/* Quick Preset Selector Bar */}
      <PresetBar
        currentOptions={options}
        onSelectPreset={handleApplyPreset}
        activePresetId={activePresetId}
      />

      {/* Main Studio Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Control Sidebar */}
        <Sidebar
          options={options}
          onChange={(newOpts) => {
            setOptions(newOpts);
            setActivePresetId(undefined); // clear preset tag if manually edited
          }}
          onImageUpload={handleImageUpload}
          onSelectSampleImage={loadImageFromUrl}
          onResetOptions={handleResetOptions}
          onApplyPreset={handleApplyPreset}
          onOpenBatch={() => setIsBatchOpen(true)}
          onExportJson={handleExportJson}
          onImportJson={handleImportJson}
        />

        {/* Center Interactive Preview Canvas */}
        <PreviewCanvas
          image={image}
          options={options}
          onImageUpload={handleImageUpload}
          onOpenSamples={() => setIsSampleOpen(true)}
          onToggleInvert={() => setOptions((prev) => ({ ...prev, invert: !prev.invert }))}
          onSelectPlate={(plate) => setOptions((prev) => ({ ...prev, activePlate: plate }))}
        />
      </div>

      {/* Export Modal */}
      {isExportOpen && image && (
        <ExportModal
          image={image}
          options={options}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {/* Sample Image Gallery Modal */}
      {isSampleOpen && (
        <SampleModal
          onSelectSample={loadImageFromUrl}
          onClose={() => setIsSampleOpen(false)}
        />
      )}

      {/* Batch Processing Modal */}
      {isBatchOpen && (
        <BatchModal
          options={options}
          onClose={() => setIsBatchOpen(false)}
        />
      )}
    </div>
  );
}

