// File: ui/admin.js
// ==========================================================================
// FATTORE UMANO - Amministrazione, Reportistica e Cloud Sync (Vault)
// ==========================================================================
import { Architetto } from '../core/architetto.js';
import { Cerbero } from '../core/cerbero.js';
import { UICore } from './core.js';

export const AdminUI = (function() {
    
    // [ 1. INIEZIONE MODALI AVANZATI ]
    const buildAdminModals = () => {
        const layer = document.getElementById('modal-layer');
        layer.innerHTML = `
            <!-- MODALE CLOUD SYNC & VAULT -->
            <div class="modal-overlay" id="modal-cloud">
                <div class="modal-box">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 16px;">
                        <h3 style="font-weight: 800; font-size: 1.4rem; color: var(--accent);">Sync Rete Globale</h3>
                        <i class="fa-solid fa-arrow-left" style="font-size: 1.4rem; cursor: pointer; color: var(--text-muted);" onclick="history.back()"></i>
                    </div>
                    
                    <!-- FASE A: Sigillo del Vault (Visibile solo se il Vault è vuoto) -->
                    <div id="cloud-vault-setup" style="display: none; background: rgba(140, 34, 34, 0.1); border: 1px solid var(--danger); padding: 24px; border-radius: 12px; margin-bottom: 24px;">
                        <h4 style="color: var(--danger); margin-bottom: 12px; font-weight: 800;"><i class="fa-solid fa-lock"></i> Vault Compromesso / Vuoto</h4>
                        <p style="font-size: 0.85rem; color: var(--text); margin-bottom: 16px;">Inserisci la Master API Key (es. JSONBin) per cifrarla nel database locale. Non verrà mai salvata in chiaro.</p>
                        
                        <div class="input-group">
                            <input type="password" id="setup-api-key" placeholder="Incolla Master API Key">
                        </div>
                        <div class="input-group">
                            <input type="password" id="setup-root-pin" placeholder="Inserisci il tuo PIN Root per sigillare">
                        </div>
                        <button class="btn-action solid" id="btn-seal-vault" style="background: var(--danger); border-color: var(--danger);">SIGILLA VAULT AES-256</button>
                    </div>

                    <!-- FASE B: Operatività Cloud (Visibile se il Vault è sigillato) -->
                    <div id="cloud-sync-ops" style="display: none; background: var(--input-bg); padding: 24px; border-radius: 12px; border: 1px solid var(--accent);">
                        <div class="input-group">
                            <label style="color: var(--accent);">Codice Assoluto JSONBin (Bin ID)</label>
                            <input type="text" id="cloud-alias-input" placeholder="es. 64a7b..." style="font-weight: 800; background: var(--card); text-align: center; letter-spacing: 2px;">
                        </div>
                        
                        <div class="input-group" style="margin-top: 24px; padding-top: 24px; border-top: 1px dashed var(--border);">
                            <label style="color: var(--warning);"><i class="fa-solid fa-key"></i> Sblocco Vault Crittografico</label>
                            <input type="password" id="cloud-auth-pin" placeholder="Inserisci PIN Root per decrittare l'API">
                        </div>
                        
                        <div style="display: flex; gap: 12px; margin-top: 32px;">
                            <button class="btn-action" id="btn-cloud-download" style="background: var(--card); color: var(--text); border: 2px solid var(--border);">
                                <i class="fa-solid fa-download"></i> SCARICA
                            </button>
                            <button class="btn-action solid" id="btn-cloud-upload">
                                <i class="fa-solid fa-upload"></i> UPLOAD
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- MODALE REPORTISTICA -->
            <div class="modal-overlay" id="modal-report">
                <div class="modal-box" style="max-width: 800px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 16px;">
                        <h3 style="font-weight: 800; font-size: 1.4rem; color: var(--success);">Sintesi Dati Isolati</h3>
                        <i class="fa-solid fa-arrow-left" style="font-size: 1.4rem; cursor: pointer; color: var(--text-muted);" onclick="history.back()"></i>
                    </div>
                    
                    <div style="display: flex; gap: 8px; background: var(--input-bg); padding: 8px; border-radius: 12px; margin-bottom: 24px; border: 1px solid var(--border);">
                        <div id="tab-report-fare" data-tab="fare" class="report-tab" style="flex: 1; text-align: center; padding: 14px; border-radius: 8px; cursor: pointer; font-weight: 800; background: var(--card); color: var(--accent); border: 1px solid var(--accent); transition: 0.3s;">MATRICE CUCINA</div>
                        <div id="tab-report-comprare" data-tab="comprare" class="report-tab" style="flex: 1; text-align: center; padding: 14px; border-radius: 8px; cursor: pointer; font-weight: 800; color: var(--text-muted); transition: 0.3s;">MATRICE ORDINI</div>
                    </div>
                    
                    <div id="report-preview-fare" style="max-height: 50vh; overflow-y: auto; padding: 24px; background: var(--input-bg); border-radius: 12px; margin-bottom: 24px; border: 1px solid var(--border);"></div>
                    <div id="report-preview-comprare" style="display: none; max-height: 50vh; overflow-y: auto; padding: 24px; background: var(--input-bg); border-radius: 12px; margin-bottom: 24px; border: 1px solid var(--border);"></div>
                    
                    <button class="btn-action" id="btn-export-wa" style="background: #25D366; color: white; border: none; font-size: 1.1rem; width: 100%;">
                        <i class="fa-brands fa-whatsapp" style="font-size: 1.4rem;"></i> TRASMETTI MATRICE
                    </button>
                </div>
            </div>

            <!-- MODALE TELEMETRIA (DASHBOARD) -->
            <div class="modal-overlay" id="modal-dashboard">
                <div class="modal-box">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 16px;">
                        <h3 style="font-weight: 800; font-size: 1.4rem; color: var(--accent);">Telemetria Operativa</h3>
                        <i class="fa-solid fa-arrow-left" style="font-size: 1.4rem; cursor: pointer; color: var(--text-muted);" onclick="history.back()"></i>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                        <div style="background: var(--input-bg); padding: 24px; border-radius: 12px; text-align: center; border: 1px solid var(--border);">
                            <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); letter-spacing: 1px;">STIMA CAPITALE</div>
                            <div id="dash-val" style="font-size: 1.8rem; font-weight: 800; color: var(--accent); margin-top: 12px;">€ 0</div>
                        </div>
                        <div style="background: var(--input-bg); padding: 24px; border-radius: 12px; text-align: center; border: 1px solid var(--border);">
                            <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); letter-spacing: 1px;">ALLERTE HACCP</div>
                            <div id="dash-exp" style="font-size: 1.8rem; font-weight: 800; color: var(--danger); margin-top: 12px;">0</div>
                        </div>
                        <div style="grid-column: span 2; background: rgba(53,110,59,0.1); padding: 32px; border-radius: 12px; text-align: center; border: 1px solid rgba(53,110,59,0.3);">
                            <div style="font-size: 0.85rem; font-weight: 800; color: var(--success); letter-spacing: 2px;">COMPLETAMENTO TURNO</div>
                            <div id="dash-prog" style="font-size: 3.5rem; font-weight: 800; color: var(--success); margin-top: 16px; text-shadow: 0 0 20px rgba(53,110,59,0.2);">0%</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        bindEvents();
    };

    // [ 2. MOTORE EVENTI ]
    const bindEvents = () => {
        // Event Delegation globale per apertura Modali (intercettata tramite i nav-item nella Sidebar)
        document.body.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('[data-action]');
            if (!actionBtn) return;
            
            const action = actionBtn.getAttribute('data-action');
            if (action === 'open-cloud') openCloudModal();
            if (action === 'open-report') openReportModal();
            if (action === 'open-dashboard') openDashboardModal();
        });

        // Eventi Cloud Vault
        document.getElementById('btn-seal-vault')?.addEventListener('click', sealVault);
        document.getElementById('btn-cloud-upload')?.addEventListener('click', uploadToCloud);
        document.getElementById('btn-cloud-download')?.addEventListener('click', downloadFromCloud);

        // Eventi Tabs Report
        document.querySelectorAll('.report-tab').forEach(tab => {
            tab.addEventListener('click', (e) => switchReportTab(e.currentTarget.getAttribute('data-tab')));
        });
        document.getElementById('btn-export-wa')?.addEventListener('click', copyReportToWhatsApp);
    };

    // [ 3. LOGICA CLOUD & VAULT (PROTOCOLLO CERBERO) ]
    const openCloudModal = () => {
        const isSealed = Cerbero.isCloudVaultSealed();
        document.getElementById('cloud-vault-setup').style.display = isSealed ? 'none' : 'block';
        document.getElementById('cloud-sync-ops').style.display = isSealed ? 'block' : 'none';
        
        // Carica ultimo alias noto
        document.getElementById('cloud-alias-input').value = localStorage.getItem('nexus_hub_id') || '';
        document.getElementById('cloud-auth-pin').value = ''; // Sempre vuoto per sicurezza
        
        UICore.showModal('modal-cloud');
    };

    const sealVault = () => {
        const apiKey = document.getElementById('setup-api-key').value.trim();
        const pin = document.getElementById('setup-root-pin').value;
        
        if(!apiKey || !pin) return UICore.showToast("Dati mancanti.", "error");
        
        try {
            Cerbero.storeCloudVault(apiKey, pin);
            UICore.showToast("Vault Sigillato e Criptato con successo.", "success");
            openCloudModal(); // Ricarica la vista
        } catch (error) {
            UICore.showToast(error.message, "error");
        }
    };

    const uploadToCloud = async () => {
        const binId = document.getElementById('cloud-alias-input').value.trim();
        const pin = document.getElementById('cloud-auth-pin').value;
        
        if(!binId || !pin) return UICore.showToast("Bin ID e PIN Root obbligatori.", "error");
        if(!confirm("[WARNING] Questa azione sovrascriverà l'intera memoria Cloud. Continuare?")) return;
        
        let apiKey;
        try {
            apiKey = Cerbero.unlockCloudVault(pin); // Decrittazione in RAM Volatile
        } catch(e) {
            return UICore.showToast(e.message, "error");
        }

        const payload = {
            metadata: { version_name: "Sync Scutum V15.3 Absolute", timestamp: new Date().toISOString() },
            data: Architetto.getState().appStructure
        };

        UICore.showToast("Trasmissione dati crittografata in corso...", "info");
        
        try {
            const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'X-Master-Key': apiKey },
                body: JSON.stringify(payload)
            });
            
            if(!response.ok) throw new Error("Connessione Rifiutata dal JSONBin.");
            
            localStorage.setItem('nexus_hub_id', binId);
            UICore.showToast("Matrice Allineata con il Cloud.", "success");
            UICore.closeModals();
        } catch (error) {
            UICore.showToast(error.message, "error");
        } finally {
            apiKey = null; // Garbage collection immediata
        }
    };

    const downloadFromCloud = async () => {
        const binId = document.getElementById('cloud-alias-input').value.trim();
        const pin = document.getElementById('cloud-auth-pin').value;
        
        if(!binId || !pin) return UICore.showToast("Bin ID e PIN Root obbligatori.", "error");
        if(!confirm("[DANGER] I dati locali verranno annientati e sostituiti dal Cloud. Procedere?")) return;
        
        let apiKey;
        try {
            apiKey = Cerbero.unlockCloudVault(pin);
        } catch(e) {
            return UICore.showToast(e.message, "error");
        }

        UICore.showToast("Estrazione dati in corso...", "info");
        
        try {
            const response = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, {
                headers: { 'X-Master-Key': apiKey }
            });
            
            if(!response.ok) throw new Error("Cloud Irraggiungibile.");
            
            const json = await response.json();
            if(json.record && json.record.data) {
                // Innesca aggiornamento di stato profondo
                Architetto.setStructure(json.record.data);
                localStorage.setItem('nexus_hub_id', binId);
                UICore.showToast("Dati Locali Sovrascritti.", "success");
                UICore.closeModals();
            }
        } catch (error) {
            UICore.showToast(error.message, "error");
        } finally {
            apiKey = null;
        }
    };

    // [ 4. LOGICA REPORTISTICA E TELEMETRIA ]
    let reportTextFare = "";
    let reportTextComprare = "";
    let currentReportTab = "fare";

    const switchReportTab = (tab) => {
        currentReportTab = tab;
        document.getElementById('tab-report-fare').style.background = tab === 'fare' ? 'var(--card)' : 'transparent';
        document.getElementById('tab-report-fare').style.color = tab === 'fare' ? 'var(--accent)' : 'var(--text-muted)';
        
        document.getElementById('tab-report-comprare').style.background = tab === 'comprare' ? 'var(--card)' : 'transparent';
        document.getElementById('tab-report-comprare').style.color = tab === 'comprare' ? 'var(--accent)' : 'var(--text-muted)';
        
        document.getElementById('report-preview-fare').style.display = tab === 'fare' ? 'block' : 'none';
        document.getElementById('report-preview-comprare').style.display = tab === 'comprare' ? 'block' : 'none';
    };

    const openReportModal = () => {
        const state = Architetto.getState();
        const { appStructure, appState, activeSede, activeFolder } = state;
        if (!activeSede || !activeFolder) return UICore.showToast("Seleziona una Sede e un Turno.", "error");

        const fol = appStructure.sedi[activeSede].folders[activeFolder];
        let fareGroups = {}, comprareGroups = {};
        
        fol.sections.forEach(sec => sec.items.forEach(i => {
            const k = `${activeSede}_${activeFolder}_${sec.id}_${i.id}`;
            const st = appState[k] || {};
            const cat = appStructure.sedi[activeSede].categories.find(x => x.id === i.catId) || { name: 'N.C.' };
            
            // Logica Fare
            if (st.fare || (st.n_fare && st.n_fare.trim() !== "")) {
                let catName = UICore.sanitize(cat.name).toUpperCase();
                if(!fareGroups[catName]) fareGroups[catName] = [];
                fareGroups[catName].push(`• ${UICore.sanitize(i.n)} (${UICore.sanitize(sec.name)}): ${st.n_fare || 'Eseguito'}`);
            }
            
            // Logica Comprare / Target Magazzino
            let doBuy = false;
            let buyNote = "";
            if (st.comprare || (st.n_comprare && st.n_comprare.trim() !== "")) {
                doBuy = true;
                buyNote = st.n_comprare || "Includere";
            } else if (cat.type === 'magazzino' && st.q !== undefined && i.idealQty && st.q < i.idealQty) {
                doBuy = true;
                buyNote = `Deficit: ${i.idealQty - st.q} ${UICore.sanitize(i.uom || 'U')}`;
            }

            if (doBuy) {
                let supName = 'ORDINE GLOBALE';
                if (i.supplierCatId) {
                    const sc = (appStructure.sedi[activeSede].supplierCategories || []).find(x => x.id === i.supplierCatId);
                    if (sc) supName = UICore.sanitize(sc.name).toUpperCase();
                }
                if(!comprareGroups[supName]) comprareGroups[supName] = [];
                comprareGroups[supName].push(`• ${UICore.sanitize(i.n)}: ${buyNote}`);
            }
        }));

        // Costruzione Testo Raw per WhatsApp
        const sedeName = UICore.sanitize(appStructure.sedi[activeSede].name).toUpperCase();
        
        reportTextFare = Object.keys(fareGroups).length > 0 ? `🔪 MATRICE CUCINA [${sedeName}]:\n` : `✅ Nessuna operazione pendente in ${sedeName}.`;
        for (let g in fareGroups) reportTextFare += `\n[ ${g} ]\n${fareGroups[g].join('\n')}\n`;

        reportTextComprare = Object.keys(comprareGroups).length > 0 ? `🛒 MATRICE ORDINI [${sedeName}]:\n` : `✅ Magazzino Ottimale in ${sedeName}.`;
        for (let s in comprareGroups) reportTextComprare += `\n[ ${s} ]\n${comprareGroups[s].join('\n')}\n`;

        // Anteprima HTML (Semplificata per il visualizzatore)
        document.getElementById('report-preview-fare').innerHTML = `<pre style="font-family:inherit; white-space:pre-wrap; font-size:0.9rem;">${reportTextFare}</pre>`;
        document.getElementById('report-preview-comprare').innerHTML = `<pre style="font-family:inherit; white-space:pre-wrap; font-size:0.9rem;">${reportTextComprare}</pre>`;

        switchReportTab('fare');
        UICore.showModal('modal-report');
    };

    const copyReportToWhatsApp = () => {
        const text = currentReportTab === 'fare' ? reportTextFare : reportTextComprare;
        if(navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text)
                .then(() => UICore.showToast("Testo copiato negli appunti.", "success"))
                .catch(() => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'));
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
    };

    const openDashboardModal = () => {
        const state = Architetto.getState();
        const { appStructure, appState, activeSede, activeFolder } = state;
        if (!activeSede || !activeFolder) return;

        const fol = appStructure.sedi[activeSede].folders[activeFolder];
        let totalValue = 0, expCount = 0, doneTasks = 0, totalTasks = 0;
        const today = new Date(); today.setHours(0,0,0,0);

        fol.sections.forEach(sec => sec.items.forEach(i => {
            const k = `${activeSede}_${activeFolder}_${sec.id}_${i.id}`;
            const st = appState[k] || { fare: false, q: 0 };
            const cat = appStructure.sedi[activeSede].categories.find(x => x.id === i.catId) || { type: 'standard' };

            if (cat.type === 'magazzino') {
                if (i.cost) totalValue += ((st.q || 0) * i.cost);
            } else {
                totalTasks++;
                if (st.fare) doneTasks++;
            }

            if (i.expiry) {
                let e = new Date(i.expiry); e.setHours(0,0,0,0);
                if (e <= today) expCount++;
            }
        }));

        document.getElementById('dash-val').innerText = "€ " + totalValue.toFixed(2);
        document.getElementById('dash-exp').innerText = expCount;
        document.getElementById('dash-prog').innerText = totalTasks > 0 ? Math.round((doneTasks/totalTasks)*100) + "%" : "100%";
        
        UICore.showModal('modal-dashboard');
    };

    return {
        init() {
            buildAdminModals();
        }
    };
})();
