<div align="center">
  <img alt="Artus Engineering" src="assets/Artus-Engineering-Logos_artus-logo-groß-wort-und-bildmarke-zweizeilig-violet.svg" width="400" />
</div>

<p align="center">
  A <a href="https://react.dev" target="_blank">React</a> library for GDPR-compliant cookie consent banners with theming, consent gates, and declarative tool integrations with Google Consent Mode v2.
</p>

<div align="center">
  <a href="https://www.npmjs.com/package/@artus-engineering/react-gdpr-cookie-consent"><img alt="NPM Version" src="https://img.shields.io/npm/v/%40artus-engineering%2Freact-gdpr-cookie-consent"></a>
  <a href="https://github.com/artus-engineering/react-gdpr-consent-banner/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/badge/License-PolyForm%20Noncommercial%201.0.0-8b5cf6"></a>
  <a href="https://github.com/artus-engineering/react-gdpr-consent-banner/actions/workflows/branch.yaml"><img alt="CI Status" src="https://img.shields.io/github/actions/workflow/status/artus-engineering/react-gdpr-consent-banner/.github%2Fworkflows%2Fbranch.yaml?label=CI&logo=GitHub"></a>
  <a href="https://sonar.artus-engineering.de/dashboard?id=artus-engineering_react-gdpr-consent-banner_77b80343-758e-46a6-aaa4-a2f681f7d05d"><img alt="SonarQube Quality Gate" src="https://sonar.artus-engineering.de/api/project_badges/measure?project=artus-engineering_react-gdpr-consent-banner_77b80343-758e-46a6-aaa4-a2f681f7d05d&amp;metric=alert_status&amp;token=sqb_88234c043e5593851d73ec5aa1c1e6e0a41d0d17"></a>
  <a href="https://artus-engineering.github.io/react-gdpr-consent-banner/"><img alt="Live demo" src="https://img.shields.io/badge/demo-live-0ea5e9?logo=next.js&logoColor=white"></a>
</div>

<hr />

## Table of Contents <!-- omit in toc -->

