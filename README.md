# Applicazione Didattica per la Visualizzazione dei Procedimenti di Teoria dei Grafi

Applicazione web moderna sviluppata in **React 18 + TypeScript + Vite + Tailwind CSS** per studenti universitari del corso di Teoria dei Grafi.
L'applicazione visualizza passo-passo ogni iterazione degli algoritmi presenti nel programma di studio, permettendo il controllo interattivo della riproduzione, l'ispezione delle strutture dati matematiche e la modifica/creazione di grafi personalizzati.

---

## ⚠️ Disclaimer e Limitazione di Responsabilità (Scopo Didattico)

> [!WARNING]
> **ESCLUSIVO USO DIDATTICO E ACCADEMICO**  
> Questo software è un progetto open-source sviluppato **esclusivamente a scopo illustrativo, sperimentale e didattico** per supportare lo studio teorico dei grafi.
>
> 1. **Possibile presenza di bug o errori**: Il codice, le visualizzazioni, i calcoli, gli pseudocodici e le simulazioni potrebbero contenere imprecisioni, errori di calcolo, regressioni visive o bug matematico-algoritmici. Non viene fornita alcuna garanzia di completezza, accuratezza, affidabilità o idoneità per qualsivoglia scopo.
> 2. **Esclusione di responsabilità (As Is)**: Il software viene fornito *"così com'è"* ("AS IS"), senza garanzie di alcun tipo, esplicite o implicite. In nessun caso l'autore o i contributori potranno essere ritenuti responsabili per danni diretti, indiretti, incidentali, speciali o consequenziali (inclusi, a titolo esemplificativo, perdita di dati, errori di valutazione in esami o contesti accademici, interruzioni di servizio o perdite economiche) derivanti dall'uso o dall'impossibilità di usare questo software.
> 3. **Divieto di utilizzo critico / industriale**: Il software non è inteso né certificato per l'impiego in ambienti di produzione, contesti operativi critici, commerciali, industriali o decisionali. L'utente si assume l'intera responsabilità per qualunque utilizzo del software o dei suoi risultati al di fuori della semplice consultazione didattica personale.

---

## 🎯 Algoritmi Implementati

### 1. Minimo Albero Ricoprente (MST)
- **Kruskal (con Union-Find / `COMP`)**: ordinamento dei lati per costo crescente, gestione componenti connesse con array `COMP`, rilevamento e scarto esplicito dei cicli.
- **Prim-Dijkstra (Versione Non Efficiente $O(n^3)$)**: partizione esplicita in insiemi $S$ e $\bar{S}$, calcolo dei lati del taglio $[S, \bar{S}]$, selezione del minimo e crescita dell'albero ricoprente.
- **Prim (Versione Efficiente $O(n^2)$)**: array dei nodi visitati $V$, array dei costi al taglio $C$, selezione del perno $k$ e rilassamento locale dei vicini non visitati.

### 2. Cammini Minimi
- **Dijkstra (Versione Non Efficiente $O(n^3)$)**: selezione globale nel taglio orientato uscente $[S, \bar{S}]^+$ con criterio $D_i + c_{ij}$.
- **Dijkstra (Versione Efficiente $O(n^2)$)**: array distanze $D$, predecessori $pred$ e inclusione $V$, con rilassamento degli archi uscenti dal nodo estratto.
- **Floyd-Warshall ($O(n^3)$)**: calcolo All-Pairs Shortest Path con **visualizzazione simultanea delle due matrici** $D^{(k)}$ e $pred^{(k)}$ per ogni $k = 0 \dots n$, evidenziazione delle celle aggiornate e strumento interattivo di ricostruzione del cammino tra qualsiasi coppia di nodi.

### 3. Problemi di Flusso
- **Ford-Fulkerson (Max Flow - Min Cut)**:
  - **Verifica dell'ammissibilità del flusso iniziale**: se viola i vincoli di capacità o di conservazione, tutti i flussi iniziali vengono automaticamente azzerati come da specifica.
  - **Rete Residua $R(x)$**: archi in avanti ($c_{ij} - x_{ij}$) e archi all'indietro ($x_{ij}$).
  - **Cammini Aumentanti**: identificazione del cammino $P$ e calcolo del collo di bottiglia $\delta$.
  - **Teorema del Massimo Flusso - Minimo Taglio**: calcolo finale della partizione del taglio $(S, T)$, identificazione dei lati saturi del taglio e verifica matematica $\text{Flusso Massimo} = \text{Capacità Taglio Minimo}$.

---

## 🚀 Istruzioni per l'Avvio

### 1. Installazione Dipendenze
```bash
npm install
```

### 2. Avvio Server di Sviluppo
```bash
npm run dev
```
Apri il browser all'indirizzo `http://localhost:5173`.

### 3. Esecuzione Test Automatizzati
```bash
npm test
```
Esegue i test di correttezza matematica e di gestione dei casi limite con Vitest.

### 4. Build di Produzione
```bash
npm run build
```

---

## 🏗 Struttura del Progetto

```
├── src/
│   ├── algorithms/          # Core Algoritmi
│   │   ├── mst/             # Kruskal, Prim Inefficiente, Prim Efficiente
│   │   ├── paths/           # Dijkstra Inefficiente, Dijkstra Efficiente, Floyd-Warshall
│   │   ├── flow/            # Ford-Fulkerson Max Flow - Min Cut
│   │   └── pseudocode.ts    # Registro pseudocodice e complessità da Algoritmi.md
│   ├── components/
│   │   ├── graph/           # Canvas SVG Interattivo con Drag-and-Drop
│   │   ├── inspector/       # Matrici Floyd, Insiemi S/S̄, Array V/C/D/pred, Taglio Minimo
│   │   ├── controls/        # Player Play/Pause, Step Scrubber, Velocità
│   │   ├── editor/          # Editor di Grafi Personalizzati
│   │   └── pseudocode/      # Pannello con evidenziazione riga attiva
│   ├── data/
│   │   └── presets.ts       # Preset didattici per ogni algoritmo
│   ├── test/                # Test Suite & Validazione Matematico-Didattica
│   │   ├── algorithms.test.ts
│   │   └── edgeCases.test.ts
│   ├── types/
│   │   └── graph.ts         # Modello dati grafo e snapshot degli step
│   ├── App.tsx              # Integrazione globale e controller reattivo
│   └── main.tsx
```

---

## 📄 Licenza

Rilasciato sotto licenza [MIT](LICENSE). Consultare il file `LICENSE` per ulteriori dettagli.
