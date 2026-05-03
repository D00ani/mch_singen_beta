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
                description: 'Wir nutzen auf dieser Website externe Dienste (wie Google Maps), um dir zusätzliche Funktionen anzubieten.',
            },
            consentNotice: {
                description: 'Wir nutzen Cookies und Google Maps, um unsere Webseite optimal für dich zu gestalten.',
                learnMore: 'Einstellungen anpassen',
            },
            ok: 'Alles akzeptieren',
            decline: 'Ablehnen',
            googleMaps: {
                description: 'Anzeige von interaktiven Karten.',
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
            purposes: ['functional'],
            // NEU: Diese Funktion wird von Klaro automatisch aufgerufen
            onAccept: (status) => {
                if (status === true && typeof loadGoogleMap === 'function') {
                    loadGoogleMap();
                }
            }
        }
    ]
};