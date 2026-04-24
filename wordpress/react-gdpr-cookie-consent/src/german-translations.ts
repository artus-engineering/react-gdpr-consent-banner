import type { CookieConsentLabels, SupportedLanguage } from '../../../src/types'

const germanLabels: CookieConsentLabels = {
    descriptions: {
        cookieDetails: `Wir verwenden Cookies auf unserer Website, um Ihre Nutzererfahrung zu verbessern. Einige dieser Cookies sind
            notwendig, während andere uns helfen, unsere Online-Dienste wirtschaftlich zu betreiben und zu verbessern. Sie können Ihre
            Einwilligung jederzeit widerrufen oder anpassen. Weitere Details finden Sie in unserer`
    },
    common: {
        of: 'von'
    },
    buttons: {
        acceptAllCookies: 'Alle akzeptieren',
        rejectAllNonNecessaryCookies: 'Nur notwendige',
        acceptSelectedCookies: 'Auswahl akzeptieren',
        showDetails: 'Details anzeigen',
        back: 'Zurück'
    },
    headings: {
        banner: 'Wir schätzen Ihre Privatsphäre',
        details: 'Cookie-Details',
        consentGate: 'Ihre Zustimmung ist erforderlich, um diesen Inhalt anzuzeigen'
    },
    details: {
        expandCookieDetails: 'Details anzeigen',
        cookieName: 'Name',
        cookieDuration: 'Speicherdauer',
        cookieAccessors: 'Zugriff möglich durch',
        cookiePurpose: 'Zweck',
        moreInfoText: 'Mehr Informationen dazu finden Sie in der',
        privacyPolicyOf: 'Datenschutzerklärung von'
    },
    links: {
        privacyPolicy: 'Datenschutzerklärung',
        cookiePolicy: 'Cookie-Richtlinie'
    },
    units: {
        days: 'Tag',
        weeks: 'Woche',
        months: 'Monat',
        years: 'Jahr',
        session: 'Sitzung',
        daysPlural: 'Tage',
        weeksPlural: 'Wochen',
        monthsPlural: 'Monate',
        yearsPlural: 'Jahre',
        sessionPlural: 'Sitzungen'
    },
    cookieCategories: {
        Essential: 'Notwendig',
        Functional: 'Funktional',
        Analytics: 'Analyse',
        Marketing: 'Marketing'
    },
    cookiePolicy: {
        autoCookiePurpose: 'Merkt sich die Auswahl der Cookie-Einwilligung.',
        autoCookieDescription: 'Diese Cookies werden verwendet, um Ihre Auswahl zur Cookie-Einwilligung zu speichern.'
    },
    consentGate: {
        message: 'Dieser Inhalt kann erst nach Ihrer Zustimmung zu Cookies von diesem Anbieter angezeigt werden:'
    },
    cookieCategoryDescriptions: {
        Essential:
            'Notwendige Cookies ermöglichen grundlegende Website-Funktionen wie Sicherheit, Authentifizierung und technische Basisfunktionen. Sie können nicht deaktiviert werden.',
        Functional:
            'Funktionale Cookies ermöglichen Dienste von Drittanbietern und erweiterte Funktionen, zum Beispiel eingebettete Videos, Karten oder Zahlungen.',
        Analytics:
            'Analyse-Cookies helfen uns zu verstehen, wie Besucher unsere Website nutzen. Dazu zählen Seitenaufrufe, Verweildauer und Interaktionen. Diese Daten helfen uns, unsere Angebote zu verbessern.',
        Marketing:
            'Marketing-Cookies erfassen Aktivitäten über Websites hinweg, um Interessenprofile zu erstellen und relevante Werbung auf anderen Seiten anzuzeigen.'
    }
}

export function getLanguageLabels(_language: SupportedLanguage): CookieConsentLabels {
    return germanLabels
}
