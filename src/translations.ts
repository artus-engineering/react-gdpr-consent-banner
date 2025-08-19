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
            cookiePurpose: 'Zweck'
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
            StrictlyNecessary: 'Notwendig',
            Preferences: 'Präferenzen',
            Statistics: 'Statistiken',
            Marketing: 'Marketing',
            Functional: 'Funktional',
            NotClassified: 'Nicht klassifiziert'
        },
        cookiePolicy: {
            autoCookiePurpose: 'Merkt die Auswahl der Cookie-Einwilligung des Benutzers.',
            autoCookieDescription: 'Diese Cookies werden verwendet, um die Auswahl der Cookie-Einwilligung des Benutzers zu unseren Diensten zu speichern.'
        },
        consentGate: {
            message: 'Entschuldigung. Wir können diesen Inhalt nicht anzeigen. Wir benötigen Ihre Zustimmung für Cookies von'
        },
        cookieCategoryDescriptions: {
            StrictlyNecessary: 'Zwingend erforderliche Cookies ermöglichen wesentliche Dienste und Funktionen, einschließlich Identitätsprüfung, Standortsicherheit usw.',
            Preferences:
                'Präferenz-Cookies ermöglichen einer Website, sich an Informationen zu erinnern, die das Verhalten oder Aussehen der Website verändern, wie Ihre bevorzugte Sprache oder die Region, in der Sie sich befinden.',
            Statistics: 'Statistik-Cookies helfen Website-Besitzern zu verstehen, wie Besucher mit Websites interagieren, indem sie Informationen anonym sammeln und melden.',
            Functional:
                'Funktionale Cookies ermöglichen es der Webseite Dienste von Drittanbietern bereitzustellen und fortgeschrittene Funktionalitäten bereitzustellen. Beispielsweise eingebettete Videos, Karten oder Zahlungen.',
            Marketing:
                'Marketing-Cookies werden verwendet, um Besucher über Websites hinweg zu verfolgen. Die Absicht ist es, Anzeigen zu zeigen, die für den einzelnen Benutzer relevant und ansprechend sind und damit für Publisher und Drittanbieter-Werbetreibende wertvoller sind.',
            NotClassified: 'Cookies, die keiner anderen Kategorie zugeordnet sind. Sie werden für Analyse- und Marketingzwecke verwendet.'
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
            cookiePurpose: 'Purpose'
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
            StrictlyNecessary: 'Strictly Necessary',
            Preferences: 'Preferences',
            Statistics: 'Statistics',
            Marketing: 'Marketing',
            Functional: 'Functional',
            NotClassified: 'Not Classified'
        },
        cookiePolicy: {
            autoCookiePurpose: "Remember the user's cookie consent selection.",
            autoCookieDescription: "These cookies are used to store the user's cookie consent selection to our services."
        },
        consentGate: {
            message: 'Sorry. We can not display this content as it requires your consent for cookies from'
        },
        cookieCategoryDescriptions: {
            StrictlyNecessary: 'Strictly necessary cookies enable essential services and functionality, including identity verification, site security, etc.',
            Preferences:
                'Preference cookies enable a website to remember information that changes the way the website behaves or looks, like your preferred language or the region that you are in.',
            Statistics: 'Statistic cookies help website owners to understand how visitors interact with websites by collecting and reporting information anonymously.',
            Functional: 'Functional cookies enable the website to provide enhanced functionality and personalization. For example, embedded videos, maps or payments.',
            Marketing:
                'Marketing cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user and thereby more valuable for publishers and third party advertisers.',
            NotClassified: 'Cookies that do not belong to any other category. They are used for analytics and marketing purposes.'
        }
    }
}

export function getLanguageLabels(language: SupportedLanguage): CookieConsentLabels {
    return cookieConsentTranslations[language]
}
