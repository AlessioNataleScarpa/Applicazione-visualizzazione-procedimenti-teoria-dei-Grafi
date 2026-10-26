Ecco tutti gli algoritmi presenti nelle immagini riscritti in formato Markdown. Ho organizzato il documento raggruppando gli algoritmi per tipologia (Minimo Albero Ricoprente, Cammini Minimi, Flussi) e distinguendo tra le versioni efficienti e non efficienti dove presente.

***

# Algoritmi su Grafi

## 1. Minimo Albero Ricoprente (MST)

### Algoritmo di Kruskal
*Versione basata sull'ordinamento dei lati e sull'uso della struttura dati Union-Find (COMP).*

```text
// Inizializzazione
COMP[i] = i, ∀i ∈ V; (una COMP per ogni vertice)
Ordina tutti i lati in LATI ; (per costi crescenti)
i = 0;
T = ∅;

// Ciclo Principale
// Fino a che non ho aggiunto n - 1 lati
while ( |T| < n - 1 )
{
    // Considera il primo lato della lista
    e = LATI [i];
    
    // Se il lato unisce due componenti separate...
    if ( COMP[e.from] != COMP[e.to] )
    then
    // ...aggiorna i dati
    {
        fondi i due elementi di COMP;
        T = T ∪ e;
    }
    i++;
}
```

### Algoritmo di Prim-Dijkstra (Versione Non Efficiente)
*Complessità: \(O(n^3)\)*

```text
// Inizializzazione
T = ∅;
S = {1}; (diversi alberi con lo stesso peso per diverse S)

// Ciclo principale
// Fino a che non ho aggiunto n - 1 lati
while (|T| < n - 1)
{
    // Trova il lato di costo minimo nel taglio
    (i ∈ S, j ∈ S̄) = arg min{c_h, h ∈ [S, S̄]};
    
    // Aggiunge (i, j) all'albero e j al taglio
    T = T ∪ (i, j);
    S = S ∪ j;
}
```

### Algoritmo di Prim (Versione Efficiente con Array di Costi)
*Versione con aggiornamento locale dei costi.*

```text
// Inizializzazione
T = ∅;
V[i] = 0, ∀i;
V[1] = 1;
C[i] = H[1, i], ∀i;

// Ciclo principale
while (|T| < n - 1)
{
    Trova il vertice k che minimizza i costi in C ∩ !V;
    
    // aggiornamento...
    V[k] = 1;
    T = T ∪ (x, k);
    
    // Aggiorna C con i lati adiacenti k
    for ( j = 1; j ≤ n; j++ )
    {
        if ( V[j] == 0 ) && ( H[k, j] < C[j] )
        {
            C[j] = H[k, j];
        }
    }
}
```

---

## 2. Cammini Minimi

### Algoritmo di Dijkstra (Versione Non Efficiente)
*Complessità: \(O(n^3)\) - Basato sulla selezione globale.*

```text
// Inizializzazione
S = {s};
pred[i] = s, ∀i ∈ V;

// Ciclo principale
for ( i = 0; i < n; i++ )
{
    (h, k) = arg min{ D_i + c_ij : (i, j) ∈ [S, S̄]^+ };
    
    // Aggiornamento
    pred[k] = h;
    D[k] = D[h] + c_hk;
    S = S ∪ k;
}
```

### Algoritmo di Dijkstra (Versione Efficiente)
*Complessità: \(O(n^2)\) - Basato su array di distanze e predecessori.*

```text
// Inizializzazione
V[i] = 0, ∀i ∈ V;
V[s] = 1;
D[i] = H[s, i], ∀i ∈ V;
pred[i] = s, ∀i ∈ V;

// Ciclo principale
for ( i = 1; i ≤ n - 1; i++ )
{
    Trova il nodo h che minimizza D[h] in D ∩ !V;
    V[h] = 1;
    
    for ( k = 1; k ≤ n; k++ )
    {
        if ( V[k] == 0 ) && ( D[h] + H[h, k] < D[k] )
        {
            // Aggiornamento
            pred[k] = h;
            D[k] = D[h] + H[h, k];
        }
    }
}
```

### Algoritmo di Floyd-Warshall
*Calcolo di tutti i cammini minimi tra tutte le coppie (All-Pairs Shortest Path).*

```text
for each [i, j] ∈ N × N do
    d_{[i,j]}^{(0)} := +∞; pred_{[i,j]}^{(0)} := j;
end_for

for each i ∈ N do
    d_{[i,i]}^{(0)} := 0; pred_{[i,i]}^{(0)} := i;
end_for

for each (i, j) ∈ A do
    d_{[i,j]}^{(0)} := c_ij; pred_{[i,j]}^{(0)} := i;
end_for

for k := 1 to n do
    for each [i, j] ∈ N × N do
        if d_{[i,j]}^{(k-1)} > d_{[i,k]}^{(k-1)} + d_{[k,j]}^{(k-1)} then
            d_{[i,j]}^{(k)} := d_{[i,k]}^{(k-1)} + d_{[k,j]}^{(k-1)};
            pred_{[i,j]}^{(k)} := pred_{[k,j]}^{(k-1)};
        else
            d_{[i,j]}^{(k)} := d_{[i,j]}^{(k-1)};
            pred_{[i,j]}^{(k)} := pred_{[i,j]}^{(k-1)};
        end_if
    end_for
end_for
```

---

## 3. Problemi di Flusso

### Algoritmo di Ford-Fulkerson
*Versione generica per il massimo flusso.*

```text
// Inizializzazione
v = 0;
Costruisci R(x) dalla distribuzione di flusso x ;

// Ciclo principale
while (∃P cammino aumentante da s a t)
{
    δ = min{ r_ij : (i, j) ∈ P }; (massimo flusso aumentante)
    Aggiorna il flusso in R, e ricalcola R(x);
    v += δ; (massimo flusso corrente)
}
```