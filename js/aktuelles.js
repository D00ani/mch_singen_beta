 // --- 3. KALENDER LOGIK (ICS GENERIERUNG) ---
        const monateMap = { "Januar": "01", "Februar": "02", "März": "03", "April": "04", "Mai": "05", "Juni": "06", "Juli": "07", "August": "08", "September": "09", "Oktober": "10", "November": "11", "Dezember": "12" };

        async function ladeUndGeneriereICS(zielGruppe) {
            try {
                // Pfad angepasst: ../additional/
                const res = await fetch('../additional/trainingstermine2026.txt');
                const data = await res.text();
                const zeilen = data.split('\n');
                let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//MCH Singen//DE\nCALSCALE:GREGORIAN\n";

                zeilen.forEach(zeile => {
                    if (zeile.trim() === "") return;
                    const p = zeile.split(';');
                    if (p.length < 5) return;
                    
                    const tag = p[0].trim().padStart(2, '0'), monat = monateMap[p[1].trim()], jahr = p[2].trim(), zeit = p[3].trim(), gruppe = p[4].trim();
                    
                    if (gruppe == zielGruppe || gruppe == "3") {
                        const start = zeit.split('-')[0].trim().replace(':', '');
                        icsContent += `BEGIN:VEVENT\nSUMMARY:MCH Training Gruppe ${gruppe}\nDTSTART:${jahr}${monat}${tag}T${start}00\nDTEND:${jahr}${monat}${tag}T133000\nLOCATION:Münchriedstraße 10, Singen\nEND:VEVENT\n`;
                    }
                });

                icsContent += "END:VCALENDAR";
                downloadFile(icsContent, `MCH_Training_Gruppe_${zielGruppe}.ics`);
            } catch (e) { alert("Fehler beim Laden der Termine."); }
        }

        async function ladeRenntermineICS() {
            try {
                const res = await fetch('../additional/timer.txt');
                const data = await res.text();
                const zeilen = data.split('\n');
                let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//MCH Singen//DE\n";

                zeilen.forEach(zeile => {
                    if (zeile.trim() === "") return;
                    const p = zeile.split(';');
                    if (p.length < 4) return;
                    const tag = p[0].trim().padStart(2, '0'), monat = monateMap[p[1].trim()], jahr = p[2].trim(), zeit = p[3].trim().replace(':', ''), ort = p[5] || "Unbekannt";
                    icsContent += `BEGIN:VEVENT\nSUMMARY:MCH Rennen ${ort}\nDTSTART:${jahr}${monat}${tag}T${zeit}00\nLOCATION:${ort}\nEND:VEVENT\n`;
                });

                icsContent += "END:VCALENDAR";
                downloadFile(icsContent, "MCH_Renntermine.ics");
            } catch (e) { alert("Fehler beim Laden der Renntermine."); }
        }

        function downloadFile(content, fileName) {
            const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
        }
