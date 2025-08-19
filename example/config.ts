import { CookieProvider } from '../src'

export const WebsiteCookieProvider: CookieProvider = {
    name: 'Some Website',
    id: 'website',
    category: 'StrictlyNecessary',
    description: 'We use session cookies to store your session on our website. This cookie is necessary to use the website.',
    dataProtectionLink: 'https://example.com/privacy',
    cookies: [
        {
            name: 'tebuto_app_session',
            duration: 7,
            unit: 'days',
            purpose: 'Store the session'
        },
        {
            name: 'logged_in',
            duration: 7,
            unit: 'days',
            purpose: 'Store the login status'
        }
    ]
}

export const TrackingCookieProvider: CookieProvider = {
    name: 'Some Tracking Service',
    id: 'tracking',
    category: 'Statistics',
    description: 'We use Some Tracking Service to collect anonymous statistics about the use of our website. This helps us to improve the website.',
    dataProtectionLink: 'https://example.com/privacy',
    cookies: [
        {
            name: '_pk_id',
            duration: 7,
            unit: 'days',
            purpose: 'Identifies returning visitors'
        },
        {
            name: '_pk_ses',
            duration: 7,
            unit: 'days',
            purpose: 'Stores the session of a visitor'
        }
    ]
}

export const GoogleCookieProvider: CookieProvider = {
    name: 'Google',
    id: 'google',
    category: 'Functional',
    description: 'We offer, among other things, Google as a provider for logging into our website. If you want to use Google Login, you must agree to this cookie.',
    dataProtectionLink: 'https://policies.google.com/privacy',
    cookies: [
        {
            name: 'NID',
            duration: 6,
            unit: 'months',
            purpose: 'Storage of user preferences and management of user sessions'
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
