import type { Dictionary } from './types'

export const de: Dictionary = {
    meta: {
        siteTitle: 'Cookie-Consent Demo | Artus Engineering',
        siteDescription:
            'Interaktive Demo der DSGVO-konformen Cookie-Consent-Bibliothek von Artus Engineering mit Theme-Anpassung und Consent-Gates.',
        privacyTitle: 'Datenschutzerklärung | Cookie-Consent Demo',
        privacyDescription:
            'Datenschutzerklärung für die öffentliche Demo-Website der Cookie-Consent-Bibliothek von Artus Engineering.'
    },
    header: {
        languageLabel: 'Sprache'
    },
    footer: {
        legalNav: 'Rechtliches',
        privacy: 'Datenschutz',
        imprint: 'Impressum',
        license: 'Lizenz',
        contact: 'Kontakt'
    },
    licenseNotice: {
        textBefore: 'Die Demo und die zugrunde liegende Bibliothek stehen unter der',
        licenseName: 'PolyForm Noncommercial License 1.0.0',
        textMiddle:
            '. Die nichtkommerzielle Nutzung ist erlaubt. Für die kommerzielle Nutzung ist eine separate Lizenz erforderlich. Bei Fragen oder für Lizenz- und Nutzungsanfragen wenden Sie sich an',
        contactLabel: 'Artus Engineering',
        textAfter: '.'
    },
    home: {
        heroTitle: 'DSGVO-konforme Cookie-Einwilligung',
        heroSubtitle:
            'Gut gestaltetes Cookie-Banner mit voller Anpassbarkeit, Consent-Gates und optionalem Audit-Trail für alle Einwilligungsänderungen.',
        openCookieSettings: 'Cookie-Einstellungen öffnen',
        themeCard: {
            title: 'Theme anpassen',
            description:
                'Passen Sie das Erscheinungsbild des Cookie-Banners an und sehen Sie die Änderungen direkt in der Vorschau.',
            presetThemes: 'Vordefinierte Themes',
            fineTuneColors: 'Farben fein abstimmen',
            livePreview: 'Live-Vorschau',
            testRealComponent: 'Mit der echten Komponente testen',
            preview: {
                title: 'Wir schätzen Ihre Privatsphäre',
                body: 'Wir verwenden Cookies, um Ihre Erfahrung auf unserer Website zu verbessern.',
                learnMore: 'Mehr erfahren',
                details: 'Details',
                essentialOnly: 'Nur Notwendige',
                acceptAll: 'Alle Akzeptieren'
            }
        },
        colorLabels: {
            bgPrimary: 'Hintergrund',
            bgSecondary: 'Sekundärer Hintergrund',
            textPrimary: 'Primärtext',
            textSecondary: 'Sekundärtext',
            primaryColor: 'Akzentfarbe',
            buttonText: 'Button-Text'
        },
        presetLabels: {
            light: 'Hell',
            dark: 'Dunkel',
            neutral: 'Neutral',
            warm: 'Warm'
        },
        consentGate: {
            title: 'Consent-Gate',
            description:
                'schützt eingebettete Drittanbieter (z. B. Zahlung, Karten, Maps) bis zur passenden Cookie-Einwilligung.',
            demoContext:
                'In dieser Demo gilt Stripe als Anbieter der Kategorie Funktional. Erst nach Zustimmung wird der eingebettete Inhalt sichtbar.',
            functionalCategory: 'Funktional',
            liveDemo: 'Live-Demo',
            paymentPossible: 'Zahlung möglich',
            paymentDescription:
                'Funktionale Cookies für Stripe sind erlaubt. Ein eingebettetes Checkout oder Zahlungsformular würde hier geladen.'
        },
        features: {
            gdpr: {
                title: 'DSGVO-konform',
                description:
                    'Abgestimmt auf DSGVO, CCPA und weitere Datenschutzvorschriften. Alle Einwilligungsänderungen lassen sich per Audit-Trail nachverfolgen.'
            },
            integration: {
                title: 'Einfache Integration',
                description:
                    'Einfache Konfiguration mit vorgefertigten Hooks für Google Analytics, PostHog, Matomo und weitere Dienste. IDs eintragen, fertig.'
            },
            multilingual: {
                title: 'Mehrsprachig',
                description:
                    'Deutsche und englische Texte sind bereits enthalten. Über das i18n-System lässt sich jede weitere Sprache ergänzen.'
            },
            customizable: {
                title: 'Voll anpassbar',
                description: 'Volle Kontrolle über Farben, Typografie und Layout. So passt das Banner zu Ihrer Marke.'
            },
            gates: {
                title: 'Consent-Gates',
                description:
                    'Blendet Inhalte aus, bis die Einwilligung vorliegt. Geeignet für eingebettete Videos, Karten und Drittanbieter-Widgets.'
            },
            granular: {
                title: 'Mehrstufige Einwilligung',
                description: 'Einzelne Kategorien wählbar: Notwendig, Funktional, Analyse und Marketing.'
            }
        },
        gettingStarted: {
            title: 'Erste Schritte',
            description: 'So binden Sie das Cookie-Banner ein und passen es an',
            steps: [
                {
                    title: 'Theme anpassen',
                    description:
                        'Nutzen Sie die Farbauswahl oben, um das Banner zu gestalten. Die Vorschau aktualisiert sich sofort.'
                },
                {
                    title: 'Anbieter konfigurieren',
                    description:
                        'Tragen Sie Ihre Cookie-Anbieter mit Beschreibung, Datenschutzlink und Cookie-Details ein.'
                },
                {
                    title: 'Banner testen',
                    description:
                        'Klicken Sie auf „Cookie-Einstellungen öffnen“, um das vollständige Banner mit allen Optionen zu sehen.'
                }
            ]
        },
        websiteName: 'Cookie-Consent Demo'
    },
    privacy: {
        title: 'Datenschutzerklärung',
        sections: [
            {
                title: '1. Datenschutz auf einen Blick',
                subsections: [
                    {
                        title: 'Allgemeine Hinweise',
                        paragraphs: [
                            'Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.',
                            'Diese Datenschutzerklärung gilt für die öffentliche Demo-Website unter react-gdpr-consent-banner.artus-engineering.de. Es handelt sich um eine interaktive Vorschau der Cookie-Consent-Bibliothek von Artus Engineering, kein produktives Kundenportal.'
                        ]
                    }
                ]
            },
            {
                title: '2. Verantwortliche Stelle',
                paragraphs: [
                    'Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:',
                    'Artus Engineering GmbH, Wilhelmstraße 18, 76344 Eggenstein-Leopoldshafen, Telefon: 0721 4671 2023, E-Mail: hi@artus-engineering.de',
                    'Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung personenbezogener Daten entscheidet.'
                ]
            },
            {
                title: '3. Hosting und Infrastruktur',
                paragraphs: [
                    'Diese Demo-Website wird über GitHub Pages bereitgestellt. Anbieter ist die GitHub Inc., 88 Colin P. Kelly Jr. St, San Francisco, CA 94107, USA (nachfolgend „GitHub“).',
                    'Beim Aufruf der Website kann GitHub in seinem Verantwortungsbereich Zugriff auf technische Daten haben, insbesondere Server-Logdateien, soweit dies zur Bereitstellung und Absicherung des Dienstes erforderlich ist. Die Verarbeitung erfolgt zur Gewährleistung eines störungsfreien Betriebs der Seite sowie zur Systemsicherheit und Stabilität.',
                    'Die Datenübertragung in die USA erfolgt auf Grundlage der Standardvertragsklauseln der EU-Kommission. Weitere Informationen entnehmen Sie der Datenschutzerklärung von GitHub.'
                ]
            },
            {
                title: '4. Datenerfassung auf dieser Website',
                subsections: [
                    {
                        title: 'Zweck und Inhalt der Demo',
                        paragraphs: [
                            'Die Website dient ausschließlich der Demonstration einer DSGVO-konformen Cookie-Einwilligung, von Theme-Anpassungen und von Consent-Gates. Es werden keine Nutzerkonten angelegt, kein Kontaktformular betrieben und keine Bestell- oder Zahlungsvorgänge durchgeführt. Die im Banner genannten Drittanbieter (z. B. Stripe, Google Analytics) sind nur Beispiele zur Illustration. Es werden keine echten Tracking- oder Zahlungsdienste eingebunden.',
                            'Auf der öffentlichen Demo werden keine Einwilligungsereignisse an einen Server übermittelt und keine Datenbank genutzt. Es findet keine Profilbildung oder Analyse Ihres Nutzungsverhaltens durch uns statt.'
                        ]
                    },
                    {
                        title: 'Server-Log-Dateien',
                        paragraphs: [
                            'Beim Aufruf dieser Website erhebt und speichert der Hosting-Anbieter automatisch Informationen in sogenannten Server-Log-Dateien, die Ihr Browser übermittelt. Dies können insbesondere sein:'
                        ],
                        listItems: [
                            'Browsertyp und Browserversion',
                            'verwendetes Betriebssystem',
                            'Referrer-URL',
                            'Hostname des zugreifenden Rechners',
                            'Uhrzeit der Serveranfrage',
                            'IP-Adresse'
                        ]
                    },
                    {
                        paragraphs: [
                            'Die Verarbeitung erfolgt zur Gewährleistung eines störungsfreien Betriebs der Seite sowie zur Systemsicherheit und Stabilität (Art. 6 Abs. 1 lit. f DSGVO). Eine Zusammenführung mit anderen Datenquellen zu Werbezwecken erfolgt durch uns nicht.'
                        ]
                    },
                    {
                        title: 'Cookies und Einwilligungsdemo',
                        paragraphs: [
                            'Beim Interagieren mit dem Cookie-Banner speichern wir ausschließlich Ihre Einwilligungswahl in Cookies im Browser, zum Beispiel ob der Hinweis bereits angezeigt wurde und welchen Beispielkategorien Sie zugestimmt haben. Diese Cookies dienen nur der Funktion der Demo.',
                            'Rechtsgrundlage ist Ihre Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO, sofern Sie eine Auswahl treffen. Die technisch notwendige Speicherung Ihrer Entscheidung im Banner kann zudem auf Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer funktionierenden Demo) gestützt werden.',
                            'Sie können Ihre Auswahl jederzeit über „Cookie-Einstellungen öffnen“ auf der Startseite ändern oder Cookies in Ihrem Browser löschen.'
                        ]
                    }
                ]
            },
            {
                title: '5. Ihre Rechte',
                paragraphs: [
                    'Soweit die gesetzlichen Voraussetzungen erfüllt sind, haben Sie Recht auf Auskunft über Ihre bei uns gespeicherten personenbezogenen Daten, auf Berichtigung unrichtiger Daten, auf Löschung oder auf Einschränkung der Verarbeitung sowie auf Datenübertragbarkeit. Außerdem steht Ihnen ein Beschwerderecht bei einer Datenschutzaufsichtsbehörde zu.',
                    'Zur Ausübung Ihrer Rechte oder bei Fragen zum Datenschutz erreichen Sie uns unter den oben genannten Kontaktdaten der verantwortlichen Stelle oder über artus-engineering.de/kontakt.'
                ]
            },
            {
                title: '6. SSL- bzw. TLS-Verschlüsselung',
                paragraphs: [
                    'Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von „http://“ auf „https://“ wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.'
                ]
            }
        ],
        cookieSettingsLink: 'Cookie-Einstellungen öffnen',
        homeLink: 'Startseite',
        backToDemo: '← Zurück zur Demo',
        updatedAt: 'Stand: 7. Juni 2026',
        githubPrivacyLabel: 'Datenschutzerklärung von GitHub',
        contactPageLabel: 'artus-engineering.de/kontakt'
    }
}
