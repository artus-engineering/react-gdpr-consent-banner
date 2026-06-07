import type { Dictionary } from './types'

export const en: Dictionary = {
    meta: {
        siteTitle: 'Cookie Consent Demo | Artus Engineering',
        siteDescription:
            'Interactive demo of the Artus Engineering GDPR cookie consent library with theme customization and consent gates.',
        privacyTitle: 'Privacy Policy | Cookie Consent Demo',
        privacyDescription:
            'Privacy policy for the public demo website of the Artus Engineering cookie consent library.'
    },
    header: {
        languageLabel: 'Language'
    },
    footer: {
        legalNav: 'Legal',
        privacy: 'Privacy',
        imprint: 'Imprint',
        license: 'License',
        contact: 'Contact'
    },
    licenseNotice: {
        textBefore: 'This demo and the underlying library are licensed under the',
        licenseName: 'PolyForm Noncommercial License 1.0.0',
        textMiddle:
            '. Noncommercial use is permitted. Commercial use requires a separate license. For questions or license and usage requests, contact',
        contactLabel: 'Artus Engineering',
        textAfter: '.'
    },
    home: {
        heroTitle: 'GDPR-compliant cookie consent',
        heroSubtitle:
            'A well-designed cookie banner with full customization, consent gates, and an optional audit trail for all consent changes.',
        openCookieSettings: 'Open cookie settings',
        themeCard: {
            title: 'Customize theme',
            description: 'Adjust the appearance of the cookie banner and see your changes in the live preview.',
            presetThemes: 'Preset themes',
            fineTuneColors: 'Fine-tune colors',
            livePreview: 'Live preview',
            testRealComponent: 'Test with the real component',
            preview: {
                title: 'We value your privacy',
                body: 'We use cookies to improve your experience on our website.',
                learnMore: 'Learn more',
                details: 'Details',
                essentialOnly: 'Essential only',
                acceptAll: 'Accept all'
            }
        },
        colorLabels: {
            bgPrimary: 'Background',
            bgSecondary: 'Secondary background',
            textPrimary: 'Primary text',
            textSecondary: 'Secondary text',
            primaryColor: 'Accent color',
            buttonText: 'Button text'
        },
        presetLabels: {
            light: 'Light',
            dark: 'Dark',
            neutral: 'Neutral',
            warm: 'Warm'
        },
        consentGate: {
            title: 'Consent gate',
            description:
                'protects embedded third-party content (e.g. payments, maps, widgets) until the matching cookie consent is given.',
            demoContext:
                'In this demo, Stripe is configured as a Functional provider. Embedded content only becomes visible after consent.',
            functionalCategory: 'Functional',
            liveDemo: 'Live demo',
            paymentPossible: 'Payment available',
            paymentDescription:
                'Functional cookies for Stripe are allowed. An embedded checkout or payment form would load here.'
        },
        features: {
            gdpr: {
                title: 'GDPR compliant',
                description:
                    'Aligned with GDPR, CCPA, and other privacy regulations. All consent changes can be tracked via an audit trail.'
            },
            integration: {
                title: 'Easy integration',
                description:
                    'Simple configuration with built-in hooks for Google Analytics, PostHog, Matomo, and more. Add your IDs and go.'
            },
            multilingual: {
                title: 'Multilingual',
                description:
                    'German and English copy is included out of the box. The i18n system makes it easy to add more languages.'
            },
            customizable: {
                title: 'Fully customizable',
                description: 'Full control over colors, typography, and layout so the banner matches your brand.'
            },
            gates: {
                title: 'Consent gates',
                description:
                    'Hides content until consent is given. Ideal for embedded videos, maps, and third-party widgets.'
            },
            granular: {
                title: 'Granular consent',
                description: 'Choose categories individually: Essential, Functional, Analytics, and Marketing.'
            }
        },
        gettingStarted: {
            title: 'Getting started',
            description: 'How to integrate and customize the cookie banner',
            steps: [
                {
                    title: 'Customize your theme',
                    description: 'Use the color pickers above to style the banner. The preview updates instantly.'
                },
                {
                    title: 'Configure providers',
                    description: 'Add your cookie providers with descriptions, privacy links, and cookie details.'
                },
                {
                    title: 'Test the banner',
                    description: 'Click "Open cookie settings" to see the full banner with all options.'
                }
            ]
        },
        websiteName: 'Cookie Consent Demo'
    },
    privacy: {
        title: 'Privacy Policy',
        sections: [
            {
                title: '1. Privacy at a glance',
                subsections: [
                    {
                        title: 'General information',
                        paragraphs: [
                            'The following notes provide a brief overview of what happens to your personal data when you visit this website. Personal data is any data that can be used to identify you personally.',
                            'This privacy policy applies to the public demo website at react-gdpr-consent-banner.artus-engineering.de. It is an interactive preview of the Artus Engineering cookie consent library, not a production customer portal.'
                        ]
                    }
                ]
            },
            {
                title: '2. Data controller',
                paragraphs: [
                    'The data controller responsible for processing on this website is:',
                    'Artus Engineering GmbH, Wilhelmstraße 18, 76344 Eggenstein-Leopoldshafen, Germany, Phone: +49 721 4671 2023, Email: hi@artus-engineering.de',
                    'The data controller is the natural or legal person who alone or jointly with others determines the purposes and means of processing personal data.'
                ]
            },
            {
                title: '3. Hosting and infrastructure',
                paragraphs: [
                    'This demo website is hosted on GitHub Pages. The provider is GitHub Inc., 88 Colin P. Kelly Jr. St, San Francisco, CA 94107, USA ("GitHub").',
                    'When you visit the website, GitHub may have access to technical data within its area of responsibility, in particular server log files, where this is necessary to provide and secure the service. Processing ensures smooth operation as well as system security and stability.',
                    "Data transfers to the USA are based on the EU Commission Standard Contractual Clauses. Further information is available in GitHub's privacy statement."
                ]
            },
            {
                title: '4. Data collection on this website',
                subsections: [
                    {
                        title: 'Purpose and content of the demo',
                        paragraphs: [
                            'The website is used solely to demonstrate GDPR-compliant cookie consent, theme customization, and consent gates. No user accounts are created, no contact form is operated, and no orders or payments are processed. Third-party providers mentioned in the banner (e.g. Stripe, Google Analytics) are examples only. No real tracking or payment services are integrated.',
                            'On the public demo, consent events are not sent to a server and no database is used. We do not profile users or analyze your behavior.'
                        ]
                    },
                    {
                        title: 'Server log files',
                        paragraphs: [
                            'When you access this website, the hosting provider automatically collects and stores information in server log files transmitted by your browser. This may include:'
                        ],
                        listItems: [
                            'Browser type and version',
                            'Operating system used',
                            'Referrer URL',
                            'Hostname of the accessing device',
                            'Time of the server request',
                            'IP address'
                        ]
                    },
                    {
                        paragraphs: [
                            'Processing ensures smooth operation as well as system security and stability (Art. 6(1)(f) GDPR). We do not combine this data with other sources for advertising purposes.'
                        ]
                    },
                    {
                        title: 'Cookies and consent demo',
                        paragraphs: [
                            'When you interact with the cookie banner, we store only your consent choices in browser cookies, for example whether the notice was already shown and which example categories you accepted. These cookies serve only the demo functionality.',
                            'The legal basis is your consent under Art. 6(1)(a) GDPR when you make a choice. Storing your banner decision may also rely on Art. 6(1)(f) GDPR (legitimate interest in a working demo).',
                            'You can change your choice at any time via "Open cookie settings" on the home page or by deleting cookies in your browser.'
                        ]
                    }
                ]
            },
            {
                title: '5. Your rights',
                paragraphs: [
                    'Where the legal requirements are met, you have the right to access, rectify, erase, or restrict processing of your personal data, and to data portability. You also have the right to lodge a complaint with a data protection supervisory authority.',
                    'To exercise your rights or if you have privacy questions, contact us using the controller details above or via artus-engineering.de/kontakt.'
                ]
            },
            {
                title: '6. SSL/TLS encryption',
                paragraphs: [
                    'This site uses SSL/TLS encryption for security and to protect confidential content during transmission. You can recognize an encrypted connection by the browser address changing from "http://" to "https://" and by the lock icon in the browser bar.'
                ]
            }
        ],
        cookieSettingsLink: 'Open cookie settings',
        homeLink: 'Home page',
        backToDemo: '← Back to demo',
        updatedAt: 'Last updated: 7 June 2026',
        githubPrivacyLabel: 'GitHub privacy statement',
        contactPageLabel: 'artus-engineering.de/kontakt'
    }
}
