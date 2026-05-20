// File: main.js (Revisione Completa Definitiva)
// ==========================================================================
// BOOTLOADER GLOBALE - Innesco e Coordinamento Assoluto (I 4 Protocolli)
// ==========================================================================
import { Architetto } from './core/architetto.js';
import { Cerbero } from './core/cerbero.js';
import { Lazzaro } from './core/lazzaro.js';
import { UICore } from './ui/core.js';
import { AuthUI } from './ui/auth.js';
import { AppUI } from './ui/app.js';
import { AdminUI } from './ui/admin.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log("[System] Avvio Sequenza Absolute V15.3 Offline-First...");

    try {
        // [ 1. PROTOCOLLO LAZZARO ] - Estrazione dati salvati nel DB
        await Lazzaro.boot();
        const structure = await Lazzaro.loadStructure();
        const state = await Lazzaro.loadState();

        // [ 2. PROGRAMMA ARCHITETTO ] - Iniezione stato in memoria RAM
        await Architetto.boot();
        Architetto.setStructure(structure);
        Architetto.setAppState(state);

        // Routing logico base
        const sKeys = Object.keys(structure.sedi); 
        const initialSede = sKeys.length > 0 ? sKeys[0] : null;
        let initialFolder = null;
        if (initialSede && structure.sedi[initialSede].folders) {
            const fKeys = Object.keys(structure.sedi[initialSede].folders);
            initialFolder = fKeys.length > 0 ? fKeys[0] : null;
        }
        Architetto.setRouting(initialSede, initialFolder);

        // Salvataggio automatico (Reattività) al mutare dello stato
        Architetto.subscribe((newState) => {
            Lazzaro.saveStructure(newState.appStructure);
            Lazzaro.saveState(newState.appState);
        });

        // [ 3. IL FATTORE UMANO ] - Generazione Componenti Visivi
        AuthUI.init();
        AppUI.init();
        AdminUI.init(); // Inietta Dashboard, Report e Cloud Vault
        
        AuthUI.refresh(); // Popola la fisarmonica di login
        
        // [ 4. PROTOCOLLO CERBERO ] - Valutazione e Routing Sessione
        const activeSession = localStorage.getItem('nexus_session');
        
        const routeUser = (profileId) => {
            const currentState = Architetto.getState();
            const isRoot = profileId === 'admin';
            const role = !isRoot ? currentState.appStructure.sedi[currentState.activeSede].roles.find(x => x.id === profileId) : null;
            
            if (role && role.type === 'checklist') {
                UICore.switchSpaView('view-checklist'); // La view isolata per operatori restrittivi
            } else {
                UICore.switchSpaView('view-app'); // Gestione matrice completa
            }
        };

        if (!activeSession) {
            UICore.switchSpaView('view-auth'); // Schermata Login
        } else {
            Architetto.setActiveProfile(activeSession);
            routeUser(activeSession);
        }
        
        // Listener per Login Riuscito emesso da AuthUI
        window.addEventListener('auth:success', (e) => {
            routeUser(e.detail.profileId);
        });

    } catch (criticalError) {
        console.error("ERRORE FATALE DI INNESCO: ", criticalError);
        document.body.innerHTML = `<div style="padding:40px; color:#ff4444; font-family:sans-serif; text-align:center;">
            <h1><i class="fa-solid fa-triangle-exclamation"></i> KERNEL PANIC</h1>
            <p>Il sistema non è riuscito ad avviarsi. Corruzione moduli o IndexedDB inaccessibile.</p>
        </div>`;
    }
});
