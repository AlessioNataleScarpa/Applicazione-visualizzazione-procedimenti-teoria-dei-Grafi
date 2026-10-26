import { describe, it, expect } from 'vitest';
import { runKruskal } from '../algorithms/mst/kruskal';
import { runPrimInefficient } from '../algorithms/mst/primInefficient';
import { runPrimEfficient } from '../algorithms/mst/primEfficient';
import { runDijkstraInefficient } from '../algorithms/paths/dijkstraInefficient';
import { runDijkstraEfficient } from '../algorithms/paths/dijkstraEfficient';
import { runFloydWarshall } from '../algorithms/paths/floydWarshall';
import { runFordFulkerson } from '../algorithms/flow/fordFulkerson';
import { GRAPH_PRESETS } from '../data/presets';

describe('Gruppo 4: QA, Validazione & Testing Algoritmi di Teoria dei Grafi', () => {

  describe('1. Minimo Albero Ricoprente (MST)', () => {
    const mstGraph = GRAPH_PRESETS.find(p => p.id === 'mst-standard')!.graph;

    it('Kruskal trova un albero con n-1 lati e peso corretto', () => {
      const steps = runKruskal(mstGraph);
      expect(steps.length).toBeGreaterThan(1);
      const finalStep = steps[steps.length - 1];
      expect(finalStep.treeEdges?.length).toBe(mstGraph.nodes.length - 1);
      
      // Calcola costo totale lati selezionati
      const totalWeight = mstGraph.edges
        .filter(e => finalStep.treeEdges?.includes(e.id))
        .reduce((sum, e) => sum + (e.weight ?? 0), 0);
      
      // Per il nostro grafo standard, il costo minimo atteso è 12
      expect(totalWeight).toBe(12);
    });

    it('Prim Non Efficiente e Prim Efficiente calcolano lo stesso costo ottimo di Kruskal', () => {
      const kruskalFinal = runKruskal(mstGraph).slice(-1)[0];
      const primIneffFinal = runPrimInefficient(mstGraph).slice(-1)[0];
      const primEffFinal = runPrimEfficient(mstGraph).slice(-1)[0];

      const getCost = (treeEdgeIds: string[] = []) =>
        mstGraph.edges
          .filter(e => treeEdgeIds.includes(e.id))
          .reduce((sum, e) => sum + (e.weight ?? 0), 0);

      const costKruskal = getCost(kruskalFinal.treeEdges);
      const costPrimIneff = getCost(primIneffFinal.treeEdges);
      const costPrimEff = getCost(primEffFinal.treeEdges);

      expect(costPrimIneff).toBe(costKruskal);
      expect(costPrimEff).toBe(costKruskal);
    });
  });

  describe('2. Cammini Minimi', () => {
    const dijkstraGraph = GRAPH_PRESETS.find(p => p.id === 'dijkstra-standard')!.graph;

    it('Dijkstra Non Efficiente ed Efficiente calcolano le stesse distanze dalla sorgente', () => {
      const ineffSteps = runDijkstraInefficient(dijkstraGraph, 'A');
      const effSteps = runDijkstraEfficient(dijkstraGraph, 'A');

      const ineffFinal = ineffSteps[ineffSteps.length - 1];
      const effFinal = effSteps[effSteps.length - 1];

      expect(ineffFinal.arrays?.D).toBeDefined();
      expect(effFinal.arrays?.D).toBeDefined();

      // Verifica distanze identiche per tutti i nodi
      for (const node of dijkstraGraph.nodes) {
        expect(ineffFinal.arrays?.D?.[node.label]).toBe(effFinal.arrays?.D?.[node.label]);
      }
    });

    it('Floyd-Warshall genera le due matrici D e pred ad ogni passo k', () => {
      const floydGraph = GRAPH_PRESETS.find(p => p.id === 'floyd-standard')!.graph;
      const steps = runFloydWarshall(floydGraph);

      // Ci devono essere n + 2 step (k=0, poi k=1..n, poi step finale)
      expect(steps.length).toBe(floydGraph.nodes.length + 2);

      // Ogni step ha matrici D e pred valide
      for (const step of steps) {
        expect(step.matrices).toBeDefined();
        expect(step.matrices?.D.length).toBe(floydGraph.nodes.length);
        expect(step.matrices?.pred.length).toBe(floydGraph.nodes.length);
      }
    });
  });

  describe('3. Max Flow - Min Cut (Ford-Fulkerson)', () => {
    const flowGraph = GRAPH_PRESETS.find(p => p.id === 'flow-standard')!.graph;
    const inadmissibleGraph = GRAPH_PRESETS.find(p => p.id === 'flow-inadmissible-demo')!.graph;

    it('Verifica Teorema Max Flow - Min Cut: Flusso Massimo = Capacità Taglio Minimo', () => {
      const steps = runFordFulkerson(flowGraph, 's', 't');
      const finalStep = steps[steps.length - 1];

      expect(finalStep.flowState).toBeDefined();
      expect(finalStep.flowState?.isTerminated).toBe(true);
      
      const maxFlow = finalStep.flowState?.minCut?.maxFlowValue;
      const minCutCap = finalStep.flowState?.minCut?.minCutCapacity;

      expect(maxFlow).toBeGreaterThan(0);
      expect(maxFlow).toBe(minCutCap);
    });

    it('Reimposta a 0 i flussi iniziali se non ammissibili come da specifica', () => {
      const steps = runFordFulkerson(inadmissibleGraph, 's', 't');
      const firstStep = steps[0];

      expect(firstStep.flowState?.isAdmissible).toBe(false);
      // I flussi iniziali devono essere stati azzerati
      for (const edgeId of Object.keys(firstStep.flowState?.edgeFlows || {})) {
        expect(firstStep.flowState?.edgeFlows[edgeId]).toBe(0);
      }
    });
  });

});
