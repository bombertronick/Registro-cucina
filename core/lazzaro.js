// File: core/lazzaro.js
// ==========================================================================
// PROTOCOLLO LAZZARO - Motore di Persistenza Assoluta e Resilienza (IndexedDB)
// ==========================================================================

export const Lazzaro = (function() {
    // Costanti e chiavi per il database locale
    const DB_STORE_NAME = "Scutum_Absolute_DB";
    const KEY_STRUCT = "nexus_struct_v15_3";
    const KEY_STATE = "nexus_state_v15_3";

    /**
     * Inizializza il layer IndexedDB tramite localforage.
     * Crea un ambiente isolato e ottimizzato per grandi payload (JSON).
     */
    const initDB = () => {
        if (typeof localforage === 'undefined') {
            console.error("[Lazzaro] Allarme Critico: localforage non rilevato nel DOM. Persistenza compromessa.");
            return;
        }
        localforage.config({
            driver: localforage.INDEXEDDB, // Forza IndexedDB per massima capacità e asincronicità
            name: 'ScutumERP_Absolute',
            version: 15.3,
            storeName: DB_STORE_NAME,
            description: 'Storage blindato per la matrice dati di Scutum ERP'
        });
    };

    /**
     * Generatore di ID alfanumerici unici per i Nodi della Matrice.
     * @returns {string} ID univoco
     */
    const generateId = () => Math.random().toString(36).substring(2, 11);

    /**
     * Matrice di Ripristino (Recovery Matrix).
     * Viene innescata automaticamente se il database è vuoto, vergine o corrotto.
     * @returns {Object} Struttura topologica di base
     */
    const getRecoveryStructure = () => {
        const sid = 'sede_root_' + generateId();
        const fid = 'folder_root_' + generateId();
        return {
            sedi: {
                [sid]: {
                    id: sid,
                    name: "COMANDO CENTRALE",
                    folders: {
                        [fid]: { id: fid, name: "TURNO ROOT", sections: [] }
                    },
                    roles: [],
                    checklists: [],
                    supplierCategories: [],
                    categories: [{ id: 'cat_gen', name: 'Generale', color: '#C9A464', type: 'standard' }]
                }
            }
        };
    };

    return {
        // [ INIZIALIZZATORE ]
        async boot() {
            initDB();
            console.log("[Lazzaro] Motore di persistenza IndexedDB innescato con successo.");
        },

        // [ GESTIONE MEMORIA STRUTTURALE (appStructure) ]
        
        /**
         * Salva l'intera struttura del gestionale in IndexedDB.
         * @param {Object} structureObj - L'albero completo (Sedi, Folder, Categorie, ecc.)
         */
        async saveStructure(structureObj) {
            try {
                await localforage.setItem(KEY_STRUCT, structureObj);
                return true;
            } catch (e) {
                console.error("[Lazzaro] Fallimento salvataggio Struttura nel Core:", e);
                return false;
            }
        },

        /**
         * Carica la struttura dal DB. Se manca o è corrotta, applica la Recovery Matrix.
         * @returns {Object} Struttura sanitizzata
         */
        async loadStructure() {
            try {
                let struct = await localforage.getItem(KEY_STRUCT);
                
                // Autodiagnostica: Se vuoto, ricrea topologia
                if (!struct || !struct.sedi || Object.keys(struct.sedi).length === 0) {
                    console.warn("[Lazzaro] Matrice vuota o non rilevata. Generazione topologia di base in corso...");
                    struct = getRecoveryStructure();
                    await this.saveStructure(struct);
                }
                
                // Allineamento Vettori: iniezione array mancanti (Sanitizzazione prototipo originale)
                Object.values(struct.sedi).forEach(s => {
                    if (!Array.isArray(s.categories) || s.categories.length === 0) {
                        s.categories = [{ id: 'c1', name: 'Generale', color: 'var(--accent)', type: 'standard' }];
                    }
                    if (!Array.isArray(s.roles)) s.roles = [];
                    if (!Array.isArray(s.checklists)) s.checklists = [];
                    if (!Array.isArray(s.supplierCategories)) s.supplierCategories = [];
                    if (!s.folders || typeof s.folders !== 'object') s.folders = {};
                });

                return struct;
            } catch (e) {
                console.error("[Lazzaro] Corruzione critica settore Struttura. Formattazione di sicurezza.", e);
                const rec = getRecoveryStructure();
                await this.saveStructure(rec);
                return rec;
            }
        },

        // [ GESTIONE STATO OPERATIVO (appState) ]

        /**
         * Salva le spunte (Fare/Comprare), le quantità e le note.
         * @param {Object} stateObj - Dizionario dello stato operativo
         */
        async saveState(stateObj) {
            try {
                await localforage.setItem(KEY_STATE, stateObj);
                return true;
            } catch (e) {
                console.error("[Lazzaro] Fallimento salvataggio Stato nel Core:", e);
                return false;
            }
        },

        /**
         * Carica lo stato e colma eventuali proprietà mancanti dovute ad aggiornamenti.
         * @returns {Object} Stato operativo sanitizzato
         */
        async loadState() {
            try {
                let state = await localforage.getItem(KEY_STATE);
                if (!state || typeof state !== 'object' || Array.isArray(state)) {
                    state = {};
                }

                // Migrazione e Purga Variabili Asincrone (dal vecchio prototipo a V15.3)
                let migrated = false;
                Object.keys(state).forEach(k => {
                    let st = state[k];
                    if (st && typeof st === 'object' && !Array.isArray(st)) {
                        if (st.fare === undefined) { st.fare = false; migrated = true; }
                        if (st.comprare === undefined) { st.comprare = false; migrated = true; }
                        if (st.n_fare === undefined) { st.n_fare = ''; migrated = true; }
                        if (st.n_comprare === undefined) { st.n_comprare = ''; migrated = true; }
                        if (st.q === undefined) { st.q = 0; migrated = true; }
                    } else {
                        // Rimuove nodi stato corrotti o obsoleti
                        delete state[k];
                        migrated = true;
                    }
                });

                if (migrated) {
                    await this.saveState(state);
                }

                return state;
            } catch (e) {
                console.error("[Lazzaro] Errore in lettura Stato Operativo. Inizializzazione pulita.", e);
                await this.saveState({});
                return {};
            }
        },

        // [ UTILITÀ ESPORTATE ]
        generateId
    };
})();
