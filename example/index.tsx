import React from 'react'
import { createRoot } from 'react-dom/client'
import { CookieConsentBannerConfig, CookieConsentGate, CookieConsentProvider, CookiePolicy, SupportedLanguage } from '../src'
import DeleteAllCookiesButton from './buttons/DeleteAllCookiesButton'
import ShowAgainButton from './buttons/ShowAgainButton'
import { GoogleCookieProvider, TrackingCookieProvider, WebsiteCookieProvider } from './config'

const Example: React.FC<{}> = () => {
    const [language, setLanguage] = React.useState<SupportedLanguage>('deDE')

    const config: CookieConsentBannerConfig = {
        theme: {
            bgPrimary: '#ffffff',
            bgSecondary: '#eeeeee',
            textPrimary: '#101010',
            textSecondary: '#181818',
            buttonBgTrue: '#5b55f5',
            buttonBgFalse: '#dddddd',
            buttonBg: '#5b55f5',
            buttonText: '#ffffff'
        },
        lang: language,
        websiteName: 'React Cookie Consent Banner Demo',
        cookiePolicyLink: '/privacy#cookie-policy',
        domain: 'localhost',
        providers: [WebsiteCookieProvider, TrackingCookieProvider, GoogleCookieProvider]
    }

    return (
        <React.StrictMode>
            <CookieConsentProvider config={config}>
                <div className="min-h-screen">
                    <div className="grid grid-cols-4 min-h-screen">
                        <div className="flex flex-col gap-8 h-full border-gray-200 border-r p-12 bg-gray-50">
                            <h1 className="text-2xl font-medium">React Cookie Consent Banner Demo</h1>
                            <div>
                                <h3 className="text-lg font-medium">Select Language</h3>
                                <select className="border border-gray-500 rounded-lg p-3" value={language} onChange={e => setLanguage(e.currentTarget.value as SupportedLanguage)}>
                                    <option value="deDE">Deutsch</option>
                                    <option value="enUS">English</option>
                                </select>
                            </div>
                            <div className="grid gap-6 mb-12">
                                <ShowAgainButton />
                                <DeleteAllCookiesButton />
                            </div>
                        </div>
                        <div className="mt-12 grid grid-cols-2 gap-8 col-span-3">
                            <div className="col-span-2">
                                <CookieConsentGate cookieProvider={TrackingCookieProvider}>
                                    <p>
                                        This is content, only visible if you accepted the cookies for <b>tracking</b>
                                    </p>
                                    <div>
                                        <CookiePolicy />
                                    </div>
                                </CookieConsentGate>
                            </div>
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
