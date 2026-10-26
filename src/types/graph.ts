export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  weight?: number; // Costo per MST e Cammini Minimi
  capacity?: number; // Capacità per Flussi
  flow?: number; // Flusso iniziale o corrente per Flussi
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  isDirected: boolean;
  sourceNodeId?: string;
  targetNodeId?: string;
}

export type NodeHighlightRole = 
  | 'default' 
  | 'current' 
  | 'candidate' 
  | 'visited' 
  | 'source' 
  | 'target' 
  | 'cut-S' 
  | 'cut-T';

export type EdgeHighlightRole = 
  | 'default' 
  | 'tree' 
  | 'candidate' 
  | 'rejected' 
  | 'augmenting' 
  | 'cut' 
  | 'relax';

export interface AlgorithmStep {
  stepNumber: number;
  phase: string;
  description: string;
  pseudocodeLine?: number;
  
  // Highlight visivi per il grafo
  nodeRoles: Record<string, NodeHighlightRole>;
  edgeRoles: Record<string, EdgeHighlightRole>;

  // Dati didattici
  treeEdges?: string[]; // IDs degli archi nell'albero T
  sets?: {
    S?: string[];
    S_bar?: string[];
    T?: string[]; // elenco lati nell'albero
    [key: string]: string[] | undefined;
  };
  
  arrays?: {
    COMP?: Record<string, string>;
    V?: Record<string, number>;
    C?: Record<string, number | string>;
    D?: Record<string, number | string>;
    pred?: Record<string, string>;
    [key: string]: Record<string, any> | undefined;
  };

  sortedEdges?: {
    id: string;
    from: string;
    to: string;
    weight: number;
    status: 'pending' | 'considered' | 'accepted' | 'rejected';
  }[];
  
  // Specifico per Floyd-Warshall
  matrices?: {
    nodeLabels: string[];
    k: number; // Iterazione k (da 0 a n)
    currentI?: number;
    currentJ?: number;
    D: (number | string)[][];
    pred: (number | string)[][];
    cellUpdated?: { i: number; j: number };
    formulaExplanation?: string;
  };

  // Specifico per Ford-Fulkerson Max Flow - Min Cut
  flowState?: {
    currentFlowTotal: number;
    isAdmissible: boolean;
    admissibilityNote?: string;
    edgeFlows: Record<string, number>; // edgeId -> flow
    residualEdges: {
      from: string;
      to: string;
      residualCapacity: number;
      isBackward: boolean;
      originalEdgeId: string;
    }[];
    augmentingPath?: string[]; // Sequenza di nodi nel cammino s -> t
    augmentingEdges?: string[]; // Sequenza di archi residui
    bottleneckDelta?: number;
    isTerminated: boolean;
    minCut?: {
      S: string[]; // Raggiungibili da s nella rete residua
      T: string[]; // V \ S
      cutEdges: { from: string; to: string; capacity: number }[];
      maxFlowValue: number;
      minCutCapacity: number;
    };
  };
}

export type AlgorithmType =
  | 'kruskal'
  | 'prim_inefficient'
  | 'prim_efficient'
  | 'dijkstra_inefficient'
  | 'dijkstra_efficient'
  | 'floyd_warshall'
  | 'ford_fulkerson';
