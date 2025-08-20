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
        <div style={{ borderColor: hexToRGBA(style.bgSecondary, 0.8) }} className="mb-3 pt-3" key={provider.id}>
            <div className="flex justify-between items-center">
                <div>
                    <h4 style={{ color: style.textPrimary }} className="font-bold text-base">
                        {provider.name}
                    </h4>
                    <p style={{ color: style.textSecondary }} className="text-xs text-justify hyphens-auto">
                        {provider.description}{' '}
                        <a className="underline" href={provider.dataProtectionLink}>
                            {`${getLabel('links', 'privacyPolicy')} ${getLabel('common', 'of')} ${provider.name}`}
                        </a>
                    </p>
                </div>
                <div className="w-24 flex flex-shrink-0 justify-end">
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
                        <DisclosureButton as="div" className="min-w-24 flex justify-end items-center hover:cursor-pointer mt-4">
                            <p style={{ color: style.textSecondary }} className="text-xs">
                                {getLabel('details', 'expandCookieDetails')}
                            </p>
                            {open ? (
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                    className="w-6 h-6 ml-3"
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
                                    className="w-6 h-6 ml-3"
                                    style={{ color: style.textSecondary }}
                                >
                                    <title>Chevron down to expand the section</title>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                                </svg>
                            )}
                        </DisclosureButton>
                        <DisclosurePanel as="div" className="grid xl:grid-cols-3 lg:grid-cols-2 gap-2 mt-6">
                            {provider.cookies.map(cookie => (
                                <div
                                    style={{ borderColor: hexToRGBA(style.bgSecondary, 0.6), backgroundColor: hexToRGBA(style.bgPrimary, 0.7) }}
                                    className="p-3 rounded-lg border"
                                    key={cookie.name}
                                >
                                    <div className="flex justify-between gap-6 ">
                                        <p style={{ color: style.textPrimary }} className="inline text-xs font-medium">
                                            {cookie.purpose}
                                        </p>
                                    </div>
                                    <div className="flex justify-between gap-6 pt-6">
                                        <p style={{ color: style.textSecondary }} className="inline text-xs">
                                            {getLabel('details', 'cookieName')}
                                        </p>
                                        <p style={{ color: style.textSecondary }} className="inline text-xs">
                                            {cookie.name}
                                        </p>
                                    </div>
                                    <div className="flex justify-between gap-6">
                                        <p style={{ color: style.textSecondary }} className="inline text-xs">
                                            {getLabel('details', 'cookieDuration')}
                                        </p>
                                        <p style={{ color: style.textSecondary }} className="inline text-xs">
                                            {cookie.duration} {getUnit(cookie.duration, cookie.unit)}
                                        </p>
                                    </div>
                                    <div className="flex justify-between gap-6 ">
                                        <p style={{ color: style.textSecondary }} className="inline text-xs">
                                            {getLabel('details', 'cookieAccessors')}
                                        </p>
                                        <p style={{ color: style.textSecondary }} className="inline text-xs">
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
