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

export function CookieConsentGate({ cookieProvider, children }: IConsentGateProps): React.ReactElement {
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
            className="md:p-12 p-4 rounded-lg border max-w-5xl mx-auto !text-left"
        >
            <h2 style={{ color: style.textPrimary }} className="text-xl font-semibold mb-4">
                {getLabel('headings', 'consentGate', config)}
            </h2>
            <p style={{ color: style.textSecondary }} className="mb-12">
                {getLabel('consentGate', 'message', config)}{' '}
                <b style={{ color: style.textSecondary }}>{cookieProvider.name}.</b>
            </p>
            <div style={{ backgroundColor: hexToRGBA(style.bgSecondary, 0.2) }} className="mb-12 md:p-8 p-2 rounded-lg">
                <CookieCategoryComponent
                    provider={cookieProvider}
                    handleCookieToggle={() => setLocalState(!localState)}
                    isEnabled={localState}
                />
            </div>
            <div className="flex justify-end w-full">
                <Button onClick={handleAccept} disabled={!localState} text={'acceptSelectedCookies'} />
            </div>
        </div>
    )
}
