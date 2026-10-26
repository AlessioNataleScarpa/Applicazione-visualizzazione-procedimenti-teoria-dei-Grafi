import { AlgorithmStep, GraphData } from '../../types/graph';

export function runDijkstraInefficient(graph: GraphData, startNodeId?: string): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const nodes = graph.nodes;
  const n = nodes.length;

  if (n === 0) return steps;

  const nodeMap = new Map(nodes.map(nd => [nd.id, nd.label]));
  const s0 = startNodeId && nodes.some(nd => nd.id === startNodeId)
    ? startNodeId
    : nodes[0].id;

  // Inizializzazione: S = {s}, pred[i] = s, ∀i ∈ V; D[s] = 0, D[i] = ∞
  const S = new Set<string>([s0]);
  const S_bar = new Set<string>(nodes.filter(nd => nd.id !== s0).map(nd => nd.id));
  
  const D: Record<string, number> = {};
  const pred: Record<string, string> = {};

  nodes.forEach(nd => {
    D[nd.id] = nd.id === s0 ? 0 : Infinity;
    pred[nd.id] = s0;
  });

  const treeEdges: string[] = []; // edge IDs
  const treeEdgeLabels: string[] = [];

  const getLabelList = (set: Set<string>) => Array.from(set).map(id => nodeMap.get(id) ?? id);

  const formatArrays = () => ({
    V: Object.fromEntries(nodes.map(nd => [nd.label, S.has(nd.id) ? 1 : 0])),
    D: Object.fromEntries(nodes.map(nd => [nd.label, D[nd.id] === Infinity ? '∞' : D[nd.id]])),
    pred: Object.fromEntries(nodes.map(nd => [nd.label, nodeMap.get(pred[nd.id]) ?? pred[nd.id]])),
  });

  // Snapshot 1: Inizializzazione
  steps.push({
    stepNumber: 1,
    phase: 'Inizializzazione',
    description: `Dijkstra Non Efficiente O(n³): Sorgente s = ${nodeMap.get(s0)}. Insieme S = {${nodeMap.get(s0)}}, S̄ = {${getLabelList(S_bar).join(', ')}}. D[${nodeMap.get(s0)}] = 0, pred[i] = ${nodeMap.get(s0)} ∀i.`,
    pseudocodeLine: 1,
    nodeRoles: {
      [s0]: 'source',
      ...Object.fromEntries(Array.from(S_bar).map(id => [id, 'cut-T'])),
    },
    edgeRoles: {},
    treeEdges: [...treeEdges],
    sets: {
      S: getLabelList(S),
      S_bar: getLabelList(S_bar),
      T: [],
    },
    arrays: formatArrays(),
  });

  let stepCount = 2;

  // Ciclo principale: esamina tutti i vertici
  while (S_bar.size > 0) {
    // Calcola il taglio uscente [S, S̄]⁺
    interface CutEdgeCandidate {
      edgeId: string;
      fromNode: string; // h in S
      toNode: string;   // k in S_bar
      edgeCost: number;
      totalCost: number; // D[h] + c_hk
    }

    const cutCandidates: CutEdgeCandidate[] = [];

    for (const e of graph.edges) {
      const u = e.from;
      const v = e.to;
      const cost = e.weight ?? 1;

      if (S.has(u) && S_bar.has(v)) {
        if (D[u] < Infinity) {
          cutCandidates.push({
            edgeId: e.id,
            fromNode: u,
            toNode: v,
            edgeCost: cost,
            totalCost: D[u] + cost,
          });
        }
      }
      if (!graph.isDirected && S.has(v) && S_bar.has(u)) {
        if (D[v] < Infinity) {
          cutCandidates.push({
            edgeId: e.id,
            fromNode: v,
            toNode: u,
            edgeCost: cost,
            totalCost: D[v] + cost,
          });
        }
      }
    }

    if (cutCandidates.length === 0) {
      // I nodi rimasti in S_bar non sono raggiungibili
      break;
    }

    // Step: Visualizza tutti i candidati nel taglio [S, S̄]⁺
    const candidateDescriptions = cutCandidates
      .map(c => `(${nodeMap.get(c.fromNode)}→${nodeMap.get(c.toNode)}: D[${nodeMap.get(c.fromNode)}]+c = ${D[c.fromNode]}+${c.edgeCost} = ${c.totalCost})`)
      .join(', ');

    steps.push({
      stepNumber: stepCount++,
      phase: 'Esame Taglio Uscente [S, S̄]⁺',
      description: `Taglio orientato [S, S̄]⁺: ${candidateDescriptions}. Calcolo di arg min{ D_i + c_ij : (i, j) ∈ [S, S̄]⁺ }.`,
      pseudocodeLine: 7,
      nodeRoles: {
        ...Object.fromEntries(Array.from(S).map(id => [id, 'cut-S'])),
        ...Object.fromEntries(Array.from(S_bar).map(id => [id, 'cut-T'])),
      },
      edgeRoles: {
        ...Object.fromEntries(treeEdges.map(id => [id, 'tree'])),
        ...Object.fromEntries(cutCandidates.map(c => [c.edgeId, 'candidate'])),
      },
      treeEdges: [...treeEdges],
      sets: {
        S: getLabelList(S),
        S_bar: getLabelList(S_bar),
        T: [...treeEdgeLabels],
      },
      arrays: formatArrays(),
    });

    // Trova il candidato minimo (h, k)
    let minCandidate = cutCandidates[0];
    for (let i = 1; i < cutCandidates.length; i++) {
      if (cutCandidates[i].totalCost < minCandidate.totalCost) {
        minCandidate = cutCandidates[i];
      }
    }

    const h = minCandidate.fromNode;
    const k = minCandidate.toNode;
    const hLabel = nodeMap.get(h)!;
    const kLabel = nodeMap.get(k)!;

    // Aggiornamento: pred[k] = h; D[k] = D[h] + c_hk; S = S ∪ k; S_bar \ {k}
    pred[k] = h;
    D[k] = minCandidate.totalCost;
    S.add(k);
    S_bar.delete(k);

    treeEdges.push(minCandidate.edgeId);
    treeEdgeLabels.push(`(${hLabel}→${kLabel}: ${D[k]})`);

    steps.push({
      stepNumber: stepCount++,
      phase: 'Aggiornamento Minimo e Inclusione in S',
      description: `Minimo selezionato: arco (${hLabel}→${kLabel}). Aggiornato: pred[${kLabel}] = ${hLabel}, D[${kLabel}] = ${D[k]}. Nodo ${kLabel} entra in S.`,
      pseudocodeLine: 10,
      nodeRoles: {
        ...Object.fromEntries(Array.from(S).map(id => [id, 'cut-S'])),
        ...Object.fromEntries(Array.from(S_bar).map(id => [id, 'cut-T'])),
        [k]: 'current',
      },
      edgeRoles: {
        ...Object.fromEntries(treeEdges.map(id => [id, 'tree'])),
      },
      treeEdges: [...treeEdges],
      sets: {
        S: getLabelList(S),
        S_bar: getLabelList(S_bar),
        T: [...treeEdgeLabels],
      },
      arrays: formatArrays(),
    });
  }

  // Step finale: Completamento albero cammini minimi
  steps.push({
    stepNumber: stepCount++,
    phase: 'Termine Algoritmo',
    description: `Dijkstra Non Efficiente terminato: Albero dei cammini minimi dalla radice ${nodeMap.get(s0)} costruito con successo per tutti i nodi raggiungibili.`,
    pseudocodeLine: 13,
    nodeRoles: Object.fromEntries(Array.from(S).map(id => [id, 'visited'])),
    edgeRoles: Object.fromEntries(treeEdges.map(id => [id, 'tree'])),
    treeEdges: [...treeEdges],
    sets: {
      S: getLabelList(S),
      S_bar: getLabelList(S_bar),
      T: [...treeEdgeLabels],
    },
    arrays: formatArrays(),
  });

  return steps;
}
