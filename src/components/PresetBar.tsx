import React from 'react';
import { PRESETS } from '../utils/presets';
import { Preset, HalftoneOptions } from '../types';
import { Sparkles, Check } from 'lucide-react';

interface PresetBarProps {
  currentOptions: HalftoneOptions;
  onSelectPreset: (preset: Preset) => void;
  activePresetId?: string;
}

export const PresetBar: React.FC<PresetBarProps> = ({
  onSelectPreset,
  activePresetId,
}) => {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs shrink-0">
      <div className="flex items-center gap-1.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px] whitespace-nowrap pr-3 border-r border-slate-200">
        <Sparkles className="w-3.5 h-3.5 text-slate-800" />
        <span>Schnell-Stile:</span>
      </div>

      <div className="flex items-center gap-2">
        {PRESETS.map((p) => {
          const isActive = activePresetId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPreset(p)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer text-xs border ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
              title={p.description}
            >
              {isActive && <Check className="w-3 h-3 text-white" />}
              <span>{p.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
