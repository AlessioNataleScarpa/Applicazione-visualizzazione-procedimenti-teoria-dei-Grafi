import React from 'react';
import { ALGORITHM_REGISTRY } from '../../algorithms/pseudocode';
import { AlgorithmType } from '../../types/graph';

interface PseudocodePanelProps {
  algorithmType: AlgorithmType;
  activeLine?: number;
}

export const PseudocodePanel: React.FC<PseudocodePanelProps> = ({
  algorithmType,
  activeLine,
}) => {
  const doc = ALGORITHM_REGISTRY[algorithmType];

  if (!doc) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 mb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-200">{doc.title}</h3>
          <span className="text-[11px] font-mono text-emerald-400">
            Complessità: {doc.complexity}
          </span>
        </div>
        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
          doc.isEfficient
            ? 'bg-emerald-950/60 border-emerald-700 text-emerald-300'
            : 'bg-amber-950/60 border-amber-700 text-amber-300'
        }`}>
          {doc.isEfficient ? 'Efficiente' : 'Non Efficiente'}
        </span>
      </div>

      <p className="text-xs text-slate-400 mb-3 leading-relaxed">
        {doc.description}
      </p>

      {/* Box Pseudocodice con linea attiva evidenziata */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs overflow-y-auto flex-1 max-h-80">
        {doc.pseudocodeLines.map((line, idx) => {
          const lineNumber = idx + 1;
          const isActive = activeLine === lineNumber;

          return (
            <div
              key={idx}
              className={`flex items-start py-0.5 px-2 rounded transition-all duration-150 ${
                isActive
                  ? 'bg-amber-500/20 text-amber-200 border-l-4 border-amber-400 font-bold pl-2 shadow-sm'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <span className="w-6 text-right mr-3 text-slate-600 select-none text-[11px]">
                {lineNumber}
              </span>
              <span className="flex-1 whitespace-pre-wrap">{line || '\u00A0'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
