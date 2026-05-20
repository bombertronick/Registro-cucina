// File: ui/app.js (Parte 1)
// ==========================================================================
// FATTORE UMANO - Core Interfaccia Gestionale, Sidebar e Matrice
// ==========================================================================
import { Architetto } from '../core/architetto.js';
import { UICore } from './core.js';
import { Cerbero } from '../core/cerbero.js';

export const AppUI = (function() {
    let searchTimeoutId = null;

    // [ 1. COSTRUZIONE SHELL DOM ]
    const buildShell = () => {
        const container = document.getElementById('view-app');
        container.innerHTML = `
            <div id="mobile-overlay" style="position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 900; display: none; opacity: 0; transition: 0.3s var(--bezier);"></div>
            
            <aside class="sidebar" id="sidebar">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; position: relative; z-index: 10;">
                    <div class="sidebar-logo">
                        <i class="fa-solid fa-shield-cat"></i> SCUTUM
                    </div>
                    <i class="fa-solid fa-xmark" style="font-size: 1.5rem; color: var(--text-muted); cursor: pointer; display: none;" id="sidebar-close"></i>
                </div>
                
                <div style="background: var(--input-bg); border: 1px solid var(--border); padding: 16px; border-radius: var(--radius-main); margin-bottom: 32px; display: flex; align-items: center; gap: 16px; position: relative; z-index: 10;">
                    <div style="width: 48px; height: 48px; border-radius: 12px; border: 2px solid var(--accent); background: var(--bg); display: flex; align-items: center; justify-content: center;">
                        <i class="fa-solid fa-user-astronaut" style="color: var(--accent); font-size: 1.5rem;"></i>
                    </div>
                    <div>
                        <div style="font-size: 0.7rem; color: var(--accent); font-weight: 800; letter-spacing: 1.5px;">OPERATORE</div>
                        <div style="font-weight: 800; font-size: 1.05rem; color: var(--text); text-transform: uppercase;" id="current-user-label">ROOT</div>
                    </div>
                </div>
                
                <div id="sidebar-scroll-area" style="flex: 1; overflow-y: auto; position: relative; z-index: 10; padding-right: 8px;">
                    <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); margin-bottom: 12px; letter-spacing: 1.5px;">SEDI ALLACCIATE</div>
                    <div id="sedi-menu" style="margin-bottom: 32px;"></div>
                    
                    <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); margin-bottom: 12px; letter-spacing: 1.5px;">FILTRO REPARTI</div>
                    <div id="categories-filter-menu" style="margin-bottom: 32px;"></div>
                    
                    <div style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); margin-bottom: 12px; letter-spacing: 1.5px;">AZIONI DI LINEA</div>
                    <div class="nav-item" data-action="open-report">
                        <i class="fa-solid fa-file-export" style="color: var(--success);"></i> Sintesi Report
                    </div>
                    
                    <!-- Admin Only Menu verrà iniettato qui -->
                    <div id="admin-tools-menu" style="display:none;"></div>
                </div>
                
                <div style="margin-top: 24px; display: flex; flex-direction: column; gap: 12px; position: relative; z-index: 10;">
                    <button class="btn-action" id="btn-toggle-edit" style="display: none;">
                        <i class="fa-solid fa-unlock"></i> SBLOCCA MATRICE
                    </button>
                    <button class="btn-action" style="background: rgba(140, 34, 34, 0.1); border: 1px solid var(--danger); color: var(--danger);" data-action="logout">
                        <i class="fa-solid fa-power-off"></i> DISCONNETTI
                    </button>
                </div>
            </aside>

            <main>
                <div class="top-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 20px;">
                        <button class="btn-action" id="btn-mobile-menu" style="width:52px; height:52px; padding:0; background:var(--card); border:1px solid var(--border); color:var(--text);">
                            <i class="fa-solid fa-bars"></i>
                        </button>
                        <span id="header-title" style="font-weight: 800; font-size: 1.4rem; color: var(--text); text-transform: uppercase;">Calcolo...</span>
                    </div>
                    <div style="display: flex; gap: 16px;">
                        <button class="btn-action" data-action="toggle-theme" style="width:52px; height:52px; padding:0; background:var(--card); border:1px solid var(--border); color:var(--text);" title="Illuminazione">
                            <i class="fa-solid fa-moon"></i>
                        </button>
                        <button class="btn-action" data-action="smart-reset" style="width:52px; height:52px; padding:0; background:rgba(140, 34, 34, 0.15); border:1px solid var(--danger); color:var(--danger);" title="Purga Operazioni Odierne">
                            <i class="fa-solid fa-rotate-left"></i>
                        </button>
                    </div>
                </div>

                <div class="search-pill">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="search-input" placeholder="Scansiona matrice per prodotto, nota o fornitore...">
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid var(--border);">
                    <div id="folders-menu" style="display: flex; gap: 12px; overflow-x: auto; padding-bottom: 8px;"></div>
                    
                    <div style="display: flex; gap: 12px;">
                        <button class="btn-action" id="btn-show-hidden" data-action="toggle-hidden" style="background:var(--card); border:1px solid var(--border); color:var(--text-muted); font-size:0.85rem; padding:10px 18px; width:auto;">
                            <i class="fa-solid fa-eye"></i> OVERRIDE
                        </button>
                        <button class="btn-action" id="btn-fifo" data-action="toggle-fifo" style="background:var(--card); border:1px solid var(--border); color:var(--text-muted); font-size:0.85rem; padding:10px 18px; width:auto;">
                            <i class="fa-solid fa-arrow-down-short-wide"></i> F.I.F.O.
                        </button>
                    </div>
                </div>

                <div id="main-content" style="flex: 1;"></div>
            </main>
        `;

        bindShellEvents();
    };

    // [ 2. GESTIONE EVENTI BASE (EVENT DELEGATION ESM) ]
    const bindShellEvents = () => {
        // Mobile Sidebar
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('mobile-overlay');
        
        document.getElementById('btn-mobile-menu').addEventListener('click', () => {
            sidebar.classList.add('open');
            overlay.style.display = 'block';
            setTimeout(() => overlay.style.opacity = '1', 10);
        });

        const closeSidebar = () => {
            sidebar.classList.remove('open');
            overlay.style.opacity = '0';
            setTimeout(() => overlay.style.display = 'none', 300);
        };
        document.getElementById('sidebar-close').addEventListener('click', closeSidebar);
        overlay.addEventListener('click', closeSidebar);

        // Motore di Ricerca Debounced
        const searchInput = document.getElementById('search-input');
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeoutId);
            searchTimeoutId = setTimeout(() => renderMatrix(Architetto.getState(), searchInput.value), 250);
        });

        // Event Delegation Globale per Azioni UI (Niente onclick inline)
        document.getElementById('view-app').addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            
            const action = btn.getAttribute('data-action');
            const state = Architetto.getState();

            switch (action) {
                case 'logout':
                    Architetto.setActiveProfile(null);
                    localStorage.removeItem('nexus_session');
                    UICore.switchSpaView('view-auth');
                    break;
                case 'toggle-theme':
                    const nextTheme = state.theme === 'light' ? 'dark' : 'light';
                    Architetto.setTheme(nextTheme);
                    break;
                case 'smart-reset':
                    if (confirm("Inizializzare purga totale del turno odierno? Eliminerà spunte e check.")) {
                        const newState = { ...state.appState };
                        for(let k in newState) {
                            newState[k].fare = false;
                            newState[k].comprare = false;
                            newState[k].n_fare = '';
                            newState[k].n_comprare = '';
                        }
                        Architetto.setAppState(newState);
                        UICore.showToast("Turno resettato.", "success");
                    }
                    break;
                case 'toggle-hidden':
                    Architetto.toggleEditMode(); // Usa override per mostrare tutto (temporaneo)
                    break;
                case 'toggle-fifo':
                    // Inietteremo il toggle FIFO nello stato architetto
                    break;
                case 'select-sede':
                    Architetto.setRouting(btn.getAttribute('data-id'));
                    break;
                case 'select-folder':
                    Architetto.setRouting(state.activeSede, btn.getAttribute('data-id'));
                    break;
                case 'filter-cat':
                    Architetto.setFilters(btn.getAttribute('data-id'));
                    if (window.innerWidth <= 768) closeSidebar();
                    break;
                case 'toggle-state':
                    const key = btn.getAttribute('data-key');
                    const type = btn.getAttribute('data-type'); // 'fare' o 'comprare'
                    const currState = state.appState[key] || { fare: false, comprare: false };
                    Architetto.updateItemState(key, { [type]: !currState[type] });
                    if(navigator.vibrate) navigator.vibrate(40);
                    break;
                case 'qty-update':
                    const qKey = btn.getAttribute('data-key');
                    const delta = parseInt(btn.getAttribute('data-delta'), 10);
                    const qCurr = state.appState[qKey] ? state.appState[qKey].q : 0;
                    Architetto.updateItemState(qKey, { q: Math.max(0, qCurr + delta) });
                    if(navigator.vibrate) navigator.vibrate(20);
                    break;
            }
        });

        // Event Delegation per gli input testuali (Note/Quantità) - OnBlur
        document.getElementById('view-app').addEventListener('blur', (e) => {
            const input = e.target;
            if (input.classList.contains('fare-note')) {
                Architetto.updateItemState(input.getAttribute('data-key'), { n_fare: input.value });
            } else if (input.classList.contains('comprare-note')) {
                Architetto.updateItemState(input.getAttribute('data-key'), { n_comprare: input.value });
            } else if (input.classList.contains('qty-input-direct')) {
                let val = parseInt(input.value, 10);
                Architetto.updateItemState(input.getAttribute('data-key'), { q: isNaN(val) || val < 0 ? 0 : val });
            }
        }, true); // true per intercettare il blur in fase di cattura
    };

    // [ 3. MOTORE DI RENDERING (REATTIVO) ]
    const renderSidebar = (state) => {
        const { appStructure, activeSede, activeProfile, activeCatFilter, editMode } = state;
        const isRoot = activeProfile === 'admin';
        
        // Etichetta Utente
        const lbl = document.getElementById('current-user-label');
        if (lbl) {
            if (isRoot) lbl.innerText = "ROOT";
            else {
                const role = appStructure.sedi[activeSede]?.roles.find(x => x.id === activeProfile);
                lbl.innerText = role ? UICore.sanitize(role.name).toUpperCase() : "OPERATORE";
            }
        }

        // Sedi
        const sediMenu = document.getElementById('sedi-menu');
        sediMenu.innerHTML = Object.values(appStructure.sedi).map(sede => `
            <div class="nav-item ${sede.id === activeSede ? 'active' : ''}" data-action="select-sede" data-id="${sede.id}">
                <i class="fa-solid fa-shield"></i> <span style="flex:1;">${UICore.sanitize(sede.name)}</span> 
            </div>
        `).join('');

        // Categorie
        const catMenu = document.getElementById('categories-filter-menu');
        let catHtml = isRoot ? `<div class="nav-item ${activeCatFilter === 'tutti' ? 'active' : ''}" data-action="filter-cat" data-id="tutti"><i class="fa-solid fa-border-all"></i> Spazio Globale</div>` : '';
        
        const currentRole = !isRoot ? appStructure.sedi[activeSede]?.roles.find(x => x.id === activeProfile) : null;
        const allowedCats = currentRole ? currentRole.allowedCats : [];

        (appStructure.sedi[activeSede]?.categories || []).forEach(c => {
            if (!isRoot && (!allowedCats || !allowedCats.includes(c.id))) return;
            catHtml += `<div class="nav-item ${activeCatFilter === c.id ? 'active' : ''}" data-action="filter-cat" data-id="${c.id}"><i class="fa-solid fa-circle" style="color:${c.color};"></i> ${UICore.sanitize(c.name)}</div>`;
        });
        catMenu.innerHTML = catHtml;

        // Strumenti Admin
        const btnEdit = document.getElementById('btn-toggle-edit');
        const adminMenu = document.getElementById('admin-tools-menu');
        if (isRoot) {
            btnEdit.style.display = 'flex';
            btnEdit.innerHTML = editMode ? `<i class="fa-solid fa-lock"></i> BLOCCA MODIFICHE` : `<i class="fa-solid fa-unlock"></i> SBLOCCA MATRICE`;
            btnEdit.style.background = editMode ? "var(--warning)" : "var(--bg)";
            btnEdit.style.color = editMode ? "#000" : "var(--text)";
            
            adminMenu.style.display = 'block';
            adminMenu.innerHTML = `
                <div style="font-size: 0.75rem; font-weight: 800; color: var(--accent); margin-bottom: 12px; margin-top: 32px; letter-spacing: 1.5px;">SISTEMA ASSOLUTO</div>
                <div class="nav-item" data-action="open-dashboard"><i class="fa-solid fa-chart-line"></i> Telemetria KPI</div>
                <div class="nav-item" data-action="open-cloud"><i class="fa-solid fa-cloud"></i> Sync Rete Globale</div>
            `;
        } else {
            btnEdit.style.display = 'none';
            adminMenu.style.display = 'none';
        }
    };

    const renderFolders = (state) => {
        const { appStructure, activeSede, activeFolder, editMode } = state;
        const menu = document.getElementById('folders-menu');
        if (!menu || !activeSede || !appStructure.sedi[activeSede].folders) return;

        document.getElementById('header-title').innerText = UICore.sanitize(appStructure.sedi[activeSede].name);

        menu.innerHTML = Object.values(appStructure.sedi[activeSede].folders).map(f => `
            <div data-action="select-folder" data-id="${f.id}" style="padding:12px 20px; border-radius:12px; font-size:0.85rem; font-weight:800; white-space:nowrap; border:2px solid ${f.id === activeFolder ? 'var(--accent)' : 'var(--border)'}; background:${f.id === activeFolder ? 'var(--accent-glow)' : 'var(--input-bg)'}; color:${f.id === activeFolder ? 'var(--accent)' : 'var(--text)'}; cursor:pointer; display:flex; align-items:center; transition:0.3s;">
                ${UICore.sanitize(f.name).toUpperCase()} 
            </div>
        `).join('');
    };

    const renderMatrix = (state, query = '') => {
        const c = document.getElementById('main-content');
        if (!c) return;

        const { appStructure, appState, activeSede, activeFolder, activeCatFilter, editMode } = state;
        if (!activeSede || !activeFolder || !appStructure.sedi[activeSede].folders[activeFolder]) {
            c.innerHTML = '';
            return;
        }

        const fol = appStructure.sedi[activeSede].folders[activeFolder];
        const cd = new Date().getDay();
        let htmlBuffer = '';

        fol.sections.forEach(sec => {
            // Filtro Nodi
            let itemsToShow = sec.items.filter(i => {
                const matchCat = activeCatFilter === 'tutti' || i.catId === activeCatFilter;
                const matchSearch = query === '' || i.n.toLowerCase().includes(query.toLowerCase()) || (i.info && i.info.toLowerCase().includes(query.toLowerCase()));
                const isToday = !i.days || i.days.length === 0 || i.days.includes(cd);
                const matchTime = editMode || isToday; // Aggiungere showHiddenTimeGated se necessario
                return matchCat && matchSearch && matchTime;
            });

            if (itemsToShow.length === 0 && !editMode) return;

            let cardHtml = `
                <div class="card" style="margin-bottom: 32px;">
                    <div class="card-header">
                        <span style="color:${sec.color}">${UICore.sanitize(sec.name)}</span>
                    </div>
                    <div style="overflow-x:auto;"><table>
            `;

            itemsToShow.forEach(i => {
                const k = `${activeSede}_${activeFolder}_${sec.id}_${i.id}`;
                const st = appState[k] || { fare: false, comprare: false, n_fare: '', n_comprare: '', q: 0 };
                const cat = appStructure.sedi[activeSede].categories.find(x => x.id === i.catId) || { name: 'ERR', color: '#ccc', type: 'standard' };
                
                // Badges e Metadati
                const bdg = `<span class="role-badge" style="background:${cat.color}; border-color:${cat.color};">${UICore.sanitize(cat.name).toUpperCase()}</span>`;
                let meta = '';
                
                if (cat.type !== 'magazzino') {
                    if (i.l) meta += `<span style="background:var(--input-bg); padding:4px 8px; border-radius:6px; border:1px solid var(--border);"><b>L:</b> ${UICore.sanitize(i.l)}</span> `;
                    if (i.s) meta += `<span style="background:var(--input-bg); padding:4px 8px; border-radius:6px; border:1px solid var(--border);"><b>S:</b> ${UICore.sanitize(i.s)}</span> `;
                } else {
                    if (i.idealQty) meta += `<span style="background:var(--accent-glow); color:var(--accent); padding:4px 8px; border-radius:6px; border:1px solid rgba(201, 164, 100, 0.3);"><b>Target:</b> ${i.idealQty}</span> `;
                    if (i.uom && i.uom.trim() !== '') meta += `<span class="uom-badge">${UICore.sanitize(i.uom)}</span> `;
                }

                // Generazione Azioni e Righe
                let act = '';
                if (cat.type === 'magazzino') {
                    act = `
                        <div class="qty-container">
                            <button class="qty-btn" data-action="qty-update" data-key="${k}" data-delta="-1"><i class="fa-solid fa-minus"></i></button>
                            <input type="number" class="qty-input qty-input-direct" data-key="${k}" value="${st.q || 0}">
                            <button class="qty-btn plus" data-action="qty-update" data-key="${k}" data-delta="1"><i class="fa-solid fa-plus"></i></button>
                        </div>`;
                } else {
                    act = `
                        <div class="actions-wrapper" style="display:flex; gap:8px;">
                            <button class="action-chip comprare ${st.comprare ? 'active' : ''}" data-action="toggle-state" data-type="comprare" data-key="${k}"><i class="fa-solid fa-cart-shopping"></i></button>
                            <button class="action-chip fare ${st.fare ? 'active' : ''}" data-action="toggle-state" data-type="fare" data-key="${k}"><i class="fa-solid fa-check"></i></button>
                        </div>`;
                }

                const rowClass = (st.fare && cat.type !== 'magazzino') ? 'is-done' : '';
                
                cardHtml += `
                    <tr class="${rowClass}">
                        <td>
                            <span class="prod-name">${UICore.sanitize(i.n)} ${bdg}</span>
                            <span class="prod-meta">${meta}</span>
                        </td>
                        <td>
                            <div class="note-wrapper" style="display:flex; flex-direction:column; gap:6px;">
                                <input type="text" class="note-input comprare-note" data-key="${k}" style="border-left: 3px solid var(--success);" value="${UICore.sanitize(st.n_comprare)}" placeholder="Note per l'Acquisto...">
                                <input type="text" class="note-input fare-note" data-key="${k}" style="border-left: 3px solid var(--warning);" value="${UICore.sanitize(st.n_fare)}" placeholder="Note Operative...">
                            </div>
                        </td>
                        <td>${act}</td>
                    </tr>
                `;
            });

            cardHtml += `</table></div></div>`;
            htmlBuffer += cardHtml;
        });

        c.innerHTML = htmlBuffer;
    };

    return {
        init() {
            buildShell();
            
            // Iscrizione reattiva: Ogni volta che l'Architetto muta, la UI si ridisegna istantaneamente
            Architetto.subscribe((state) => {
                // Se non siamo nella view-app (es. siamo nel login), non renderizziamo per risparmiare CPU
                if (!document.getElementById('view-app').classList.contains('active')) return;
                
                renderSidebar(state);
                renderFolders(state);
                
                const q = document.getElementById('search-input')?.value || '';
                renderMatrix(state, q);
            });
        }
    };
})();
