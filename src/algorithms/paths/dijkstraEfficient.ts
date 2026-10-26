import { AlgorithmStep, GraphData } from '../../types/graph';

export function runDijkstraEfficient(graph: GraphData, startNodeId?: string): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const nodes = graph.nodes;
  const n = nodes.length;

  if (n === 0) return steps;

  const nodeMap = new Map(nodes.map(nd => [nd.id, nd.label]));
  const s0 = startNodeId && nodes.some(nd => nd.id === startNodeId)
    ? startNodeId
    : nodes[0].id;

  // Costruzione matrice pesi H[u, v] e lookup archi
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
  // V[i] = 0, ∀i ∈ V; V[s] = 1; D[i] = H[s, i], ∀i ∈ V; pred[i] = s, ∀i ∈ V;
  const V: Record<string, number> = {};
  const D: Record<string, number> = {};
  const pred: Record<string, string> = {};

  nodes.forEach(nd => {
    V[nd.id] = 0;
    D[nd.id] = H[s0][nd.id];
    pred[nd.id] = s0;
  });

  V[s0] = 1;
  D[s0] = 0;

  const formatArrays = () => ({
    V: Object.fromEntries(nodes.map(nd => [nd.label, V[nd.id]])),
    D: Object.fromEntries(nodes.map(nd => [nd.label, D[nd.id] === Infinity ? '∞' : D[nd.id]])),
    pred: Object.fromEntries(nodes.map(nd => [nd.label, nodeMap.get(pred[nd.id]) ?? pred[nd.id]])),
  });

  // Trova gli archi dell'albero dei cammini minimi
  const getTreeEdges = () => {
    const list: string[] = [];
    nodes.forEach(nd => {
      if (nd.id !== s0 && V[nd.id] === 1 && D[nd.id] < Infinity) {
        const p = pred[nd.id];
        const edgeId = edgeLookup[p]?.[nd.id] || (!graph.isDirected ? edgeLookup[nd.id]?.[p] : undefined);
        if (edgeId) list.push(edgeId);
      }
    });
    return list;
  };

  // Snapshot 1: Inizializzazione
  steps.push({
    stepNumber: 1,
    phase: 'Inizializzazione',
    description: `Dijkstra Efficiente O(n²): Sorgente ${nodeMap.get(s0)}. Inizializzato V (V[${nodeMap.get(s0)}]=1), D[i]=H[${nodeMap.get(s0)}, i], pred[i]=${nodeMap.get(s0)} ∀i.`,
    pseudocodeLine: 1,
    nodeRoles: {
      [s0]: 'visited',
      ...Object.fromEntries(nodes.filter(nd => nd.id !== s0).map(nd => [nd.id, 'default'])),
    },
    edgeRoles: {},
    treeEdges: getTreeEdges(),
    arrays: formatArrays(),
  });

  let stepCount = 2;

  // Ciclo principale: for ( i = 1; i <= n - 1; i++ )
  for (let iter = 1; iter <= n - 1; iter++) {
    // Trova nodo h che minimizza D[h] in D ∩ !V
    let minD = Infinity;
    let h: string | null = null;

    nodes.forEach(nd => {
      if (V[nd.id] === 0 && D[nd.id] < minD) {
        minD = D[nd.id];
        h = nd.id;
      }
    });

    if (!h || minD === Infinity) {
      // Nessun altro nodo raggiungibile
      break;
    }

    const hNode = h;
    const hLabel = nodeMap.get(hNode)!;

    // Step: Selezione di h
    steps.push({
      stepNumber: stepCount++,
      phase: 'Scelta Nodo Minimo h',
      description: `Iterazione ${iter}: Trovato nodo con min D[h] tra i non visitati (V=0) -> h = ${hLabel} con distanza D[${hLabel}] = ${minD}.`,
      pseudocodeLine: 7,
      nodeRoles: {
        ...Object.fromEntries(nodes.map(nd => [nd.id, V[nd.id] === 1 ? 'visited' : 'default'])),
        [hNode]: 'candidate',
      },
      edgeRoles: Object.fromEntries(getTreeEdges().map(id => [id, 'tree'])),
      treeEdges: getTreeEdges(),
      arrays: formatArrays(),
    });

    // V[h] = 1
    V[hNode] = 1;

    steps.push({
      stepNumber: stepCount++,
      phase: 'Marcatura Visitato (V[h]=1)',
      description: `Inclusione nodo ${hLabel} nell'insieme dei nodi con cammino minimo definitivo (V[${hLabel}] = 1).`,
      pseudocodeLine: 8,
      nodeRoles: {
        ...Object.fromEntries(nodes.map(nd => [nd.id, V[nd.id] === 1 ? 'visited' : 'default'])),
      },
      edgeRoles: Object.fromEntries(getTreeEdges().map(id => [id, 'tree'])),
      treeEdges: getTreeEdges(),
      arrays: formatArrays(),
    });

    // Rilassamento per i vicini k: for ( k = 1; k <= n; k++ ) if ( V[k] == 0 && D[h] + H[h, k] < D[k] )
    const relaxed: string[] = [];
    const relaxingEdgeIds: string[] = [];

    nodes.forEach(kNode => {
      const k = kNode.id;
      if (V[k] === 0) {
        const edgeWeight = H[hNode][k];
        if (edgeWeight < Infinity && D[hNode] + edgeWeight < D[k]) {
          const oldD = D[k] === Infinity ? '∞' : D[k];
          D[k] = D[hNode] + edgeWeight;
          pred[k] = hNode;
          relaxed.push(`${nodeMap.get(k)} (da ${oldD} a ${D[k]})`);

          const edgeId = edgeLookup[hNode]?.[k] || (!graph.isDirected ? edgeLookup[k]?.[hNode] : undefined);
          if (edgeId) relaxingEdgeIds.push(edgeId);
        }
      }
    });

    steps.push({
      stepNumber: stepCount++,
      phase: 'Rilassamento Vicini di h',
      description: relaxed.length > 0
        ? `Rilassati vicini di ${hLabel}: ${relaxed.join(', ')}. Aggiornati D e pred.`
        : `Nessun vicino non visitato di ${hLabel} offre un cammino più breve.`,
      pseudocodeLine: 12,
      nodeRoles: {
        ...Object.fromEntries(nodes.map(nd => [nd.id, V[nd.id] === 1 ? 'visited' : 'default'])),
      },
      edgeRoles: {
        ...Object.fromEntries(getTreeEdges().map(id => [id, 'tree'])),
        ...Object.fromEntries(relaxingEdgeIds.map(id => [id, 'relax'])),
      },
      treeEdges: getTreeEdges(),
      arrays: formatArrays(),
    });
  }

  // Step finale
  steps.push({
    stepNumber: stepCount++,
    phase: 'Termine Algoritmo',
    description: `Dijkstra Efficiente completato: Albero dei cammini minimi dalla radice ${nodeMap.get(s0)} determinato con successo.`,
    pseudocodeLine: 16,
    nodeRoles: Object.fromEntries(nodes.map(nd => [nd.id, V[nd.id] === 1 ? 'visited' : 'default'])),
    edgeRoles: Object.fromEntries(getTreeEdges().map(id => [id, 'tree'])),
    treeEdges: getTreeEdges(),
    arrays: formatArrays(),
  });

  return steps;
}
