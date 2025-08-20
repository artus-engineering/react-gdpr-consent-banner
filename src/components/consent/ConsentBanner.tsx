import { useEffect, useState } from 'react'
import { getCookieSelection, getLabel, hexToRGBA, persistCookieSelection, setCookieConsentDisplayed } from '../../functions'
import { useConfig, useConsentHooks, useCookieConsentContext, useCookieProviders, useSetStrictlyNecessaryCookiesOnly, useStyle } from '../../hooks'
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
    const { acceptConsent, rejectConsent } = useConsentHooks()

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
                return 'md:grid-cols-1'
            case 2:
                return 'md:grid-cols-2'
            case 3:
                return 'md:grid-cols-3'
            case 4:
                return 'md:grid-cols-3'
            case 5:
                return 'md:grid-cols-3'
            default:
                return 'md:grid-cols-1'
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
                acc[cookie.category] = { enabled: cookie.category === 'Essential', cookies: {} }
            }
            acc[cookie.category].cookies[cookie.id] = cookie.category === 'Essential' || getCookieSelection(cookie)
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

        // Execute consent hooks for accepted categories
        Object.entries(consentState).forEach(([category, categoryState]) => {
            if (categoryState.enabled && category !== 'Essential') {
                acceptConsent(category as CookieCategory)
            } else if (!categoryState.enabled && category !== 'Essential') {
                rejectConsent(category as CookieCategory)
            }
        })
    }

    function handleAcceptDetailed() {
        setSelectedCookies()
        setCookieConsentDisplayed(config.domain, config.cookiesValidForDays)
        setIsBannerOpen(true)

        // Execute consent hooks for accepted categories
        Object.entries(consentState).forEach(([category, categoryState]) => {
            if (categoryState.enabled && category !== 'Essential') {
                acceptConsent(category as CookieCategory)
            } else if (!categoryState.enabled && category !== 'Essential') {
                rejectConsent(category as CookieCategory)
            }
        })
    }

    function handleAcceptAll() {
        setAllCookiesAccepted()
        setCookieConsentDisplayed(config.domain, config.cookiesValidForDays)
        setIsBannerOpen(true)

        // Execute consent hooks for all categories
        acceptConsent('Analytics')
        acceptConsent('Marketing')
    }

    function handleReject() {
        setCookieConsentDisplayed(config.domain, config.cookiesValidForDays)
        setStrictlyNecessaryCookiesOnly()
        setIsBannerOpen(true)

        // Execute consent hooks for rejected categories
        rejectConsent('Analytics')
        rejectConsent('Marketing')
    }

    if (!isClient || isBannerOpen) return <></>

    if (isClient && !isBannerOpen)
        return (
            <dialog
                className="fixed z-[999] flex bottom-0 left-0 w-full xl:p-4 p-2 bg-transparent"
                aria-labelledby={getLabel('headings', 'banner')}
                aria-describedby={getLabel('descriptions', 'cookieDetails')}
                aria-hidden={isBannerOpen ? 'true' : 'false'}
                data-nosnippet
            >
                <div
                    style={{ backgroundColor: hexToRGBA(style.bgPrimary, 0.99), borderColor: style.bgSecondary, color: style.textPrimary }}
                    className="w-full text-xs bg-opacity-[98%] px-6 py-8 xl:p-12 rounded-lg border shadow-lg"
                >
                    {openSettings ? (
                        <div className="max-h-screen overflow-auto">
                            <h2 style={{ color: style.textPrimary }} className="text-lg font-semibold text-white mb-3">
                                {getLabel('headings', 'details')}
                            </h2>
                            {config.crossSubDomainConsent ? (
                                <p style={{ color: style.textPrimary }} className="mb-10 text-sm">
                                    Ihre Zustimmung gilt für diese Domains:{' '}
                                    <b className="text-sm" style={{ color: style.textSecondary }}>
                                        {config.crossSubDomainConsent.join(', ')}
                                    </b>
                                </p>
                            ) : (
                                <></>
                            )}
                            <div className="mt-6 grid gap-3 overflow-scroll max-h-[60vh]">
                                {Object.entries(consentState).map(([category, categoryState]) => (
                                    <div style={{ backgroundColor: hexToRGBA(style.bgSecondary, 0.2) }} className="p-6 rounded-lg grid gap-3" key={category}>
                                        <div style={{ borderColor: hexToRGBA(style.bgSecondary, 0.8) }} className="flex justify-between items-center border-b pb-4">
                                            <div>
                                                <h3 style={{ color: style.textPrimary }} className="font-bold text-lg">
                                                    {getLabel('cookieCategories', category as CookieCategory)}
                                                </h3>
                                                <p style={{ color: style.textSecondary }} className="text-sm text-justify hyphens-auto">
                                                    {getLabel('cookieCategoryDescriptions', category as CookieCategory)}
                                                </p>
                                            </div>
                                            <div className="min-w-24 flex justify-end">
                                                <SwitchButton
                                                    bgTrue={style.primaryColor}
                                                    bgFalse={style.bgSecondary}
                                                    toggled={categoryState.enabled}
                                                    onToggle={() => handleCategoryToggle(category)}
                                                    name={category}
                                                    disabled={category === 'Essential'}
                                                />
                                            </div>
                                        </div>
                                        <div className="divide-y pb-3">
                                            {Object.entries(categoryState.cookies).map(([cookieId, isEnabled]) => {
                                                const cookie = cookieProviders.find(cookieProvider => cookieProvider.id === cookieId) as CookieProviderConfig
                                                return <CookieCategoryComponent key={cookie.id} provider={cookie} handleCookieToggle={handleCookieToggle} isEnabled={isEnabled} />
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-between">
                                <Button onClick={() => setOpenSettings(false)} text="back" />
                                <Button onClick={handleAcceptDetailed} text="acceptSelectedCookies" />
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="xl:flex grid">
                                <div className="xl:w-1/2">
                                    <h2 style={{ color: style.textPrimary }} className="text-xl font-semibold mb-6">
                                        {getLabel('headings', 'banner')}
                                    </h2>
                                    <p style={{ color: style.textPrimary }} className="text-sm  text-justify hyphens-auto">
                                        {getLabel('descriptions', 'cookieDetails')}{' '}
                                        <a className="underline" href={config.cookiePolicyLink}>
                                            {getLabel('links', 'cookiePolicy')}
                                        </a>
                                    </p>
                                </div>
                                <div className={`grid ${overviewGrid()} my-12 md:divide-x gap-6 md:gap-0 md:justify-evenly xl:w-1/2`}>
                                    {Object.entries(consentState).map(([category, categoryState]) => (
                                        <div
                                            style={{ borderColor: hexToRGBA(style.bgSecondary, 0.6) }}
                                            key={category}
                                            className={category === 'Essential' ? 'cursor-not-allowed opacity-70' : ''}
                                        >
                                            <div className="md:text-center md:inline flex items-center justify-between">
                                                <p style={{ color: style.textPrimary }} className="md:mb-2 block md:text-sm text-base self-end">
                                                    {getLabel('cookieCategories', category as CookieCategory)}
                                                </p>
                                                <SwitchButton
                                                    bgTrue={style.primaryColor}
                                                    bgFalse={style.bgSecondary}
                                                    toggled={categoryState.enabled}
                                                    onToggle={() => handleCategoryToggle(category)}
                                                    name={category}
                                                    disabled={category === 'Essential'}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="mt-4 md:flex justify-between items-center w-full flex-col md:flex-row">
                                <div className="md:mb-0 mb-6 grid md:flex">
                                    <Button onClick={() => setOpenSettings(true)} text="showDetails" />
                                </div>
                                <div className="md:flex md:gap-10 grid gap-6">
                                    <Button  onClick={handleReject} text="rejectAllNonNecessaryCookies" />
                                    <Button  onClick={handleAcceptSelected} text="acceptSelectedCookies" />
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
