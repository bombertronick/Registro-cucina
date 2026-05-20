// File: core/cerbero.js
// ==========================================================================
// PROTOCOLLO CERBERO - Motore di Crittografia, Autenticazione e Vault
// ==========================================================================

export const Cerbero = (function() {
    // Salt di sistema per rafforzare l'hashing (generato staticamente per questo ambiente)
    const SYSTEM_SALT = "Scutum_Absolute_V15.3_Crypto_Salt_X91";
    
    // Chiave di storage per i dati blindati
    const VAULT_KEY = "nexus_cloud_vault";
    const ROOT_PIN_KEY = "nexus_root_hash";

    /**
     * Esegue l'hashing irreversibile di una stringa combinata con il Salt di sistema.
     * Utilizza SHA-256 dalla libreria CryptoJS.
     * @param {string} text - Il testo in chiaro (es. il PIN)
     * @returns {string} - L'hash esadecimale risultante
     */
    const hashData = (text) => {
        if (!text) return null;
        // Se CryptoJS non è caricato (errore CDN), lancia un'eccezione ferrea
        if (typeof CryptoJS === 'undefined') {
            throw new Error("[Cerbero] Allarme: Motore Crittografico (CryptoJS) non rilevato nel DOM.");
        }
        return CryptoJS.SHA256(text + SYSTEM_SALT).toString(CryptoJS.enc.Hex);
    };

    /**
     * Cripta un payload in formato AES-256.
     * @param {string} payload - I dati sensibili in chiaro (es. Chiave API Cloud)
     * @param {string} secretKey - La chiave di cifratura (es. il PIN dell'utente)
     * @returns {string} - Dati cifrati in Base64
     */
    const encryptAES = (payload, secretKey) => {
        if (!payload || !secretKey) return null;
        const secretHash = hashData(secretKey); // Usiamo l'hash del PIN come chiave robusta
        return CryptoJS.AES.encrypt(payload, secretHash).toString();
    };

    /**
     * Decripta un payload AES-256.
     * @param {string} cipherText - I dati cifrati
     * @param {string} secretKey - La chiave di cifratura originale (il PIN)
     * @returns {string|null} - I dati in chiaro, o null se la chiave è errata
     */
    const decryptAES = (cipherText, secretKey) => {
        if (!cipherText || !secretKey) return null;
        try {
            const secretHash = hashData(secretKey);
            const bytes = CryptoJS.AES.decrypt(cipherText, secretHash);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            return decrypted || null; // Ritorna null se la decodifica fallisce (chiave errata)
        } catch (error) {
            console.error("[Cerbero] Violazione di Accesso: Fallimento decrittazione.", error);
            return null;
        }
    };

    return {
        // [ GESTIONE IDENTITÀ ROOT ]
        
        /**
         * Inizializza la Firma Root (PIN di base per l'amministratore).
         * Salva solo l'Hash, MAI il PIN in chiaro.
         * @param {string} pin - Il PIN in chiaro inserito dall'utente
         */
        setupRootSignature(pin) {
            const hashedPin = hashData(pin);
            localStorage.setItem(ROOT_PIN_KEY, hashedPin);
            return true;
        },

        /**
         * Verifica se una Firma (PIN) corrisponde a quella di Root salvata.
         * @param {string} pin - Il PIN in chiaro da testare
         * @returns {boolean} - True se autorizzato, False se respinto
         */
        verifyRootSignature(pin) {
            const storedHash = localStorage.getItem(ROOT_PIN_KEY);
            // Se non esiste un PIN Root (primo avvio), non possiamo autorizzare il login
            if (!storedHash) return false;
            
            const attemptHash = hashData(pin);
            return attemptHash === storedHash;
        },

        /**
         * Controlla se il sistema è vergine (Nessuna Firma Root impostata)
         */
        isSystemVirgin() {
            return localStorage.getItem(ROOT_PIN_KEY) === null;
        },

        // [ GESTIONE IDENTITÀ OPERATORI ]

        /**
         * Genera un Hash sicuro per il PIN di un operatore (da salvare nel JSON della matrice).
         */
        hashOperatorPin(pin) {
            return hashData(pin);
        },

        /**
         * Valida un PIN operatore confrontandolo con l'hash salvato nella matrice.
         */
        verifyOperatorSignature(pinAttempt, storedHash) {
            if (!storedHash) return false;
            return hashData(pinAttempt) === storedHash;
        },

        // [ VAULT CHIAVI SENSIBILI (CLOUD API) ]

        /**
         * Prende la chiave API in chiaro, la cripta usando il PIN Root, e la salva.
         * Il codice su GitHub non conterrà mai questa chiave.
         * @param {string} apiKey - La chiave API (es. di JSONBin)
         * @param {string} rootPin - Il PIN dell'amministratore per blindarla
         */
        storeCloudVault(apiKey, rootPin) {
            if (!this.verifyRootSignature(rootPin)) {
                throw new Error("[Cerbero] Firma Root non valida. Impossibile sigillare il Vault.");
            }
            const encryptedKey = encryptAES(apiKey, rootPin);
            localStorage.setItem(VAULT_KEY, encryptedKey);
            return true;
        },

        /**
         * Estrae e decripta la chiave API dal Vault locale.
         * @param {string} rootPin - Il PIN dell'amministratore per sbloccarla
         * @returns {string|null} - La chiave API in chiaro (volatile) o null
         */
        unlockCloudVault(rootPin) {
            const encryptedKey = localStorage.getItem(VAULT_KEY);
            if (!encryptedKey) return null; // Vault vuoto

            const decryptedKey = decryptAES(encryptedKey, rootPin);
            if (!decryptedKey) {
                throw new Error("[Cerbero] Sblocco Vault fallito. Firma errata o Dati Corrotti.");
            }
            return decryptedKey;
        },
        
        /**
         * Verifica se esiste una chiave blindata nel Vault
         */
        isCloudVaultSealed() {
            return localStorage.getItem(VAULT_KEY) !== null;
        },
        
        /**
         * Distrugge il Vault Cloud (Disconnessione Forzata)
         */
        destroyCloudVault() {
            localStorage.removeItem(VAULT_KEY);
        }
    };
})();
