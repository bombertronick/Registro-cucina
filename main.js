// File: main.js
// ==========================================================================
// BOOTLOADER GLOBALE - Innesco e Coordinamento Protocolli
// ==========================================================================
import { Architetto } from './core/architetto.js';
import { Lazzaro } from './core/lazzaro.js';
import { UICore } from './ui/core.js';
import { AuthUI } from './ui/auth.js';
// (ui/app.js verrà importato in FASE 4 - Parte 2)

document.addEventListener('DOMContentLoaded', async () => {
    console.log("[System] Avvio Sequenza Absolute V15.3...");

    // 1. Accensione Motore IndexedDB (Lazzaro)
    await Lazzaro.boot();
    
    // 2. Estrazione Matrice e Stato dal database locale
    const structure = await Lazzaro.loadStructure();
    const state = await Lazzaro.loadState();

    // 3. Iniezione dati in RAM tramite l'Architetto
    await Architetto.boot();
    Architetto.setStructure(structure);
    Architetto.setAppState(state);

    // Impostazione Puntatori Iniziali di Navigazione
    const sKeys = Object.keys(structure.sedi); 
    const initialSede = sKeys.length > 0 ? sKeys[0] : null;
    let initialFolder = null;
    if (initialSede && structure.sedi[initialSede].folders) {
        const fKeys = Object.keys(structure.sedi[initialSede].folders);
        initialFolder = fKeys.length > 0 ? fKeys[0] : null;
    }
    Architetto.setRouting(initialSede, initialFolder);

    // 4. Innesco Interfaccia Utente Autenticazione
    AuthUI.init();
    AuthUI.refresh();

    // 5. Iscrizione dell'Architetto a Lazzaro (Salvataggio automatico su DB al variare dello stato)
    Architetto.subscribe((newState) => {
        // Quando l'Architetto emette una mutazione, Lazzaro salva asincronamente
        Lazzaro.saveStructure(newState.appStructure);
        Lazzaro.saveState(newState.appState);
    });

    // 6. Routing basato su sessione attiva
    const activeSession = localStorage.getItem('nexus_session');
    
    if (!activeSession) {
        UICore.switchSpaView('view-auth');
    } else {
        Architetto.setActiveProfile(activeSession);
        routeUser(activeSession);
    }
    
    // Ascoltatore eventi di Login riuscito
    window.addEventListener('auth:success', (e) => {
        routeUser(e.detail.profileId);
    });
});

/**
 * RBAC Routing: Instrada l'utente in base ai permessi
 */
function routeUser(profileId) {
    const state = Architetto.getState();
    const isRoot = profileId === 'admin';
    const role = !isRoot ? state.appStructure.sedi[state.activeSede].roles.find(x => x.id === profileId) : null;
    
    if (role && role.type === 'checklist') {
        // Utente Isolato -> Vista Checklist (Da generare in Parte 2)
        console.log("Instradamento: Nodo Isolato");
        UICore.switchSpaView('view-checklist');
        // Verrà innescato il renderChecklistHub()
    } else {
        // Utente Completo / Admin -> Vista ERP Completa (Da generare in Parte 2)
        console.log("Instradamento: Matrice Principale");
        UICore.switchSpaView('view-app');
        // Verrà innescato renderApp()
    }
}
