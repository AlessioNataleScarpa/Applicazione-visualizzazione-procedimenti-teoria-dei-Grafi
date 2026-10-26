import { describe, it, expect } from 'vitest';
import { runKruskal } from '../algorithms/mst/kruskal';
import { runPrimInefficient } from '../algorithms/mst/primInefficient';
import { runPrimEfficient } from '../algorithms/mst/primEfficient';
import { runDijkstraInefficient } from '../algorithms/paths/dijkstraInefficient';
import { runDijkstraEfficient } from '../algorithms/paths/dijkstraEfficient';
import { runFloydWarshall } from '../algorithms/paths/floydWarshall';
import { runFordFulkerson } from '../algorithms/flow/fordFulkerson';
import { GraphData } from '../types/graph';

describe('Test di Robustezza & Casi Limite (Edge Cases)', () => {

  it('Kruskal scarta correttamente i lati che formano cicli', () => {
    // Grafo a 4 nodi con ciclo tra 1, 2, 3 prima di collegare il nodo 4
    const cycleGraph: GraphData = {
      isDirected: false,
      nodes: [
        { id: '1', label: '1', x: 0, y: 0 },
        { id: '2', label: '2', x: 0, y: 0 },
        { id: '3', label: '3', x: 0, y: 0 },
        { id: '4', label: '4', x: 0, y: 0 },
      ],
      edges: [
        { id: 'e1', from: '1', to: '2', weight: 1 },
        { id: 'e2', from: '2', to: '3', weight: 2 },
        { id: 'e3', from: '1', to: '3', weight: 3 }, // Forma ciclo tra 1, 2, 3!
        { id: 'e4', from: '3', to: '4', weight: 4 }, // Collega il nodo 4
      ]
    };

    const steps = runKruskal(cycleGraph);
    const finalStep = steps[steps.length - 1];

    // Lati accettati devono essere 3 (n-1 = 4-1)
    expect(finalStep.treeEdges?.length).toBe(3);
    expect(finalStep.treeEdges).toContain('e1');
    expect(finalStep.treeEdges).toContain('e2');
    expect(finalStep.treeEdges).toContain('e4');
    expect(finalStep.treeEdges).not.toContain('e3');

    // Verifica che ci sia uno step di scarto esplicito per e3
    const rejectStep = steps.find(s => s.phase.includes('Scarto'));
    expect(rejectStep).toBeDefined();
  });

  it('Prim gestisce grafi sconnessi terminando senza crash', () => {
    const disconnectedGraph: GraphData = {
      isDirected: false,
      nodes: [
        { id: '1', label: '1', x: 0, y: 0 },
        { id: '2', label: '2', x: 0, y: 0 },
        { id: '3', label: '3', x: 0, y: 0 }, // Isolato
      ],
      edges: [
        { id: 'e1', from: '1', to: '2', weight: 5 },
      ]
    };

    const ineffSteps = runPrimInefficient(disconnectedGraph, '1');
    const effSteps = runPrimEfficient(disconnectedGraph, '1');

    expect(ineffSteps.length).toBeGreaterThan(0);
    expect(effSteps.length).toBeGreaterThan(0);

    const lastIneff = ineffSteps[ineffSteps.length - 1];
    const lastEff = effSteps[effSteps.length - 1];

    expect(lastIneff.treeEdges?.length).toBe(1);
    expect(lastEff.treeEdges?.length).toBe(1);
  });

  it('Dijkstra gestisce nodi non raggiungibili con distanza ∞', () => {
    const unreachableGraph: GraphData = {
      isDirected: true,
      nodes: [
        { id: 'A', label: 'A', x: 0, y: 0 },
        { id: 'B', label: 'B', x: 0, y: 0 },
        { id: 'C', label: 'C', x: 0, y: 0 }, // Nessun arco verso C
      ],
      edges: [
        { id: 'e1', from: 'A', to: 'B', weight: 4 },
      ]
    };

    const ineffSteps = runDijkstraInefficient(unreachableGraph, 'A');
    const effSteps = runDijkstraEfficient(unreachableGraph, 'A');

    const lastIneff = ineffSteps[ineffSteps.length - 1];
    const lastEff = effSteps[effSteps.length - 1];

    expect(lastIneff.arrays?.D?.['C']).toBe('∞');
    expect(lastEff.arrays?.D?.['C']).toBe('∞');
  });

  it('Ford-Fulkerson gestisce archi all\'indietro nella rete residua (residual backward edges)', () => {
    // Grafo classico che forza l'uso di un arco all'indietro
    const flowGraph: GraphData = {
      isDirected: true,
      nodes: [
        { id: 's', label: 's', x: 0, y: 0 },
        { id: 'a', label: 'a', x: 0, y: 0 },
        { id: 'b', label: 'b', x: 0, y: 0 },
        { id: 't', label: 't', x: 0, y: 0 },
      ],
      edges: [
        { id: 'e1', from: 's', to: 'a', capacity: 1, flow: 0 },
        { id: 'e2', from: 's', to: 'b', capacity: 1, flow: 0 },
        { id: 'e3', from: 'a', to: 'b', capacity: 1, flow: 0 },
        { id: 'e4', from: 'a', to: 't', capacity: 1, flow: 0 },
        { id: 'e5', from: 'b', to: 't', capacity: 1, flow: 0 },
      ]
    };

    const steps = runFordFulkerson(flowGraph, 's', 't');
    const finalStep = steps[steps.length - 1];

    expect(finalStep.flowState?.minCut?.maxFlowValue).toBe(2);
    expect(finalStep.flowState?.minCut?.minCutCapacity).toBe(2);
  });

  it('Floyd-Warshall aggiorna correttamente i cammini intermedi k', () => {
    const lineGraph: GraphData = {
      isDirected: true,
      nodes: [
        { id: '1', label: '1', x: 0, y: 0 },
        { id: '2', label: '2', x: 0, y: 0 },
        { id: '3', label: '3', x: 0, y: 0 },
      ],
      edges: [
        { id: 'e1', from: '1', to: '2', weight: 3 },
        { id: 'e2', from: '2', to: '3', weight: 4 },
      ]
    };

    const steps = runFloydWarshall(lineGraph);
    const finalStep = steps[steps.length - 1];

    // Distanza da 1 a 3 deve essere 3 + 4 = 7
    expect(finalStep.matrices?.D[0][2]).toBe(7);
    // Predecessore di 3 sul cammino da 1 deve essere 2
    expect(finalStep.matrices?.pred[0][2]).toBe('2');
  });

});
