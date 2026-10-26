import { AlgorithmStep, GraphData } from '../../types/graph';

export function runFloydWarshall(graph: GraphData): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const nodes = graph.nodes;
  const n = nodes.length;

  if (n === 0) return steps;

  const nodeLabels = nodes.map(nd => nd.label);
  const idToIndex = new Map(nodes.map((nd, idx) => [nd.id, idx]));

  // Inizializzazione d^(0) e pred^(0)
  // for each [i, j] ∈ N × N do d[i,j]^(0) := +∞; pred[i,j]^(0) := j;
  // for each i ∈ N do d[i,i]^(0) := 0; pred[i,i]^(0) := i;
  // for each (i, j) ∈ A do d[i,j]^(0) := c_ij; pred[i,j]^(0) := i;

  const D: number[][] = Array.from({ length: n }, () => Array(n).fill(Infinity));
  // In the note: pred[i, j]^(0) := j (or '-' if no path) and pred[i, i] := i
  // But when (i, j) ∈ A, pred[i, j] := i (or the immediate predecessor).
  // Let's store labels in predMatrix for direct readability
  const pred: (string | number)[][] = Array.from({ length: n }, (_, i) => 
    Array.from({ length: n }, (_, j) => (i === j ? nodeLabels[i] : '-'))
  );

  for (let i = 0; i < n; i++) {
    D[i][i] = 0;
    pred[i][i] = nodeLabels[i];
  }

  graph.edges.forEach(e => {
    const u = idToIndex.get(e.from);
    const v = idToIndex.get(e.to);
    const w = e.weight ?? 1;

    if (u !== undefined && v !== undefined) {
      if (w < D[u][v]) {
        D[u][v] = w;
        pred[u][v] = nodeLabels[u];
      }
      if (!graph.isDirected) {
        if (w < D[v][u]) {
          D[v][u] = w;
          pred[v][u] = nodeLabels[v];
        }
      }
    }
  });

  const cloneD = (mat: number[][]) => mat.map(row => row.map(v => (v === Infinity ? '∞' : v)));
  const clonePred = (mat: (string | number)[][]) => mat.map(row => [...row]);

  // Snapshot k = 0
  steps.push({
    stepNumber: 1,
    phase: 'Inizializzazione (k = 0)',
    description: `Floyd-Warshall: Inizializzazione matrici D^(0) e pred^(0). Diagonale posta a 0, archi diretti impostati con peso c_ij, coppie non connesse a +∞.`,
    pseudocodeLine: 1,
    nodeRoles: {},
    edgeRoles: {},
    matrices: {
      nodeLabels: [...nodeLabels],
      k: 0,
      D: cloneD(D),
      pred: clonePred(pred),
      formulaExplanation: 'Stato iniziale k=0 basato sui soli archi diretti del grafo.',
    }
  });

  let stepCount = 2;

  // for k := 1 to n do
  for (let k = 0; k < n; k++) {
    const kPivotLabel = nodeLabels[k];
    const prevD = D.map(row => [...row]);
    const prevPred = pred.map(row => [...row]);

    const updatesInThisK: { i: number; j: number; oldD: number; newD: number; formula: string }[] = [];

    // Esame per ogni coppia [i, j]
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (prevD[i][k] < Infinity && prevD[k][j] < Infinity) {
          const alternativePath = prevD[i][k] + prevD[k][j];
          if (alternativePath < prevD[i][j]) {
            updatesInThisK.push({
              i,
              j,
              oldD: prevD[i][j],
              newD: alternativePath,
              formula: `D[${nodeLabels[i]},${nodeLabels[j]}] = min(${prevD[i][j] === Infinity ? '∞' : prevD[i][j]}, D[${nodeLabels[i]},${kPivotLabel}] + D[${kPivotLabel},${nodeLabels[j]}] = ${prevD[i][k]} + ${prevD[k][j]} = ${alternativePath})`,
            });
            D[i][j] = alternativePath;
            pred[i][j] = prevPred[k][j];
          }
        }
      }
    }

    const descUpdates = updatesInThisK.length > 0
      ? `Aggiornamenti trovati passando per il perno ${kPivotLabel}: ${updatesInThisK.map(u => `(${nodeLabels[u.i]}→${nodeLabels[u.j]}: da ${u.oldD === Infinity ? '∞' : u.oldD} a ${u.newD})`).join('; ')}.`
      : `Nessuna distanza migliorata inserendo ${kPivotLabel} come nodo intermedio.`;

    steps.push({
      stepNumber: stepCount++,
      phase: `Iterazione k = ${k + 1} (Perno: ${kPivotLabel})`,
      description: `Iterazione k = ${k + 1} su n (Nodo intermedio considerato: ${kPivotLabel}). ${descUpdates}`,
      pseudocodeLine: 7,
      nodeRoles: {
        [nodes[k].id]: 'current',
      },
      edgeRoles: {},
      matrices: {
        nodeLabels: [...nodeLabels],
        k: k + 1,
        D: cloneD(D),
        pred: clonePred(pred),
        cellUpdated: updatesInThisK.length > 0 ? { i: updatesInThisK[0].i, j: updatesInThisK[0].j } : undefined,
        formulaExplanation: `Condizione: d[i, j]^(k) = min( d[i, j]^(k-1), d[i, ${kPivotLabel}]^(k-1) + d[${kPivotLabel}, j]^(k-1) )`,
      }
    });
  }

  // Step finale: Completamento All-Pairs Shortest Path
  steps.push({
    stepNumber: stepCount++,
    phase: 'Termine Algoritmo',
    description: `Floyd-Warshall completato: Matrici D^(n) e pred^(n) definitive calcolate per tutte le coppie di nodi del grafo.`,
    pseudocodeLine: 16,
    nodeRoles: Object.fromEntries(nodes.map(nd => [nd.id, 'visited'])),
    edgeRoles: {},
    matrices: {
      nodeLabels: [...nodeLabels],
      k: n,
      D: cloneD(D),
      pred: clonePred(pred),
      formulaExplanation: 'Tutti i cammini minimi tra tutte le coppie di nodi sono stati calcolati.',
    }
  });

  return steps;
}
