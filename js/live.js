
        // --- 2. DATEN & TIMING LOGIK ---
        let currentMode = 'rennen';

        let raceData = [
            { vorname: "Nico", name: "K.", club: "AC Singen", klasse: "Klasse 1a", timeMs: 40700 },
            { vorname: "Mario", name: "P.", club: "MCH Singen", klasse: "Klasse 1a", timeMs: 36020 },
            { vorname: "Maximilian", name: "E.", club: "MCH Singen", klasse: "Klasse 1a", timeMs: 32780 },
            { vorname: "Anna", name: "S.", club: "MCH Singen", klasse: "Klasse 1b", timeMs: 26010 }
        ];

        let trainingData = [
            { vorname: "Test", name: "Fahrer", club: "MCH", klasse: "Klasse 2", timeMs: 45000 }
        ];

        function formatTime(ms) {
            if(!ms) return "--:--.---";
            let mins = Math.floor(ms / 60000), secs = Math.floor((ms % 60000) / 1000), mil = ms % 1000;
            return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${mil.toString().padStart(3, '0')}`;
        }

        function render() {
            const container = document.getElementById('boards-container');
            container.innerHTML = '';
            let data = currentMode === 'rennen' ? raceData : trainingData;

            if (currentMode === 'training') {
                container.innerHTML = buildTableHTML(data, "Gesamt-Training");
            } else {
                let classes = [...new Set(data.map(d => d.klasse))].sort();
                classes.forEach(cls => {
                    container.innerHTML += buildTableHTML(data.filter(d => d.klasse === cls), cls);
                });
            }
        }

        function buildTableHTML(drivers, title) {
            let sorted = drivers.sort((a, b) => a.timeMs - b.timeMs);
            let best = sorted.length > 0 ? sorted[0].timeMs : 0;
            let html = `<div class="class-title">${title}</div><div class="table-container"><div class="responsive-wrap"><table>
                        <thead><tr><th>Pos</th><th>Fahrer</th><th>Club</th><th style="text-align:right">Zeit</th><th style="text-align:right">Diff.</th></tr></thead><tbody>`;
            sorted.forEach((d, i) => {
                let diff = i === 0 ? "--" : "+" + ((d.timeMs - best) / 1000).toFixed(3);
                html += `<tr><td class="pos-cell">${i+1}</td><td class="name-cell">${d.vorname} ${d.name}</td><td>${d.club}</td><td class="time-cell">${formatTime(d.timeMs)}</td><td class="diff-cell">${diff}</td></tr>`;
            });
            return html + `</tbody></table></div></div>`;
        }

        function setMode(m) {
            currentMode = m;
            document.getElementById('btn-rennen').classList.toggle('active', m === 'rennen');
            document.getElementById('btn-training').classList.toggle('active', m === 'training');
            render();
        }

        // --- 3. EXCEL EXPORT (Pro Klasse ein Reiter) ---
        async function exportToExcel() {
            const workbook = new ExcelJS.Workbook();
            
            if (currentMode === 'rennen') {
                const klassen = ["Klasse 1a", "Klasse 1b", "Klasse 1c", "Klasse 1d", "Klasse 1e", "Klasse 2", "Klasse 3", "Klasse 4", "Klasse 5"];
                
                klassen.forEach(cls => {
                    const sheet = workbook.addWorksheet(cls);
                    sheet.columns = [
                        { header: 'Nachname', key: 'nachname', width: 20 },
                        { header: 'Vorname', key: 'vorname', width: 20 },
                        { header: 'Club', key: 'club', width: 25 },
                        { header: 'Zeit', key: 'zeit', width: 15 },
                        { header: 'Punktzahl', key: 'punkte', width: 15 }
                    ];

                    const headerRow = sheet.getRow(1);
                    headerRow.font = { bold: true };
                    headerRow.eachCell(c => { c.fill = {type:'pattern', pattern:'solid', fgColor:{argb:'FFEEEEEE'}}; });

                    let clsDrivers = raceData.filter(d => d.klasse === cls).sort((a,b) => a.timeMs - b.timeMs);
                    clsDrivers.forEach(d => {
                        sheet.addRow({ nachname: d.name, vorname: d.vorname, club: d.club, zeit: formatTime(d.timeMs), punkte: "" });
                    });
                });
            } else {
                const sheet = workbook.addWorksheet('Training');
                sheet.columns = [
                    { header: 'Nachname', key: 'nachname', width: 20 },
                    { header: 'Vorname', key: 'vorname', width: 20 },
                    { header: 'Club', key: 'club', width: 25 },
                    { header: 'Zeit', key: 'zeit', width: 15 }
                ];
                trainingData.sort((a,b) => a.timeMs - b.timeMs).forEach(d => {
                    sheet.addRow({ nachname: d.name, vorname: d.vorname, club: d.club, zeit: formatTime(d.timeMs) });
                });
            }

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), `MCH_Live_Export_${currentMode}.xlsx`);
        }

        render();