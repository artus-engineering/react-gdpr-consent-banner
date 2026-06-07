import type { CookieConsentStyle } from '../../../../src/types'

export type Dictionary = {
    meta: {
        siteTitle: string
        siteDescription: string
        privacyTitle: string
        privacyDescription: string
    }
    header: {
        languageLabel: string
    }
    footer: {
        legalNav: string
        privacy: string
        imprint: string
        license: string
        contact: string
    }
    licenseNotice: {
        textBefore: string
        licenseName: string
        textMiddle: string
        contactLabel: string
        textAfter: string
    }
    home: {
        heroTitle: string
        heroSubtitle: string
        openCookieSettings: string
        themeCard: {
            title: string
            description: string
            presetThemes: string
            fineTuneColors: string
            livePreview: string
            testRealComponent: string
            preview: {
                title: string
                body: string
                learnMore: string
                details: string
                essentialOnly: string
                acceptAll: string
            }
        }
        colorLabels: Record<keyof CookieConsentStyle, string>
        presetLabels: Record<string, string>
        consentGate: {
            title: string
            description: string
            demoContext: string
            functionalCategory: string
            liveDemo: string
            paymentPossible: string
            paymentDescription: string
        }
        features: {
            gdpr: { title: string; description: string }
            integration: { title: string; description: string }
            multilingual: { title: string; description: string }
            customizable: { title: string; description: string }
            gates: { title: string; description: string }
            granular: { title: string; description: string }
        }
        gettingStarted: {
            title: string
            description: string
            steps: Array<{ title: string; description: string }>
        }
        websiteName: string
    }
    privacy: {
        title: string
        sections: Array<{
            title: string
            subsections?: Array<{
                title?: string
                paragraphs: string[]
                listItems?: string[]
            }>
            paragraphs?: string[]
        }>
        cookieSettingsLink: string
        homeLink: string
        backToDemo: string
        updatedAt: string
        githubPrivacyLabel: string
        contactPageLabel: string
    }
}
