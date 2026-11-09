import React from 'react';
import { SAMPLE_IMAGES } from '../utils/sampleImages';
import { X, Sparkles } from 'lucide-react';

interface SampleModalProps {
  onSelectSample: (url: string) => void;
  onClose: () => void;
}

export const SampleModal: React.FC<SampleModalProps> = ({
  onSelectSample,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col text-slate-900">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 uppercase tracking-tight">Beispielbilder Galerie</h3>
              <p className="text-xs text-slate-500">Wähle ein Motiv zum Testen des Halftone-Effekts</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
          {SAMPLE_IMAGES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => {
                onSelectSample(sample.url);
                onClose();
              }}
              className="p-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-black transition-all text-left flex flex-col gap-2 cursor-pointer group shadow-sm"
            >
              <div className="aspect-square w-full rounded-lg bg-slate-100 overflow-hidden border border-slate-200 relative">
                <img
                  src={sample.url}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-xs">{sample.title}</p>
                <p className="text-[10px] text-slate-500">{sample.category}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
