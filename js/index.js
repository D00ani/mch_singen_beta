// ==========================================
// MCH Singen - Spezifischer Code für Startseite
// Zuständig für: Google Maps Zwei-Klick-Lösung & Timer-Auslesung (.txt)
// ==========================================

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. GOOGLE MAPS LOADER (Zwei-Klick & Auto-Klaro Lösung) ---
    window.loadGoogleMap = function() {
        const mapContainer = document.getElementById('map-placeholder');
        if (!mapContainer || mapContainer.innerHTML.includes('iframe')) return;

        mapContainer.style.border = "none";
        mapContainer.style.background = "transparent";
        mapContainer.style.minHeight = "auto";
        mapContainer.style.padding = "0";
        
        const mapsUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2681.4429994236526!2d8.847113176939527!3d47.7728795772659!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x479a61e3df6a161b%3A0x6e0eb058ca76e828!2sM%C3%BCnchriedstra%C3%9Fe%2010%2C%2078224%20Singen%20(Hohentwiel)!5e0!3m2!1sde!2sde!4v1715014800000!5m2!1sde!2sde";

        mapContainer.innerHTML = `<iframe src="${mapsUrl}" width="100%" height="350" style="border:0; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.15); margin-bottom: 20px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
    };

    const loadMapBtn = document.getElementById('load-map-btn');
    if (loadMapBtn) {
        loadMapBtn.addEventListener('click', function() {
            if (typeof klaro !== 'undefined') {
                try {
                    let manager = klaro.getManager();
                    if (manager.updateConsent) manager.updateConsent('googleMaps', true);
                    else manager.updateService('googleMaps', true);
                    
                    if (manager.saveAndApplyConsents) manager.saveAndApplyConsents();
                    else manager.saveAndApply();
                } catch(e) {
                    console.log("Klaro konnte nicht automatisch aktualisiert werden.");
                }
            }
            window.loadGoogleMap();
        });
    }

    if (typeof klaro !== 'undefined' && klaro.getManager().getConsent('googleMaps')) {
        window.loadGoogleMap();
    }

    // --- 2. INTELLIGENTER LIVE COUNTDOWN SCRIPT (Aus timer.txt) ---
    fetch('additional/timer.txt')
        .then(response => {
            if (!response.ok) throw new Error("Fehler beim Laden des Timers");
            return response.text();
        })
        .then(data => {
            const lines = data.split('\n');
            const raceDates = []; 
            for(let i = 0; i < lines.length; i++) {
                let line = lines[i].trim();
                if(line !== "") {
                    let parts = line.split(';');
                    if(parts.length >= 4) {
                        let day = parts[0].trim(), month = parts[1].trim(), year = parts[2].trim(), time = parts[3].trim();
                        let kuerzel = parts.length > 4 ? parts[4].trim() : "", stadt = parts.length > 5 ? parts[5].trim() : "", mapLink = parts.length > 6 ? parts[6].trim() : "";
                        let validDateString = `${month} ${day}, ${year} ${time}`;
                        let parsedDate = new Date(validDateString).getTime();
                        if(!isNaN(parsedDate)) raceDates.push({ timestamp: parsedDate, verein: kuerzel, ort: stadt, link: mapLink });
                    }
                }
            }

            function getNextRace() {
                const now = new Date().getTime();
                const nowDateObj = new Date(now);
                raceDates.sort((a, b) => a.timestamp - b.timestamp);
                for (let race of raceDates) {
                    const raceDateObj = new Date(race.timestamp);
                    const isSameDay = nowDateObj.getFullYear() === raceDateObj.getFullYear() && nowDateObj.getMonth() === raceDateObj.getMonth() && nowDateObj.getDate() === raceDateObj.getDate();
                    if (race.timestamp > now || isSameDay) return race; 
                }
                return null;
            }

            setInterval(function() {
                let targetRace = getNextRace();
                let headingElement = document.querySelector(".countdown-wrapper h2");
                if (!targetRace) {
                    const cdBox = document.getElementById("countdown");
                    if(cdBox) cdBox.style.display = "none";
                    const cdMsg = document.getElementById("countdown-message");
                    if(cdMsg) { cdMsg.innerHTML = "Saison beendet!"; cdMsg.style.display = "block"; }
                    if(headingElement) headingElement.style.display = "none";
                    return;
                }

                const now = new Date().getTime(), distance = targetRace.timestamp - now;
                let vereinsText = "", vereinName = targetRace.verein + " " + targetRace.ort;
                if (targetRace.link !== "") vereinsText = " beim <a href='" + targetRace.link + "' target='_blank' style='color: #ffcc00; text-decoration: underline;'>" + vereinName + "</a>";
                else vereinsText = " beim " + vereinName;

                if (distance <= 0) {
                    if(headingElement) headingElement.style.display = "none"; 
                    document.getElementById("countdown").style.display = "none";
                    document.getElementById("countdown-message").innerHTML = "HEUTE IST RENNTAG" + vereinsText.toUpperCase() + "! 🏁🏎️";
                    document.getElementById("countdown-message").style.display = "block";
                } else {
                    if(headingElement) { headingElement.style.display = "block"; headingElement.innerHTML = "Nächstes Rennen" + vereinsText + " startet in:"; }
                    const d = Math.floor(distance / 86400000), h = Math.floor((distance % 86400000) / 3600000), m = Math.floor((distance % 3600000) / 60000), s = Math.floor((distance % 60000) / 1000);
                    
                    const daysEl = document.getElementById("days");
                    const hoursEl = document.getElementById("hours");
                    const minutesEl = document.getElementById("minutes");
                    const secondsEl = document.getElementById("seconds");

                    if(daysEl) daysEl.innerHTML = d < 10 ? "0"+d : d;
                    if(hoursEl) hoursEl.innerHTML = h < 10 ? "0"+h : h;
                    if(minutesEl) minutesEl.innerHTML = m < 10 ? "0"+m : m;
                    if(secondsEl) secondsEl.innerHTML = s < 10 ? "0"+s : s;
                    
                    document.getElementById("countdown").style.display = "flex";
                    document.getElementById("countdown-message").style.display = "none";
                }
            }, 1000);
        });
});