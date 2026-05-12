// --- 2. INTELLIGENTE SUCH-LOGIK (Erweitert) ---
        const websiteSeiten = [
            { url: '../index.html', titel: 'Startseite', beschreibung: 'Willkommen beim Motorsportclub Singen. Alle Infos zum Verein, Karte und Live-Countdown.', keywords: 'startseite home homepage willkommen begrüßung verein club motorsport motorsportclub mch singen hohentwiel hegau bodensee bodenseekreis radolfzell konstanz mitgliedschaft anfahrt adresse standort karte google maps navigation route wo münchriedstraße timer countdown live öffnungszeiten' },
            { url: 'aktuelles.html', titel: 'Aktuelle News & Termine', beschreibung: 'Lade dir Trainingspläne, Renntermine und aktuelle Wertungen herunter.', keywords: 'aktuell news neuigkeiten termine kalender kalenderdatei ics apple google outlook training trainingsplan samstag uhrzeit wann rennen wertung ergebnis download pdf liste plan veranstaltungen event updates' },
            { url: 'ueber-uns.html', titel: 'Verein & Team', beschreibung: 'Erfahre mehr über unsere Philosophie, den Vorstand und unsere Trainer.', keywords: 'über uns philosophie geschichte historie werte gemeinschaft vereinsleben dmv tradition leitbild wer wir sind vorstand präsident kassierer leitung team trainer betina jochen isak alex brandenburg andi leon thorsten max daniel ansprechpartner' },
            { url: 'kartsport.html', titel: 'Kartsport', beschreibung: 'Alles rund um den Jugendkart-Slalom und unsere Kartsport-Abteilung.', keywords: 'kart kartsport rennkart jugendkart slalom rennen bkc bodensee kart cup meisterschaft schnell gas bremse helm reifen asphalt fahrer jugend kard cart karts rennstrecke motor ps geschwindigkeit rennfahrer' },
            { url: 'trialsport.html', titel: 'Trialsport', beschreibung: 'Motorrad-Beherrschung pur. Infos zu unserer Trial-Abteilung.', keywords: 'trial trialsport motorrad mopped moped balance geschicklichkeit sektion hindernis punkte fehler meisterschaft süddeutsche fahrer jugend trialer offroad steine gelände trail triel wettbewerb zweirad fahrtechnik' },
            { url: 'statistiken.html', titel: 'Statistiken & Erfolge', beschreibung: 'Platzierungen, Wanderpokale und historische Vereinsbestleistungen.', keywords: 'statistik erfolge ergebnisse platzierung tabelle pokal wanderpokal sieger meister rekorde bestleistung hall of fame historie vergleich gewinner erster platz gold silber bronze rangliste punktestand vereinsmeister podest' },
            { url: 'mitglied-werden.html', titel: 'Mitglied werden & Gebühren', beschreibung: 'Übersicht der Jahresbeiträge, Trainingskosten und Anmeldeformular.', keywords: 'mitglied mitgliedschaft beitreten anmelden anmeldung formular antrag pdf preise kosten geld beitrag jahresbeitrag gebühr gebühren renngebühren dmv kinder jugendliche erwachsene passiv aktiv probetraining' },
            { url: 'faq.html', titel: 'FAQ - Häufige Fragen', beschreibung: 'Antworten zu Alter, Ausrüstung, Probetraining und Saison.', keywords: 'faq fragen antworten häufig probetraining alter ab wann jahre ausrüstung helm schuhe handschuhe regen wetter nass saison dauer karts ps leistung mach 1 unterschied' },
            { url: 'sponsoren-links.html', titel: 'Sponsoren & Links', beschreibung: 'Unsere Unterstützer, befreundete Vereine und nützliche Links.', keywords: 'sponsoren sponsor partner unterstützer geldgeber werbung links freunde netzwerk vereine danke förderer firmen spende sparkasse huk coburg randegger herby' },
            { url: 'geschichte.html', titel: 'Geschichte des MCH', beschreibung: 'Von den Anfängen im "Deutschen Hof" bis heute.', keywords: 'geschichte historie früher vergangenheit alte gründung 1954 entstehung chronik deutscher hof alemannenring dtm stw dtm-betreuung arena-trial' },
            { url: 'kontakt.html', titel: 'Kontaktformular', beschreibung: 'Schreibe uns eine Nachricht oder finde unsere Kontaktdaten.', keywords: 'kontakt schreiben nachricht email e-mail mail telefon anrufen formular frage hilfe erreichbarkeit adresse postanschrift briefkasten support anfrage nummer handynummer' },
            { url: 'archiv.html', titel: 'Ergebnis-Archiv', beschreibung: 'Historische Ergebnisse, Wertungen und Berichte vergangener Jahre.', keywords: 'archiv früher vergangenheit historie alte ergebnisse vergangen saison jahre rückblick dokumente 2022 2023 2024 alt aufzeichnungen' },
            { url: 'impressum-datenschutz.html', titel: 'Impressum & Datenschutz', beschreibung: 'Rechtliche Angaben und Informationen zur Datenverarbeitung (DSGVO).', keywords: 'impressum haftung rechtliches gesetz regeln agb datenschutz dsgvo privacy daten privatsphäre cookies tracking sicherheit' },
            { url: 'https://mch-singen.teamkleidung24.de', titel: 'MCH Vereins-Shop', beschreibung: 'Hier kommst du zu unserem Shop für Teamkleidung.', keywords: 'shop t-shirt tshirt pulli hoodie shirt kleidung bekleidung vereinskleidung teamkleidung fanartikel merch merchandise kaufen bestellen jacke mütze' }
        ];

        const urlParams = new URLSearchParams(window.location.search);
        const rawSearch = urlParams.get('q') || '';
        const searchTerms = rawSearch.toLowerCase().trim().split(/\s+/);
        
        document.getElementById('main-search-input').value = rawSearch;
        const resultsContainer = document.getElementById('results-container');

        if (rawSearch.trim() !== '') {
            document.getElementById('search-info').style.display = 'block';
            document.getElementById('search-query-display').textContent = rawSearch;
            
            const treffer = websiteSeiten.filter(seite => {
                const textToSearch = (seite.titel + " " + seite.beschreibung + " " + seite.keywords).toLowerCase();
                // Prüft, ob ALLE eingegebenen Wörter im Text vorkommen
                return searchTerms.every(term => textToSearch.includes(term));
            });

            if (treffer.length > 0) {
                treffer.forEach(seite => {
                    let targetAttr = seite.url.startsWith('http') ? 'target="_blank"' : '';
                    
                    resultsContainer.innerHTML += `
                        <div class="result-item" style="background: #fff; padding: 20px; margin-bottom: 15px; border-radius: 8px; border-left: 4px solid var(--primary-blue); box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                            <h3 style="margin-top: 0; margin-bottom: 5px;"><a href="${seite.url}" ${targetAttr} style="color: var(--primary-blue); text-decoration: none;">${seite.titel}</a></h3>
                            <p style="margin: 0; color: #555;">${seite.beschreibung}</p>
                        </div>
                    `;
                });
            } else {
                resultsContainer.innerHTML = `<p style="padding: 20px; background: #fffbe6; border-left: 4px solid #ffcc00; border-radius: 8px;">Leider haben wir zu "<strong>${rawSearch}</strong>" nichts gefunden. Versuche es mit einem anderen Begriff (z.B. "Training", "Kosten" oder "Vorstand").</p>`;
            }
        } else {
            resultsContainer.innerHTML = '<p style="font-size: 1.1rem; color: var(--text-main);">Bitte gib oben einen Suchbegriff ein und klicke auf "Suchen".</p>';
        }