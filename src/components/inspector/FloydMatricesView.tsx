import React, { useState } from 'react';
import { AlgorithmStep } from '../../types/graph';

interface FloydMatricesViewProps {
  step: AlgorithmStep;
}

export const FloydMatricesView: React.FC<FloydMatricesViewProps> = ({ step }) => {
  const matrices = step.matrices;
  const [queryStart, setQueryStart] = useState<string>('');
  const [queryEnd, setQueryEnd] = useState<string>('');

  if (!matrices) {
    return null;
  }

  const { nodeLabels, k, D, pred, formulaExplanation } = matrices;

  // Reconstruct path between queryStart and queryEnd using pred matrix
  const reconstructPath = () => {
    if (!queryStart || !queryEnd) return null;
    const startIndex = nodeLabels.indexOf(queryStart);
    const endIndex = nodeLabels.indexOf(queryEnd);
    if (startIndex === -1 || endIndex === -1) return null;

    const dist = D[startIndex][endIndex];
    if (dist === '∞' || dist === Infinity) {
      return { path: 'Nessun cammino esistente', distance: '∞' };
    }

    // Build path backwards using pred
    const path: string[] = [queryEnd];
    let curr = endIndex;
    let guard = 0;

    while (curr !== startIndex && guard < nodeLabels.length + 1) {
      const pVal = pred[startIndex][curr];
      const pIdx = nodeLabels.indexOf(String(pVal));
      if (pIdx === -1 || pVal === '-') break;
      path.unshift(String(pVal));
      curr = pIdx;
      guard++;
    }

    return { path: path.join(' → '), distance: dist };
  };

  const pathResult = reconstructPath();

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg space-y-4">
      {/* Header Floyd con indicatore di iterazione k */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            Matrici Floyd-Warshall:
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-mono text-sm border border-blue-500/30">
              k = {k} / {nodeLabels.length}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {k === 0 
              ? 'Fase iniziale k=0 (soli archi diretti)' 
              : `Considerando il nodo intermedio ${nodeLabels[k - 1] ?? k}`}
          </p>
        </div>

        {formulaExplanation && (
          <div className="text-xs font-mono bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-amber-300 max-w-md">
            {formulaExplanation}
          </div>
        )}
      </div>

      {/* Due Matrici Affiancate: D^(k) e pred^(k) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Matrice Distanze D */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              Matrice Distanze D^({k})
            </span>
            <span className="text-[11px] text-slate-500 font-mono">[i, j] costo cammino</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs font-mono">
              <thead>
                <tr>
                  <th className="p-1.5 text-slate-500 border border-slate-800 bg-slate-900/50">i \ j</th>
                  {nodeLabels.map((lbl, idx) => (
                    <th
                      key={lbl}
                      className={`p-1.5 border border-slate-800 font-bold ${
                        idx === k - 1 ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
                      }`}
                    >
                      {lbl}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nodeLabels.map((rowLbl, i) => (
                  <tr key={rowLbl}>
                    <th
                      className={`p-1.5 border border-slate-800 font-bold ${
                        i === k - 1 ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
                      }`}
                    >
                      {rowLbl}
                    </th>
                    {nodeLabels.map((colLbl, j) => {
                      const val = D[i]?.[j];
                      const isDiagonal = i === j;
                      const isPivot = i === k - 1 || j === k - 1;

                      return (
                        <td
                          key={colLbl}
                          className={`p-2 border border-slate-800 transition-colors ${
                            isDiagonal
                              ? 'bg-slate-900/80 text-slate-400 font-semibold'
                              : isPivot
                              ? 'bg-amber-500/10 text-amber-200'
                              : val === '∞'
                              ? 'text-slate-600'
                              : 'text-cyan-300 font-semibold'
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Matrice Predecessori pred */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Matrice Predecessori pred^({k})
            </span>
            <span className="text-[11px] text-slate-500 font-mono">[i, j] nodo precedente</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse text-xs font-mono">
              <thead>
                <tr>
                  <th className="p-1.5 text-slate-500 border border-slate-800 bg-slate-900/50">i \ j</th>
                  {nodeLabels.map((lbl, idx) => (
                    <th
                      key={lbl}
                      className={`p-1.5 border border-slate-800 font-bold ${
                        idx === k - 1 ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
                      }`}
                    >
                      {lbl}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nodeLabels.map((rowLbl, i) => (
                  <tr key={rowLbl}>
                    <th
                      className={`p-1.5 border border-slate-800 font-bold ${
                        i === k - 1 ? 'bg-amber-500/20 text-amber-300' : 'text-slate-400'
                      }`}
                    >
                      {rowLbl}
                    </th>
                    {nodeLabels.map((colLbl, j) => {
                      const val = pred[i]?.[j];
                      const isDiagonal = i === j;
                      const isPivot = i === k - 1 || j === k - 1;

                      return (
                        <td
                          key={colLbl}
                          className={`p-2 border border-slate-800 transition-colors ${
                            isDiagonal
                              ? 'bg-slate-900/80 text-slate-400'
                              : isPivot
                              ? 'bg-amber-500/10 text-amber-200'
                              : val === '-'
                              ? 'text-slate-600'
                              : 'text-emerald-300 font-bold'
                          }`}
                        >
                          {val}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Strumento Interattivo per Studenti: Ricostruzione del Cammino Minimo da pred */}
      <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">Ispezione Cammino tra nodi:</span>
          <select
            value={queryStart}
            onChange={e => setQueryStart(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono"
          >
            <option value="">Da...</option>
            {nodeLabels.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <span className="text-slate-500">→</span>
          <select
            value={queryEnd}
            onChange={e => setQueryEnd(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono"
          >
            <option value="">A...</option>
            {nodeLabels.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {pathResult && (
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded font-mono">
            <span className="text-cyan-400 font-bold">Cammino: {pathResult.path}</span>
            <span className="text-slate-400">|</span>
            <span className="text-emerald-400 font-bold">Costo: {pathResult.distance}</span>
          </div>
        )}
      </div>
    </div>
  );
};
