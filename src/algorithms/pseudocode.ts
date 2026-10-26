import { AlgorithmType } from '../types/graph';

export interface AlgorithmDoc {
  id: AlgorithmType;
  title: string;
  category: 'mst' | 'paths' | 'flow';
  isEfficient: boolean;
  complexity: string;
  description: string;
  pseudocodeLines: string[];
}

export const ALGORITHM_REGISTRY: Record<AlgorithmType, AlgorithmDoc> = {
  kruskal: {
    id: 'kruskal',
    title: "Algoritmo di Kruskal",
    category: 'mst',
    isEfficient: true,
    complexity: "O(m log m) o O(m α(n))",
    description: "Versione basata sull'ordinamento dei lati e sull'uso della struttura dati Union-Find (COMP).",
    pseudocodeLines: [
      "// Inizializzazione",
      "COMP[i] = i, ∀i ∈ V; (una COMP per ogni vertice)",
      "Ordina tutti i lati in LATI ; (per costi crescenti)",
      "i = 0;",
      "T = ∅;",
      "",
      "// Ciclo Principale",
      "while ( |T| < n - 1 )",
      "{",
      "    e = LATI [i];",
      "    if ( COMP[e.from] != COMP[e.to] )",
      "    then",
      "    {",
      "        fondi i due elementi di COMP;",
      "        T = T ∪ e;",
      "    }",
      "    i++;",
      "}"
    ]
  },
  prim_inefficient: {
    id: 'prim_inefficient',
    title: "Prim-Dijkstra (Versione Non Efficiente)",
    category: 'mst',
    isEfficient: false,
    complexity: "O(n³)",
    description: "Basato sul taglio esplicito [S, S̄] e ricerca globale del lato di costo minimo nel taglio ad ogni passo.",
    pseudocodeLines: [
      "// Inizializzazione",
      "T = ∅;",
      "S = {1}; (diversi alberi con lo stesso peso per diverse S)",
      "",
      "// Ciclo principale",
      "while (|T| < n - 1)",
      "{",
      "    // Trova il lato di costo minimo nel taglio",
      "    (i ∈ S, j ∈ S̄) = arg min{c_h, h ∈ [S, S̄]};",
      "    ",
      "    // Aggiunge (i, j) all'albero e j al taglio",
      "    T = T ∪ (i, j);",
      "    S = S ∪ j;",
      "}"
    ]
  },
  prim_efficient: {
    id: 'prim_efficient',
    title: "Algoritmo di Prim (Versione Efficiente)",
    category: 'mst',
    isEfficient: true,
    complexity: "O(n²)",
    description: "Versione con array dei nodi visitati V e array di aggiornamento locale dei costi C.",
    pseudocodeLines: [
      "// Inizializzazione",
      "T = ∅;",
      "V[i] = 0, ∀i; V[1] = 1;",
      "C[i] = H[1, i], ∀i;",
      "",
      "// Ciclo principale",
      "while (|T| < n - 1)",
      "{",
      "    Trova il vertice k che minimizza i costi in C ∩ !V;",
      "    V[k] = 1;",
      "    T = T ∪ (x, k);",
      "    for ( j = 1; j ≤ n; j++ )",
      "    {",
      "        if ( V[j] == 0 ) && ( H[k, j] < C[j] )",
      "        {",
      "            C[j] = H[k, j];",
      "        }",
      "    }",
      "}"
    ]
  },
  dijkstra_inefficient: {
    id: 'dijkstra_inefficient',
    title: "Dijkstra (Versione Non Efficiente)",
    category: 'paths',
    isEfficient: false,
    complexity: "O(n³)",
    description: "Basato sulla selezione globale tra tutti i lati del taglio orientato uscente [S, S̄]⁺ con criterio D_i + c_ij.",
    pseudocodeLines: [
      "// Inizializzazione",
      "S = {s};",
      "pred[i] = s, ∀i ∈ V;",
      "",
      "// Ciclo principale",
      "for ( i = 0; i < n; i++ )",
      "{",
      "    (h, k) = arg min{ D_i + c_ij : (i, j) ∈ [S, S̄]⁺ };",
      "    ",
      "    // Aggiornamento",
      "    pred[k] = h;",
      "    D[k] = D[h] + c_hk;",
      "    S = S ∪ k;",
      "}"
    ]
  },
  dijkstra_efficient: {
    id: 'dijkstra_efficient',
    title: "Dijkstra (Versione Efficiente)",
    category: 'paths',
    isEfficient: true,
    complexity: "O(n²)",
    description: "Basato su array delle distanze minime D, predecessori pred e vettore di inclusione V.",
    pseudocodeLines: [
      "// Inizializzazione",
      "V[i] = 0, ∀i ∈ V; V[s] = 1;",
      "D[i] = H[s, i], ∀i ∈ V; pred[i] = s, ∀i ∈ V;",
      "",
      "// Ciclo principale",
      "for ( i = 1; i ≤ n - 1; i++ )",
      "{",
      "    Trova il nodo h che minimizza D[h] in D ∩ !V;",
      "    V[h] = 1;",
      "    for ( k = 1; k ≤ n; k++ )",
      "    {",
      "        if ( V[k] == 0 ) && ( D[h] + H[h, k] < D[k] )",
      "        {",
      "            pred[k] = h;",
      "            D[k] = D[h] + H[h, k];",
      "        }",
      "    }",
      "}"
    ]
  },
  floyd_warshall: {
    id: 'floyd_warshall',
    title: "Algoritmo di Floyd-Warshall",
    category: 'paths',
    isEfficient: true,
    complexity: "O(n³)",
    description: "All-Pairs Shortest Path: calcolo di tutti i cammini minimi con aggiornamento simultaneo delle matrici D e pred per k = 1...n.",
    pseudocodeLines: [
      "for each [i, j] ∈ N × N do d[i,j]^(0) := +∞; pred[i,j]^(0) := j; end_for",
      "for each i ∈ N do d[i,i]^(0) := 0; pred[i,i]^(0) := i; end_for",
      "for each (i, j) ∈ A do d[i,j]^(0) := c_ij; pred[i,j]^(0) := i; end_for",
      "",
      "for k := 1 to n do",
      "    for each [i, j] ∈ N × N do",
      "        if d[i,j]^(k-1) > d[i,k]^(k-1) + d[k,j]^(k-1) then",
      "            d[i,j]^(k) := d[i,k]^(k-1) + d[k,j]^(k-1);",
      "            pred[i,j]^(k) := pred[k,j]^(k-1);",
      "        else",
      "            d[i,j]^(k) := d[i,j]^(k-1);",
      "            pred[i,j]^(k) := pred[i,j]^(k-1);",
      "        end_if",
      "    end_for",
      "end_for"
    ]
  },
  ford_fulkerson: {
    id: 'ford_fulkerson',
    title: "Algoritmo di Ford-Fulkerson (Max Flow - Min Cut)",
    category: 'flow',
    isEfficient: true,
    complexity: "O(m · C) o O(n · m²)",
    description: "Verifica ammissibilità flusso iniziale, costruzione rete residua R(x), ricerca cammini aumentanti, aggiornamento v += δ e determinazione del taglio a costo minimo (S, T).",
    pseudocodeLines: [
      "// Inizializzazione",
      "v = 0;",
      "Costruisci R(x) dalla distribuzione di flusso x ;",
      "",
      "// Ciclo principale",
      "while (∃P cammino aumentante da s a t)",
      "{",
      "    δ = min{ r_ij : (i, j) ∈ P }; (massimo flusso aumentante)",
      "    Aggiorna il flusso in R, e ricalcola R(x);",
      "    v += δ; (massimo flusso corrente)",
      "}",
      "// Conclusione: Taglio Minimo (S, T = V \\ S con S raggiungibile da s in R(x))"
    ]
  }
};
