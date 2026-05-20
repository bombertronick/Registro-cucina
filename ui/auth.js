// File: ui/auth.js
// ==========================================================================
// FATTORE UMANO - Gateway di Autenticazione e Fisarmonica (Accordion)
// ==========================================================================
import { Architetto } from '../core/architetto.js';
import { Cerbero } from '../core/cerbero.js';
import { UICore } from './core.js';

export const AuthUI = (function() {
    
    // Iniezione DOM della schermata di Login
    const buildAuthDOM = () => {
        const container = document.getElementById('view-auth');
        container.innerHTML = `
            <div class="card" style="width: 100%; max-width: 420px; text-align: center; padding: 48px 32px; border: 2px solid var(--border); position: relative; overflow: visible;">
                <!-- Logo -->
                <div style="width: 130px; height: 130px; border-radius: 50%; background: var(--bg); display: flex; align-items:center; justify-content:center; margin: -65px auto 24px; border: 4px solid var(--accent); box-shadow: 0 10px 20px rgba(0,0,0,0.5);">
                    <i class="fa-solid fa-shield-halved" style="font-size: 4rem; color: var(--accent);"></i>
                </div>
                
                <h2 style="font-weight: 800; font-size: 2rem; margin-bottom: 8px; color: var(--accent); letter-spacing: -1px; text-transform: uppercase;">Scutum ERP</h2>
                <p style="font-size: 0.95rem; color: var(--text-muted); font-weight: 800; margin-bottom: 32px; text-transform: uppercase; letter-spacing: 2px;">Protocollo Accesso</p>
                
                <div class="input-group" style="text-align: left; margin-bottom: 24px;">
                    <label>Identità Operativa</label>
                    <input type="hidden" id="login-selected-user" value="">
                    <div id="login-accordion-container"></div>
                    
                    <div id="login-selected-display" style="margin-top: 16px; font-weight: 800; font-size: 1.1rem; color: var(--success); text-align: center; display: none; background: rgba(53, 110, 59, 0.1); padding: 12px; border-radius: 8px; border: 1px solid rgba(53, 110, 59, 0.3);">
                        Innesco: <span id="login-selected-name" style="color: var(--text);"></span>
                    </div>
                </div>
                
                <div class="input-group" style="text-align: left; margin-bottom: 40px;">
                    <label>Firma Criptografica (PIN)</label>
                    <input type="password" id="login-password" placeholder="••••" style="letter-spacing:8px; font-size:1.5rem; text-align:center;">
                </div>
                
                <button id="btn-login-submit" class="btn-action solid">
                    INIZIALIZZA SESSIONE <i class="fa-solid fa-bolt" style="margin-left:8px;"></i>
                </button>
            </div>
        `;

        document.getElementById('btn-login-submit').addEventListener('click', performLogin);
    };

    const renderAuthProfiles = () => {
        const state = Architetto.getState();
        const structure = state.appStructure;
        const container = document.getElementById('login-accordion-container'); 
        const display = document.getElementById('login-selected-display');
        const hiddenInput = document.getElementById('login-selected-user');
        
        if(!container) return; 
        container.innerHTML = ''; 
        
        hiddenInput.value = '';
        display.style.display = 'none';
        document.getElementById('login-selected-name').innerText = '';
        
        // 1. Gruppo ROOT
        let html = `
            <div class="accordion-group" style="margin-bottom: 12px; border: 2px solid var(--border); border-radius: 12px; overflow: hidden; background: var(--bg);">
                <div class="accordion-header" data-target="acc-root" style="padding: 16px; background: var(--card); color: var(--text); font-weight: 800; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                    <span><i class="fa-solid fa-chess-king" style="color:var(--accent); margin-right:8px;"></i> SISTEMA ASSOLUTO</span>
                    <i class="fa-solid fa-chevron-down" id="icon-acc-root" style="transition:0.3s; color:var(--text-muted);"></i>
                </div>
                <div class="accordion-body" id="body-acc-root" style="max-height: 0; overflow: hidden; transition: max-height 0.4s var(--bezier); background: var(--input-bg);">
                    <button class="accordion-btn" data-id="admin" data-name="Root / Area Manager" style="display: block; width: 100%; padding: 14px 16px; text-align: left; background: transparent; border: none; border-bottom: 1px solid var(--border); color: var(--text-muted); font-weight: 700; font-size: 1rem; cursor: pointer;">Root / Area Manager</button>
                </div>
            </div>`;
            
        // 2. Estrazione Gruppi dalla Sede Attiva
        const activeSede = state.activeSede || Object.keys(structure.sedi)[0];
        
        if(activeSede && structure.sedi[activeSede]) { 
            const roles = structure.sedi[activeSede].roles || []; 
            const grps = {}; 
            
            roles.forEach(r => {
                const gn = (r.group && r.group.trim() !== "") ? UICore.sanitize(r.group).toUpperCase() : "OPERATIVITÀ BASE"; 
                if(!grps[gn]) grps[gn] = []; 
                grps[gn].push(r);
            }); 
            
            let idx = 0;
            for(let g in grps) {
                let accId = `acc-grp-${idx}`;
                html += `
                    <div class="accordion-group" style="margin-bottom: 12px; border: 2px solid var(--border); border-radius: 12px; overflow: hidden; background: var(--bg);">
                        <div class="accordion-header" data-target="${accId}" style="padding: 16px; background: var(--card); color: var(--text); font-weight: 800; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
                            <span><i class="fa-solid fa-users" style="color:var(--text-muted); margin-right:8px;"></i> ${g}</span>
                            <i class="fa-solid fa-chevron-down" id="icon-${accId}" style="transition:0.3s; color:var(--text-muted);"></i>
                        </div>
                        <div class="accordion-body" id="body-${accId}" style="max-height: 0; overflow: hidden; transition: max-height 0.4s var(--bezier); background: var(--input-bg);">`;
                
                grps[g].forEach(r => {
                    const typeLabel = r.type === 'checklist' ? ' <span style="font-size:0.75rem; color:var(--warning);">[Isolato]</span>' : '';
                    html += `<button class="accordion-btn" data-id="${r.id}" data-name="${UICore.sanitize(r.name).replace(/'/g, "\\'")}" style="display: block; width: 100%; padding: 14px 16px; text-align: left; background: transparent; border: none; border-bottom: 1px solid var(--border); color: var(--text-muted); font-weight: 700; font-size: 1rem; cursor: pointer;">${UICore.sanitize(r.name)}${typeLabel}</button>`;
                }); 
                
                html += `</div></div>`;
                idx++;
            } 
        } 
        
        container.innerHTML = html;
        bindAccordionEvents();
    };

    const bindAccordionEvents = () => {
        // Logica click Header
        document.querySelectorAll('.accordion-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const targetId = e.currentTarget.getAttribute('data-target');
                const targetBody = document.getElementById(`body-${targetId}`);
                const targetIcon = document.getElementById(`icon-${targetId}`);
                const isOpen = targetBody.style.maxHeight !== "0px" && targetBody.style.maxHeight !== "";
                
                // Chiudi tutti
                document.querySelectorAll('.accordion-body').forEach(b => b.style.maxHeight = null);
                document.querySelectorAll('.accordion-header i.fa-chevron-down').forEach(i => i.style.transform = 'rotate(0deg)');
                
                // Apri selezionato
                if(!isOpen) {
                    targetBody.style.maxHeight = targetBody.scrollHeight + "px"; // Animazione fluida
                    targetIcon.style.transform = 'rotate(180deg)';
                }
            });
        });

        // Logica selezione Utente
        document.querySelectorAll('.accordion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                const name = e.currentTarget.getAttribute('data-name');
                
                document.getElementById('login-selected-user').value = id;
                document.getElementById('login-selected-name').innerText = name.toUpperCase();
                document.getElementById('login-selected-display').style.display = 'block';
                
                document.querySelectorAll('.accordion-btn').forEach(b => {
                    b.style.background = 'transparent';
                    b.style.color = 'var(--text-muted)';
                    b.style.paddingLeft = '16px';
                });
                
                e.currentTarget.style.background = 'var(--accent-glow)';
                e.currentTarget.style.color = 'var(--accent)';
                e.currentTarget.style.paddingLeft = '24px'; // Effetto rientro visivo
            });
        });
    };

    const performLogin = () => {
        const selId = document.getElementById('login-selected-user').value; 
        const pin = document.getElementById('login-password').value; 
        
        if(!selId) {
            return UICore.showToast("Seleziona prima un'identità dall'elenco.", "error");
        }
        
        if(selId === 'admin') { 
            if(Cerbero.isSystemVirgin()) {
                Cerbero.setupRootSignature(pin || '0000'); 
                finalizeLogin('admin'); 
                return UICore.showToast("Firma Root istanziata. Accesso consentito.", "success");
            } 
            
            if(Cerbero.verifyRootSignature(pin)) {
                finalizeLogin('admin'); 
            } else {
                UICore.showToast("Firma Respinta dal Gateway.", "error"); 
            }
        } else { 
            // Validazione Operatore Standard
            const state = Architetto.getState();
            const activeSede = state.activeSede || Object.keys(state.appStructure.sedi)[0];
            const role = state.appStructure.sedi[activeSede].roles.find(x => x.id === selId); 
            
            // Il Master PIN Root fa bypass su tutti gli operatori (emergenza)
            const isMasterBypass = Cerbero.verifyRootSignature(pin);
            
            if(role && (Cerbero.verifyOperatorSignature(pin, role.pinHash) || role.pin === pin || isMasterBypass)) {
                // Retro-compatibilità: Se l'operatore aveva il pin in chiaro nel vecchio DB, convertiamolo in Hash
                if(role.pin && !role.pinHash) {
                    role.pinHash = Cerbero.hashOperatorPin(role.pin);
                    delete role.pin;
                    // Scatena l'aggiornamento architetturale per salvare in DB
                    Architetto.setStructure(state.appStructure); 
                }
                finalizeLogin(role.id); 
            } else {
                UICore.showToast("Firma Respinta dal Gateway.", "error"); 
            }
        } 
        
        document.getElementById('login-password').value = ''; 
    };

    const finalizeLogin = (id) => { 
        localStorage.setItem('nexus_session', id); 
        Architetto.setActiveProfile(id);
        UICore.showToast("Accesso Consentito.", "success"); 
        
        // Simula Custom Event per dire al Main di instradare l'utente (disaccoppiamento)
        window.dispatchEvent(new CustomEvent('auth:success', { detail: { profileId: id } }));
    };

    return {
        init() {
            UICore.initHistoryListener();
            buildAuthDOM();
        },
        refresh() {
            renderAuthProfiles();
        }
    };
})();
