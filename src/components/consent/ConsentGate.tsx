import React from 'react'
import { getLabel, hexToRGBA, persistCookieSelection } from '../../functions'
import { useConfig, useCookieState, useStyle } from '../../hooks'
import { CookieProviderConfig } from '../../types'
import { CookieCategoryComponent } from '../cookies'
import { Button } from '../general'

interface IConsentGateProps {
    cookieProvider: CookieProviderConfig
    children: React.ReactNode
}

export function CookieConsentGate({ cookieProvider, children }: IConsentGateProps): JSX.Element {
    const { isEnabled } = useCookieState({ cookieProvider })
    if (isEnabled) {
        return <>{children}</>
    }
    return <ConsentGateContent cookieProvider={cookieProvider} />
}

export function ConsentGateContent({ cookieProvider }: { cookieProvider: CookieProviderConfig }) {
    const style = useStyle()
    const config = useConfig()
    const { isEnabled } = useCookieState({ cookieProvider })
    const [localState, setLocalState] = React.useState(isEnabled)

    function handleAccept() {
        persistCookieSelection(cookieProvider, localState, config.domain, config.cookiesValidForDays)
    }

    return (
        <div
            style={{ backgroundColor: style.bgPrimary, borderColor: style.bgSecondary }}
            className="md:ngcc-tw-p-12 ngcc-tw-p-4 ngcc-tw-rounded-lg ngcc-tw-border ngcc-tw-max-w-5xl ngcc-tw-mx-auto !ngcc-tw-text-left"
        >
            <h2 style={{ color: style.textPrimary }} className="ngcc-tw-text-xl ngcc-tw-font-semibold ngcc-tw-mb-4">
                {getLabel('headings', 'consentGate')}
            </h2>
            <p style={{ color: style.textSecondary }} className="ngcc-tw-mb-12">
                {getLabel('consentGate', 'message')} <b style={{ color: style.textSecondary }}>{cookieProvider.name}.</b>
            </p>
            <div style={{ backgroundColor: hexToRGBA(style.bgSecondary, 0.2) }} className="ngcc-tw-mb-12 md:ngcc-tw-p-8 ngcc-tw-p-2 ngcc-tw-rounded-lg">
                <CookieCategoryComponent provider={cookieProvider} handleCookieToggle={() => setLocalState(!localState)} isEnabled={localState} />
            </div>
            <div className="ngcc-tw-flex ngcc-tw-justify-end w-full">
                <Button onClick={handleAccept} disabled={!localState} text={'acceptSelectedCookies'} />
            </div>
        </div>
    )
}
