import { useEffect, useState } from 'react'
import { getCookieSelection, getLabel, hexToRGBA, persistCookieSelection, setCookieConsentDisplayed } from '../../functions'
import { useConfig, useCookieConsentContext, useCookieProviders, useSetStrictlyNecessaryCookiesOnly, useStyle } from '../../hooks'
import { CookieCategory, CookieConsentState, CookieProviderConfig } from '../../types'
import { CookieCategoryComponent } from '../cookies'
import { Button, SwitchButton } from '../general'

export function CookieConsentBanner(): JSX.Element {
    const config = useConfig()
    const style = useStyle()
    const cookieProviders = useCookieProviders()
    const setStrictlyNecessaryCookiesOnly = useSetStrictlyNecessaryCookiesOnly()
    const { isBannerOpen, setIsBannerOpen } = useCookieConsentContext()
    const [openSettings, setOpenSettings] = useState<boolean>(false)
    const [consentState, setConsentState] = useState<CookieConsentState>(getCookieConsentState)
    const [isClient, setIsClient] = useState(false)

    /** Resolves pre-rendering issues with react */
    useEffect(() => setIsClient(true), [])

    /** Gets the current states whenever the dialog is reopened to reflect the current state of the selections */
    useEffect(() => setConsentState(getCookieConsentState), [isBannerOpen])

    /**
     * Function to get the grid layout for the overview. Should be based on the number of categories that have at least one cookie
     * Necessary for TailwindCSS to recognize and compile the predefined classes without loosing the dynamic nature of the grid
     *
     * @returns {string}
     */
    function overviewGrid(): string {
        const numberOfUsedCategories = Object.values(consentState).filter(category => Object.values(category.cookies).length >= 1).length

        switch (numberOfUsedCategories) {
            case 1:
                return 'md:ngcc-tw-grid-cols-1'
            case 2:
                return 'md:ngcc-tw-grid-cols-2'
            case 3:
                return 'md:ngcc-tw-grid-cols-3'
            case 4:
                return 'md:ngcc-tw-grid-cols-3'
            case 5:
                return 'md:ngcc-tw-grid-cols-3'
            default:
                return 'md:ngcc-tw-grid-cols-1'
        }
    }

    /**
     * Function to persist the selected cookies
     */
    function setSelectedCookies() {
        cookieProviders.forEach(provider => persistCookieSelection(provider, getSelectionState(provider), config.domain, config.cookiesValidForDays))
    }

    /**
     * Function to set all cookies
     */
    function setAllCookiesAccepted() {
        cookieProviders.forEach(cookie => persistCookieSelection(cookie, true, config.domain, config.cookiesValidForDays))
    }

    /**
     * Function to get the selection state of a cookie
     */
    function getSelectionState(cookie: CookieProviderConfig): boolean {
        return consentState[cookie.category].cookies[cookie.id]
    }

    /**
     * Function to get the initial cookie consent state
     */
    function getCookieConsentState(): CookieConsentState {
        return cookieProviders.reduce((acc, cookie) => {
            if (!acc[cookie.category]) {
                acc[cookie.category] = { enabled: cookie.category === 'StrictlyNecessary', cookies: {} }
            }
            acc[cookie.category].cookies[cookie.id] = cookie.category === 'StrictlyNecessary' || getCookieSelection(cookie)
            acc[cookie.category].enabled = Object.values(acc[cookie.category].cookies).every(value => value)
            return acc
        }, {} as CookieConsentState)
    }

    /**
     * Function to handle the category toggle
     * @param category The category to toggle
     */
    function handleCategoryToggle(category: string) {
        setConsentState(prevState => {
            const newEnabledState = !prevState[category as CookieCategory].enabled
            const newCookiesState = Object.keys(prevState[category as CookieCategory].cookies).reduce(
                (acc, cookieId) => {
                    acc[cookieId] = newEnabledState
                    return acc
                },
                {} as { [cookieId: string]: boolean }
            )
            return {
                ...prevState,
                [category]: {
                    enabled: newEnabledState,
                    cookies: newCookiesState
                }
            }
        })
    }

    /**
     * Function to handle the cookie toggle
     *
     * @param category
     * @param cookieId
     */
    function handleCookieToggle(category: string, cookieId: string) {
        setConsentState(prevState => {
            const newCookiesState = {
                ...prevState[category as CookieCategory].cookies,
                [cookieId]: !prevState[category as CookieCategory].cookies[cookieId]
            }
            const newEnabledState = Object.values(newCookiesState).every(value => value)

            return {
                ...prevState,
                [category]: {
                    ...prevState[category as CookieCategory],
                    enabled: newEnabledState,
                    cookies: newCookiesState
                }
            }
        })
    }

    function handleAcceptSelected() {
        setSelectedCookies()
        setCookieConsentDisplayed(config.domain, config.cookiesValidForDays)
        setIsBannerOpen(true)
    }

    function handleAcceptDetailed() {
        setSelectedCookies()
        setCookieConsentDisplayed(config.domain, config.cookiesValidForDays)
        setIsBannerOpen(true)
    }

    function handleAcceptAll() {
        setAllCookiesAccepted()
        setCookieConsentDisplayed(config.domain, config.cookiesValidForDays)
        setIsBannerOpen(true)
    }

    function handleReject() {
        setCookieConsentDisplayed(config.domain, config.cookiesValidForDays)
        setStrictlyNecessaryCookiesOnly()
        setIsBannerOpen(true)
    }

    if (!isClient || isBannerOpen) return <></>

    if (isClient && !isBannerOpen)
        return (
            <dialog
                className="ngcc-tw-fixed ngcc-tw-z-[999] ngcc-tw-flex ngcc-tw-bottom-0 ngcc-tw-left-0 ngcc-tw-w-full xl:ngcc-tw-p-4 ngcc-tw-p-2 ngcc-tw-bg-transparent"
                aria-labelledby={getLabel('headings', 'banner')}
                aria-describedby={getLabel('descriptions', 'cookieDetails')}
                aria-hidden={isBannerOpen ? 'true' : 'false'}
                data-nosnippet
            >
                <div
                    style={{ backgroundColor: hexToRGBA(style.bgPrimary, 0.99), borderColor: style.bgSecondary, color: style.textPrimary }}
                    className="ngcc-tw-w-full ngcc-tw-text-xs ngcc-tw-bg-opacity-[98%] ngcc-tw-px-6 ngcc-tw-py-8 xl:ngcc-tw-p-12 ngcc-tw-rounded-lg ngcc-tw-border ngcc-tw-shadow-lg"
                >
                    {openSettings ? (
                        <div className="ngcc-tw-max-h-screen ngcc-tw-overflow-auto">
                            <h2 style={{ color: style.textPrimary }} className="ngcc-tw-text-lg ngcc-tw-font-semibold ngcc-tw-text-white ngcc-tw-mb-3">
                                {getLabel('headings', 'details')}
                            </h2>
                            {config.crossSubDomainConsent ? (
                                <p style={{ color: style.textPrimary }} className="ngcc-tw-mb-10 ngcc-tw-text-sm">
                                    Ihre Zustimmung gilt für diese Domains:{' '}
                                    <b className="ngcc-tw-text-sm" style={{ color: style.textSecondary }}>
                                        {config.crossSubDomainConsent.join(', ')}
                                    </b>
                                </p>
                            ) : (
                                <></>
                            )}
                            <div className="ngcc-tw-mt-6 ngcc-tw-grid ngcc-tw-gap-3 ngcc-tw-overflow-scroll ngcc-tw-max-h-[60vh]">
                                {Object.entries(consentState).map(([category, categoryState]) => (
                                    <div
                                        style={{ backgroundColor: hexToRGBA(style.bgSecondary, 0.2) }}
                                        className="ngcc-tw-p-6 ngcc-tw-rounded-lg ngcc-tw-grid ngcc-tw-gap-3"
                                        key={category}
                                    >
                                        <div
                                            style={{ borderColor: hexToRGBA(style.bgSecondary, 0.8) }}
                                            className="ngcc-tw-flex ngcc-tw-justify-between ngcc-tw-items-center ngcc-tw-border-b ngcc-tw-pb-4"
                                        >
                                            <div>
                                                <h3 style={{ color: style.textPrimary }} className="ngcc-tw-font-bold ngcc-tw-text-lg">
                                                    {getLabel('cookieCategories', category as CookieCategory)}
                                                </h3>
                                                <p style={{ color: style.textSecondary }} className="ngcc-tw-text-sm ngcc-tw-text-justify ngcc-tw-hyphens-auto">
                                                    {getLabel('cookieCategoryDescriptions', category as CookieCategory)}
                                                </p>
                                            </div>
                                            <div className="ngcc-tw-min-w-24 ngcc-tw-flex ngcc-tw-justify-end">
                                                <SwitchButton
                                                    bgTrue={style.buttonBgTrue}
                                                    bgFalse={style.buttonBgFalse}
                                                    toggled={categoryState.enabled}
                                                    onToggle={() => handleCategoryToggle(category)}
                                                    name={category}
                                                    disabled={category === 'StrictlyNecessary'}
                                                />
                                            </div>
                                        </div>
                                        <div className="ngcc-tw-divide-y ngcc-tw-pb-3">
                                            {Object.entries(categoryState.cookies).map(([cookieId, isEnabled]) => {
                                                const cookie = cookieProviders.find(cookieProvider => cookieProvider.id === cookieId) as CookieProviderConfig
                                                return <CookieCategoryComponent key={cookie.id} provider={cookie} handleCookieToggle={handleCookieToggle} isEnabled={isEnabled} />
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="ngcc-tw-mt-6 ngcc-tw-flex ngcc-tw-justify-between">
                                <Button onClick={() => setOpenSettings(false)} text="back" />
                                <Button onClick={handleAcceptDetailed} text="acceptSelectedCookies" />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="xl:ngcc-tw-flex ngcc-tw-grid">
                                <div className="xl:ngcc-tw-w-1/2">
                                    <h2 style={{ color: style.textPrimary }} className="ngcc-tw-text-xl ngcc-tw-font-semibold ngcc-tw-mb-6">
                                        {getLabel('headings', 'banner')}
                                    </h2>
                                    <p style={{ color: style.textPrimary }} className="ngcc-tw-text-sm  ngcc-tw-text-justify ngcc-tw-hyphens-auto">
                                        {getLabel('descriptions', 'cookieDetails')}{' '}
                                        <a className="ngcc-tw-underline" href={config.cookiePolicyLink}>
                                            {getLabel('links', 'cookiePolicy')}
                                        </a>
                                    </p>
                                </div>
                                <div
                                    className={`ngcc-tw-grid ${overviewGrid()} ngcc-tw-my-12 md:ngcc-tw-divide-x ngcc-tw-gap-6 md:ngcc-tw-gap-0 md:ngcc-tw-justify-evenly xl:ngcc-tw-w-1/2`}
                                >
                                    {Object.entries(consentState).map(([category, categoryState]) => (
                                        <div
                                            style={{ borderColor: hexToRGBA(style.bgSecondary, 0.6) }}
                                            key={category}
                                            className={category === 'StrictlyNecessary' ? 'ngcc-tw-cursor-not-allowed ngcc-tw-opacity-70' : ''}
                                        >
                                            <div className="md:ngcc-tw-text-center md:ngcc-tw-inline ngcc-tw-flex ngcc-tw-items-center ngcc-tw-justify-between">
                                                <p
                                                    style={{ color: style.textPrimary }}
                                                    className="md:ngcc-tw-mb-2 ngcc-tw-block md:ngcc-tw-text-sm ngcc-tw-text-base ngcc-tw-self-end"
                                                >
                                                    {getLabel('cookieCategories', category as CookieCategory)}
                                                </p>
                                                <SwitchButton
                                                    bgTrue={style.buttonBgTrue}
                                                    bgFalse={style.buttonBgFalse}
                                                    toggled={categoryState.enabled}
                                                    onToggle={() => handleCategoryToggle(category)}
                                                    name={category}
                                                    disabled={category === 'StrictlyNecessary'}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="ngcc-tw-mt-4 md:ngcc-tw-flex ngcc-tw-justify-between ngcc-tw-items-center ngcc-tw-w-full ngcc-tw-flex-col md:ngcc-tw-flex-row">
                                <div className="md:ngcc-tw-mb-0 ngcc-tw-mb-6 ngcc-tw-grid md:ngcc-tw-flex">
                                    <Button onClick={() => setOpenSettings(true)} text="showDetails" />
                                </div>
                                <div className="md:ngcc-tw-flex md:ngcc-tw-gap-10 ngcc-tw-grid ngcc-tw-gap-6">
                                    <Button onClick={handleReject} text="rejectAllNonNecessaryCookies" />
                                    <Button onClick={handleAcceptSelected} text="acceptSelectedCookies" />
                                    <Button onClick={handleAcceptAll} text="acceptAllCookies" />
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </dialog>
        )

    return <></>
}
