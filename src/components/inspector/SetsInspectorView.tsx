import React from 'react';
import { AlgorithmStep } from '../../types/graph';

interface SetsInspectorViewProps {
  step: AlgorithmStep;
}

export const SetsInspectorView: React.FC<SetsInspectorViewProps> = ({ step }) => {
  const sets = step.sets;
  const arrays = step.arrays;
  const sortedEdges = step.sortedEdges;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500"></span>
          Ispezione Insiemi & Vettori di Stato
        </h3>
        <span className="text-xs text-slate-400 font-mono">Fase: {step.phase}</span>
      </div>

      {/* Sezione Insiemi S, S̄, T */}
      {sets && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {sets.S && (
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-xs font-semibold text-cyan-400 block mb-1.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Insieme S:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sets.S.length > 0 ? (
                  sets.S.map(item => (
                    <span key={item} className="px-2 py-0.5 bg-cyan-950/80 border border-cyan-800/80 text-cyan-200 rounded text-xs font-mono font-bold">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">∅ (Vuoto)</span>
                )}
              </div>
            </div>
          )}

          {sets.S_bar && (
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-xs font-semibold text-orange-400 block mb-1.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-orange-400"></span> Insieme S̄ (V \ S):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sets.S_bar.length > 0 ? (
                  sets.S_bar.map(item => (
                    <span key={item} className="px-2 py-0.5 bg-orange-950/80 border border-orange-800/80 text-orange-200 rounded text-xs font-mono font-bold">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">∅ (Vuoto)</span>
                )}
              </div>
            </div>
          )}

          {sets.T && (
            <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
              <span className="text-xs font-semibold text-emerald-400 block mb-1.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Albero T (|T| = {sets.T.length}):
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {sets.T.length > 0 ? (
                  sets.T.map(item => (
                    <span key={item} className="px-2 py-0.5 bg-emerald-950/80 border border-emerald-800/80 text-emerald-200 rounded text-[11px] font-mono">
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-500 italic">∅ (Nessun lato ancora)</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sezione Struttura Dati COMP (Kruskal) */}
      {arrays?.COMP && (
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              Struttura COMP[i] (Componenti Connesse Union-Find)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Vertice → ID Componente</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.entries(arrays.COMP).map(([nodeId, compId]) => (
              <div
                key={nodeId}
                className="flex items-center bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono"
              >
                <span className="text-slate-400 font-bold mr-1.5">{nodeId}:</span>
                <span className="px-1.5 py-0.5 bg-purple-900/60 text-purple-200 border border-purple-700/60 rounded font-semibold">
                  comp {compId}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabella Trasposta: Nodo | Flag (ovvero se visitato) | Costo | Predecessore */}
      {arrays && (arrays.V || arrays.C || arrays.D || arrays.pred) && (
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Tabella di Stato Nodi (Prim / Dijkstra)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {arrays.C ? 'Costo C[i] al Taglio' : 'Distanza D[i] dalla Radice'}
            </span>
          </div>

          <table className="w-full text-center border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-900/90 text-slate-300 border border-slate-800">
                <th className="p-2 border border-slate-800 font-bold text-center">Nodo</th>
                <th className="p-2 border border-slate-800 font-bold text-center">Flag (Visitato)</th>
                <th className="p-2 border border-slate-800 font-bold text-center">
                  {arrays.C ? 'Costo (C[i])' : 'Costo (D[i])'}
                </th>
                <th className="p-2 border border-slate-800 font-bold text-center">Predecessore (pred[i])</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(arrays.V || arrays.D || arrays.C || {}).map(nodeKey => {
                const flagVal = arrays.V?.[nodeKey];
                const isVisited = flagVal === 1;
                const costVal = arrays.C?.[nodeKey] !== undefined ? arrays.C[nodeKey] : arrays.D?.[nodeKey];
                const predVal = arrays.pred?.[nodeKey] ?? '-';

                // Evidenziazione del nodo attualmente esaminato o selezionato
                const role = step.nodeRoles[nodeKey];
                const isCurrent = role === 'current' || role === 'candidate';

                return (
                  <tr
                    key={nodeKey}
                    className={`border border-slate-800 transition-colors ${
                      isCurrent
                        ? 'bg-amber-500/15 text-amber-200 font-bold'
                        : isVisited
                        ? 'bg-slate-900/40 text-slate-200'
                        : 'text-slate-400 hover:bg-slate-900/20'
                    }`}
                  >
                    {/* Colonna: Nodo */}
                    <td className="p-2 border border-slate-800 font-bold">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded border text-xs ${
                          isCurrent
                            ? 'bg-amber-950 border-amber-600 text-amber-300 ring-1 ring-amber-400'
                            : isVisited
                            ? 'bg-blue-950 border-blue-700 text-blue-200'
                            : 'bg-slate-900 border-slate-700 text-slate-300'
                        }`}
                      >
                        {nodeKey}
                      </span>
                    </td>

                    {/* Colonna: Flag (Visitato) */}
                    <td className="p-2 border border-slate-800">
                      {isVisited ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700 text-emerald-300 font-semibold text-[11px]">
                          <span>✓</span> 1 (In S)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-400 text-[11px]">
                          <span>○</span> 0 (In S̄)
                        </span>
                      )}
                    </td>

                    {/* Colonna: Costo */}
                    <td className="p-2 border border-slate-800 font-bold">
                      {costVal === '∞' || costVal === Infinity ? (
                        <span className="text-slate-500 font-normal">∞</span>
                      ) : (
                        <span className="text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                          {costVal}
                        </span>
                      )}
                    </td>

                    {/* Colonna: Predecessore */}
                    <td className="p-2 border border-slate-800">
                      {predVal && predVal !== '-' ? (
                        <span className="text-emerald-300 font-bold bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                          {predVal}
                        </span>
                      ) : (
                        <span className="text-slate-500 font-normal">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Lista Ordinata dei Lati (Kruskal) */}
      {sortedEdges && sortedEdges.length > 0 && (
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              LATI (Ordinati per costo crescente)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Totale: {sortedEdges.length} lati</span>
          </div>

          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {sortedEdges.map((e, idx) => {
              let badgeColor = 'bg-slate-900 border-slate-800 text-slate-400';
              if (e.status === 'accepted') badgeColor = 'bg-emerald-950 border-emerald-700 text-emerald-300 font-bold';
              else if (e.status === 'rejected') badgeColor = 'bg-rose-950/60 border-rose-800/60 text-rose-400 line-through';
              else if (e.status === 'considered') badgeColor = 'bg-amber-950 border-amber-600 text-amber-300 ring-2 ring-amber-400 animate-pulse';

              return (
                <span
                  key={e.id}
                  className={`px-2.5 py-1 rounded border text-xs font-mono flex items-center gap-1.5 ${badgeColor}`}
                >
                  <span className="text-[10px] opacity-60">#{idx + 1}</span>
                  ({e.from}-{e.to}) : <strong>{e.weight}</strong>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
