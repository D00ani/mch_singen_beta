// ==========================================
// MCH Singen - Haupt-JavaScript
// Zuständig für: Navigation, Sidebar, Dark-Mode, Touch-Gesten
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SIDEBAR & NAVIGATION LOGIK ---
    const sideMenu = document.getElementById('side-menu');
    const openMenuBtn = document.getElementById('open-menu');
    const closeMenuBtn = document.getElementById('close-menu');

    if (openMenuBtn) {
        openMenuBtn.addEventListener('click', (e) => { 
            if(sideMenu) sideMenu.classList.add('open'); 
            e.stopPropagation(); 
        });
    }

    if (closeMenuBtn) {
        closeMenuBtn.addEventListener('click', () => {
            if(sideMenu) sideMenu.classList.remove('open');
        });
    }

    // Klick außerhalb des Menüs schließt es
    document.addEventListener('click', (e) => { 
        if (sideMenu && sideMenu.classList.contains('open') && !sideMenu.contains(e.target)) {
            sideMenu.classList.remove('open'); 
        }
    });

    // --- 2. DARK MODE TOGGLE ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Lade gespeichertes Theme aus dem LocalStorage
    if (localStorage.getItem('dark-mode') === 'enabled') {
        body.classList.add('dark-mode');
    }

    function updateThemeIcon() {
        if (themeToggleBtn) {
            themeToggleBtn.innerHTML = body.classList.contains('dark-mode') ? 
                '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        }
    }
    updateThemeIcon(); // Initiale Icon-Anzeige

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            localStorage.setItem('dark-mode', body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
            updateThemeIcon();
        });
    }

    // --- 3. MOBILE SWIPE GESTURE (Wisch-Menü) ---
    let touchstartX = 0;
    let touchstartY = 0;

    document.addEventListener('touchstart', (e) => { 
        touchstartX = e.changedTouches[0].screenX; 
        touchstartY = e.changedTouches[0].screenY;
    }, {passive: true});

    document.addEventListener('touchend', (e) => {
        let dx = e.changedTouches[0].screenX - touchstartX;
        let dy = Math.abs(e.changedTouches[0].screenY - touchstartY);
        
        // Nur reagieren, wenn es ein horizontaler Wisch war (kein Scrollen)
        if (dy < 50) {
            // Wisch nach rechts (am linken Rand starten) -> Öffnen
            if (dx > 70 && touchstartX < 80) {
                if (sideMenu) sideMenu.classList.add('open');
            }
            // Wisch nach links -> Schließen
            else if (dx < -70) {
                if (sideMenu) sideMenu.classList.remove('open');
            }
        }
    }, {passive: true});

    // --- 4. KLARO COOKIE CONSENT RELOAD ---
    // Lädt die Seite neu, wenn die Cookie-Einstellungen gespeichert wurden
    document.addEventListener('click', function(e) {
        if (e.target.closest('.cm-btn') || e.target.closest('.cn-button')) {
            setTimeout(() => { window.location.reload(true); }, 400);
        }
    });

});