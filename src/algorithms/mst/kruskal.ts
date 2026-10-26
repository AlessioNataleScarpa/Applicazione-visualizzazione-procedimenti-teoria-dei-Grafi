import { AlgorithmStep, GraphData } from '../../types/graph';

export function runKruskal(graph: GraphData): AlgorithmStep[] {
  const steps: AlgorithmStep[] = [];
  const nodes = graph.nodes;
  const n = nodes.length;

  if (n === 0) return steps;

  // Prepara i lati (considera il grafo non orientato: ogni arco ha from, to, peso)
  const edges = graph.edges.map(e => ({
    id: e.id,
    from: e.from,
    to: e.to,
    weight: e.weight ?? 1,
  }));

  // Inizializzazione COMP[i] = i, ∀i ∈ V
  const comp: Record<string, string> = {};
  nodes.forEach(node => {
    comp[node.id] = node.id;
  });

  // Ordina tutti i lati in LATI per costi crescenti
  const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);

  const edgeStatus: Record<string, 'pending' | 'considered' | 'accepted' | 'rejected'> = {};
  sortedEdges.forEach(e => {
    edgeStatus[e.id] = 'pending';
  });

  const T: string[] = []; // ID dei lati selezionati nell'albero
  const treeEdgeLabels: string[] = [];

  // Snapshot 1: Inizializzazione
  steps.push({
    stepNumber: 1,
    phase: 'Inizializzazione',
    description: `Inizializzazione Kruskal: Una componente COMP distinta per ogni vertice. Ordinamento dei ${sortedEdges.length} lati per peso crescente. T = ∅.`,
    pseudocodeLine: 1,
    nodeRoles: Object.fromEntries(nodes.map(node => [node.id, 'default'])),
    edgeRoles: {},
    treeEdges: [...T],
    sets: {
      T: [],
    },
    arrays: {
      COMP: { ...comp },
    },
    sortedEdges: sortedEdges.map(e => ({ ...e, status: edgeStatus[e.id] }))
  });

  let i = 0;
  let stepCount = 2;

  // while ( |T| < n - 1 && i < sortedEdges.length )
  while (T.length < n - 1 && i < sortedEdges.length) {
    const e = sortedEdges[i];
    edgeStatus[e.id] = 'considered';

    const u = e.from;
    const v = e.to;
    const compU = comp[u];
    const compV = comp[v];

    const uNode = nodes.find(nd => nd.id === u)?.label ?? u;
    const vNode = nodes.find(nd => nd.id === v)?.label ?? v;

    // Step: Considera il lato e = LATI[i]
    steps.push({
      stepNumber: stepCount++,
      phase: 'Esame Lato',
      description: `Iterazione ${i + 1}: Esame lato (${uNode}, ${vNode}) con peso ${e.weight}. Verifica COMP[${uNode}] (${compU}) vs COMP[${vNode}] (${compV}).`,
      pseudocodeLine: 7,
      nodeRoles: {
        [u]: 'candidate',
        [v]: 'candidate',
      },
      edgeRoles: {
        ...Object.fromEntries(T.map(id => [id, 'tree'])),
        [e.id]: 'candidate',
      },
      treeEdges: [...T],
      sets: {
        T: [...treeEdgeLabels],
      },
      arrays: {
        COMP: { ...comp },
      },
      sortedEdges: sortedEdges.map(ed => ({ ...ed, status: edgeStatus[ed.id] }))
    });

    if (compU !== compV) {
      // Unisce le due componenti
      const oldCompV = compV;
      nodes.forEach(node => {
        if (comp[node.id] === oldCompV) {
          comp[node.id] = compU;
        }
      });

      T.push(e.id);
      treeEdgeLabels.push(`(${uNode}-${vNode}: ${e.weight})`);
      edgeStatus[e.id] = 'accepted';

      steps.push({
        stepNumber: stepCount++,
        phase: 'Aggiunta all\'Albero',
        description: `COMP[${uNode}] ≠ COMP[${vNode}]: Nessun ciclo rilevato. Il lato (${uNode}, ${vNode}) viene aggiunto all'albero ricoprente T. Unione delle componenti: tutti i nodi con COMP=${oldCompV} passano a COMP=${compU}.`,
        pseudocodeLine: 12,
        nodeRoles: {
          [u]: 'visited',
          [v]: 'visited',
        },
        edgeRoles: {
          ...Object.fromEntries(T.map(id => [id, 'tree'])),
        },
        treeEdges: [...T],
        sets: {
          T: [...treeEdgeLabels],
        },
        arrays: {
          COMP: { ...comp },
        },
        sortedEdges: sortedEdges.map(ed => ({ ...ed, status: edgeStatus[ed.id] }))
      });
    } else {
      // Ciclo individuato
      edgeStatus[e.id] = 'rejected';

      steps.push({
        stepNumber: stepCount++,
        phase: 'Scarto Lato (Ciclo)',
        description: `COMP[${uNode}] == COMP[${vNode}] (${compU}): Il lato (${uNode}, ${vNode}) forma un ciclo tra nodi già connessi. Viene SCARTATO.`,
        pseudocodeLine: 10,
        nodeRoles: {
          [u]: 'visited',
          [v]: 'visited',
        },
        edgeRoles: {
          ...Object.fromEntries(T.map(id => [id, 'tree'])),
          [e.id]: 'rejected',
        },
        treeEdges: [...T],
        sets: {
          T: [...treeEdgeLabels],
        },
        arrays: {
          COMP: { ...comp },
        },
        sortedEdges: sortedEdges.map(ed => ({ ...ed, status: edgeStatus[ed.id] }))
      });
    }

    i++;
  }

  // Step finale: Completamento
  const totalCost = sortedEdges
    .filter(e => T.includes(e.id))
    .reduce((sum, e) => sum + e.weight, 0);

  const isComplete = T.length === n - 1;

  steps.push({
    stepNumber: stepCount++,
    phase: 'Termine Algoritmo',
    description: isComplete
      ? `Algoritmo di Kruskal terminato con successo! Albero ricoprente minimo trovato con |T| = ${T.length} lati (n - 1) e costo totale = ${totalCost}.`
      : `Algoritmo terminato. Trovati |T| = ${T.length} lati. Il grafo potrebbe non essere connesso.`,
    pseudocodeLine: 16,
    nodeRoles: Object.fromEntries(nodes.map(nd => [nd.id, 'visited'])),
    edgeRoles: Object.fromEntries(T.map(id => [id, 'tree'])),
    treeEdges: [...T],
    sets: {
      T: [...treeEdgeLabels],
    },
    arrays: {
      COMP: { ...comp },
    },
    sortedEdges: sortedEdges.map(ed => ({ ...ed, status: edgeStatus[ed.id] }))
  });

  return steps;
}
