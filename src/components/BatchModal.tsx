import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import { HalftoneOptions } from '../types';
import {
  getImagePixelData,
  generateHalftoneSVG,
  generateHighResPNG,
} from '../utils/halftoneEngine';
import {
  Upload,
  X,
  Archive,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileImage,
  Trash2,
  Download,
  Layers,
  Sparkles,
} from 'lucide-react';

interface BatchModalProps {
  options: HalftoneOptions;
  onClose: () => void;
}

interface BatchFileItem {
  id: string;
  file: File;
  name: string;
  sizeFormatted: string;
  previewUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  errorMsg?: string;
}

export const BatchModal: React.FC<BatchModalProps> = ({ options, onClose }) => {
  const [fileList, setFileList] = useState<BatchFileItem[]>([]);
  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'both'>('png');
  const [scaleFactor, setScaleFactor] = useState<number>(2); // 2x default HD
  const [includeBg, setIncludeBg] = useState<boolean>(!options.transparentBg);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isDone, setIsDone] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleAddFiles = (files: FileList | File[]) => {
    const newItems: BatchFileItem[] = [];
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        newItems.push({
          id: Math.random().toString(36).substring(2, 9),
          file,
          name: file.name,
          sizeFormatted: formatFileSize(file.size),
          previewUrl: URL.createObjectURL(file),
          status: 'pending',
        });
      }
    });

    if (newItems.length > 0) {
      setFileList((prev) => [...prev, ...newItems]);
      setIsDone(false);
    }
  };

  const handleRemoveFile = (id: string) => {
    setFileList((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleClearAll = () => {
    fileList.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    setFileList([]);
    setIsDone(false);
  };

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
    if (e.dataTransfer.files) {
      handleAddFiles(e.dataTransfer.files);
    }
  };

  // Run Batch Processing and ZIP Generation
  const startBatchProcess = async () => {
    if (fileList.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setIsDone(false);
    const zip = new JSZip();
    const batchOptions: HalftoneOptions = {
      ...options,
      transparentBg: !includeBg,
    };

    const updatedList = [...fileList];

    for (let i = 0; i < updatedList.length; i++) {
      setCurrentIndex(i);
      const item = updatedList[i];

      // Set status to processing
      updatedList[i] = { ...item, status: 'processing' };
      setFileList([...updatedList]);

      try {
        // Load image offscreen
        const img = new Image();
        img.src = item.previewUrl;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = () => reject(new Error('Bild konnte nicht geladen werden'));
        });

        const baseName = item.name.substring(0, item.name.lastIndexOf('.')) || item.name;

        // Process PNG if selected
        if (exportFormat === 'png' || exportFormat === 'both') {
          const pngDataUrl = await generateHighResPNG(img, batchOptions, scaleFactor);
          // Convert dataURL to Uint8Array/Blob
          const base64Data = pngDataUrl.replace(/^data:image\/png;base64,/, '');
          zip.file(`${baseName}-halftone-${scaleFactor}x.png`, base64Data, { base64: true });
        }

        // Process SVG if selected
        if (exportFormat === 'svg' || exportFormat === 'both') {
          const { imageData, width, height } = getImagePixelData(img, batchOptions);
          const svgContent = generateHalftoneSVG(imageData, width, height, batchOptions, true);
          zip.file(`${baseName}-halftone.svg`, svgContent);
        }

        updatedList[i] = { ...item, status: 'done' };
        setFileList([...updatedList]);
      } catch (err: any) {
        console.error(`Error processing ${item.name}:`, err);
        updatedList[i] = { ...item, status: 'error', errorMsg: err?.message || 'Fehler beim Verarbeiten' };
        setFileList([...updatedList]);
      }
    }

    // Generate ZIP file and trigger download
    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `halftone-batch-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setIsDone(true);
    } catch (zipErr) {
      console.error('Fehler beim Erstellen der ZIP-Datei:', zipErr);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalFiles = fileList.length;
  const processedFiles = fileList.filter((f) => f.status === 'done' || f.status === 'error').length;
  const progressPct = totalFiles > 0 ? Math.round((processedFiles / totalFiles) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col text-slate-900 max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">
              <Archive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 uppercase tracking-tight">
                Stapelverarbeitung (Batch Processing)
              </h3>
              <p className="text-xs text-slate-500">
                Wende deine Halftone-Einstellungen auf mehrere Bilder gleichzeitig an
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isProcessing}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer disabled:opacity-30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Dropzone for Multiple Images */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer ${
              isDragOver
                ? 'border-black bg-slate-100'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => e.target.files && handleAddFiles(e.target.files)}
              className="hidden"
            />
            <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm text-slate-800">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-slate-900 text-sm">Bilder hierher ziehen oder durchsuchen</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Unterstützt PNG, JPG, WebP, SVG (Mehrfachauswahl möglich)
              </p>
            </div>
          </div>

          {/* Export Options Settings for Batch */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-slate-800" />
              <span>Export-Konfiguration für die Stapelverarbeitung</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {[
                { id: 'png', label: 'PNG Rasterbild', icon: <FileImage className="w-3.5 h-3.5" /> },
                { id: 'svg', label: 'SVG Vektor', icon: <Layers className="w-3.5 h-3.5" /> },
                { id: 'both', label: 'PNG + SVG (Beides)', icon: <Archive className="w-3.5 h-3.5" /> },
              ].map((fmt) => (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => setExportFormat(fmt.id as any)}
                  disabled={isProcessing}
                  className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-2 transition-all cursor-pointer font-semibold ${
                    exportFormat === fmt.id
                      ? 'bg-black text-white border-black shadow-sm'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {fmt.icon}
                  <span>{fmt.label}</span>
                </button>
              ))}
            </div>

            {(exportFormat === 'png' || exportFormat === 'both') && (
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-semibold">PNG Auflösung:</span>
                <div className="flex gap-1.5">
                  {[
                    { factor: 1, label: '1x' },
                    { factor: 2, label: '2x HD' },
                    { factor: 4, label: '4x Print' },
                  ].map((s) => (
                    <button
                      key={s.factor}
                      type="button"
                      onClick={() => setScaleFactor(s.factor)}
                      disabled={isProcessing}
                      className={`px-2.5 py-1 rounded text-[11px] font-mono border font-bold transition-all cursor-pointer ${
                        scaleFactor === s.factor
                          ? 'bg-black text-white border-black'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-700 font-semibold">Hintergrund einbinden:</span>
              <input
                type="checkbox"
                checked={includeBg}
                onChange={(e) => setIncludeBg(e.target.checked)}
                disabled={isProcessing}
                className="w-4 h-4 accent-black rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Files Queue List */}
          {fileList.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-900">
                  Ausgewählte Bilder ({fileList.length})
                </span>
                {!isProcessing && (
                  <button
                    onClick={handleClearAll}
                    className="text-red-600 hover:text-red-700 font-semibold transition-colors cursor-pointer"
                  >
                    Alle entfernen
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {fileList.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <img
                        src={item.previewUrl}
                        alt={item.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-100 border border-slate-200 shrink-0"
                      />
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-500">{item.sizeFormatted}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.status === 'pending' && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-2 py-0.5 rounded">
                          Bereit
                        </span>
                      )}
                      {item.status === 'processing' && (
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Verarbeite...</span>
                        </span>
                      )}
                      {item.status === 'done' && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Fertig</span>
                        </span>
                      )}
                      {item.status === 'error' && (
                        <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded flex items-center gap-1" title={item.errorMsg}>
                          <AlertCircle className="w-3 h-3" />
                          <span>Fehler</span>
                        </span>
                      )}

                      {!isProcessing && (
                        <button
                          onClick={() => handleRemoveFile(item.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progress Bar when processing */}
          {isProcessing && (
            <div className="p-4 bg-slate-100 rounded-xl space-y-2 border border-slate-200">
              <div className="flex justify-between font-bold text-slate-900 text-xs">
                <span>Stapelverarbeitung läuft... ({processedFiles} / {totalFiles})</span>
                <span>{progressPct}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-black h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Success Banner */}
          {isDone && !isProcessing && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-bold text-xs">
                  Stapelverarbeitung erfolgreich abgeschlossen! ZIP-Datei wurde heruntergeladen.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold cursor-pointer text-xs transition-all disabled:opacity-30"
          >
            Schließen
          </button>

          <button
            onClick={startBatchProcess}
            disabled={fileList.length === 0 || isProcessing}
            className="px-5 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold flex items-center gap-2 cursor-pointer text-xs transition-all shadow-md disabled:opacity-40 active:scale-98"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Erstelle ZIP ({processedFiles}/{totalFiles})...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{fileList.length} Bilder verarbeiten & ZIP Herunterladen</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
