import { AlgorithmStep, GraphData } from '../../types/graph';

export function runFordFulkerson(
  graph: GraphData,
  sourceId?: string,
  targetId?: string
): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const nodes = graph.nodes;
  const n = nodes.length;

  if (n < 2) return steps;

  const nodeMap = new Map(nodes.map(nd => [nd.id, nd.label]));

  // Identifica sorgente e pozzo
  const s = sourceId && nodes.some(nd => nd.id === sourceId)
    ? sourceId
    : graph.sourceNodeId && nodes.some(nd => nd.id === graph.sourceNodeId)
    ? graph.sourceNodeId
    : nodes[0].id;

  const t = targetId && nodes.some(nd => nd.id === targetId)
    ? targetId
    : graph.targetNodeId && nodes.some(nd => nd.id === graph.targetNodeId)
    ? graph.targetNodeId
    : nodes[nodes.length - 1].id;

  const sLabel = nodeMap.get(s)!;
  const tLabel = nodeMap.get(t)!;

  // 1. Verifica Ammissibilità del Flusso Iniziale
  const edgeFlows: Record<string, number> = {};
  let isInitialFlowAdmissible = true;
  let admissibilityViolationReason = '';

  // Controlla capacità: 0 <= x_ij <= c_ij
  for (const e of graph.edges) {
    const cap = e.capacity ?? e.weight ?? 0;
    const fl = e.flow ?? 0;
    if (fl < 0 || fl > cap) {
      isInitialFlowAdmissible = false;
      admissibilityViolationReason = `Arco (${nodeMap.get(e.from)}→${nodeMap.get(e.to)}): flusso iniziale ${fl} non rispetta 0 ≤ x ≤ ${cap}.`;
      break;
    }
  }

  // Controlla conservazione del flusso ai nodi intermedi: ∀u ∉ {s, t}, Σ in = Σ out
  if (isInitialFlowAdmissible) {
    for (const nd of nodes) {
      if (nd.id === s || nd.id === t) continue;

      let inFlow = 0;
      let outFlow = 0;

      for (const e of graph.edges) {
        if (e.to === nd.id) inFlow += e.flow ?? 0;
        if (e.from === nd.id) outFlow += e.flow ?? 0;
      }

      if (inFlow !== outFlow) {
        isInitialFlowAdmissible = false;
        admissibilityViolationReason = `Nodo intermedio ${nd.label}: flusso entrante (${inFlow}) ≠ flusso uscente (${outFlow}).`;
        break;
      }
    }
  }

  // Se non ammissibile, resetta a 0 per tutti
  let currentFlowTotal = 0;
  for (const e of graph.edges) {
    if (isInitialFlowAdmissible) {
      edgeFlows[e.id] = e.flow ?? 0;
    } else {
      edgeFlows[e.id] = 0;
    }
  }

  // Calcola flusso iniziale totale uscente da s
  if (isInitialFlowAdmissible) {
    let outS = 0;
    let inS = 0;
    for (const e of graph.edges) {
      if (e.from === s) outS += edgeFlows[e.id];
      if (e.to === s) inS += edgeFlows[e.id];
    }
    currentFlowTotal = outS - inS;
  } else {
    currentFlowTotal = 0;
  }

  // Helper per costruire la rete residua R(x)
  const buildResidualEdges = () => {
    const res: {
      from: string;
      to: string;
      residualCapacity: number;
      isBackward: boolean;
      originalEdgeId: string;
    }[] = [];

    for (const e of graph.edges) {
      const cap = e.capacity ?? e.weight ?? 0;
      const fl = edgeFlows[e.id];

      // Arco in avanti (u -> v): residuo = c_uv - x_uv
      if (cap - fl > 0) {
        res.push({
          from: e.from,
          to: e.to,
          residualCapacity: cap - fl,
          isBackward: false,
          originalEdgeId: e.id,
        });
      }

      // Arco all'indietro (v -> u): residuo = x_uv
      if (fl > 0) {
        res.push({
          from: e.to,
          to: e.from,
          residualCapacity: fl,
          isBackward: true,
          originalEdgeId: e.id,
        });
      }
    }
    return res;
  };

  let stepCount = 1;

  // Snapshot 1: Grafo di partenza e verifica ammissibilità
  const initialResidual = buildResidualEdges();
  steps.push({
    stepNumber: stepCount++,
    phase: 'Verifica Flusso Iniziale',
    description: isInitialFlowAdmissible
      ? `Grafo di partenza con capacità e flussi iniziali AMMISSIBILI. Flusso corrente v = ${currentFlowTotal}. Sorgente s = ${sLabel}, Pozzo t = ${tLabel}.`
      : `ATTENZIONE: Flusso iniziale NON ammissibile (${admissibilityViolationReason}). Come da specifica, tutti i flussi iniziali vengono reimpostati a 0. Flusso iniziale v = 0.`,
    pseudocodeLine: 1,
    nodeRoles: {
      [s]: 'source',
      [t]: 'target',
    },
    edgeRoles: {},
    flowState: {
      currentFlowTotal,
      isAdmissible: isInitialFlowAdmissible,
      admissibilityNote: isInitialFlowAdmissible
        ? 'Flusso iniziale ammissibile: rispetta vincoli di capacità e conservazione.'
        : `Non ammissibile: ${admissibilityViolationReason} -> Reimpostato a zero.`,
      edgeFlows: { ...edgeFlows },
      residualEdges: initialResidual,
      isTerminated: false,
    }
  });

  // Funzione BFS per cercare un cammino aumentante in R(x) (Edmonds-Karp)
  const findAugmentingPathBFS = (resEdges: ReturnType<typeof buildResidualEdges>) => {
    interface ParentInfo {
      node: string;
      resEdgeIndex: number;
    }

    const visited = new Set<string>([s]);
    const queue: string[] = [s];
    const parentMap = new Map<string, ParentInfo>();

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr === t) break;

      for (let idx = 0; idx < resEdges.length; idx++) {
        const edge = resEdges[idx];
        if (edge.from === curr && edge.residualCapacity > 0 && !visited.has(edge.to)) {
          visited.add(edge.to);
          parentMap.set(edge.to, { node: curr, resEdgeIndex: idx });
          queue.push(edge.to);
        }
      }
    }

    if (!visited.has(t)) return null;

    // Ricostruisci il cammino da t a s
    const pathNodes: string[] = [];
    const pathResEdgeIndices: number[] = [];
    let curr = t;

    while (curr !== s) {
      pathNodes.unshift(curr);
      const info = parentMap.get(curr)!;
      pathResEdgeIndices.unshift(info.resEdgeIndex);
      curr = info.node;
    }
    pathNodes.unshift(s);

    // Calcola il collo di bottiglia δ
    let delta = Infinity;
    pathResEdgeIndices.forEach(idx => {
      if (resEdges[idx].residualCapacity < delta) {
        delta = resEdges[idx].residualCapacity;
      }
    });

    return { pathNodes, pathResEdgeIndices, delta };
  };

  // Ciclo principale: while (∃P cammino aumentante da s a t)
  let iteration = 1;
  while (true) {
    const currentResidual = buildResidualEdges();
    const augmenting = findAugmentingPathBFS(currentResidual);

    if (!augmenting) {
      // Nessun cammino aumentante trovato -> Termina e calcola il Taglio Minimo!
      break;
    }

    const { pathNodes, pathResEdgeIndices, delta } = augmenting;
    const pathLabels = pathNodes.map(id => nodeMap.get(id) ?? id).join(' → ');
    const involvedOriginalEdges = Array.from(new Set(pathResEdgeIndices.map(idx => currentResidual[idx].originalEdgeId)));

    // Step: Identificazione cammino aumentante
    steps.push({
      stepNumber: stepCount++,
      phase: `Cammino Aumentante #${iteration}`,
      description: `Trovato cammino aumentante P: [${pathLabels}] con capacità residua minima (bottleneck) δ = ${delta}.`,
      pseudocodeLine: 6,
      nodeRoles: {
        [s]: 'source',
        [t]: 'target',
        ...Object.fromEntries(pathNodes.filter(id => id !== s && id !== t).map(id => [id, 'candidate'])),
      },
      edgeRoles: Object.fromEntries(involvedOriginalEdges.map(id => [id, 'augmenting'])),
      flowState: {
        currentFlowTotal,
        isAdmissible: true,
        edgeFlows: { ...edgeFlows },
        residualEdges: currentResidual,
        augmentingPath: pathNodes,
        bottleneckDelta: delta,
        isTerminated: false,
      }
    });

    // Aggiornamento dei flussi lungo P:
    // Se arco in avanti: x_uv += delta
    // Se arco all'indietro: x_vu -= delta
    pathResEdgeIndices.forEach(idx => {
      const resEdge = currentResidual[idx];
      const edgeId = resEdge.originalEdgeId;
      if (!resEdge.isBackward) {
        edgeFlows[edgeId] += delta;
      } else {
        edgeFlows[edgeId] -= delta;
      }
    });

    currentFlowTotal += delta;

    // Step: Aggiornamento del flusso
    const updatedResidual = buildResidualEdges();
    steps.push({
      stepNumber: stepCount++,
      phase: `Aggiornamento Flusso (+${delta})`,
      description: `Flusso aumentato di δ = ${delta} lungo il cammino. Flusso totale corrente v = ${currentFlowTotal}. Ricalcolata la rete residua R(x).`,
      pseudocodeLine: 8,
      nodeRoles: {
        [s]: 'source',
        [t]: 'target',
        ...Object.fromEntries(pathNodes.filter(id => id !== s && id !== t).map(id => [id, 'visited'])),
      },
      edgeRoles: Object.fromEntries(involvedOriginalEdges.map(id => [id, 'tree'])),
      flowState: {
        currentFlowTotal,
        isAdmissible: true,
        edgeFlows: { ...edgeFlows },
        residualEdges: updatedResidual,
        augmentingPath: pathNodes,
        bottleneckDelta: delta,
        isTerminated: false,
      }
    });

    iteration++;
  }

  // Calcolo del Taglio Minimo (S, T):
  // S = nodi raggiungibili da s nella rete residua finale R(x)
  // T = V \ S
  const finalResidual = buildResidualEdges();
  const S_set = new Set<string>([s]);
  const queue: string[] = [s];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    for (const rEdge of finalResidual) {
      if (rEdge.from === curr && rEdge.residualCapacity > 0 && !S_set.has(rEdge.to)) {
        S_set.add(rEdge.to);
        queue.push(rEdge.to);
      }
    }
  }

  const T_set = new Set<string>(nodes.filter(nd => !S_set.has(nd.id)).map(nd => nd.id));

  // Archi del taglio nel grafo originale: da S verso T
  const cutEdges: { from: string; to: string; capacity: number }[] = [];
  const cutEdgeIds: string[] = [];
  let minCutCapacity = 0;

  for (const e of graph.edges) {
    if (S_set.has(e.from) && T_set.has(e.to)) {
      const cap = e.capacity ?? e.weight ?? 0;
      cutEdges.push({
        from: nodeMap.get(e.from) ?? e.from,
        to: nodeMap.get(e.to) ?? e.to,
        capacity: cap,
      });
      cutEdgeIds.push(e.id);
      minCutCapacity += cap;
    }
  }

  const S_labels = Array.from(S_set).map(id => nodeMap.get(id) ?? id);
  const T_labels = Array.from(T_set).map(id => nodeMap.get(id) ?? id);
  const cutDesc = cutEdges.map(c => `(${c.from}→${c.to}: cap ${c.capacity})`).join(', ');

  // Snapshot Finale: Flusso Massimo & Taglio Minimo
  steps.push({
    stepNumber: stepCount++,
    phase: 'Flusso Massimo & Taglio Minimo',
    description: `Nessun ulteriore cammino aumentante in R(x). TEOREMA MAX FLOW - MIN CUT VERIFICATO: Flusso Massimo = ${currentFlowTotal} = Capacità Taglio Minimo = ${minCutCapacity}. Taglio (S, T) con S = {${S_labels.join(', ')}}, T = {${T_labels.join(', ')}}. Lati saturi del taglio: [${cutDesc}].`,
    pseudocodeLine: 11,
    nodeRoles: {
      ...Object.fromEntries(Array.from(S_set).map(id => [id, 'cut-S'])),
      ...Object.fromEntries(Array.from(T_set).map(id => [id, 'cut-T'])),
    },
    edgeRoles: Object.fromEntries(cutEdgeIds.map(id => [id, 'cut'])),
    flowState: {
      currentFlowTotal,
      isAdmissible: true,
      edgeFlows: { ...edgeFlows },
      residualEdges: finalResidual,
      isTerminated: true,
      minCut: {
        S: S_labels,
        T: T_labels,
        cutEdges,
        maxFlowValue: currentFlowTotal,
        minCutCapacity,
      }
    }
  });

  return steps;
}
