import React from 'react';
import { AlgorithmStep } from '../../types/graph';

interface FlowCutViewProps {
  step: AlgorithmStep;
}

export const FlowCutView: React.FC<FlowCutViewProps> = ({ step }) => {
  const flowState = step.flowState;

  if (!flowState) {
    return null;
  }

  const {
    currentFlowTotal,
    isAdmissible,
    admissibilityNote,
    residualEdges,
    augmentingPath,
    bottleneckDelta,
    isTerminated,
    minCut,
  } = flowState;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
      {/* Banner Ammissibilità Flusso Iniziale */}
      {admissibilityNote && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
            isAdmissible
              ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
              : 'bg-rose-950/50 border-rose-800 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="font-bold">{isAdmissible ? '✓' : '⚠'}</span>
            <span>{admissibilityNote}</span>
          </div>
          <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-900/60 border border-slate-700">
            Flusso Attuale: v = {currentFlowTotal}
          </span>
        </div>
      )}

      {/* Cammino Aumentante Corrente & Bottleneck */}
      {augmentingPath && augmentingPath.length > 0 && (
        <div className="bg-slate-950 p-3 rounded-lg border border-purple-900/60 flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs uppercase tracking-wider font-bold text-purple-300 block mb-1">
              Cammino Aumentante P (da s a t):
            </span>
            <div className="flex items-center gap-1.5 font-mono text-sm text-purple-200">
              {augmentingPath.map((node, idx) => (
                <React.Fragment key={node}>
                  <span className="px-2 py-0.5 bg-purple-950 border border-purple-700 rounded font-bold">
                    {node}
                  </span>
                  {idx < augmentingPath.length - 1 && (
                    <span className="text-purple-400 font-bold">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {bottleneckDelta !== undefined && (
            <div className="text-right">
              <span className="text-xs text-slate-400 block">Flusso Aumentante Massimo:</span>
              <span className="text-lg font-bold font-mono text-purple-300">
                δ = {bottleneckDelta}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Sezione Finale: Teorema Max Flow - Min Cut */}
      {isTerminated && minCut && (
        <div className="bg-gradient-to-r from-emerald-950/60 via-slate-950 to-rose-950/60 p-4 rounded-xl border border-emerald-600/50 shadow-md space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div>
              <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                ★ TEOREMA DEL MASSIMO FLUSSO - MINIMO TAGLIO
              </h4>
              <p className="text-xs text-slate-400">
                Non esistono ulteriori cammini aumentanti nella rete residua. Il flusso ottenuto è ottimo!
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-emerald-900/80 border border-emerald-500 rounded text-center">
                <span className="text-[10px] text-emerald-300 block uppercase">Flusso Massimo</span>
                <span className="text-base font-bold font-mono text-emerald-100">{minCut.maxFlowValue}</span>
              </div>
              <span className="text-slate-400 font-bold">=</span>
              <div className="px-3 py-1 bg-rose-900/80 border border-rose-500 rounded text-center">
                <span className="text-[10px] text-rose-300 block uppercase">Capacità Taglio Minimo</span>
                <span className="text-base font-bold font-mono text-rose-100">{minCut.minCutCapacity}</span>
              </div>
            </div>
          </div>

          {/* Partizione del Taglio (S, T) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900/80 p-2.5 rounded border border-cyan-800">
              <span className="font-bold text-cyan-400 block mb-1">
                Insieme S (Raggiungibili da s in R(x)):
              </span>
              <div className="flex flex-wrap gap-1 font-mono">
                {minCut.S.map(n => (
                  <span key={n} className="px-2 py-0.5 bg-cyan-950 border border-cyan-700 text-cyan-200 rounded font-semibold">
                    {n}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded border border-orange-800">
              <span className="font-bold text-orange-400 block mb-1">
                Insieme T (V \ S, comprende il pozzo t):
              </span>
              <div className="flex flex-wrap gap-1 font-mono">
                {minCut.T.map(n => (
                  <span key={n} className="px-2 py-0.5 bg-orange-950 border border-orange-700 text-orange-200 rounded font-semibold">
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Archi del Taglio Minimo */}
          <div className="bg-slate-900/80 p-2.5 rounded border border-slate-800">
            <span className="text-xs font-bold text-slate-300 block mb-1.5">
              Lati del Taglio [S, T] nel Grafo Originale (Saturi al 100%):
            </span>
            <div className="flex flex-wrap gap-2 text-xs font-mono">
              {minCut.cutEdges.map((c, idx) => (
                <span key={idx} className="px-2.5 py-1 bg-rose-950/70 border border-rose-700 text-rose-200 rounded font-bold">
                  ({c.from} → {c.to}) : cap = {c.capacity}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Rete Residua R(x) Tabella Rapida */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Archi della Rete Residua R(x)
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {residualEdges.length} archi con capacità residua &gt; 0
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
          {residualEdges.map((r, i) => (
            <span
              key={i}
              className={`px-2 py-0.5 rounded text-[11px] font-mono border ${
                r.isBackward
                  ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300'
              }`}
            >
              {r.isBackward ? '↺' : '→'} {r.from}→{r.to}: <strong>{r.residualCapacity}</strong>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
