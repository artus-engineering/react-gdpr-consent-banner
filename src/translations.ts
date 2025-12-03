import { CookieConsentLabels, SupportedLanguage } from './types'

const cookieConsentTranslations: Record<SupportedLanguage, CookieConsentLabels> = {
    deDE: {
        descriptions: {
            cookieDetails: `Wir verwenden Cookies auf unserer Website, um Ihre Nutzererfahrung zu verbessern. Einige dieser Cookies sind
                notwendig, während andere uns helfen, unsere Online-Dienste wirtschaftlich zu betreiben und zu verbessern. Sie können Ihre
                Einwilligung jederzeit widerrufen oder anpassen. Weitere Details finden Sie in unserer`
        },
        common: {
            of: 'von'
        },
        buttons: {
            acceptAllCookies: 'Alle Akzeptieren',
            rejectAllNonNecessaryCookies: 'Nur Notwendige',
            acceptSelectedCookies: 'Auswahl Akzeptieren',
            showDetails: 'Details anzeigen',
            back: 'Zurück'
        },
        headings: {
            banner: 'Wir schätzen Ihre Privatsphäre',
            details: 'Cookie Details',
            consentGate: 'Ihre Zustimmung ist erforderlich, um diesen Inhalt anzuzeigen'
        },
        details: {
            expandCookieDetails: 'Details anzeigen',
            cookieName: 'Name',
            cookieDuration: 'Speicherdauer',
            cookieAccessors: 'Zugriff möglich durch',
            cookiePurpose: 'Zweck',
            moreInfoText: 'Mehr informationen dazu finden Sie in der',
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
            Analytics: 'Analytik',
            Marketing: 'Marketing'
        },
        cookiePolicy: {
            autoCookiePurpose: 'Merkt die Auswahl der Cookie-Einwilligung des Benutzers.',
            autoCookieDescription: 'Diese Cookies werden verwendet, um die Auswahl der Cookie-Einwilligung des Benutzers zu unseren Diensten zu speichern.'
        },
        consentGate: {
            message: 'Entschuldigung. Wir können diesen Inhalt nicht anzeigen. Wir benötigen Ihre Zustimmung für Cookies von'
        },
        cookieCategoryDescriptions: {
            Essential:
                'Zwingend erforderliche Cookies ermöglichen wesentliche Dienste und Funktionen, einschließlich Identitätsprüfung, Standortsicherheit usw.',
            Functional:
                'Funktionale Cookies ermöglichen es der Webseite Dienste von Drittanbietern bereitzustellen und fortgeschrittene Funktionalitäten bereitzustellen. Beispielsweise eingebettete Videos, Karten oder Zahlungen.',
            Analytics:
                'Analytik-Cookies helfen uns zu verstehen, wie Besucher unsere Website nutzen, indem sie Informationen über Seitenbesuche, Verweildauer und Benutzerinteraktionen sammeln. Diese Daten helfen uns, unsere Dienste zu verbessern.',
            Marketing:
                'Marketing-Cookies verfolgen Ihre Aktivitäten auf verschiedenen Websites, um ein Profil Ihrer Interessen zu erstellen und Ihnen relevante Werbung auf anderen Seiten zu zeigen.'
        }
    },
    enUS: {
        descriptions: {
            cookieDetails: `We use cookies on our website to improve your user experience. Some of these cookies are necessary, while others
                help us to improve our online services and operate them economically. You can withdraw or adjust your consent at any time.
                Further details can be found in our`
        },
        common: {
            of: 'of'
        },
        buttons: {
            acceptAllCookies: 'Accept All',
            rejectAllNonNecessaryCookies: 'Necessary Only',
            acceptSelectedCookies: 'Accept Selected',
            showDetails: 'Show Details',
            back: 'Back'
        },
        headings: {
            banner: 'We value your privacy',
            details: 'Cookie Details',
            consentGate: 'Your consent is required to view this content'
        },
        details: {
            expandCookieDetails: 'Show details',
            cookieName: 'Name',
            cookieDuration: 'Storage Duration',
            cookieAccessors: 'Accessible By',
            cookiePurpose: 'Purpose',
            moreInfoText: 'More information can be found in the',
            privacyPolicyOf: 'Privacy Policy of'
        },
        links: {
            privacyPolicy: 'Privacy Policy',
            cookiePolicy: 'Cookie Policy'
        },
        units: {
            days: 'Day',
            weeks: 'Week',
            months: 'Month',
            years: 'Year',
            session: 'Session',
            daysPlural: 'Days',
            weeksPlural: 'Weeks',
            monthsPlural: 'Months',
            yearsPlural: 'Years',
            sessionPlural: 'Sessions'
        },
        cookieCategories: {
            Essential: 'Essential',
            Functional: 'Functional',
            Analytics: 'Analytics',
            Marketing: 'Marketing'
        },
        cookiePolicy: {
            autoCookiePurpose: "Remember the user's cookie consent selection.",
            autoCookieDescription: "These cookies are used to store the user's cookie consent selection to our services."
        },
        consentGate: {
            message: 'Sorry. We can not display this content as it requires your consent for cookies from'
        },
        cookieCategoryDescriptions: {
            Essential: 'Essential cookies enable core website functionality, including security, authentication, and basic operations. These cannot be disabled.',
            Functional: 'Functional cookies enable the website to provide third-party services and advanced functionality. For example, embedded videos, maps, or payments.',
            Analytics:
                'Analytics cookies help us understand how visitors use our website by collecting information about page visits, time spent, and user interactions. This data helps us improve our services.',
            Marketing: 'Marketing cookies track your activity across websites to build a profile of your interests and show you relevant advertisements on other sites.'
        }
    }
}

export function getLanguageLabels(language: SupportedLanguage): CookieConsentLabels {
    return cookieConsentTranslations[language]
}
