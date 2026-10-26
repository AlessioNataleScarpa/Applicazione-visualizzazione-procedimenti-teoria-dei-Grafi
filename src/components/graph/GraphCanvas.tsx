import React, { useState, useRef } from 'react';
import { GraphData, NodeHighlightRole, EdgeHighlightRole } from '../../types/graph';

interface GraphCanvasProps {
  graph: GraphData;
  nodeRoles: Record<string, NodeHighlightRole>;
  edgeRoles: Record<string, EdgeHighlightRole>;
  edgeFlows?: Record<string, number>;
  onNodeMove?: (id: string, x: number, y: number) => void;
  isFlowAlgorithm?: boolean;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  graph,
  nodeRoles,
  edgeRoles,
  edgeFlows,
  onNodeMove,
  isFlowAlgorithm = false,
}) => {
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Calcolo colori nodi in base al ruolo
  const getNodeColor = (role?: NodeHighlightRole) => {
    switch (role) {
      case 'current':
        return { fill: '#f59e0b', stroke: '#fbbf24', text: '#1e293b' }; // Amber
      case 'candidate':
        return { fill: '#eab308', stroke: '#fde047', text: '#1e293b' }; // Yellow
      case 'visited':
        return { fill: '#3b82f6', stroke: '#60a5fa', text: '#ffffff' }; // Blue
      case 'source':
        return { fill: '#10b981', stroke: '#34d399', text: '#ffffff' }; // Emerald
      case 'target':
        return { fill: '#ef4444', stroke: '#f87171', text: '#ffffff' }; // Rose
      case 'cut-S':
        return { fill: '#06b6d4', stroke: '#22d3ee', text: '#ffffff' }; // Cyan (S)
      case 'cut-T':
        return { fill: '#f97316', stroke: '#fb923c', text: '#ffffff' }; // Orange (T)
      default:
        return { fill: '#1e293b', stroke: '#64748b', text: '#f8fafc' }; // Slate
    }
  };

  // Calcolo stile archi in base al ruolo
  const getEdgeStyle = (role?: EdgeHighlightRole) => {
    switch (role) {
      case 'tree':
        return { stroke: '#10b981', strokeWidth: 3.5, strokeDasharray: '' }; // Verde albero
      case 'augmenting':
        return { stroke: '#a855f7', strokeWidth: 4, strokeDasharray: '6 3' }; // Viola aumentante
      case 'candidate':
        return { stroke: '#f59e0b', strokeWidth: 3, strokeDasharray: '4 4' }; // Giallo esame
      case 'cut':
        return { stroke: '#ef4444', strokeWidth: 4, strokeDasharray: '5 5' }; // Rosso taglio
      case 'rejected':
        return { stroke: '#f43f5e', strokeWidth: 2, strokeDasharray: '2 2' }; // Scartato
      case 'relax':
        return { stroke: '#38bdf8', strokeWidth: 3, strokeDasharray: '' }; // Celeste relax
      default:
        return { stroke: '#475569', strokeWidth: 2, strokeDasharray: '' };
    }
  };

  // Drag and Drop dei nodi
  const handleMouseDownNode = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDraggingNodeId(id);
  };

  const handleMouseDownCanvas = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNodeId && svgRef.current && onNodeMove) {
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = (e.clientX - rect.left - pan.x) / zoom;
      const rawY = (e.clientY - rect.top - pan.y) / zoom;
      onNodeMove(draggingNodeId, Math.round(rawX), Math.round(rawY));
    } else if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    setZoom(prev => Math.min(Math.max(prev * zoomFactor, 0.4), 2.5));
  };

  const nodePos = new Map(graph.nodes.map(n => [n.id, { x: n.x, y: n.y }]));

  return (
    <div className="relative w-full h-[520px] bg-slate-950/80 rounded-xl border border-slate-800 overflow-hidden shadow-inner flex flex-col">
      {/* Barra strumenti zoom e reset */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 px-2.5 py-1.5 rounded-lg shadow backdrop-blur-sm text-xs text-slate-300">
        <button
          onClick={() => setZoom(z => Math.min(z * 1.15, 2.5))}
          className="p-1 hover:bg-slate-800 rounded font-bold"
          title="Zoom Avanti"
        >
          +
        </button>
        <span className="w-10 text-center font-mono">{Math.round(zoom * 100)}%</span>
        <button
          onClick={() => setZoom(z => Math.max(z * 0.85, 0.4))}
          className="p-1 hover:bg-slate-800 rounded font-bold"
          title="Zoom Indietro"
        >
          -
        </button>
        <button
          onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
          className="ml-1 px-2 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-[11px]"
        >
          Reset Vista
        </button>
      </div>

      {/* Legenda rapida in sovraimpressione */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-wrap gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg text-[11px] text-slate-400 backdrop-blur-sm pointer-events-none">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Albero/Sorgente</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Taglio S</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Taglio T</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Perno/Attivo</span>
      </div>

      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDownCanvas}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          {/* Frecce per archi orientati */}
          <marker
            id="arrow-default"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#64748b" />
          </marker>
          <marker
            id="arrow-tree"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
          </marker>
          <marker
            id="arrow-augmenting"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#a855f7" />
          </marker>
          <marker
            id="arrow-cut"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#ef4444" />
          </marker>
          <marker
            id="arrow-candidate"
            viewBox="0 0 10 10"
            refX="22"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Disegno Archi */}
          {graph.edges.map(e => {
            const p1 = nodePos.get(e.from);
            const p2 = nodePos.get(e.to);
            if (!p1 || !p2) return null;

            const role = edgeRoles[e.id];
            const style = getEdgeStyle(role);
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2;

            // Seleziona il marker freccia corretto per grafi orientati
            let markerId = 'url(#arrow-default)';
            if (role === 'tree') markerId = 'url(#arrow-tree)';
            else if (role === 'augmenting') markerId = 'url(#arrow-augmenting)';
            else if (role === 'cut') markerId = 'url(#arrow-cut)';
            else if (role === 'candidate') markerId = 'url(#arrow-candidate)';

            // Testo etichetta arco (peso o flusso/capacità)
            let labelText = '';
            if (isFlowAlgorithm) {
              const currentFlow = edgeFlows?.[e.id] ?? e.flow ?? 0;
              const cap = e.capacity ?? e.weight ?? 0;
              labelText = `${currentFlow} / ${cap}`;
            } else if (e.weight !== undefined) {
              labelText = `${e.weight}`;
            }

            return (
              <g key={e.id} className="transition-all duration-300">
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  strokeDasharray={style.strokeDasharray}
                  markerEnd={graph.isDirected ? markerId : undefined}
                />
                {labelText && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-18"
                      y="-11"
                      width="36"
                      height="20"
                      rx="4"
                      fill="#0f172a"
                      stroke={style.stroke}
                      strokeWidth="1.2"
                      opacity="0.9"
                    />
                    <text
                      y="3.5"
                      textAnchor="middle"
                      fill="#f1f5f9"
                      fontSize="11"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      {labelText}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Disegno Nodi */}
          {graph.nodes.map(n => {
            const role = nodeRoles[n.id];
            const colors = getNodeColor(role);

            return (
              <g
                key={n.id}
                transform={`translate(${n.x}, ${n.y})`}
                onMouseDown={(e) => handleMouseDownNode(e, n.id)}
                className="cursor-move group"
              >
                {/* Glow ring per nodi selezionati o attivi */}
                {(role === 'current' || role === 'source' || role === 'cut-S') && (
                  <circle
                    r="24"
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth="3"
                    className="animate-ping opacity-30"
                  />
                )}
                
                <circle
                  r="19"
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={role ? '3' : '2'}
                  className="transition-colors duration-200 shadow-md group-hover:scale-105"
                />
                <text
                  y="4.5"
                  textAnchor="middle"
                  fill={colors.text}
                  fontSize="13"
                  fontWeight="bold"
                  className="pointer-events-none"
                >
                  {n.label}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
