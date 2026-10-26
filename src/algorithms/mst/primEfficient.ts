import { AlgorithmStep, GraphData } from '../../types/graph';

export function runPrimEfficient(graph: GraphData, startNodeId?: string): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const nodes = graph.nodes;
  const n = nodes.length;

  if (n === 0) return steps;

  const nodeMap = new Map(nodes.map(nd => [nd.id, nd.label]));
  const s0 = startNodeId && nodes.some(nd => nd.id === startNodeId) 
    ? startNodeId 
    : nodes[0].id;

  // Costruisci matrice dei costi H[u, v]
  const H: Record<string, Record<string, number>> = {};
  const edgeLookup: Record<string, Record<string, string>> = {};

  nodes.forEach(u => {
    H[u.id] = {};
    edgeLookup[u.id] = {};
    nodes.forEach(v => {
      H[u.id][v.id] = u.id === v.id ? 0 : Infinity;
    });
  });

  graph.edges.forEach(e => {
    const w = e.weight ?? 1;
    if (w < H[e.from][e.to]) {
      H[e.from][e.to] = w;
      edgeLookup[e.from][e.to] = e.id;
    }
    if (!graph.isDirected) {
      if (w < H[e.to][e.from]) {
        H[e.to][e.from] = w;
        edgeLookup[e.to][e.from] = e.id;
      }
    }
  });

  // Inizializzazione:
  // T = ∅; V[i] = 0, ∀i; V[1] = 1; C[i] = H[1, i], ∀i;
  const V: Record<string, number> = {};
  const C: Record<string, number | string> = {};
  const parent: Record<string, string | null> = {};

  nodes.forEach(nd => {
    V[nd.id] = 0;
    const cost = H[s0][nd.id];
    C[nd.id] = cost === Infinity ? '∞' : cost;
    parent[nd.id] = cost < Infinity ? s0 : null;
  });

  V[s0] = 1;
  const T: string[] = [];
  const treeEdgeLabels: string[] = [];

  const formatArrays = () => ({
    V: Object.fromEntries(nodes.map(nd => [nd.label, V[nd.id]])),
    C: Object.fromEntries(nodes.map(nd => [nd.label, C[nd.id]])),
    pred: Object.fromEntries(nodes.map(nd => [nd.label, parent[nd.id] ? (nodeMap.get(parent[nd.id]!) ?? parent[nd.id]!) : '-'])),
  });

  // Snapshot 1: Inizializzazione
  steps.push({
    stepNumber: 1,
    phase: 'Inizializzazione',
    description: `Prim Efficiente O(n²): Radice = ${nodeMap.get(s0)}. Inizializzati vettori V (con V[${nodeMap.get(s0)}]=1) e C[i] = H[${nodeMap.get(s0)}, i]. T = ∅.`,
    pseudocodeLine: 2,
    nodeRoles: {
      [s0]: 'visited',
      ...Object.fromEntries(nodes.filter(nd => nd.id !== s0).map(nd => [nd.id, 'default'])),
    },
    edgeRoles: {},
    treeEdges: [...T],
    sets: { T: [] },
    arrays: formatArrays(),
  });

  let stepCount = 2;

  // Ciclo principale: while (|T| < n - 1)
  while (T.length < n - 1) {
    // Trova vertice k che minimizza i costi in C ∩ !V
    let minCost = Infinity;
    let k: string | null = null;

    nodes.forEach(nd => {
      if (V[nd.id] === 0) {
        const val = C[nd.id];
        const numVal = typeof val === 'number' ? val : Infinity;
        if (numVal < minCost) {
          minCost = numVal;
          k = nd.id;
        }
      }
    });

    if (!k || minCost === Infinity) {
      // Nessun nodo raggiungibile
      break;
    }

    const kNode = k;
    const kLabel = nodeMap.get(kNode)!;
    const xNode = parent[kNode];
    const xLabel = xNode ? nodeMap.get(xNode) : '?';
    const edgeId = xNode ? (edgeLookup[xNode]?.[kNode] || edgeLookup[kNode]?.[xNode]) : null;

    // Step: Selezione di k
    steps.push({
      stepNumber: stepCount++,
      phase: 'Scelta Vertice k',
      description: `Ricerca vertice k con min C[k] tra i non visitati (V=0): selezionato k = ${kLabel} con costo C[${kLabel}] = ${minCost}.`,
      pseudocodeLine: 7,
      nodeRoles: {
        ...Object.fromEntries(nodes.map(nd => [nd.id, V[nd.id] === 1 ? 'visited' : 'default'])),
        [kNode]: 'candidate',
      },
      edgeRoles: {
        ...Object.fromEntries(T.map(id => [id, 'tree'])),
        ...(edgeId ? { [edgeId]: 'candidate' } : {}),
      },
      treeEdges: [...T],
      sets: { T: [...treeEdgeLabels] },
      arrays: formatArrays(),
    });

    // Aggiornamento: V[k] = 1, T = T ∪ (x, k)
    V[kNode] = 1;
    if (edgeId) {
      T.push(edgeId);
      treeEdgeLabels.push(`(${xLabel}-${kLabel}: ${minCost})`);
    }

    steps.push({
      stepNumber: stepCount++,
      phase: 'Inclusione in V e T',
      description: `Aggiornamento: V[${kLabel}] = 1. Aggiunto lato (${xLabel}, ${kLabel}) a T.`,
      pseudocodeLine: 8,
      nodeRoles: {
        ...Object.fromEntries(nodes.map(nd => [nd.id, V[nd.id] === 1 ? 'visited' : 'default'])),
      },
      edgeRoles: Object.fromEntries(T.map(id => [id, 'tree'])),
      treeEdges: [...T],
      sets: { T: [...treeEdgeLabels] },
      arrays: formatArrays(),
    });

    // Aggiorna C con i lati adiacenti a k
    // for ( j = 1; j ≤ n; j++ ) if ( V[j] == 0 && H[k, j] < C[j] ) C[j] = H[k, j]
    const relaxedNodes: string[] = [];

    nodes.forEach(jNode => {
      const j = jNode.id;
      if (V[j] === 0) {
        const costKJ = H[kNode][j];
        const currentC = typeof C[j] === 'number' ? (C[j] as number) : Infinity;

        if (costKJ < currentC) {
          C[j] = costKJ;
          parent[j] = kNode;
          relaxedNodes.push(`${nodeMap.get(j)} (nuovo C=${costKJ})`);
        }
      }
    });

    steps.push({
      stepNumber: stepCount++,
      phase: 'Aggiornamento Vettore C',
      description: relaxedNodes.length > 0
        ? `Aggiornamento vettori da ${kLabel}: rilassati i nodi non visitati vicini -> ${relaxedNodes.join(', ')}.`
        : `Nessun costo in C migliorato dall'aggiunta di ${kLabel}.`,
      pseudocodeLine: 11,
      nodeRoles: {
        ...Object.fromEntries(nodes.map(nd => [nd.id, V[nd.id] === 1 ? 'visited' : 'default'])),
      },
      edgeRoles: Object.fromEntries(T.map(id => [id, 'tree'])),
      treeEdges: [...T],
      sets: { T: [...treeEdgeLabels] },
      arrays: formatArrays(),
    });
  }

  // Step finale
  const totalCost = graph.edges
    .filter(e => T.includes(e.id))
    .reduce((sum, e) => sum + (e.weight ?? 1), 0);

  steps.push({
    stepNumber: stepCount++,
    phase: 'Termine Algoritmo',
    description: `Prim Efficiente completato: Trovato MST con |T| = ${T.length} lati e costo totale = ${totalCost}.`,
    pseudocodeLine: 16,
    nodeRoles: Object.fromEntries(nodes.map(nd => [nd.id, 'visited'])),
    edgeRoles: Object.fromEntries(T.map(id => [id, 'tree'])),
    treeEdges: [...T],
    sets: { T: [...treeEdgeLabels] },
    arrays: formatArrays(),
  });

  return steps;
}
