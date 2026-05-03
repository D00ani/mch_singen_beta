// js/klaro-config.js

var klaroConfig = {
    elementID: 'klaro',
    lang: 'de',
    default: false,
    acceptAll: true,
    translations: {
        de: {
            consentModal: {
                title: 'Datenschutz & Cookies',
                description: 'Wir nutzen auf dieser Website externe Dienste (wie Google Maps), um dir zusätzliche Funktionen anzubieten. Du kannst hier selbst entscheiden, was du zulassen möchtest.',
            },
            // NEU: Der Text für das kleine Banner unten
            consentNotice: {
                description: 'Wir nutzen Cookies und externe Dienste (wie Google Maps), um unsere Webseite optimal für dich zu gestalten.',
                learnMore: 'Einstellungen anpassen',
            },
            // NEU: Beschriftung der Buttons
            ok: 'Alles akzeptieren',
            decline: 'Ablehnen',
            
            googleMaps: {
                description: 'Ermöglicht die Anzeige von interaktiven Karten direkt auf der Website.',
            },
            purposes: {
                functional: 'Funktionale Dienste',
            }
        }
    },
    services: [
        {
            name: 'googleMaps',
            default: false,
            title: 'Google Maps',
            purposes: ['functional']
        }
    ]
};