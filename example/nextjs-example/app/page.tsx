'use client'

import { CookieConsentProvider } from '../../src/components/consent'
import { createGoogleAnalyticsHook } from '../../src/consentHooks'
import { getUserIdFromClientCookies, generateUserId } from '../lib/userId'

export default function HomePage() {
    // Get user ID for audit trail (strictly necessary)
    const getUserId = () => {
        return getUserIdFromClientCookies() || generateUserId()
    }

    const config = {
        cookiePolicyLink: '/privacy-policy',
        websiteName: 'Example Website',
        domain: 'localhost',
        cookiesValidForDays: 365,
        lang: 'enUS' as const,
        providers: [
            {
                id: 'google-analytics',
                name: 'Google Analytics',
                category: 'Analytics' as const,
                description: 'We use Google Analytics to understand how visitors interact with our website.',
                dataProtectionLink: 'https://policies.google.com/privacy',
                cookies: [
                    {
                        name: '_ga',
                        duration: 2,
                        unit: 'years' as const,
                        purpose: 'Used to distinguish users'
                    },
                    {
                        name: '_gid',
                        duration: 1,
                        unit: 'days' as const,
                        purpose: 'Used to distinguish users'
                    }
                ]
            },
            {
                id: 'google-ads',
                name: 'Google Ads',
                category: 'Marketing' as const,
                description: 'We use Google Ads to show you relevant advertisements.',
                dataProtectionLink: 'https://policies.google.com/privacy',
                cookies: [
                    {
                        name: '_gcl_au',
                        duration: 3,
                        unit: 'months' as const,
                        purpose: 'Used for ad personalization'
                    }
                ]
            }
        ],
        // GDPR Audit Trail Configuration
        audit: {
            url: '/api/gdpr/audit',
            userId: getUserId(),
            additionalData: {
                source: 'nextjs-example',
                version: '1.0.0'
            }
        },
        // Consent Hooks for Google Analytics
        consentHooks: createGoogleAnalyticsHook('GA_MEASUREMENT_ID', {
            anonymizeIp: true,
            cookieFlags: 'SameSite=Strict;Secure'
        })
    }

    return (
        <CookieConsentProvider config={config}>
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16">
                            <div className="flex items-center">
                                <h1 className="text-xl font-semibold text-gray-900">GDPR Cookie Consent Example</h1>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="px-4 py-5 sm:p-6">
                                <h2 className="text-lg font-medium text-gray-900 mb-4">Welcome to our GDPR-compliant website</h2>

                                <div className="prose max-w-none">
                                    <p className="text-gray-600 mb-4">This example demonstrates a GDPR-compliant cookie consent system with audit trail functionality.</p>

                                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
                                        <h3 className="text-sm font-medium text-blue-800 mb-2">Features Implemented:</h3>
                                        <ul className="text-sm text-blue-700 space-y-1">
                                            <li>• GDPR-compliant cookie consent banner</li>
                                            <li>• Audit trail for all consent changes</li>
                                            <li>• User ID generation via middleware (strictly necessary)</li>
                                            <li>• PostgreSQL storage for audit logs</li>
                                            <li>• Scalable consent tracking</li>
                                        </ul>
                                    </div>

                                    <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                                        <h3 className="text-sm font-medium text-green-800 mb-2">GDPR Compliance:</h3>
                                        <ul className="text-sm text-green-700 space-y-1">
                                            <li>
                                                • <strong>Strictly Necessary:</strong> User ID generation for audit trail
                                            </li>
                                            <li>
                                                • <strong>Consent Categories:</strong> Analytics and Marketing
                                            </li>
                                            <li>
                                                • <strong>Audit Trail:</strong> Complete record of consent changes
                                            </li>
                                            <li>
                                                • <strong>Data Minimization:</strong> Only essential data collected
                                            </li>
                                            <li>
                                                • <strong>Transparency:</strong> Clear consent options and audit logs
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                                        <h3 className="text-sm font-medium text-yellow-800 mb-2">How to Test:</h3>
                                        <ol className="text-sm text-yellow-700 space-y-1">
                                            <li>1. Open browser developer tools</li>
                                            <li>2. Go to Network tab</li>
                                            <li>3. Interact with the cookie consent banner</li>
                                            <li>4. Watch for POST requests to /api/gdpr/audit</li>
                                            <li>5. Check the database for audit logs</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </CookieConsentProvider>
    )
}
