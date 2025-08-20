[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=artus-engineering_react-gdpr-consent-banner&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=artus-engineering_react-gdpr-consent-banner)
[![Tests](https://github.com/artus-engineering/react-gdpr-consent-banner/actions/workflows/branch.yaml/badge.svg)](https://github.com/artus-engineering/react-gdpr-consent-banner/actions/workflows/branch.yaml)

**Disclaimer**: This library is currently in development and does not yet provide a stable and full feature set.

<p align="center">A flexible cookie consent solution for <a href="https://react.dev" target="_blank">React</a> - built to comply with the GDPR, the ePrivacy Directive, and the CCPA<p align="center">

<hr />

Building a GDPR compliant website is a real challenge with the available tools and libraries. Few to none implement compliance with the GDPR, the ePrivacy Directive, and the CCPA. 

This library is a simple and lightweight solution to comply with the GDPR, the ePrivacy Directive, and the CCPA. However, you use this library at your **own risk**, and you should always consult a lawyer to understand the legal implications of the GDPR, the ePrivacy Directive, and the CCPA. This library is **not a substitute for legal advice** and should not be considered as such. We are not responsible for any damages or legal issues caused by the use of this library.

## Table of Contents <!-- omit in toc -->

- [Features](#features)
- [Installing](#installing)
- [Getting Started](#getting-started)
    - [Use Consent Gates](#use-consent-gates)
    - [Generate Cookie Specification](#generate-cookie-specification)
- [Google Consent Mode v2 Integration](#google-consent-mode-v2-integration)
    - [Quick Start with Google Services](#quick-start-with-google-services)
    - [Custom Google Consent Configuration](#custom-google-consent-configuration)
    - [Advanced Google Integration](#advanced-google-integration)
- [Configuration](#configuration)
  - [Cookie Providers](#cookie-providers)
  - [Cookie Classifications](#cookie-classifications)
  - [Components](#components)
  - [Hooks](#hooks)
- [Contributing](#contributing)
- [License](#license)

## Features

* Deferred loading of code until the user has given consent
* Customizable
* Multilanguage support (german and english so far, help welcome)
* Internationalization (i18n) for cookie descriptions and purposes  
* Native German and English support for all UI elements
* Themes
* Hooks to create your own components
* Auto-generate your Cookie-Policy or use Hooks to create your own
* Track which services are allowed by the user
* Require consent for loading specific nodes in your app (Consent Gate)


## Installing

This is a [Node.js](https://nodejs.org/en/) module available via
[GitHub Packages](https://github.com/artus-engineering/gdpr-cookie-consent/pkgs/npm/react-gdpr-cookie-consent).

First, make sure to be logged in to the GitHub Packages npm registry. To authenticate, run this command and login via username and (classic) personal access token with `packages:read` scope.

```bash
npm login --registry=https://npm.pkg.github.com
```

Installation is done using the`npm install` command:

``` bash
npm install @artus-engineering/react-gdpr-cookie-consent
```

## Getting Started

First, create the configurations for the cookies you set on your website. It makes sense to define them in your app config or a separate file, so that they can be used everywhere in your application (e.g. for [Consent Gates](#use-consent-gates)).

You can find more information about the cookie options in the [configuration](#configuration) section.

```ts
// cookies.ts

import { CookieProviderConfig } from '@artus-engineering/react-gdpr-cookie-consent'

export const YourWebsiteCookieProviderConfig: CookieProviderConfig = {
    id: 'your-website',
    name: 'YourWebsite',
    category: 'Essential',
    description: 'We use session cookies for the login on our website.',
    dataProtectionLink: 'https://example.com/datenschutzerklaerung',
    cookies: [
        {
            name: 'session_cookie',
            duration: 7,
            unit: 'days',
            purpose: 'Stores the session'
        }
    ]
}

// Example with internationalization (i18n) support and service provider
export const MultilingualCookieProviderConfig: CookieProviderConfig = {
    id: 'multilingual-example',
    name: 'Multilingual Service',
    category: 'Analytics',
    serviceProvider: 'AnalyticsCorp',
    description: {
        enUS: 'We use analytics cookies to understand how visitors interact with our website.',
        deDE: 'Wir verwenden Analytik-Cookies, um zu verstehen, wie Besucher mit unserer Website interagieren.'
    },
    dataProtectionLink: 'https://example.com/privacy',
    cookies: [
        {
            name: 'analytics_session',
            duration: 1,
            unit: 'days',
            purpose: {
                enUS: 'Track user sessions for analytics',
                deDE: 'Verfolgt Benutzersitzungen für die Analytik'
            }
        }
    ]
}

export const GoogleCookieProviderConfig: CookieProviderConfig = {
    id: 'google',
    name: 'Google Analytics & Ads',
    category: 'Analytics',
    serviceProvider: 'Google',
    description:
        'We offer Google as social login provider on our website. If you want to use Google for logging in, you need to consent to these cookies.',
    dataProtectionLink: 'https://policies.google.com/privacy',
    cookies: [
        {
            name: 'SID',
            duration: 2,
            unit: 'years',
            purpose: 'Authenticate users and prevent fraudulent credentials'
        },
        // ...
    ]
}
```

Now add the `CookieConsentProvider` component to integrate the cookie consent in your application. It is supposed to be in your layout so that it wraps the whole content of your website. Then you can interact with the cookie consent from everywhere in your application.

```tsx
// layout.tsx

import React from 'react'
import { CookieConsentProvider, CookieConsentBannerConfig } from '@artus-engineering/react-gdpr-cookie-consent'
import { YourWebsiteCookieConfig, GoogleCookieConfig } from 'cookies.ts'

export default function Layout({children}: {children: React.ReactNode}): JSX.Element {
    const config: CookieConsentBannerConfig = {
        lang: 'enUS',
        websiteName: 'Your Website',
        cookiePolicyLink: '/privacy#cookie-policy',
        domain: 'yourdomain',
        providers: [YourWebsiteCookieConfig, GoogleCookieConfig]
    }

    return (
        <CookieConsentProvider config={config}>
            {/* ... */}
            {children}
            {/* ... */}
        </CookieConsentProvider>
    )
}
```

#### Use Consent Gates

If you use cookies the users have to consent to explicitly, it makes sense to only load them when consent is given. This can be done with the `ConsentGate`.

```tsx
// ComponentWithConsentRequired.tsx

import { ComponentWithConsentRequired } from '@artus-engineering/react-gdpr-cookie-consent'
import { GoogleCookieConfig } from 'cookies.ts'

export default function ComponentWithConsentRequired(): JSX.Element {
    return (
        <ConsentGate cookieProvider={GoogleCookieConfig}>
            {/* Load some Google service */}
        </ConsentGate>
    )
}
```

The content within the consent gate will only be rendered when the consent to the configured cookie is given. Otherwise it will show a message with the option to consent to this cookie.

#### Generate Cookie Specification

Probably you want to have a detailed list of your cookies in the privacy policy. You can use the `CookiePolicy` component to generate the specification from your cookie configuration of the `CookieConsentProvider`.

```tsx
// PrivacyPolicy.tsx

import { CookiePolicy } from '@artus-engineering/react-gdpr-cookie-consent'

export default function PrivacyPolicy(): JSX.Element {
    return (
        <div>
            <h1>Privacy Policy</h1>
            
            {/* ... */}
            
            <h3>Overview of used cookies</h3>
            <p>Our website uses cookies...</p>
            <CookiePolicy />

            {/* ... */}
        </div>
    )
}
```

## Google Consent Mode v2 Integration

This library provides seamless integration with Google Consent Mode v2 through our modern **Consent Hooks** system. This allows you to easily integrate Google Analytics, Google Ads, and other Google services while maintaining GDPR compliance.

### Quick Start with Google Services

Google Consent Mode v2 requires **granular consent** for different data uses. The same Google service may collect data for both analytics and marketing purposes, and users should control each use case separately.

```tsx
import React from 'react'
import { 
    CookieConsentProvider, 
    CookieConsentBannerConfig,
    createCustomToolHook,
    ConsentHook
} from '@artus-engineering/react-gdpr-cookie-consent'

// Google Analytics with granular consent control
const googleAnalyticsHooks: ConsentHook[] = [
    {
        id: 'google-analytics-load',
        category: 'Essential',
        type: 'onLoad',
        description: 'Initialize Google Analytics script',
        execute: async (context) => {
            // Initialize gtag and set default denied state
            window.dataLayer = window.dataLayer || []
            window.gtag = function gtag() { window.dataLayer.push(arguments) }

            // Load GA4 script
            const script = document.createElement('script')
            script.async = true
            script.src = `https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID`
            document.head.appendChild(script)

            // Set default consent (all denied initially)
            window.gtag('consent', 'default', {
                ad_storage: 'denied',
                analytics_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                functionality_storage: 'denied',
                personalization_storage: 'denied',
                security_storage: 'granted',
                wait_for_update: 500
            })

            // Configure GA4 with measurement only (no marketing features)
            window.gtag('config', 'GA_MEASUREMENT_ID', {
                anonymize_ip: true,
                allow_google_signals: false, // Disable until marketing consent
                allow_ad_personalization_signals: false // Disable until marketing consent
            })
        }
    },
    {
        id: 'google-analytics-analytics-consent',
        category: 'Analytics',
        type: 'onAccept',
        description: 'Enable analytics data collection',
        execute: async (context) => {
            window.gtag('consent', 'update', {
                analytics_storage: 'granted',
                functionality_storage: 'granted'
            })
        }
    },
    {
        id: 'google-analytics-marketing-consent',
        category: 'Marketing',
        type: 'onAccept',
        description: 'Enable marketing features in Google Analytics',
        execute: async (context) => {
            window.gtag('consent', 'update', {
                ad_storage: 'granted',
                ad_user_data: 'granted',
                ad_personalization: 'granted'
            })

            // Enable marketing features in GA4
            window.gtag('config', 'GA_MEASUREMENT_ID', {
                allow_google_signals: true,
                allow_ad_personalization_signals: true
            })
        }
    },
    {
        id: 'google-analytics-marketing-reject',
        category: 'Marketing',
        type: 'onReject',
        description: 'Disable marketing features in Google Analytics',
        execute: async (context) => {
            window.gtag('consent', 'update', {
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied'
            })

            // Disable marketing features
            window.gtag('config', 'GA_MEASUREMENT_ID', {
                allow_google_signals: false,
                allow_ad_personalization_signals: false
            })
        }
    }
]

export default function Layout({ children }: { children: React.ReactNode }) {
    const config: CookieConsentBannerConfig = {
        websiteName: 'Your Website',
        cookiePolicyLink: '/privacy#cookie-policy',
        domain: 'yourdomain.com',
        providers: [
            {
                id: 'google-analytics',
                name: 'Google Analytics',
                category: 'Analytics',
                description: 'We use Google Analytics to understand how visitors use our website. This helps us improve our services.',
                dataProtectionLink: 'https://policies.google.com/privacy',
                cookies: [
                    { name: '_ga', duration: 2, unit: 'years', purpose: 'Distinguish unique users for analytics' },
                    { name: '_gid', duration: 1, unit: 'days', purpose: 'Distinguish unique users for analytics' }
                ]
            },
            {
                id: 'google-marketing',
                name: 'Google Marketing Features',
                category: 'Marketing',
                description: 'Enhanced marketing features in Google Analytics including audience building and remarketing.',
                dataProtectionLink: 'https://policies.google.com/privacy',
                cookies: [
                    { name: '_gat', duration: 1, unit: 'days', purpose: 'Marketing and advertising optimization' }
                ]
            }
        ],
        // 🎯 Granular Consent Control - Users can choose Analytics without Marketing
        consentHooks: googleAnalyticsHooks
    }

    return (
        <CookieConsentProvider config={config}>
            {children}
        </CookieConsentProvider>
    )
}
```

### Custom Google Consent Configuration

For more control over Google Consent Mode, you can create custom hooks:

```tsx
import { 
    createCustomToolHook, 
    ConsentHook 
} from '@artus-engineering/react-gdpr-cookie-consent'

// Custom Google Analytics with specific settings
const customGoogleAnalyticsHooks = createCustomToolHook('google-analytics', 'Analytics', {
    onLoad: async (context) => {
        if (!context.consentState.Analytics) return

        // Initialize gtag with custom settings
        window.dataLayer = window.dataLayer || []
        window.gtag = function gtag() { window.dataLayer.push(arguments) }

        // Load Google Analytics script
        const script = document.createElement('script')
        script.async = true
        script.src = `https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID`
        document.head.appendChild(script)

        // Configure with custom settings
        window.gtag('config', 'GA_MEASUREMENT_ID', {
            anonymize_ip: true,
            cookie_flags: 'SameSite=Strict;Secure',
            allow_google_signals: false,
            allow_ad_personalization_signals: false
        })
    },
    onAccept: async (context) => {
        // Update consent when user accepts analytics
        if (context.gtag) {
            context.gtag('consent', 'update', {
                analytics_storage: 'granted',
                functionality_storage: 'granted'
            })
        }
    },
    onReject: async (context) => {
        // Clean up when user rejects analytics
        if (context.gtag) {
            context.gtag('consent', 'update', {
                analytics_storage: 'denied',
                functionality_storage: 'denied'
            })
        }

        // Remove Google Analytics cookies
        const gaCookies = ['_ga', '_gid', '_gat', '_ga_*']
        gaCookies.forEach(cookie => {
            context.cookies.remove(cookie)
            context.cookies.remove(cookie, { domain: `.${window.location.hostname}` })
        })
    }
})

// Use in your config
const config: CookieConsentBannerConfig = {
    // ... other config
    consentHooks: [
        ...customGoogleAnalyticsHooks
    ]
}
```

### Google Tag Manager Integration

Google Tag Manager requires special handling to properly implement consent management. Here's the recommended approach:

```tsx
import { 
    createGoogleTagManagerHook,
    CookieConsentBannerConfig 
} from '@artus-engineering/react-gdpr-cookie-consent'

export default function Layout({ children }: { children: React.ReactNode }) {
    const config: CookieConsentBannerConfig = {
        websiteName: 'Your Website',
        cookiePolicyLink: '/privacy#cookie-policy',
        domain: 'yourdomain.com',
        providers: [
            {
                id: 'google-tag-manager',
                name: 'Google Tag Manager',
                category: 'Essential',
                description: 'Manages website tags and tracking scripts based on your consent choices.',
                dataProtectionLink: 'https://policies.google.com/privacy',
                cookies: [
                    { name: 'gtm_*', duration: 1, unit: 'days', purpose: 'Tag management and consent state' }
                ]
            },
            {
                id: 'google-analytics-gtm',
                name: 'Google Analytics (via GTM)',
                category: 'Analytics',
                description: 'Website analytics through Google Tag Manager for understanding visitor behavior.',
                dataProtectionLink: 'https://policies.google.com/privacy',
                cookies: [
                    { name: '_ga', duration: 2, unit: 'years', purpose: 'Distinguish unique users for analytics' },
                    { name: '_gid', duration: 1, unit: 'days', purpose: 'Distinguish unique users for analytics' }
                ]
            },
            {
                id: 'google-ads-gtm',
                name: 'Google Ads (via GTM)',
                category: 'Marketing',
                description: 'Advertising and conversion tracking through Google Tag Manager.',
                dataProtectionLink: 'https://policies.google.com/privacy',
                cookies: [
                    { name: '_gcl_*', duration: 90, unit: 'days', purpose: 'Conversion tracking and attribution' },
                    { name: '_gat', duration: 1, unit: 'days', purpose: 'Marketing optimization' }
                ]
            }
        ],
        // 🎯 GTM with granular consent control
        consentHooks: createGoogleTagManagerHook('GTM-XXXXXXX')
    }

    return (
        <CookieConsentProvider config={config}>
            {children}
        </CookieConsentProvider>
    )
}
```

#### GTM Container Configuration

In your GTM container, create these triggers to respect consent:

**Analytics Consent Trigger:**
- Trigger Type: Custom Event
- Event Name: `analytics_consent_granted`
- Use this trigger for: GA4, Universal Analytics, etc.

**Marketing Consent Trigger:**
- Trigger Type: Custom Event  
- Event Name: `marketing_consent_granted`
- Use this trigger for: Google Ads, Facebook Pixel, etc.

**Consent Denied Triggers:**
- Event Name: `analytics_consent_denied`
- Event Name: `marketing_consent_denied`
- Use these to stop tracking and clean up

#### GTM Built-in Consent Mode

The hooks automatically push consent state to GTM's built-in consent mode:

```javascript
// This is handled automatically by the hooks
dataLayer.push({
    'event': 'gtm_consent_update',
    'consent': {
        'analytics_storage': 'granted', // or 'denied'
        'ad_storage': 'granted',        // or 'denied'
        'ad_user_data': 'granted',      // or 'denied'
        'ad_personalization': 'granted' // or 'denied'
    }
})
```

### Advanced Google Integration

For complex scenarios with multiple Google services:

```tsx
import { 
    createGoogleAnalyticsHook,
    createGoogleAdsHook,
    createCustomToolHook,
    ConsentHook 
} from '@artus-engineering/react-gdpr-cookie-consent'

// Google Tag Manager integration
const googleTagManagerHooks = createCustomToolHook('google-tag-manager', 'Analytics', {
    onLoad: async (context) => {
        if (!context.consentState.Analytics) return

        // Initialize GTM with default denied state
        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
            'gtm.start': new Date().getTime(),
            event: 'gtm.js'
        })

        // Set default consent state
        window.dataLayer.push({
            event: 'default_consent',
            consent: {
                ad_storage: 'denied',
                analytics_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                functionality_storage: 'denied',
                personalization_storage: 'denied',
                security_storage: 'granted'
            }
        })

        // Load GTM script
        const script = document.createElement('script')
        script.async = true
        script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-XXXXXXX'
        document.head.appendChild(script)
    },
    onAccept: async (context) => {
        // Update consent via GTM dataLayer
        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
            event: 'consent_update',
            consent: {
                analytics_storage: 'granted',
                functionality_storage: 'granted'
            }
        })
    },
    onReject: async (context) => {
        // Update consent to denied
        window.dataLayer = window.dataLayer || []
        window.dataLayer.push({
            event: 'consent_update',
            consent: {
                analytics_storage: 'denied',
                functionality_storage: 'denied'
            }
        })
    }
})

// Combine all Google services
const allGoogleHooks: ConsentHook[] = [
    ...createGoogleAnalyticsHook('GA_MEASUREMENT_ID'),
    ...createGoogleAdsHook('AW_CONVERSION_ID'),
    ...googleTagManagerHooks
]

const config: CookieConsentBannerConfig = {
    websiteName: 'Your Website',
    cookiePolicyLink: '/privacy#cookie-policy',
    domain: 'yourdomain.com',
    providers: [
        {
            id: 'google-services',
            name: 'Google Services',
            category: 'Analytics',
            description: 'We use Google Analytics to understand how visitors interact with our website.',
            dataProtectionLink: 'https://policies.google.com/privacy',
            cookies: [
                { name: '_ga', duration: 2, unit: 'years', purpose: 'Distinguish unique users' },
                { name: '_gid', duration: 1, unit: 'days', purpose: 'Distinguish unique users' },
                { name: '_gat', duration: 1, unit: 'days', purpose: 'Throttle request rate' }
            ]
        }
    ],
    consentHooks: allGoogleHooks
}
```

### Key Benefits

- **🎯 Granular Consent Control**: Users can accept Analytics without Marketing, or any combination
- **🚀 Proper Google Consent Mode v2**: Correctly implements consent parameters for each use case
- **🔄 Smart Script Loading**: Initializes tools with default denied state, updates dynamically
- **🧹 Automatic Cleanup**: Removes specific cookies based on withdrawn consent
- **⚙️ Multi-Purpose Tool Support**: Single tools (like GA4) can serve both Analytics and Marketing
- **📊 Transparent User Choice**: Clear separation of data collection purposes
- **🛡️ GDPR Compliant**: Ensures granular consent is properly managed and respected

### Real-World Consent Scenarios

This implementation correctly handles these common user choices:

| User Choice | Analytics Consent | Marketing Consent | Result |
|-------------|------------------|-------------------|---------|
| "Accept All" | ✅ Granted | ✅ Granted | Full GA4 + Marketing features |
| "Analytics Only" | ✅ Granted | ❌ Denied | GA4 measurement only, no remarketing |
| "Marketing Only" | ❌ Denied | ✅ Granted | Only advertising cookies, no analytics |
| "Reject All" | ❌ Denied | ❌ Denied | No tracking, essential cookies only |

### Supported Google Services

| Service | Hook Function | Categories |
|---------|---------------|------------|
| Google Analytics 4 | `createGoogleAnalyticsHook()` | Analytics + Marketing |
| Google Ads | `createGoogleAdsHook()` | Marketing |
| Google Tag Manager | `createGoogleTagManagerHook()` | Essential + Analytics + Marketing |
| Facebook Pixel | `createFacebookPixelHook()` | Marketing |

All hooks automatically handle Google Consent Mode v2 parameters (`ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`, etc.) and ensure compliance with user consent preferences.

## Configuration

### Cookie Providers

### Cookie Internationalization (i18n)

The library supports multilingual cookie descriptions and purposes. You can provide translations in multiple languages for both cookie provider descriptions and individual cookie purposes.

#### Supported Format

Instead of a simple string, you can provide an object with language keys:

```ts
{
    description: {
        enUS: 'English description',
        deDE: 'Deutsche Beschreibung'
    },
    cookies: [
        {
            name: 'cookie_name',
            duration: 1,
            unit: 'days',
            purpose: {
                enUS: 'English purpose',
                deDE: 'Deutscher Zweck'
            }
        }
    ]
}
```

#### Language Fallback

The system will:
1. Use the current language setting (`config.lang`)
2. Fall back to English (`enUS`) if current language is not available
3. Use any available language if neither current nor English are available
4. Return empty string if no translations are provided

#### Complete UI Internationalization

The library provides complete German and English translations for all UI elements:
- Cookie consent banner text
- Cookie policy descriptions
- Button labels and headings
- Cookie category names and descriptions
- Privacy policy links and text
- All user-facing messages and instructions

#### Service Provider Support

You can specify a `serviceProvider` to distinguish between the cookie service name and the actual service provider:

```typescript
{
    name: 'Google Analytics & Ads',        // Display name for the service
    serviceProvider: 'Google',             // Actual service provider for privacy policy links
    // ... other properties
}
```

This ensures privacy policy links show the correct service provider name (e.g., "Privacy Policy of Google" instead of "Privacy Policy of Google Analytics & Ads").

#### Helper Function

You can also use the `getLocalizedCookieText()` helper function in your custom components:

```ts
import { getLocalizedCookieText } from '@artus-engineering/react-gdpr-cookie-consent'

const description = getLocalizedCookieText(provider.description)
```

### Cookie Classifications

### Components

### Hooks

## Contributing

This library is open for any contribution. You can help in many ways:

* Translate to additional languages
* Design themes
* Improve Documentation
* Improve the code
* Parameterize the components to offer more customization
* Add more features

These are just a few ideas. Feel free to contribute in any way you like.

## 🧪 Testing

This library includes comprehensive tests for Google Consent Mode v2 compliance:

```bash
# Run all tests (includes Google Consent Mode v2 tests)
pnpm test

# Run only consent hooks tests (GTM integration)
pnpm test:consent-hooks

# Run tests with coverage
pnpm test:coverage

# Run tests in watch mode (for development)
pnpm test:watch
```

### Key Tests Covered:
- ✅ **GTM Initialization**: Verifies GTM loads with default DENIED consent
- ✅ **Granular Consent**: Tests individual parameter control (`analytics_storage`, `ad_storage`, `ad_user_data`, `ad_personalization`)
- ✅ **Consent Updates**: Verifies proper gtag consent API usage
- ✅ **Cookie Cleanup**: Tests cookie removal on consent withdrawal
- ✅ **Hook Manager**: Tests consent hook registration and execution
- ✅ **Consent Mode v2**: Verifies all required v2 parameters are supported

All tests verify that the implementation correctly follows [Google's Consent Mode v2 requirements](https://developers.google.com/tag-platform/security/guides/consent) and provides users with proper granular control over their data.

## License

TBD
