// File: core/architetto.js
// ==========================================================================
// PROGRAMMA ARCHITETTO - Orchestratore Assoluto di Stato (Reattività Vanilla)
// ==========================================================================

export const Architetto = (function() {
    // Stato interno blindato
    let state = {
        appStructure: { sedi: {} },
        appState: {},
        activeProfile: null,
        activeSede: null,
        activeFolder: null,
        activeCatFilter: 'tutti',
        editMode: false,
        isFifo: false,
        showHiddenTimeGated: false,
        clipboardSection: null,
        currentReportTab: 'fare',
        theme: 'dark'
    };

    // Array dei listener iscritti alle mutazioni
    const listeners = [];

    // Metodi Privati
    const notify = () => {
        listeners.forEach(listener => listener(Object.freeze({ ...state })));
    };

    const emitMutation = (mutator) => {
        const prevState = { ...state };
        mutator(state);
        // Evita trigger ridondanti se lo stato non cambia profondamente (ottimizzazione)
        if (JSON.stringify(prevState) !== JSON.stringify(state)) {
            notify();
        }
    };

    return {
        // [ INIZIALIZZATORE ]
        async boot() {
            // Qui Lazzaro inietterà i dati da IndexedDB, per ora prepariamo il terreno
            this.setTheme(localStorage.getItem('nexus_theme') || 'dark');
            console.log("[Architetto] Stato Istanziato. Pronti all'integrazione protocolli.");
            notify();
        },

        // [ PUB/SUB PATTERN ]
        subscribe(listener) {
            listeners.push(listener);
            listener(Object.freeze({ ...state })); // Invia stato iniziale
            return () => {
                const index = listeners.indexOf(listener);
                if (index > -1) listeners.splice(index, 1);
            };
        },

        // [ GETTERS (Solo Lettura) ]
        getState() {
            return Object.freeze({ ...state });
        },

        // [ SETTERS PURI (Mutazioni Controlate) ]
        setStructure(newStructure) {
            emitMutation(s => { s.appStructure = newStructure; });
        },

        setAppState(newStateObj) {
            emitMutation(s => { s.appState = newStateObj; });
        },

        updateItemState(itemKey, updateData) {
            emitMutation(s => {
                if (!s.appState[itemKey]) {
                    s.appState[itemKey] = { fare: false, comprare: false, n_fare: '', n_comprare: '', q: 0 };
                }
                s.appState[itemKey] = { ...s.appState[itemKey], ...updateData };
            });
        },

        setActiveProfile(profileId) {
            emitMutation(s => { s.activeProfile = profileId; });
        },

        setRouting(sedeId, folderId = null) {
            emitMutation(s => {
                s.activeSede = sedeId;
                if (folderId) s.activeFolder = folderId;
            });
        },

        setFilters(catId) {
            emitMutation(s => { s.activeCatFilter = catId; });
        },

        toggleEditMode() {
            emitMutation(s => { s.editMode = !s.editMode; });
        },

        setTheme(themeName) {
            emitMutation(s => {
                s.theme = themeName;
                document.documentElement.setAttribute('data-theme', themeName);
                localStorage.setItem('nexus_theme', themeName);
            });
        }
    };
})();
