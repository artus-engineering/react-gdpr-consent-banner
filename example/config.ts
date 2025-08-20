import { CookieProvider } from '../src'

export const WebsiteCookieProvider: CookieProvider = {
    name: 'Some Website',
    id: 'website',
    category: 'Essential',
    description: {
        enUS: 'We use session cookies to store your session on our website. This cookie is necessary to use the website.',
        deDE: 'Wir verwenden Session-Cookies, um Ihre Sitzung auf unserer Website zu speichern. Dieses Cookie ist für die Nutzung der Website erforderlich.'
    },
    dataProtectionLink: 'https://example.com/privacy',
    cookies: [
        {
            name: 'app_session',
            duration: 7,
            unit: 'days',
            purpose: {
                enUS: 'Store the session',
                deDE: 'Sitzung speichern'
            }
        },
        {
            name: 'logged_in',
            duration: 7,
            unit: 'days',
            purpose: {
                enUS: 'Store the login status',
                deDE: 'Anmeldestatus speichern'
            }
        }
    ]
}

export const TrackingCookieProvider: CookieProvider = {
    name: 'Some Tracking Service',
    id: 'tracking',
    category: 'Analytics',
    serviceProvider: 'TrackingCorp',
    description: {
        enUS: 'We use Some Tracking Service to collect anonymous statistics about the use of our website. This helps us to improve the website.',
        deDE: 'Wir verwenden einen Tracking-Service, um anonyme Statistiken über die Nutzung unserer Website zu sammeln. Dies hilft uns bei der Verbesserung der Website.'
    },
    dataProtectionLink: 'https://example.com/privacy',
    cookies: [
        {
            name: '_pk_id',
            duration: 7,
            unit: 'days',
            purpose: {
                enUS: 'Identifies returning visitors',
                deDE: 'Identifiziert wiederkehrende Besucher'
            }
        },
        {
            name: '_pk_ses',
            duration: 7,
            unit: 'days',
            purpose: {
                enUS: 'Stores the session of a visitor',
                deDE: 'Speichert die Sitzung eines Besuchers'
            }
        }
    ]
}

export const PreferencesCookieProvider: CookieProvider = {
    name: 'User Preferences',
    id: 'preferences',
    category: 'Analytics',
    description: {
        enUS: 'We use cookies to remember your preferences and settings to provide you with a personalized experience.',
        deDE: 'Wir verwenden Cookies, um Ihre Präferenzen und Einstellungen zu speichern und Ihnen ein personalisiertes Erlebnis zu bieten.'
    },
    dataProtectionLink: 'https://example.com/privacy',
    cookies: [
        {
            name: 'theme_preference',
            duration: 1,
            unit: 'years',
            purpose: {
                enUS: 'Remember your theme preference (light/dark mode)',
                deDE: 'Speichert Ihre Theme-Präferenz (Hell-/Dunkelmodus)'
            }
        },
        {
            name: 'language_preference',
            duration: 1,
            unit: 'years',
            purpose: {
                enUS: 'Remember your language preference',
                deDE: 'Speichert Ihre Sprachpräferenz'
            }
        },
        {
            name: 'font_size',
            duration: 1,
            unit: 'years',
            purpose: {
                enUS: 'Remember your font size preference',
                deDE: 'Speichert Ihre Schriftgröße-Präferenz'
            }
        }
    ]
}

export const FunctionalCookieProvider: CookieProvider = {
    name: 'Functional Services',
    id: 'functional',
    category: 'Analytics',
    description: {
        enUS: 'We use cookies to enable enhanced functionality and features on our website.',
        deDE: 'Wir verwenden Cookies, um erweiterte Funktionen und Features auf unserer Website zu ermöglichen.'
    },
    dataProtectionLink: 'https://example.com/privacy',
    cookies: [
        {
            name: 'chat_session',
            duration: 1,
            unit: 'days',
            purpose: {
                enUS: 'Enable live chat functionality',
                deDE: 'Ermöglicht Live-Chat-Funktionalität'
            }
        },
        {
            name: 'video_preferences',
            duration: 7,
            unit: 'days',
            purpose: {
                enUS: 'Remember video player settings',
                deDE: 'Speichert Video-Player-Einstellungen'
            }
        }
    ]
}

export const GoogleCookieProvider: CookieProvider = {
    name: 'Google Analytics & Ads',
    id: 'google',
    category: 'Marketing',
    serviceProvider: 'Google',
    description: {
        enUS: 'We use Google Analytics and Google Ads to analyze website usage and show personalized advertisements.',
        deDE: 'Wir verwenden Google Analytics und Google Ads, um die Website-Nutzung zu analysieren und personalisierte Werbung anzuzeigen.'
    },
    dataProtectionLink: 'https://policies.google.com/privacy',
    cookies: [
        {
            name: '_ga',
            duration: 2,
            unit: 'years',
            purpose: {
                enUS: 'Distinguish unique users and sessions',
                deDE: 'Unterscheidet eindeutige Benutzer und Sitzungen'
            }
        },
        {
            name: '_gid',
            duration: 1,
            unit: 'days',
            purpose: {
                enUS: 'Distinguish unique users',
                deDE: 'Unterscheidet eindeutige Benutzer'
            }
        },
        {
            name: '_gat',
            duration: 1,
            unit: 'days',
            purpose: {
                enUS: 'Throttle request rate',
                deDE: 'Begrenzt die Anfragerate'
            }
        },
        {
            name: '_ga_*',
            duration: 2,
            unit: 'years',
            purpose: {
                enUS: 'Store and count pageviews',
                deDE: 'Speichert und zählt Seitenaufrufe'
            }
        },
        {
            name: 'NID',
            duration: 6,
            unit: 'months',
            purpose: {
                enUS: 'Storage of user preferences and management of user sessions',
                deDE: 'Speicherung von Benutzerpräferenzen und Verwaltung von Benutzersitzungen'
            }
        },
        {
            name: '1P_JAR',
            duration: 1,
            unit: 'months',
            purpose: 'Collection of website statistics and tracking of conversion rates'
        },
        {
            name: 'SID',
            duration: 2,
            unit: 'years',
            purpose: 'Authentication of users and prevention of fraudulent login credentials'
        },
        {
            name: 'HSID',
            duration: 2,
            unit: 'years',
            purpose: 'Authentication of users and prevention of fraudulent login credentials'
        },
        {
            name: 'SSID',
            duration: 2,
            unit: 'years',
            purpose: 'Security measures for authentication and fraud prevention'
        },
        {
            name: 'APISID',
            duration: 2,
            unit: 'years',
            purpose: 'Security measures for authentication and fraud prevention'
        },
        {
            name: 'SAPISID',
            duration: 2,
            unit: 'years',
            purpose: 'Security measures for authentication and fraud prevention'
        },
        {
            name: 'SIDCC',
            duration: 1,
            unit: 'years',
            purpose: 'Security cookie to protect user data'
        },
        {
            name: 'OGPC',
            duration: 2,
            unit: 'months',
            purpose: 'Storage of user preferences and information on the use of Google services'
        },
        {
            name: 'OGP',
            duration: 2,
            unit: 'months',
            purpose: 'Storage of user preferences and information on the use of Google services'
        }
    ]
}

export const config = {
    cookiePolicyLink: 'https://example.com/cookie-policy',
    websiteName: 'Example Website',
    providers: [WebsiteCookieProvider, TrackingCookieProvider, PreferencesCookieProvider, FunctionalCookieProvider, GoogleCookieProvider],
    domain: '.example.com'
}
