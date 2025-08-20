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
* Themes
* Hooks to create your own components
* Auto-generate your Cookie-Policy or use Hooks to create your own
* Track which services are allowed by the user
* Require consent for loading specific nodes in your app (Consent Gate)

<!-- ## What GDPR and ePrivacy Directive require 

* Consent must be freely given
* Consent must be specific
* Consent must be informed
* Consent must be unambiguous
* The user must be able to withdraw consent at any time
* The user must be able to refuse or withdraw consent without detriment
* Buttons for consent must be unticked by default (no pre-ticked checkboxes)
* Cookies may not be set until the user has given consent
* Only strictly necessary cookies may be set without consent

-->

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
    category: 'StrictlyNecessary',
    description: 'We use session cookies for the login on our website.',
    dataProtectionLink: 'https://tebuto.de/datenschutzerklaerung',
    cookies: [
        {
            name: 'session_cookie',
            duration: 7,
            unit: 'days',
            purpose: 'Stores the session'
        }
    ]
}

export const GoogleCookieProviderConfig: CookieProviderConfig = {
    id: 'google',
    name: 'Google',
    category: 'Functional',
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
import { CookieConsentProvider, CookieConsentBannerConfig } from '@tebuto/react-gdpr-cookie-consent'
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

## Configuration

### Cookie Providers

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

## License

TBD
