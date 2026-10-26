import { useState, useEffect, useMemo, useCallback } from 'react';
import { AlgorithmType, GraphData, AlgorithmStep } from './types/graph';
import { GRAPH_PRESETS } from './data/presets';
import { runKruskal } from './algorithms/mst/kruskal';
import { runPrimInefficient } from './algorithms/mst/primInefficient';
import { runPrimEfficient } from './algorithms/mst/primEfficient';
import { runDijkstraInefficient } from './algorithms/paths/dijkstraInefficient';
import { runDijkstraEfficient } from './algorithms/paths/dijkstraEfficient';
import { runFloydWarshall } from './algorithms/paths/floydWarshall';
import { runFordFulkerson } from './algorithms/flow/fordFulkerson';
import { GraphCanvas } from './components/graph/GraphCanvas';
import { PlaybackControls } from './components/controls/PlaybackControls';
import { SetsInspectorView } from './components/inspector/SetsInspectorView';
import { FloydMatricesView } from './components/inspector/FloydMatricesView';
import { FlowCutView } from './components/inspector/FlowCutView';
import { PseudocodePanel } from './components/pseudocode/PseudocodePanel';
import { GraphEditorModal } from './components/editor/GraphEditorModal';

export function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmType>('kruskal');
  const [currentGraph, setCurrentGraph] = useState<GraphData>(GRAPH_PRESETS[0].graph);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(1200);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);

  // Determina quale preset impostare di default al cambio categoria di algoritmo
  const handleAlgorithmChange = (algo: AlgorithmType) => {
    setSelectedAlgorithm(algo);
    setIsPlaying(false);
    setCurrentStepIndex(0);

    // Suggerisce un preset ottimale per l'algoritmo scelto se non già compatibile
    if (algo === 'ford_fulkerson') {
      setCurrentGraph(GRAPH_PRESETS.find(p => p.id === 'flow-standard')!.graph);
    } else if (algo === 'floyd_warshall') {
      setCurrentGraph(GRAPH_PRESETS.find(p => p.id === 'floyd-standard')!.graph);
    } else if (algo.startsWith('dijkstra')) {
      setCurrentGraph(GRAPH_PRESETS.find(p => p.id === 'dijkstra-standard')!.graph);
    } else if (algo.startsWith('prim') || algo === 'kruskal') {
      setCurrentGraph(GRAPH_PRESETS.find(p => p.id === 'mst-standard')!.graph);
    }
  };

  // Esecuzione dell'algoritmo corrente e generazione degli step
  const steps: AlgorithmStep[] = useMemo(() => {
    switch (selectedAlgorithm) {
      case 'kruskal':
        return runKruskal(currentGraph);
      case 'prim_inefficient':
        return runPrimInefficient(currentGraph, currentGraph.sourceNodeId);
      case 'prim_efficient':
        return runPrimEfficient(currentGraph, currentGraph.sourceNodeId);
      case 'dijkstra_inefficient':
        return runDijkstraInefficient(currentGraph, currentGraph.sourceNodeId);
      case 'dijkstra_efficient':
        return runDijkstraEfficient(currentGraph, currentGraph.sourceNodeId);
      case 'floyd_warshall':
        return runFloydWarshall(currentGraph);
      case 'ford_fulkerson':
        return runFordFulkerson(currentGraph, currentGraph.sourceNodeId, currentGraph.targetNodeId);
      default:
        return [];
    }
  }, [selectedAlgorithm, currentGraph]);

  const activeStep = steps[currentStepIndex] || {
    stepNumber: 0,
    phase: 'Pronto',
    description: 'Nessun dato di step disponibile.',
    nodeRoles: {},
    edgeRoles: {},
  };

  // Autoplay timer
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, speedMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, speedMs, steps.length]);

  // Gestione posizionamento nodi con drag and drop
  const handleNodeMove = useCallback((id: string, x: number, y: number) => {
    setCurrentGraph(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => (n.id === id ? { ...n, x, y } : n)),
    }));
  }, []);

  const isFlow = selectedAlgorithm === 'ford_fulkerson';
  const isFloyd = selectedAlgorithm === 'floyd_warshall';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header & Navigation */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 font-mono font-bold text-lg text-white">
              G
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Visualizzatore Algoritmi Teoria dei Grafi
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Didattico
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Visualizzazione rigorosa iterazione per iterazione con insiemi, matrici e tagli
              </p>
            </div>
          </div>

          {/* Preset Selector & Editor Trigger */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs">
              <span className="text-slate-400">Preset:</span>
              <select
                onChange={(e) => {
                  const preset = GRAPH_PRESETS.find(p => p.id === e.target.value);
                  if (preset) {
                    setCurrentGraph(preset.graph);
                    setCurrentStepIndex(0);
                    setIsPlaying(false);
                  }
                }}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                {GRAPH_PRESETS.map(p => (
                  <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsEditorOpen(true)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow"
            >
              ✏ Modifica Grafo
            </button>
          </div>
        </div>

        {/* Algorithm Tabs */}
        <div className="max-w-7xl mx-auto mt-4 flex flex-wrap gap-2 border-t border-slate-800/80 pt-3">
          {/* Categoria MST */}
          <div className="flex items-center bg-slate-950/70 p-1 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-2 select-none">
              Albero Ricoprente:
            </span>
            <button
              onClick={() => handleAlgorithmChange('kruskal')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                selectedAlgorithm === 'kruskal'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Kruskal (COMP)
            </button>
            <button
              onClick={() => handleAlgorithmChange('prim_inefficient')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                selectedAlgorithm === 'prim_inefficient'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Prim [S, S̄] O(n³)
            </button>
            <button
              onClick={() => handleAlgorithmChange('prim_efficient')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                selectedAlgorithm === 'prim_efficient'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Prim (V, C) O(n²)
            </button>
          </div>

          {/* Categoria Cammini Minimi */}
          <div className="flex items-center bg-slate-950/70 p-1 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-2 select-none">
              Cammini Minimi:
            </span>
            <button
              onClick={() => handleAlgorithmChange('dijkstra_inefficient')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                selectedAlgorithm === 'dijkstra_inefficient'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dijkstra [S, S̄]⁺ O(n³)
            </button>
            <button
              onClick={() => handleAlgorithmChange('dijkstra_efficient')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                selectedAlgorithm === 'dijkstra_efficient'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dijkstra (V, D, pred) O(n²)
            </button>
            <button
              onClick={() => handleAlgorithmChange('floyd_warshall')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                selectedAlgorithm === 'floyd_warshall'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Floyd-Warshall (D, pred)
            </button>
          </div>

          {/* Categoria Flussi */}
          <div className="flex items-center bg-slate-950/70 p-1 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-2 select-none">
              Flusso Massimo:
            </span>
            <button
              onClick={() => handleAlgorithmChange('ford_fulkerson')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                selectedAlgorithm === 'ford_fulkerson'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ford-Fulkerson (Max Flow - Min Cut)
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto w-full p-6 flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Colonna Sinistra (7 colonne su 12): Canvas e Controller Playback */}
        <section className="xl:col-span-7 flex flex-col gap-5">
          {/* Card Canvas */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
                <h2 className="text-sm font-bold text-slate-200">
                  Visualizzazione Grafo &amp; Stato Iterazione
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {currentGraph.nodes.length} Nodi | {currentGraph.edges.length} Lati | {currentGraph.isDirected ? 'Orientato' : 'Non Orientato'}
              </span>
            </div>

            <GraphCanvas
              graph={currentGraph}
              nodeRoles={activeStep.nodeRoles}
              edgeRoles={activeStep.edgeRoles}
              edgeFlows={activeStep.flowState?.edgeFlows}
              onNodeMove={handleNodeMove}
              isFlowAlgorithm={isFlow}
            />
          </div>

          {/* Player di Avanzamento */}
          <PlaybackControls
            currentStepIndex={currentStepIndex}
            totalSteps={steps.length}
            isPlaying={isPlaying}
            speedMs={speedMs}
            onPlayPause={() => setIsPlaying(p => !p)}
            onNext={() => setCurrentStepIndex(i => Math.min(i + 1, steps.length - 1))}
            onPrev={() => setCurrentStepIndex(i => Math.max(i - 1, 0))}
            onFirst={() => setCurrentStepIndex(0)}
            onLast={() => setCurrentStepIndex(steps.length - 1)}
            onSeek={(idx) => setCurrentStepIndex(idx)}
            onSpeedChange={(s) => setSpeedMs(s)}
            currentStepDescription={activeStep.description}
            currentStepPhase={activeStep.phase}
          />
        </section>

        {/* Colonna Destra (5 colonne su 12): Ispettori Dati e Pseudocodice */}
        <section className="xl:col-span-5 flex flex-col gap-5">
          {/* Ispettore Specifico per Algoritmo */}
          {isFloyd && (
            <FloydMatricesView step={activeStep} />
          )}

          {isFlow && (
            <FlowCutView step={activeStep} />
          )}

          {!isFloyd && !isFlow && (
            <SetsInspectorView step={activeStep} />
          )}

          {/* Pannello Pseudocodice con linea attiva */}
          <div className="flex-1 min-h-[300px]">
            <PseudocodePanel
              algorithmType={selectedAlgorithm}
              activeLine={activeStep.pseudocodeLine}
            />
          </div>
        </section>
      </main>

      {/* Footer informativo */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-3 px-6 text-center text-xs text-slate-500">
        Applicazione di Teoria dei Grafi per la visualizzazione dei procedimenti iterativi • Conforme a <span className="font-mono text-slate-400">Algoritmi.md</span>
      </footer>

      {/* Modal Editor Grafo */}
      <GraphEditorModal
        graph={currentGraph}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={(newGraph) => {
          setCurrentGraph(newGraph);
          setCurrentStepIndex(0);
          setIsPlaying(false);
        }}
        isFlowAlgorithm={isFlow}
      />
    </div>
  );
}

export default App;
