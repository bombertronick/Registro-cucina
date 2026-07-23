# 🍳 Cucina ERP

Gestionale web (PWA) per **cucine, pizzerie e ristorazione**. Pensato per l'uso
quotidiano da smartphone: gestisce preparazioni, magazzino, ordini ai fornitori,
report per la brigata e checklist di procedura — tutto **offline**, con dati
salvati sul dispositivo e sincronizzazione cloud opzionale tra più sedi.

È un'app **single-file**: tutta la logica vive in `index.html`. Nessun build,
nessuna dipendenza da installare.

## ✨ Funzionalità

- **Multi-sede** — gestisci più locali, ognuno con i propri reparti, turni e profili.
- **Turni & frigoriferi** — organizza i prodotti per turno di lavoro e per cella/scaffale.
- **Prodotti** — nome, reparto, fornitore, costo, scadenza HACCP, note/ricetta e
  pianificazione della visibilità per giorno della settimana.
- **Doppio flusso operativo** — segna ogni voce come **Da Fare** (preparazione) o
  **Da Comprare** (ordine).
- **Reparto Magazzino** — contatore di giacenza con giacenza ideale: genera in
  automatico la quantità mancante da ordinare.
- **Report intelligenti** — "Da Fare" raggruppato per reparto e "Da Comprare"
  raggruppato per fornitore, esportabili su **WhatsApp** o in **CSV/Excel**.
- **Dashboard KPI** — valore di magazzino, prodotti in scadenza e avanzamento turni.
- **Ruoli & permessi (RBAC)** — profili Manager, operatori ERP (con reparti
  assegnati) e profili "solo Hub Procedure" per cassieri/pulizie.
- **Hub Checklist** — pulsanti verso moduli/Google Form per apertura cassa,
  procedure di pulizia, ecc.
- **FIFO** — ordinamento per scadenza più vicina.
- **Backup locale ("Macchina del Tempo")** — snapshot automatici giornalieri
  ripristinabili.
- **Cloud Hub Sync** — condividi e allinea la struttura aziendale tra dispositivi
  tramite un codice azienda.
- **PWA installabile** — aggiungi alla home del telefono e usala offline.
- **Tema chiaro/scuro** (OLED).

## 🚀 Utilizzo

Essendo un file statico, basta servirlo da un qualsiasi hosting statico.

### GitHub Pages
1. In *Settings → Pages* seleziona il branch e la cartella root.
2. Apri l'URL pubblicato: l'app funziona subito.

### In locale
```bash
# un qualsiasi server statico va bene (il service worker richiede http/https)
python3 -m http.server 8080
# poi apri http://localhost:8080
```
> Aprendo `index.html` con `file://` l'app funziona ma il service worker
> (installazione/offline) non si attiva: serve un server http.

## 🔑 Primo accesso

- Al primo login come **Area Manager / Proprietario** la password che inserisci
  viene impostata come password Admin.
- Esiste una **Master Key** di servizio (`9999`) per lo sblocco d'emergenza.
- Da *Sblocca Modifiche* il Manager accede alla configurazione di sedi, reparti,
  fornitori, profili e checklist.

## 📁 Struttura del progetto

| File | Descrizione |
|------|-------------|
| `index.html` | L'intera applicazione (UI + logica). |
| `manifest.webmanifest` | Metadati PWA per l'installazione. |
| `sw.js` | Service worker: cache dell'app shell e funzionamento offline. |
| `icon.svg` | Icona dell'app. |

## 💾 Dati & privacy

Tutti i dati operativi sono salvati **localmente** nel browser (`localStorage`).
La sincronizzazione cloud è **opzionale** e usa [jsonbin.io](https://jsonbin.io)
tramite il "Codice Azienda". Nessun dato lascia il dispositivo finché non attivi
il Cloud Hub.

## 🛠️ Note tecniche

- Nessun framework: HTML + CSS + JavaScript vanilla.
- Persistenza con `localStorage` e migrazione automatica dalle versioni
  precedenti (V9 → V10).
- Font: Plus Jakarta Sans + Font Awesome (via CDN, con fallback offline dalla
  cache del service worker dopo la prima visita).
