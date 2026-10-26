import { AlgorithmStep, GraphData } from '../../types/graph';

export function runPrimInefficient(graph: GraphData, startNodeId?: string): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const nodes = graph.nodes;
  const n = nodes.length;

  if (n === 0) return steps;

  // Inizializzazione: S = {1}, S̄ = V \ S, T = ∅
  const s0 = startNodeId && nodes.some(nd => nd.id === startNodeId) 
    ? startNodeId 
    : nodes[0].id;

  const S = new Set<string>([s0]);
  const S_bar = new Set<string>(nodes.filter(nd => nd.id !== s0).map(nd => nd.id));
  const T: string[] = []; // edge IDs
  const treeEdgeLabels: string[] = [];

  const nodeMap = new Map(nodes.map(nd => [nd.id, nd.label]));

  const C: Record<string, number | string> = {};
  const pred: Record<string, string> = {};
  nodes.forEach(nd => {
    C[nd.id] = nd.id === s0 ? 0 : '∞';
    pred[nd.id] = nd.id === s0 ? s0 : '-';
  });

  const getLabelList = (set: Set<string>) => Array.from(set).map(id => nodeMap.get(id) ?? id);

  const formatArrays = () => ({
    V: Object.fromEntries(nodes.map(nd => [nd.label, S.has(nd.id) ? 1 : 0])),
    C: Object.fromEntries(nodes.map(nd => [nd.label, C[nd.id]])),
    pred: Object.fromEntries(nodes.map(nd => [nd.label, pred[nd.id] === '-' ? '-' : (nodeMap.get(pred[nd.id]) ?? pred[nd.id])])),
  });

  // Snapshot 1: Inizializzazione
  steps.push({
    stepNumber: 1,
    phase: 'Inizializzazione',
    description: `Prim-Dijkstra (Non Efficiente): S = {${nodeMap.get(s0)}}, S̄ = {${getLabelList(S_bar).join(', ')}}, T = ∅.`,
    pseudocodeLine: 1,
    nodeRoles: {
      ...Object.fromEntries(Array.from(S).map(id => [id, 'cut-S'])),
      ...Object.fromEntries(Array.from(S_bar).map(id => [id, 'cut-T'])),
    },
    edgeRoles: {},
    treeEdges: [...T],
    sets: {
      S: getLabelList(S),
      S_bar: getLabelList(S_bar),
      T: [],
    },
    arrays: formatArrays(),
  });

  let stepCount = 2;

  // Ciclo principale: while (|T| < n - 1)
  while (T.length < n - 1 && S_bar.size > 0) {
    // Calcola tutti i lati del taglio [S, S̄]
    // Nel grafo non orientato, un lato collega un nodo in S e un nodo in S̄
    interface CutEdgeCandidate {
      edgeId: string;
      fromNode: string; // nodo in S
      toNode: string;   // nodo in S_bar
      cost: number;
    }

    const cutCandidates: CutEdgeCandidate[] = [];

    for (const e of graph.edges) {
      const u = e.from;
      const v = e.to;
      const cost = e.weight ?? 1;

      if (S.has(u) && S_bar.has(v)) {
        cutCandidates.push({ edgeId: e.id, fromNode: u, toNode: v, cost });
      } else if (!graph.isDirected && S.has(v) && S_bar.has(u)) {
        cutCandidates.push({ edgeId: e.id, fromNode: v, toNode: u, cost });
      }
    }

    if (cutCandidates.length === 0) {
      // Grafo non connesso
      break;
    }

    // Step: Identificazione dei lati nel taglio [S, S̄]
    const candidateEdgeIds = cutCandidates.map(c => c.edgeId);
    const candidateDescriptions = cutCandidates
      .map(c => `(${nodeMap.get(c.fromNode)}-${nodeMap.get(c.toNode)}: ${c.cost})`)
      .join(', ');

    steps.push({
      stepNumber: stepCount++,
      phase: 'Esame Taglio [S, S̄]',
      description: `Calcolo del taglio [S, S̄]. Lati attraversanti: [${candidateDescriptions}]. Ricerca del minimo arg min{c_h, h ∈ [S, S̄]}.`,
      pseudocodeLine: 7,
      nodeRoles: {
        ...Object.fromEntries(Array.from(S).map(id => [id, 'cut-S'])),
        ...Object.fromEntries(Array.from(S_bar).map(id => [id, 'cut-T'])),
      },
      edgeRoles: {
        ...Object.fromEntries(T.map(id => [id, 'tree'])),
        ...Object.fromEntries(candidateEdgeIds.map(id => [id, 'candidate'])),
      },
      treeEdges: [...T],
      sets: {
        S: getLabelList(S),
        S_bar: getLabelList(S_bar),
        T: [...treeEdgeLabels],
      },
      arrays: formatArrays(),
    });

    // Trova il lato di costo minimo nel taglio
    let minCandidate = cutCandidates[0];
    for (let k = 1; k < cutCandidates.length; k++) {
      if (cutCandidates[k].cost < minCandidate.cost) {
        minCandidate = cutCandidates[k];
      }
    }

    // Aggiunge (i, j) all'albero e j a S
    T.push(minCandidate.edgeId);
    S.add(minCandidate.toNode);
    S_bar.delete(minCandidate.toNode);
    treeEdgeLabels.push(`(${nodeMap.get(minCandidate.fromNode)}-${nodeMap.get(minCandidate.toNode)}: ${minCandidate.cost})`);

    // Aggiorna Costo e Predecessore per il nodo inserito
    C[minCandidate.toNode] = minCandidate.cost;
    pred[minCandidate.toNode] = minCandidate.fromNode;

    const iLabel = nodeMap.get(minCandidate.fromNode);
    const jLabel = nodeMap.get(minCandidate.toNode);

    steps.push({
      stepNumber: stepCount++,
      phase: 'Aggiornamento Albero e Taglio',
      description: `Minimo trovato: lato (${iLabel}, ${jLabel}) con costo ${minCandidate.cost}. T = T ∪ {(${iLabel}, ${jLabel})}, S = S ∪ {${jLabel}}, S̄ rimosso ${jLabel}.`,
      pseudocodeLine: 11,
      nodeRoles: {
        ...Object.fromEntries(Array.from(S).map(id => [id, 'cut-S'])),
        ...Object.fromEntries(Array.from(S_bar).map(id => [id, 'cut-T'])),
        [minCandidate.toNode]: 'current',
      },
      edgeRoles: {
        ...Object.fromEntries(T.map(id => [id, 'tree'])),
      },
      treeEdges: [...T],
      sets: {
        S: getLabelList(S),
        S_bar: getLabelList(S_bar),
        T: [...treeEdgeLabels],
      },
      arrays: formatArrays(),
    });
  }

  // Step finale
  const totalCost = graph.edges
    .filter(e => T.includes(e.id))
    .reduce((sum, e) => sum + (e.weight ?? 1), 0);

  const isComplete = T.length === n - 1;

  steps.push({
    stepNumber: stepCount++,
    phase: 'Termine Algoritmo',
    description: isComplete
      ? `Prim-Dijkstra (Non Efficiente) completato: Albero ricoprente minimo trovato con |T| = ${T.length} lati e costo totale = ${totalCost}.`
      : `Algoritmo terminato con |T| = ${T.length}. Il grafo non è completamente connesso.`,
    pseudocodeLine: 13,
    nodeRoles: Object.fromEntries(Array.from(S).map(id => [id, 'visited'])),
    edgeRoles: Object.fromEntries(T.map(id => [id, 'tree'])),
    treeEdges: [...T],
    sets: {
      S: getLabelList(S),
      S_bar: getLabelList(S_bar),
      T: [...treeEdgeLabels],
    },
    arrays: formatArrays(),
  });

  return steps;
}