- [Features](#features)
- [License](#license)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Consent storage & re-consent](#consent-storage--re-consent)
- [Components](#components)
- [Integrations](#integrations)
- [Hooks](#hooks)
- [WordPress Plugin](#wordpress-plugin)
- [Development](#development)
- [Releases](#releases)

## Features

- **Drop-in banner** — Add a full cookie consent UI with `CookieConsentProvider`
- **Strict loading** — No third-party script is injected before the visitor consents; Google Consent Mode v2 defaults to denied
- **Declarative integrations** — JSON-serializable descriptors for Google Tag Manager, GA4, Google Ads, Meta Pixel, and custom scripts
- **Privacy-minimal consent cookie** — One first-party cookie without any user id; rejection is stored too, so visitors are not re-asked
- **Re-consent on material change** — A purposes hash ties consent to the provider set; only material changes re-prompt
- **Consent gates** — Block embedded third-party content until the matching provider is accepted
- **Theming** — Customize colors and typography to match your brand
- **i18n** — Built-in German and English copy with extensible provider descriptions
- **Full TypeScript support** — Complete type definitions for configuration and integrations
- **React 19 compatible** — Built for modern React applications

## License

This software is licensed under the [PolyForm Noncommercial License 1.0.0](LICENSE). You may use, modify, and distribute it for **noncommercial purposes**.

**Commercial use** (client projects, SaaS, paid products, and similar) requires a separate license. See [COMMERCIAL-LICENSE.md](COMMERCIAL-LICENSE.md).

## Installation

```bash
# npm
npm install @artus-engineering/react-gdpr-cookie-consent

# pnpm
pnpm add @artus-engineering/react-gdpr-cookie-consent

# yarn
yarn add @artus-engineering/react-gdpr-cookie-consent
```

**Requirements:** React 19.0.0 or higher

## Quick Start

Wrap your application with `CookieConsentProvider` and configure your cookie providers:

```tsx
import { CookieConsentProvider } from "@artus-engineering/react-gdpr-cookie-consent";

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
  integrations: [
    {
      id: "int_ga4",
      type: "ga4",
      providerId: "google-analytics",
      params: { measurementId: "G-XXXXXXXXXX" },
    },
  ],
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
| `domain` | `string` | Primary domain of the website |
| `cookieDomain` | `string?` | Cookie `Domain=` attribute for subdomain-wide consent (e.g. `.example.com`) |
| `cookieName` | `string?` | Name of the consent cookie (default: `artus_consent`) |
| `purposesHash` | `string?` | Hex hash identifying the material configuration; a mismatch with the stored cookie triggers re-consent. Without it, a local fingerprint over provider ids and categories is used |
| `integrations` | `IntegrationDescriptor[]?` | Declarative tool integrations, injected only after consent |
| `cookiePolicyLink` | `string` | Link to your privacy / cookie policy |
| `lang` | `SupportedLanguage` | Banner locale (`enUS`, `deDE`) |
| `theme` | `CookieConsentStyle` | Optional color overrides |
| `labels` | `PartialCookieConsentLabels?` | Partial overrides of any banner copy |
| `consentHooks` | `ConsentHook[]?` | **Deprecated** — use `integrations`; removed in 3.0 |
| `crossSubDomainConsent` | `string[]?` | **Deprecated** — display-only; use `cookieDomain` |
| `cookiesValidForDays` | `number?` | **Deprecated** — the v2 cookie has a fixed max age (400 days) and is renewed on every visit |

Set `includeCookieBanner={false}` on the provider if you only need context and hooks without rendering the banner.

## Consent storage & re-consent

Consent is stored in **one first-party cookie** (`artus_consent`) that contains only the decision per
non-essential provider, plus a short purposes-hash prefix identifying the configuration the consent
refers to — no user id, no timestamp, no fingerprint. A cookie is also written on rejection, so
returning visitors are not asked again.

```json
{ "v": 2, "ph": "9f2b4c11d8a0e5f6", "d": { "gtm": 1, "ga4": 1, "meta": 0 } }
```

Consent does not expire. The cookie is written with a 400-day max age (the Chrome cap) and renewed on
every visit. The banner re-prompts only when the **material** configuration changes (providers
added/removed or categories changed — reflected in `purposesHash`); previous grants are then treated
as absent until the visitor decides again (fail-closed). Cosmetic changes (texts, theme) never
re-prompt.

Existing v1 per-provider cookies (`{id}_consent`) are migrated automatically on first load and
removed afterwards.

## Components

| Component | Description |
| --- | --- |
| `CookieConsentProvider` | Root provider; manages consent state, hooks, and optional banner |
| `CookieConsentBanner` | Standalone banner (usually rendered by the provider) |
| `CookieConsentGate` | Blocks content until consent is granted for a given provider |
| `CookiePolicy` | Renders a cookie policy table from configured providers |

### Consent gate example

```tsx
import {
  CookieConsentGate,
  useCookieProviders,
} from "@artus-engineering/react-gdpr-cookie-consent";

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

## Integrations

Integrations are plain JSON descriptors. Scripts are injected **only after** the matching provider
has been granted (strict loading); for Google tools, Consent Mode v2 defaults are pushed as `denied`
before anything loads and updated from the visitor's category decisions. On revocation, the cookies
declared for the provider (wildcards like `_ga_*` supported) are deleted.

| Type | Params | Integrates |
| --- | --- | --- |
| `gtm` | `containerId` | Google Tag Manager |
| `ga4` | `measurementId`, `anonymizeIp?` | Google Analytics 4 |
| `google-ads` | `conversionId` | Google Ads conversion tracking |
| `meta-pixel` | `pixelId` | Meta Pixel |
| `custom-script` | `src` (https only), `attrs?` | Any third-party script |

```tsx
const config = {
  // …other config
  integrations: [
    { id: "int_gtm", type: "gtm", providerId: "gtm", params: { containerId: "GTM-XXXXXXX" } },
    { id: "int_meta", type: "meta-pixel", providerId: "meta", params: { pixelId: "1234567890" } },
  ],
};
```

### Headless entry point

Non-React consumers — script loaders, WordPress bridges, edge workers — import from
`@artus_engineering/react-gdpr-cookie-consent/headless`, which exposes the consent cookie logic
(`getConsentStatus`, `readConsentCookie`, `writeConsentCookie`, `refreshConsentCookie`,
`resolveConsentCookieName`, `resolvePurposesHashPrefix`), the `ConsentStore` and the
`IntegrationRegistry` without pulling React into the bundle. The main entry cannot be tree-shaken
down to these: it re-exports components whose module scope calls `createContext`, which bundlers
must treat as a side effect.

```ts
import {
  getConsentStatus,
  IntegrationRegistry,
} from "@artus_engineering/react-gdpr-cookie-consent/headless";
```

The v1 `consentHooks` factories (`createGoogleAnalyticsHook`, `createGoogleTagManagerHook`,
`createFacebookPixelHook`, `createGoogleAdsHook`, `createCustomToolHook`) remain available but are
**deprecated** and will be removed in 3.0. Note that they follow the old loading model (Google
scripts load before consent with denied defaults), while `integrations` never load anything
pre-consent.

## Hooks

| Hook | Description |
| --- | --- |
| `useCookieConsentContext` | Banner open state and provider context |
| `useOpenCookieBanner` | Programmatically open the consent banner |
| `useConsentSnapshot` | Subscribe to the consent status (`none`/`partial`/`stale`/`valid`) and per-provider decisions |
| `useCookieProviders` | Access configured providers (optionally filtered) |
| `useCookieState` | Read whether a provider has consent |
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
pnpm run storybook    # local component docs
pnpm run dev          # library watch + Next.js example app (live demo: https://artus-engineering.github.io/react-gdpr-consent-banner/)
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

Packages are published to [npm](https://www.npmjs.com/package/@artus-engineering/react-gdpr-cookie-consent) when a [GitHub Release](https://github.com/artus-engineering/react-gdpr-consent-banner/releases) is published.

1. Ensure `main` is green.
2. Create a GitHub Release with a semver tag, e.g. `v1.0.5`.
3. The publish workflow runs tests, builds `dist/`, and publishes to npm via [Trusted Publishing](https://docs.npmjs.com/trusted-publishers/) (no npm token required).

The release tag (without the leading `v`) becomes the package version.

---

Maintained by [Artus Engineering GmbH](https://artus-engineering.de).
