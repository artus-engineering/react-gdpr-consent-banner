import React from 'react'
import { createRoot } from 'react-dom/client'
import { CookieConsentBannerConfig, CookieConsentGate, CookieConsentProvider, CookiePolicy, SupportedLanguage } from '../src'
import DeleteAllCookiesButton from './buttons/DeleteAllCookiesButton'
import ShowAgainButton from './buttons/ShowAgainButton'
import { GoogleCookieProvider, TrackingCookieProvider, WebsiteCookieProvider } from './config'

import '../dist/esm/index.css' // only required for example, when using the package the CSS is imported automatically

const Example: React.FC<{}> = () => {
    const [language, setLanguage] = React.useState<SupportedLanguage>('deDE')

    const config: CookieConsentBannerConfig = {
        lang: language,
        websiteName: 'React Cookie Consent Banner Demo',
        cookiePolicyLink: '/privacy#cookie-policy',
        domain: 'localhost',
        providers: [WebsiteCookieProvider, TrackingCookieProvider, GoogleCookieProvider]
    }

    return (
        <React.StrictMode>
            <CookieConsentProvider config={config}>
                <div className="ngcc-tw-p-12">
                    <div className="ngcc-tw-flex ngcc-tw-justify-between ngcc-tw-w-1/2">
                        <h1 className="ngcc-tw-text-2xl ngcc-tw-font-medium">React Cookie Consent Banner Demo</h1>
                        <div>
                            <h3 className="ngcc-tw-text-lg ngcc-tw-font-medium">Select Language</h3>
                            <select
                                className="ngcc-tw-border ngcc-tw-border-gray-500 ngcc-tw-rounded-lg ngcc-tw-p-3"
                                value={language}
                                onChange={e => setLanguage(e.currentTarget.value as SupportedLanguage)}
                            >
                                <option value="deDE">Deutsch</option>
                                <option value="enUS">English</option>
                            </select>
                        </div>
                    </div>
                    <div className="ngcc-tw-mt-12 ngcc-tw-grid ngcc-tw-grid-cols-2 ngcc-tw-gap-8">
                        <div className="ngcc-tw-grid ngcc-tw-gap-6 ngcc-tw-mb-12">
                            <ShowAgainButton />
                            <DeleteAllCookiesButton />
                        </div>
                        <div className="ngcc-tw-col-span-2">
                            <CookieConsentGate provider={TrackingCookieProvider}>
                                <p>
                                    This is content, only visible if you accepted the cookies for <b>tebuto_tracking</b>
                                </p>
                                <div>
                                    <CookiePolicy />
                                </div>
                            </CookieConsentGate>
                        </div>
                    </div>
                </div>
            </CookieConsentProvider>
        </React.StrictMode>
    )
}

const container = document.getElementById('root')
if (!container) {
    throw new Error('Root container not found')
}

createRoot(container).render(<Example />)
