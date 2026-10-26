import React from 'react';

interface PlaybackControlsProps {
  currentStepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  speedMs: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onFirst: () => void;
  onLast: () => void;
  onSeek: (stepIndex: number) => void;
  onSpeedChange: (speed: number) => void;
  currentStepDescription?: string;
  currentStepPhase?: string;
}

export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  currentStepIndex,
  totalSteps,
  isPlaying,
  speedMs,
  onPlayPause,
  onNext,
  onPrev,
  onFirst,
  onLast,
  onSeek,
  onSpeedChange,
  currentStepDescription,
  currentStepPhase,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-3">
      {/* Box descrittivo didattico dell'iterazione corrente */}
      <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 flex flex-col gap-1 min-h-[60px] justify-center">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-bold text-blue-400 tracking-wider">
            {currentStepPhase || 'Esecuzione Passo-Passo'}
          </span>
          <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
            Passo {totalSteps > 0 ? currentStepIndex + 1 : 0} di {totalSteps}
          </span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-sans">
          {currentStepDescription || 'Seleziona un algoritmo e avvia la visualizzazione.'}
        </p>
      </div>

      {/* Slider scrubber di avanzamento */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-slate-500 w-6 text-right">0</span>
        <input
          type="range"
          min={0}
          max={Math.max(totalSteps - 1, 0)}
          value={currentStepIndex}
          onChange={(e) => onSeek(Number(e.target.value))}
          disabled={totalSteps <= 1}
          className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
        />
        <span className="text-xs font-mono text-slate-400 w-8">
          {totalSteps > 0 ? totalSteps : 0}
        </span>
      </div>

      {/* Pulsanti Player e regolazione velocità */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Pulsanti di navigazione */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onFirst}
            disabled={currentStepIndex === 0}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 rounded text-xs font-bold transition"
            title="Torna all'Inizio"
          >
            ⏮ Inizio
          </button>
          <button
            onClick={onPrev}
            disabled={currentStepIndex === 0}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 rounded text-xs font-bold transition"
            title="Passo Precedente"
          >
            ◀ Indietro
          </button>
          <button
            onClick={onPlayPause}
            className={`px-4 py-1.5 rounded text-xs font-bold shadow transition flex items-center gap-1.5 ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            }`}
          >
            {isPlaying ? '⏸ Pausa' : '▶ Avvia Play'}
          </button>
          <button
            onClick={onNext}
            disabled={currentStepIndex >= totalSteps - 1}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 rounded text-xs font-bold transition"
            title="Passo Successivo"
          >
            Avanti ▶
          </button>
          <button
            onClick={onLast}
            disabled={currentStepIndex >= totalSteps - 1}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 text-slate-200 rounded text-xs font-bold transition"
            title="Salta alla Conclusione"
          >
            Fine ⏭
          </button>
        </div>

        {/* Regolatore velocità riproduzione */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Velocità:</span>
          <select
            value={speedMs}
            onChange={(e) => onSpeedChange(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono text-xs"
          >
            <option value={2000}>0.5x (Molto lenta)</option>
            <option value={1200}>1.0x (Standard)</option>
            <option value={600}>2.0x (Veloce)</option>
            <option value={250}>4.0x (Molto veloce)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
