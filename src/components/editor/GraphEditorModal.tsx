import React, { useState } from 'react';
import { GraphData, GraphNode, GraphEdge } from '../../types/graph';

interface GraphEditorModalProps {
  graph: GraphData;
  isOpen: boolean;
  onClose: () => void;
  onSave: (newGraph: GraphData) => void;
  isFlowAlgorithm: boolean;
}

export const GraphEditorModal: React.FC<GraphEditorModalProps> = ({
  graph,
  isOpen,
  onClose,
  onSave,
  isFlowAlgorithm,
}) => {
  const [nodes, setNodes] = useState<GraphNode[]>([...graph.nodes]);
  const [edges, setEdges] = useState<GraphEdge[]>([...graph.edges]);
  const [isDirected, setIsDirected] = useState<boolean>(graph.isDirected);
  const [sourceId, setSourceId] = useState<string>(graph.sourceNodeId || (graph.nodes[0]?.id ?? ''));
  const [targetId, setTargetId] = useState<string>(
    graph.targetNodeId || (graph.nodes[graph.nodes.length - 1]?.id ?? '')
  );

  // New Node form state
  const [newNodeLabel, setNewNodeLabel] = useState<string>('');

  // New Edge form state
  const [edgeFrom, setEdgeFrom] = useState<string>('');
  const [edgeTo, setEdgeTo] = useState<string>('');
  const [edgeWeight, setEdgeWeight] = useState<number>(1);
  const [edgeCapacity, setEdgeCapacity] = useState<number>(10);
  const [edgeFlow, setEdgeFlow] = useState<number>(0);

  if (!isOpen) return null;

  const handleAddNode = () => {
    const trimmed = newNodeLabel.trim();
    if (!trimmed) return;
    if (nodes.some(n => n.label === trimmed)) {
      alert(`Un nodo con etichetta "${trimmed}" esiste già!`);
      return;
    }

    const id = trimmed;
    // Calcola una coordinata casuale o a griglia
    const count = nodes.length;
    const x = 120 + ((count % 4) * 140);
    const y = 100 + (Math.floor(count / 4) * 120);

    const newNode: GraphNode = { id, label: trimmed, x, y };
    const updatedNodes = [...nodes, newNode];
    setNodes(updatedNodes);
    setNewNodeLabel('');

    if (updatedNodes.length === 1) setSourceId(id);
    if (updatedNodes.length === 2) setTargetId(id);
  };

  const handleRemoveNode = (idToRemove: string) => {
    setNodes(nodes.filter(n => n.id !== idToRemove));
    setEdges(edges.filter(e => e.from !== idToRemove && e.to !== idToRemove));
    if (sourceId === idToRemove) setSourceId('');
    if (targetId === idToRemove) setTargetId('');
  };

  const handleAddEdge = () => {
    if (!edgeFrom || !edgeTo) {
      alert('Seleziona entrambi i nodi (Da e A)!');
      return;
    }
    if (edgeFrom === edgeTo) {
      alert('Non sono ammessi cappi (stesso nodo di partenza e arrivo)!');
      return;
    }

    const edgeId = `e_${edgeFrom}_${edgeTo}_${Date.now()}`;
    const newEdge: GraphEdge = {
      id: edgeId,
      from: edgeFrom,
      to: edgeTo,
      weight: edgeWeight,
      capacity: edgeCapacity,
      flow: edgeFlow,
    };

    setEdges([...edges, newEdge]);
  };

  const handleRemoveEdge = (edgeId: string) => {
    setEdges(edges.filter(e => e.id !== edgeId));
  };

  const handleSave = () => {
    if (nodes.length < 2) {
      alert('Il grafo deve avere almeno 2 nodi per eseguire gli algoritmi!');
      return;
    }

    onSave({
      nodes,
      edges,
      isDirected,
      sourceNodeId: sourceId || nodes[0].id,
      targetNodeId: targetId || nodes[nodes.length - 1].id,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              ✏ Editor Interattivo del Grafo
            </h3>
            <p className="text-xs text-slate-400">
              Personalizza nodi, lati, pesi, capacità e flussi iniziali per i test didattici.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 text-lg"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Opzioni Generali Grafo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-semibold">
              <input
                type="checkbox"
                checked={isDirected}
                onChange={e => setIsDirected(e.target.checked)}
                className="w-4 h-4 accent-blue-500 rounded"
              />
              Grafo Orientato (Directed)
            </label>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Sorgente (s):</span>
              <select
                value={sourceId}
                onChange={e => setSourceId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              >
                <option value="">Seleziona...</option>
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>{n.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Pozzo / Dest. (t):</span>
              <select
                value={targetId}
                onChange={e => setTargetId(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
              >
                <option value="">Seleziona...</option>
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>{n.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Gestione Nodi */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs">
                Nodi del Grafo ({nodes.length})
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Etichetta nodo (es. 1, A, v1)"
                value={newNodeLabel}
                onChange={e => setNewNodeLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddNode()}
                className="bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-200 font-mono w-48 text-xs"
              />
              <button
                onClick={handleAddNode}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold shadow"
              >
                + Aggiungi Nodo
              </button>
            </div>

            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto p-2 bg-slate-950 rounded-lg border border-slate-800">
              {nodes.map(n => (
                <span
                  key={n.id}
                  className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded font-mono text-slate-200"
                >
                  <strong>{n.label}</strong>
                  {n.id === sourceId && <span className="text-[10px] text-emerald-400 font-bold">(s)</span>}
                  {n.id === targetId && <span className="text-[10px] text-rose-400 font-bold">(t)</span>}
                  <button
                    onClick={() => handleRemoveNode(n.id)}
                    className="text-slate-500 hover:text-rose-400 font-bold ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Gestione Lati */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-200 uppercase tracking-wider text-xs">
              Lati del Grafo ({edges.length})
            </h4>

            {/* Form Aggiunta Arco */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800 items-end">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Da (From)</label>
                <select
                  value={edgeFrom}
                  onChange={e => setEdgeFrom(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                >
                  <option value="">Nodo...</option>
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">A (To)</label>
                <select
                  value={edgeTo}
                  onChange={e => setEdgeTo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200"
                >
                  <option value="">Nodo...</option>
                  {nodes.map(n => (
                    <option key={n.id} value={n.id}>{n.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Peso / Costo</label>
                <input
                  type="number"
                  value={edgeWeight}
                  onChange={e => setEdgeWeight(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Capacità</label>
                <input
                  type="number"
                  min={1}
                  value={edgeCapacity}
                  onChange={e => setEdgeCapacity(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Flusso Iniziale</label>
                <input
                  type="number"
                  min={0}
                  value={edgeFlow}
                  onChange={e => setEdgeFlow(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-200 font-mono"
                />
              </div>

              <div>
                <button
                  onClick={handleAddEdge}
                  className="w-full px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded shadow"
                >
                  + Aggiungi Lato
                </button>
              </div>
            </div>

            {/* Lista Lati Esistenti */}
            <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-2 bg-slate-950 rounded-lg border border-slate-800">
              {edges.map(e => {
                const fromLabel = nodes.find(n => n.id === e.from)?.label ?? e.from;
                const toLabel = nodes.find(n => n.id === e.to)?.label ?? e.to;

                return (
                  <span
                    key={e.id}
                    className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-2.5 py-1 rounded font-mono text-slate-300"
                  >
                    <span>
                      ({fromLabel} {isDirected ? '→' : '—'} {toLabel})
                    </span>
                    <span className="text-amber-400 font-semibold">
                      [costo: {e.weight ?? 1}]
                    </span>
                    {isFlowAlgorithm && (
                      <span className="text-purple-300">
                        (f: {e.flow ?? 0} / c: {e.capacity ?? 10})
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoveEdge(e.id)}
                      className="text-slate-500 hover:text-rose-400 font-bold ml-1"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t border-slate-800 bg-slate-950/60">
          <button
            onClick={() => {
              setNodes([]);
              setEdges([]);
            }}
            className="px-3 py-1.5 bg-rose-950/80 border border-rose-800 hover:bg-rose-900 text-rose-200 rounded font-semibold text-xs"
          >
            Svuota Grafo
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-semibold text-xs"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold text-xs shadow-lg"
            >
              Salva e Applica al Visualizzatore
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
