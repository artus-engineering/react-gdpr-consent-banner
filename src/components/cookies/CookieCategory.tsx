import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { getLabel, getUnit, hexToRGBA } from '../../functions'
import { useStyle } from '../../hooks'
import { CookieProviderConfig } from '../../types'
import { SwitchButton } from '../general'

interface ICookieCategory {
    provider: CookieProviderConfig
    handleCookieToggle: (category: string, cookieId: string) => void
    isEnabled: boolean
}

export function CookieCategoryComponent({ provider, handleCookieToggle, isEnabled }: ICookieCategory) {
    const style = useStyle()

    return (
        <div style={{ borderColor: hexToRGBA(style.bgSecondary, 0.8) }} className="ngcc-tw-mb-3 ngcc-tw-pt-3" key={provider.id}>
            <div className="ngcc-tw-flex ngcc-tw-justify-between ngcc-tw-items-center">
                <div>
                    <h4 style={{ color: style.textPrimary }} className="ngcc-tw-font-bold ngcc-tw-text-base">
                        {provider.name}
                    </h4>
                    <p style={{ color: style.textSecondary }} className="ngcc-tw-text-xs ngcc-tw-text-justify ngcc-tw-hyphens-auto">
                        {provider.description}{' '}
                        <a className="ngcc-tw-underline" href={provider.dataProtectionLink}>
                            {`${getLabel('links', 'privacyPolicy')} ${getLabel('common', 'of')} ${provider.name}`}
                        </a>
                    </p>
                </div>
                <div className="ngcc-tw-w-24 ngcc-tw-flex ngcc-tw-flex-shrink-0 ngcc-tw-justify-end">
                    <SwitchButton
                        bgTrue={style.buttonBgTrue}
                        bgFalse={style.buttonBgFalse}
                        toggled={isEnabled}
                        onToggle={() => handleCookieToggle(provider.category, provider.id)}
                        name={provider.id}
                        disabled={provider.category === 'StrictlyNecessary'}
                    />
                </div>
            </div>
            <Disclosure as="div" className="mt-4" defaultOpen={false}>
                {({ open }) => (
                    <>
                        <DisclosureButton as="div" className="ngcc-tw-min-w-24 ngcc-tw-flex ngcc-tw-justify-end ngcc-tw-items-center hover:ngcc-tw-cursor-pointer ngcc-tw-mt-4">
                            <p style={{ color: style.textSecondary }} className="ngcc-tw-text-xs">
                                {getLabel('details', 'expandCookieDetails')}
                            </p>
                            {open ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="ngcc-tw-w-6 ngcc-tw-h-6 ngcc-tw-ml-3"
                                    style={{ color: style.textSecondary }}
                                >
                                    <title>Chevron up to collapse the section</title>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
                                </svg>
                            ) : (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth="1.5"
                                    stroke="currentColor"
                                    className="ngcc-tw-w-6 ngcc-tw-h-6 ngcc-tw-ml-3"
                                    style={{ color: style.textSecondary }}
                                >
                                    <title>Chevron down to expand the section</title>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>
                            )}
                        </DisclosureButton>
                        <DisclosurePanel as="div" className="ngcc-tw-grid xl:ngcc-tw-grid-cols-3 lg:ngcc-tw-grid-cols-2 ngcc-tw-gap-2 ngcc-tw-mt-6">
                            {provider.cookies.map(cookie => (
                                <div
                                    style={{ borderColor: hexToRGBA(style.bgSecondary, 0.6), backgroundColor: hexToRGBA(style.bgPrimary, 0.7) }}
                                    className="ngcc-tw-p-3 ngcc-tw-rounded-lg ngcc-tw-border"
                                    key={cookie.name}
                                >
                                    <div className="ngcc-tw-flex ngcc-tw-justify-between ngcc-tw-gap-6 ">
                                        <p style={{ color: style.textPrimary }} className="ngcc-tw-inline ngcc-tw-text-xs ngcc-tw-font-medium">
                                            {cookie.purpose}
                                        </p>
                                    </div>
                                    <div className="ngcc-tw-flex ngcc-tw-justify-between ngcc-tw-gap-6 ngcc-tw-pt-6">
                                        <p style={{ color: style.textSecondary }} className="ngcc-tw-inline ngcc-tw-text-xs">
                                            {getLabel('details', 'cookieName')}
                                        </p>
                                        <p style={{ color: style.textSecondary }} className="ngcc-tw-inline ngcc-tw-text-xs">
                                            {cookie.name}
                                        </p>
                                    </div>
                                    <div className="ngcc-tw-flex ngcc-tw-justify-between ngcc-tw-gap-6">
                                        <p style={{ color: style.textSecondary }} className="ngcc-tw-inline ngcc-tw-text-xs">
                                            {getLabel('details', 'cookieDuration')}
                                        </p>
                                        <p style={{ color: style.textSecondary }} className="ngcc-tw-inline ngcc-tw-text-xs">
                                            {cookie.duration} {getUnit(cookie.duration, cookie.unit)}
                                        </p>
                                    </div>
                                    <div className="ngcc-tw-flex ngcc-tw-justify-between ngcc-tw-gap-6 ">
                                        <p style={{ color: style.textSecondary }} className="ngcc-tw-inline ngcc-tw-text-xs">
                                            {getLabel('details', 'cookieAccessors')}
                                        </p>
                                        <p style={{ color: style.textSecondary }} className="ngcc-tw-inline ngcc-tw-text-xs">
                                            {(cookie.accessors || [provider.name]).join(', ')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </DisclosurePanel>
                    </>
                )}
            </Disclosure>
        </div>
    )
}
