// js/klaro-config.js

var klaroConfig = {
    // ID des HTML-Elements, das Klaro erstellt
    elementID: 'klaro',
    
    // Standardsprache
    lang: 'de',
    
    // Sollen Dienste standardmäßig aktiv sein? (Muss wegen DSGVO auf false stehen!)
    default: false,
    
    // Zeigt den "Alle akzeptieren"-Button
    acceptAll: true,
    
    // Übersetzungen für dein Banner
    translations: {
        de: {
            consentModal: {
                title: 'Datenschutz & Cookies',
                description: 'Wir nutzen auf dieser Website externe Dienste (wie Google Maps), um dir zusätzliche Funktionen anzubieten. Du kannst hier selbst entscheiden, was du zulassen möchtest.',
            },
            googleMaps: {
                description: 'Ermöglicht die Anzeige von interaktiven Karten direkt auf der Website.',
            },
            purposes: {
                functional: 'Funktionale Dienste',
            }
        }
    },
    
    // Hier definieren wir die Dienste, die blockiert werden sollen
    services: [
        {
            // Das ist der interne Name. Er MUSS mit dem data-name im HTML übereinstimmen!
            name: 'googleMaps',
            default: false,
            title: 'Google Maps',
            purposes: ['functional']
        }
    ]
};