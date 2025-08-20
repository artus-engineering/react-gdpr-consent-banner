# React GDPR Cookie Consent

A comprehensive, GDPR-compliant cookie consent banner for React applications with audit trail functionality.

## Features

- 🍪 **GDPR Compliant**: Full compliance with GDPR requirements
- 📊 **Audit Trail**: Complete logging of consent changes for compliance
- 🎨 **Customizable**: Fully customizable themes and styling
- 🌍 **Internationalized**: Multi-language support
- 🔧 **Flexible**: Easy integration with any analytics or marketing tools
- 📱 **Responsive**: Works on all device sizes
- ⚡ **Lightweight**: Minimal bundle size impact
- 🔒 **Secure**: Secure cookie handling with proper flags

## Quick Start

### Installation

```bash
npm install react-gdpr-cookie-consent
```

### Basic Usage

```tsx
import { CookieConsentProvider } from 'react-gdpr-cookie-consent'

const config = {
  cookiePolicyLink: '/privacy-policy',
  websiteName: 'My Website',
  domain: 'example.com',
  providers: [
    {
      id: 'google-analytics',
      name: 'Google Analytics',
      category: 'Analytics',
      description: 'We use Google Analytics to understand how visitors interact with our website.',
      dataProtectionLink: 'https://policies.google.com/privacy',
      cookies: [
        {
          name: '_ga',
          duration: 2,
          unit: 'years',
          purpose: 'Used to distinguish users'
        }
      ]
    }
  ]
}

function App() {
  return (
    <CookieConsentProvider config={config}>
      <YourApp />
    </CookieConsentProvider>
  )
}
```

## GDPR Audit Trail

The library includes built-in audit trail functionality for GDPR compliance:

### Configuration

```tsx
const config = {
  // ... other config
  audit: {
    url: '/api/gdpr/audit',
    userId: getUserId(), // Function to get user ID
    additionalData: {
      source: 'my-app',
      version: '1.0.0'
    }
  }
}
```

### Audit Events

The system automatically logs:
- **Accept**: When user accepts all cookies
- **Reject**: When user rejects non-essential cookies  
- **Change**: When user modifies specific consent settings

### Audit Data Structure

```typescript
interface ConsentAuditEvent {
  userId: string
  timestamp: string
  action: 'accept' | 'reject' | 'change'
  category: CookieCategory
  previousState?: Record<CookieCategory, boolean>
  currentState: Record<CookieCategory, boolean>
  userAgent: string
  ipAddress?: string
  sessionId?: string
  additionalData?: Record<string, any>
}
```

## Next.js Example

See the complete Next.js example in `example/nextjs-example/` which includes:

- **Middleware**: User ID generation (strictly necessary)
- **API Endpoint**: PostgreSQL storage for audit logs
- **Database Schema**: Optimized for audit trail queries
- **Full Integration**: Complete working example

### Setup Next.js Example

```bash
cd example/nextjs-example
npm install
cp env.example .env.local
# Edit .env.local with your database URL
npm run db:init
npm run dev
```

## Configuration

### Basic Configuration

```typescript
interface CookieConsentBannerConfig {
  cookiePolicyLink: string
  websiteName: string
  providers: CookieProviderConfig[]
  domain: string
  crossSubDomainConsent?: string[]
  cookiesValidForDays?: number
  lang?: 'deDE' | 'enUS'
  labels?: CookieConsentLabels
  theme?: CookieConsentStyle
  consentHooks?: ConsentHook[]
  audit?: AuditConfig
}
```

### Audit Configuration

```typescript
interface AuditConfig {
  url: string
  userId: string
  additionalData?: Record<string, any>
}
```

## Consent Hooks

Integrate with analytics and marketing tools using consent hooks:

```tsx
import { createGoogleAnalyticsHook } from 'react-gdpr-cookie-consent'

const config = {
  // ... other config
  consentHooks: createGoogleAnalyticsHook('GA_MEASUREMENT_ID', {
    anonymizeIp: true,
    cookieFlags: 'SameSite=Strict;Secure'
  })
}
```

## Styling

Customize the appearance with themes:

```tsx
const config = {
  // ... other config
  theme: {
    bgPrimary: '#1f2937',
    bgSecondary: '#374151',
    textPrimary: '#ffffff',
    textSecondary: '#d1d5db',
    primaryColor: '#3b82f6',
    buttonText: '#ffffff'
  }
}
```

## GDPR Compliance Features

- ✅ **Strictly Necessary**: User ID generation for audit trail
- ✅ **Consent Categories**: Analytics and Marketing
- ✅ **Audit Trail**: Complete record of consent changes
- ✅ **Data Minimization**: Only essential data collected
- ✅ **Transparency**: Clear consent options and audit logs
- ✅ **User Rights**: Easy consent withdrawal and modification
- ✅ **Cookie Management**: Automatic cookie cleanup on rejection

## License

MIT License - see LICENSE file for details.
