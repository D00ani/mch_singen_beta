
        // --- 2. NEU: ANIMIERTE MEILENSTEINE (ZÄHLER) ---
        document.addEventListener("DOMContentLoaded", () => {
            const counters = document.querySelectorAll('.milestone-number');
            const speed = 150; // Animationsgeschwindigkeit (niedriger = schneller)

            const startCounting = (counter) => {
                const target = +counter.getAttribute('data-target');
                const suffix = counter.getAttribute('data-suffix') || '';
                // Aktuellen Wert lesen (ohne Suffix)
                const count = +counter.innerText.replace(/\D/g, ''); 
                const inc = target / speed;

                if (count < target) {
                    counter.innerText = Math.ceil(count + inc) + suffix;
                    setTimeout(() => startCounting(counter), 15);
                } else {
                    counter.innerText = target + suffix;
                }
            };

            // Observer startet die Animation erst, wenn die Box im Bildbereich sichtbar wird
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        startCounting(entry.target);
                        observer.unobserve(entry.target); // Nur 1x animieren
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(counter => observer.observe(counter));
        });

        // --- 3. DIAGRAMM LOGIK (Chart.js) ---
        document.addEventListener("DOMContentLoaded", function() {
            const commonOptions = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }, plugins: { legend: { display: false } } };
            
            new Chart(document.getElementById('chartCurrent').getContext('2d'), {
                type: 'bar', data: { labels: ['1. Platz', '2. Platz', '3. Platz'], datasets: [{ data: [0, 0, 0], backgroundColor: 'rgba(0, 51, 160, 0.8)', borderColor: '#0033a0', borderWidth: 1, borderRadius: 4 }] }, options: commonOptions
            });
            new Chart(document.getElementById('chartGesamt').getContext('2d'), {
                type: 'bar', data: { labels: ['1. Platz', '2. Platz', '3. Platz'], datasets: [{ data: [121, 112, 115], backgroundColor: 'rgba(0, 27, 94, 0.8)', borderColor: '#001b5e', borderWidth: 1, borderRadius: 4 }] }, options: commonOptions
            });
            new Chart(document.getElementById('chart2025').getContext('2d'), {
                type: 'bar', data: { labels: ['1. Platz', '2. Platz', '3. Platz'], datasets: [{ data: [14, 12, 23], backgroundColor: 'rgba(66, 133, 244, 0.8)', borderColor: '#4285F4', borderWidth: 1, borderRadius: 4 }] }, options: commonOptions
            });
        });

        // --- 4. DATENSCHUTZ-SKRIPT (Namen abkürzen) ---
        document.addEventListener("DOMContentLoaded", function() {
            const tables = document.querySelectorAll('.stats-table');
            tables.forEach(table => {
                let nameColumnIndex = -1;
                const headers = table.querySelectorAll('thead th');
                headers.forEach((th, index) => {
                    const headerText = th.textContent.trim().toLowerCase();
                    if (headerText === 'fahrer/in' || headerText === 'gewinner/in') nameColumnIndex = index;
                });
                if (nameColumnIndex !== -1) {
                    const rows = table.querySelectorAll('tbody tr');
                    rows.forEach(row => {
                        const cells = row.querySelectorAll('td');
                        if (cells.length > nameColumnIndex) {
                            let fullName = cells[nameColumnIndex].textContent.trim();
                            if (fullName.includes(" ") && !fullName.endsWith(".")) {
                                let nameParts = fullName.split(" ");
                                let lastName = nameParts.pop(); 
                                let firstName = nameParts.join(" "); 
                                cells[nameColumnIndex].textContent = firstName + " " + lastName.charAt(0) + ".";
                            }
                        }
                    });
                }
            });
        });