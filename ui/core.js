// File: ui/core.js
// ==========================================================================
// FATTORE UMANO - Core UI, Notifiche, Modali e Navigazione SPA
// ==========================================================================

export const UICore = (function() {
    return {
        /**
         * Sistema di Notifiche (Toast) non bloccanti
         * @param {string} message - Il messaggio da mostrare
         * @param {string} type - 'success', 'error', 'info'
         */
        showToast(message, type = 'info') {
            const container = document.getElementById('toast-container');
            if (!container) return;
            
            const toast = document.createElement('div');
            toast.className = `toast`;
            
            let borderCol = type === 'success' ? 'var(--success)' : (type === 'error' ? 'var(--danger)' : 'var(--accent)');
            toast.style.borderLeft = `4px solid ${borderCol}`;
            
            let icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-triangle-exclamation' : 'fa-info-circle');
            toast.innerHTML = `<i class="fa-solid ${icon}" style="color:${borderCol}; margin-right:12px;"></i> ${message}`;
            
            container.appendChild(toast);
            
            // Distruzione DOM automatica
            setTimeout(() => { 
                toast.style.opacity = '0'; 
                toast.style.transform = 'translateY(10px)'; 
                setTimeout(() => toast.remove(), 300); 
            }, 3500);
        },

        /**
         * Sanitizzazione profonda contro XSS (Cross-Site Scripting)
         */
        sanitize(str) { 
            if (str === null || str === undefined) return "";
            return str.toString().replace(/[<>"]/g, "'").trim(); 
        },

        /**
         * Apre un modale e inietta uno stato fittizio nella History (previene chiusura app su Mobile)
         */
        showModal(modalId) { 
            const m = document.getElementById(modalId);
            if(m) {
                m.style.display = 'flex';
                document.body.classList.add('modal-open');
                history.pushState({ modal: modalId }, null, window.location.href);
            }
        },

        /**
         * Chiude tutti i modali aperti e ripristina la History
         */
        closeModals(eventOrGoBack = true) {
            let wasOpen = false;
            document.querySelectorAll('.modal-overlay').forEach(m => { 
                if(m.style.display === 'flex') { 
                    wasOpen = true; 
                    m.style.animation = 'none'; 
                    m.style.opacity = '0'; 
                    setTimeout(() => { 
                        m.style.display = 'none'; 
                        m.style.opacity = '1'; 
                        m.style.animation = 'modalIn 0.3s var(--bezier) forwards'; 
                    }, 250); 
                } 
            });
            document.body.classList.remove('modal-open');
            if (wasOpen && eventOrGoBack) {
                history.back();
            }
        },

        /**
         * Alterna le macro-viste della Single Page Application (Auth, Checklist, App)
         */
        switchSpaView(viewId) { 
            document.querySelectorAll('.spa-view').forEach(v => v.classList.remove('active')); 
            const target = document.getElementById(viewId); 
            if(target) target.classList.add('active'); 
        },

        /**
         * Ascoltatore per il tasto hardware "Indietro" di Android / Swipe iOS
         */
        initHistoryListener() {
            window.addEventListener('popstate', () => this.closeModals(false));
        }
    };
})();
