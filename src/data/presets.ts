import { GraphData } from '../types/graph';

export interface GraphPreset {
  id: string;
  title: string;
  description: string;
  category: 'mst' | 'paths' | 'flow';
  graph: GraphData;
}

export const GRAPH_PRESETS: GraphPreset[] = [
  {
    id: 'mst-standard',
    title: 'Grafo Esempio MST (6 Nodi, 9 Lati)',
    description: 'Grafo non orientato standard per il calcolo del Minimo Albero Ricoprente con Kruskal e Prim.',
    category: 'mst',
    graph: {
      isDirected: false,
      nodes: [
        { id: '1', label: '1', x: 120, y: 180 },
        { id: '2', label: '2', x: 280, y: 80 },
        { id: '3', label: '3', x: 440, y: 80 },
        { id: '4', label: '4', x: 600, y: 180 },
        { id: '5', label: '5', x: 440, y: 280 },
        { id: '6', label: '6', x: 280, y: 280 },
      ],
      edges: [
        { id: 'e1', from: '1', to: '2', weight: 4 },
        { id: 'e2', from: '1', to: '6', weight: 2 },
        { id: 'e3', from: '2', to: '3', weight: 6 },
        { id: 'e4', from: '2', to: '6', weight: 5 },
        { id: 'e5', from: '3', to: '4', weight: 3 },
        { id: 'e6', from: '3', to: '5', weight: 1 },
        { id: 'e7', from: '4', to: '5', weight: 2 },
        { id: 'e8', from: '5', to: '6', weight: 4 },
        { id: 'e9', from: '2', to: '5', weight: 3 },
      ]
    }
  },
  {
    id: 'dijkstra-standard',
    title: 'Rete Stradale Dijkstra (5 Nodi)',
    description: 'Grafo orientato pesato per verificare la convergenza di Dijkstra (versione efficiente vs non efficiente).',
    category: 'paths',
    graph: {
      isDirected: true,
      sourceNodeId: 'A',
      nodes: [
        { id: 'A', label: 'A', x: 120, y: 180 },
        { id: 'B', label: 'B', x: 300, y: 90 },
        { id: 'C', label: 'C', x: 300, y: 270 },
        { id: 'D', label: 'D', x: 500, y: 90 },
        { id: 'E', label: 'E', x: 500, y: 270 },
      ],
      edges: [
        { id: 'e1', from: 'A', to: 'B', weight: 10 },
        { id: 'e2', from: 'A', to: 'C', weight: 5 },
        { id: 'e3', from: 'B', to: 'C', weight: 2 },
        { id: 'e4', from: 'B', to: 'D', weight: 1 },
        { id: 'e5', from: 'C', to: 'B', weight: 3 },
        { id: 'e6', from: 'C', to: 'D', weight: 9 },
        { id: 'e7', from: 'C', to: 'E', weight: 2 },
        { id: 'e8', from: 'D', to: 'E', weight: 4 },
        { id: 'e9', from: 'E', to: 'D', weight: 6 },
      ]
    }
  },
  {
    id: 'floyd-standard',
    title: 'Grafo Floyd-Warshall (4 Nodi con Matrici)',
    description: 'Grafo compatto ideale per seguire visivamente riga, colonna e perno k nelle matrici D e pred.',
    category: 'paths',
    graph: {
      isDirected: true,
      nodes: [
        { id: '1', label: '1', x: 200, y: 100 },
        { id: '2', label: '2', x: 450, y: 100 },
        { id: '3', label: '3', x: 450, y: 280 },
        { id: '4', label: '4', x: 200, y: 280 },
      ],
      edges: [
        { id: 'e1', from: '1', to: '2', weight: 3 },
        { id: 'e2', from: '1', to: '4', weight: 7 },
        { id: 'e3', from: '2', to: '1', weight: 8 },
        { id: 'e4', from: '2', to: '3', weight: 2 },
        { id: 'e5', from: '3', to: '1', weight: 5 },
        { id: 'e6', from: '3', to: '4', weight: 1 },
        { id: 'e7', from: '4', to: '1', weight: 2 },
      ]
    }
  },
  {
    id: 'flow-standard',
    title: 'Rete di Flusso Classica (6 Nodi, con Flusso Iniziale Ammissibile)',
    description: 'Rete con sorgente s, pozzo t, capacità e un flusso iniziale ammissibile impostato.',
    category: 'flow',
    graph: {
      isDirected: true,
      sourceNodeId: 's',
      targetNodeId: 't',
      nodes: [
        { id: 's', label: 's', x: 120, y: 180 },
        { id: 'u', label: 'u', x: 280, y: 90 },
        { id: 'v', label: 'v', x: 280, y: 270 },
        { id: 'w', label: 'w', x: 460, y: 90 },
        { id: 'z', label: 'z', x: 460, y: 270 },
        { id: 't', label: 't', x: 620, y: 180 },
      ],
      edges: [
        { id: 'e1', from: 's', to: 'u', capacity: 10, flow: 4 },
        { id: 'e2', from: 's', to: 'v', capacity: 10, flow: 0 },
        { id: 'e3', from: 'u', to: 'v', capacity: 2, flow: 0 },
        { id: 'e4', from: 'u', to: 'w', capacity: 4, flow: 4 },
        { id: 'e5', from: 'u', to: 'z', capacity: 8, flow: 0 },
        { id: 'e6', from: 'v', to: 'z', capacity: 9, flow: 0 },
        { id: 'e7', from: 'w', to: 't', capacity: 10, flow: 4 },
        { id: 'e8', from: 'z', to: 't', capacity: 10, flow: 0 },
        { id: 'e9', from: 'z', to: 'w', capacity: 6, flow: 0 },
      ]
    }
  },
  {
    id: 'flow-inadmissible-demo',
    title: 'Rete con Flusso Iniziale NON Ammissibile (Demo Reset a 0)',
    description: 'Rete con flusso iniziale non conservativo al nodo u: dimostra il reset automatico a 0 richiesto dalle specifiche.',
    category: 'flow',
    graph: {
      isDirected: true,
      sourceNodeId: 's',
      targetNodeId: 't',
      nodes: [
        { id: 's', label: 's', x: 140, y: 180 },
        { id: 'u', label: 'u', x: 340, y: 100 },
        { id: 'v', label: 'v', x: 340, y: 260 },
        { id: 't', label: 't', x: 540, y: 180 },
      ],
      edges: [
        { id: 'e1', from: 's', to: 'u', capacity: 10, flow: 8 },
        { id: 'e2', from: 's', to: 'v', capacity: 5, flow: 2 },
        // Nodo u ha flusso entrante 8 ma uscente 4 (violazione di conservazione!)
        { id: 'e3', from: 'u', to: 't', capacity: 10, flow: 4 },
        { id: 'e4', from: 'v', to: 't', capacity: 8, flow: 2 },
      ]
    }
  }
];
