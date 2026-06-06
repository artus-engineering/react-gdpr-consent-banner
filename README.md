<div align="center">
  <h1>React GDPR Cookie Consent</h1>
</div>

<p align="center">
  A <a href="https://react.dev" target="_blank">React</a> library for GDPR-compliant cookie consent banners with theming, consent gates, audit trails, and pre-built integration hooks.
</p>

<div align="center">
  <a href="https://www.npmjs.com/package/@artus_engineering/react-gdpr-cookie-consent"><img alt="NPM Version" src="https://img.shields.io/npm/v/%40artus_engineering%2Freact-gdpr-cookie-consent"></a>
  <a href="https://github.com/artus-engineering/react-gdpr-consent-banner/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/npm/l/%40artus_engineering%2Freact-gdpr-cookie-consent"></a>
  <a href="https://github.com/artus-engineering/react-gdpr-consent-banner/actions/workflows/branch.yaml"><img alt="CI Status" src="https://img.shields.io/github/actions/workflow/status/artus-engineering/react-gdpr-consent-banner/.github%2Fworkflows%2Fbranch.yaml?label=CI&logo=GitHub"></a>
</div>

<hr />

## Table of Contents <!-- omit in toc -->

- [Features](#features)
- [License](#license)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Components](#components)
- [Consent Hooks](#consent-hooks)
- [Hooks](#hooks)
- [WordPress Plugin](#wordpress-plugin)
- [Development](#development)
- [Releases](#releases)

## Features

- **Drop-in banner** — Add a full cookie consent UI with `CookieConsentProvider`
- **Consent gates** — Block embedded third-party content until the matching provider is accepted
- **Pre-built integrations** — Hooks for Google Analytics, Google Ads, Google Tag Manager, and Facebook Pixel
- **Audit trail** — Optional server-side logging of consent changes
- **Theming** — Customize colors and typography to match your brand
- **i18n** — Built-in German and English copy with extensible provider descriptions
- **Full TypeScript support** — Complete type definitions for configuration and hooks
- **React 19 compatible** — Built for modern React applications

## License

This software is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE). You may use, modify, and distribute it for **noncommercial purposes**.

**Commercial use** (client projects, SaaS, paid products, and similar) requires a separate license. See [COMMERCIAL-LICENSE.md](COMMERCIAL-LICENSE.md).

## Installation

```bash
# npm
npm install @artus_engineering/react-gdpr-cookie-consent

# pnpm
pnpm add @artus_engineering/react-gdpr-cookie-consent

# yarn
yarn add @artus_engineering/react-gdpr-cookie-consent
```

**Requirements:** React 19.0.0 or higher

## Quick Start

Wrap your application with `CookieConsentProvider` and configure your cookie providers:

```tsx
import {
  CookieConsentProvider,
  createGoogleAnalyticsHook,
} from "@artus_engineering/react-gdpr-cookie-consent";

const config = {
  cookiePolicyLink: "/privacy-policy",
  websiteName: "My Website",
  domain: "example.com",
  lang: "enUS",
  providers: [
    {
      id: "google-analytics",
      name: "Google Analytics",
      category: "Analytics",
      description: {
        enUS: "We use Google Analytics to understand how visitors use our site.",
        deDE: "Wir verwenden Google Analytics, um zu verstehen, wie Besucher unsere Website nutzen.",
      },
      dataProtectionLink: "https://policies.google.com/privacy",
      serviceProvider: "Google",
      cookies: [
        {
          name: "_ga",
          duration: 2,
          unit: "years",
          purpose: {
            enUS: "Used to distinguish users",
            deDE: "Wird verwendet, um Benutzer zu unterscheiden",
          },
        },
      ],
    },
  ],
  consentHooks: createGoogleAnalyticsHook("G-XXXXXXXXXX"),
};

export function App({ children }: { children: React.ReactNode }) {
  return (
    <CookieConsentProvider config={config}>
      {children}
    </CookieConsentProvider>
  );
}
```

The provider renders the consent banner automatically. Re-open it later with `useOpenCookieBanner()`.

## Configuration

`CookieConsentProvider` accepts a `config` object of type `CookieConsentBannerConfig`:

| Option | Type | Description |
| --- | --- | --- |
| `providers` | `CookieProvider[]` | Cookie providers grouped by category (Essential, Functional, Analytics, Marketing) |
| `websiteName` | `string` | Display name shown in the banner |
| `domain` | `string` | Cookie domain for consent persistence |
| `cookiePolicyLink` | `string` | Link to your privacy / cookie policy |
| `lang` | `SupportedLanguage` | Banner locale (`enUS`, `deDE`, …) |
| `theme` | `CookieConsentStyle` | Optional color overrides |
| `consentHooks` | `ConsentHook[]` | Hooks that run on load, accept, or reject |
| `audit` | `AuditConfig` | Optional endpoint for consent change logging |
| `crossSubDomainConsent` | `string[]` | Share consent across subdomains |
| `cookiesValidForDays` | `number` | Consent cookie lifetime (default: 365) |

Set `includeCookieBanner={false}` on the provider if you only need context and hooks without rendering the banner.

## Components

| Component | Description |
| --- | --- |
| `CookieConsentProvider` | Root provider; manages consent state, hooks, and optional banner |
| `CookieConsentBanner` | Standalone banner (usually rendered by the provider) |
| `CookieConsentModal` | Detailed per-provider consent dialog |
| `CookieConsentGate` | Hides children until consent is granted for a given provider |
| `CookiePolicy` | Renders a cookie policy table from configured providers |

### Consent gate example

```tsx
import {
  CookieConsentGate,
  useCookieProviders,
} from "@artus_engineering/react-gdpr-cookie-consent";

function PaymentSection() {
  const providers = useCookieProviders();
  const stripe = providers.find((p) => p.id === "stripe");
  if (!stripe) return null;

  return (
    <CookieConsentGate cookieProvider={stripe}>
      <EmbeddedCheckout />
    </CookieConsentGate>
  );
}
```

## Consent Hooks

Pre-built hook factories wire common tools to consent events:

| Factory | Category | Integrates |
| --- | --- | --- |
| `createGoogleAnalyticsHook` | Analytics | Google Analytics 4 |
| `createGoogleAdsHook` | Marketing | Google Ads conversion tracking |
| `createGoogleTagManagerHook` | Analytics / Marketing | Google Tag Manager with Consent Mode |
| `createGranularGoogleTagManagerHook` | Analytics / Marketing | GTM with per-category consent signals |
| `createFacebookPixelHook` | Marketing | Meta Pixel |
| `createCustomToolHook` | Any | Custom onLoad / onAccept / onReject handlers |

```tsx
import {
  createGoogleTagManagerHook,
  createFacebookPixelHook,
} from "@artus_engineering/react-gdpr-cookie-consent";

const config = {
  // …other config
  consentHooks: [
    ...createGoogleTagManagerHook("GTM-XXXXXXX"),
    ...createFacebookPixelHook("1234567890"),
  ],
};
```

## Hooks

| Hook | Description |
| --- | --- |
| `useCookieConsentContext` | Banner open state and provider context |
| `useOpenCookieBanner` | Programmatically open the consent banner |
| `useCookieProviders` | Access configured providers (optionally filtered) |
| `useCookieState` | Read whether a provider/category has consent |
| `useConfig` | Read the resolved banner configuration |
| `useStyle` | Read the resolved theme styles |

## WordPress Plugin

A German-language WordPress plugin is included under `wordpress/react-gdpr-cookie-consent/`. Build a ready-to-upload zip with:

```bash
pnpm run build:wordpress
```

The artifact is written to `wordpress/react-gdpr-cookie-consent/dist/react-gdpr-cookie-consent.zip`.

## Development

Clone the repository and install dependencies:

```bash
pnpm install
pnpm run storybook    # component docs and visual baselines
pnpm run dev          # library watch + Next.js example app
```

Run the full test suite before opening a pull request:

```bash
pnpm run lint
pnpm run build
pnpm run test:all
pnpm run build-storybook
pnpm run test:visual
```

See [AGENTS.md](AGENTS.md) for contributor conventions.

## Releases

Packages are published to [npm](https://www.npmjs.com/package/@artus_engineering/react-gdpr-cookie-consent) when a [GitHub Release](https://github.com/artus-engineering/react-gdpr-consent-banner/releases) is published.

1. Ensure `main` is green.
2. Create a GitHub Release with a semver tag, e.g. `v1.0.5`.
3. The publish workflow runs tests, builds `dist/`, and publishes to npm via [Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) (no npm token required).

The release tag (without the leading `v`) becomes the package version.

---

Maintained by [Artus Engineering GmbH](https://artus-engineering.de).
