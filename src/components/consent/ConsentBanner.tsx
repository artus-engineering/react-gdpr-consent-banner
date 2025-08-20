import { useEffect, useState } from 'react'
import { getCookieSelection, getLabel, hexToRGBA, persistCookieSelection, setCookieConsentDisplayed, getUnit } from '../../functions'
import { useConfig, useCookieConsentContext, useCookieProviders, useSetStrictlyNecessaryCookiesOnly, useStyle } from '../../hooks'
import { CookieCategory, CookieConsentState, CookieProviderConfig } from '../../types'
import { CookieCategoryComponent } from '../cookies'
import { Button, SwitchButton } from '../general'

export function CookieConsentBanner(): JSX.Element {
    const config = useConfig()
    const style = useStyle()
    const cookieProviders = useCookieProviders()
    const setStrictlyNecessaryCookiesOnly = useSetStrictlyNecessaryCookiesOnly()
    const { isBannerOpen, setIsBannerOpen, auditService } = useCookieConsentContext()
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
     * @param category The category of the cookie
     * @param cookieId The id of the cookie
     */
    function handleCookieToggle(category: string, cookieId: string) {
        setConsentState(prevState => {
            const newCookieState = !prevState[category as CookieCategory].cookies[cookieId]
            const newCookiesState = {
                ...prevState[category as CookieCategory].cookies,
                [cookieId]: newCookieState
            }
            const newEnabledState = Object.values(newCookiesState).every(value => value)
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
     * Function to handle the accept all cookies action
     */
    function handleAcceptAll() {
        setAllCookiesAccepted()
        setCookieConsentDisplayed(config.domain, config.cookiesValidForDays)
        setIsBannerOpen(false)
    }

    /**
     * Function to handle the reject all non-necessary cookies action
     */
    function handleRejectAll() {
        setStrictlyNecessaryCookiesOnly()
        setCookieConsentDisplayed(config.domain, config.cookiesValidForDays)
        setIsBannerOpen(false)
    }

    /**
     * Function to handle the accept selected cookies action
     */
    function handleAcceptSelected() {
        setSelectedCookies()
        setCookieConsentDisplayed(config.domain, config.cookiesValidForDays)
        setIsBannerOpen(false)
    }

    /**
     * Function to handle the category toggle in the overview
     * @param category The category to toggle
     */
    function handleCategoryToggleOverview(category: string) {
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
     * Function to handle the accept all cookies action in the overview
     */
    function handleAcceptAllOverview() {
        setConsentState(prevState => {
            const newState = { ...prevState }
            Object.keys(newState).forEach(category => {
                newState[category as CookieCategory] = {
                    enabled: true,
                    cookies: Object.keys(newState[category as CookieCategory].cookies).reduce(
                        (acc, cookieId) => {
                            acc[cookieId] = true
                            return acc
                        },
                        {} as { [cookieId: string]: boolean }
                    )
                }
            })
            return newState
        })
    }

    /**
     * Function to handle the reject all non-necessary cookies action in the overview
     */
    function handleRejectAllOverview() {
        setConsentState(prevState => {
            const newState = { ...prevState }
            Object.keys(newState).forEach(category => {
                if (category !== 'Essential') {
                    newState[category as CookieCategory] = {
                        enabled: false,
                        cookies: Object.keys(newState[category as CookieCategory].cookies).reduce(
                            (acc, cookieId) => {
                                acc[cookieId] = false
                                return acc
                            },
                            {} as { [cookieId: string]: boolean }
                        )
                    }
                }
            })
            return newState
        })
    }

    if (!isClient || isBannerOpen) return <></>

    return (
        <>
            {isClient && isBannerOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" style={{ backgroundColor: hexToRGBA(style.bgPrimary, 0.5) }}>
                    <div className="w-full max-w-4xl mx-4 mb-4 sm:mb-0 rounded-lg shadow-lg" style={{ backgroundColor: style.bgPrimary }}>
                        {!openSettings ? (
                            <div className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h2 className="text-lg font-semibold mb-2" style={{ color: style.textPrimary }}>
                                            {getLabel('headings', 'banner', config)}
                                        </h2>
                                        <p className="text-sm mb-4" style={{ color: style.textSecondary }}>
                                            {getLabel('descriptions', 'cookieDetails', config)}
                                        </p>
                                    </div>
                                </div>

                                <div className={`grid gap-4 ${overviewGrid()}`}>
                                    {Object.entries(consentState).map(([category, categoryState]) => (
                                        <div key={category} className="border rounded-lg p-4" style={{ borderColor: style.bgSecondary }}>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-medium" style={{ color: style.textPrimary }}>
                                                    {getLabel('cookieCategories', category as CookieCategory, config)}
                                                </h3>
                                                <SwitchButton
                                                    bgTrue={style.primaryColor}
                                                    bgFalse={style.bgSecondary}
                                                    toggled={categoryState.enabled}
                                                    onToggle={() => handleCategoryToggleOverview(category)}
                                                    name={category}
                                                    disabled={category === 'Essential'}
                                                />
                                            </div>
                                            <p className="text-sm mb-4" style={{ color: style.textSecondary }}>
                                                {getLabel('cookieCategoryDescriptions', category as CookieCategory, config)}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                                    <Button onClick={handleRejectAll} text="rejectAllNonNecessaryCookies" />
                                    <Button onClick={handleAcceptSelected} text="acceptSelectedCookies" />
                                    <Button onClick={handleAcceptAllOverview} text="acceptAllCookies" />
                                </div>
                            </div>
                        ) : (
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-6">
                                    <h2 className="text-lg font-semibold" style={{ color: style.textPrimary }}>
                                        {getLabel('headings', 'details', config)}
                                    </h2>
                                    <button type="button" onClick={() => setOpenSettings(false)} className="text-gray-400 hover:text-gray-600" aria-label="Close settings">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <title>Close settings</title>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {Object.entries(consentState).map(([category, categoryState]) => (
                                        <div key={category} className="border rounded-lg p-4" style={{ borderColor: style.bgSecondary }}>
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-medium" style={{ color: style.textPrimary }}>
                                                    {getLabel('cookieCategories', category as CookieCategory, config)}
                                                </h3>
                                                <SwitchButton
                                                    bgTrue={style.primaryColor}
                                                    bgFalse={style.bgSecondary}
                                                    toggled={categoryState.enabled}
                                                    onToggle={() => handleCategoryToggle(category)}
                                                    name={category}
                                                    disabled={category === 'Essential'}
                                                />
                                            </div>
                                            <p className="text-sm mb-4" style={{ color: style.textSecondary }}>
                                                {getLabel('cookieCategoryDescriptions', category as CookieCategory, config)}
                                            </p>
                                            <div className="space-y-3">
                                                {Object.entries(categoryState.cookies).map(([cookieId, isEnabled]) => {
                                                    const provider = cookieProviders.find(p => p.id === cookieId)
                                                    if (!provider) return null
                                                    return (
                                                        <CookieCategoryComponent key={cookieId} provider={provider} handleCookieToggle={handleCookieToggle} isEnabled={isEnabled} />
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 flex justify-between">
                                    <Button onClick={() => setOpenSettings(false)} text="back" />
                                    <Button onClick={handleAcceptSelected} text="acceptSelectedCookies" />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}
