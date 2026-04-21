import { getLabel, getLocalizedCookieText, getUnit, hexToRGBA } from '../../functions'
import { useConfig, useStyle } from '../../hooks'
import { CookieProviderConfig } from '../../types'
import { SwitchButton } from '../general'

interface ICookieCategory {
    readonly provider: CookieProviderConfig
    readonly handleCookieToggle: (category: string, cookieId: string) => void
    readonly isEnabled: boolean
}

export function CookieCategoryComponent({ provider, handleCookieToggle, isEnabled }: ICookieCategory) {
    const style = useStyle()
    const config = useConfig()

    return (
        <div style={{ borderColor: hexToRGBA(style.bgSecondary, 0.8) }} className="mb-3 pt-3" key={provider.id}>
            <div className="flex justify-between items-center">
                <div>
                    <h4 style={{ color: style.textPrimary }} className="font-bold text-base">
                        {provider.name}
                    </h4>
                    <p style={{ color: style.textSecondary }} className="text-xs text-justify hyphens-auto">
                        {getLocalizedCookieText(provider.description)}{' '}
                        <a className="underline" href={provider.dataProtectionLink}>
                            {`${getLabel('links', 'privacyPolicy', config)} ${getLabel('common', 'of', config)} ${provider.serviceProvider || provider.name}`}
                        </a>
                    </p>
                </div>
                <div className="w-24 flex flex-shrink-0 justify-end">
                    <SwitchButton
                        bgTrue={style.primaryColor}
                        bgFalse={style.bgSecondary}
                        toggled={isEnabled}
                        onToggle={() => handleCookieToggle(provider.category, provider.id)}
                        name={provider.id}
                        disabled={provider.category === 'Essential'}
                    />
                </div>
            </div>
            <details className="mt-4 group">
                <summary className="min-w-24 flex justify-end items-center cursor-pointer mt-4 list-none [&::-webkit-details-marker]:hidden">
                    <p style={{ color: style.textSecondary }} className="text-xs">
                        {getLabel('details', 'expandCookieDetails', config)}
                    </p>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 ml-3 transition-transform group-open:rotate-180"
                        style={{ color: style.textSecondary }}
                    >
                        <title>Toggle cookie details</title>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                </summary>
                <div className="grid xl:grid-cols-3 lg:grid-cols-2 gap-2 mt-6">
                    {provider.cookies.map(cookie => (
                        <div
                            style={{
                                borderColor: hexToRGBA(style.bgSecondary, 0.6),
                                backgroundColor: hexToRGBA(style.bgPrimary, 0.7)
                            }}
                            className="p-3 rounded-lg border"
                            key={cookie.name}
                        >
                            <div className="flex justify-between gap-6 ">
                                <p style={{ color: style.textPrimary }} className="inline text-xs font-medium">
                                    {getLocalizedCookieText(cookie.purpose)}
                                </p>
                            </div>
                            <div className="flex justify-between gap-6 pt-6">
                                <p style={{ color: style.textSecondary }} className="inline text-xs">
                                    {getLabel('details', 'cookieName', config)}
                                </p>
                                <p style={{ color: style.textSecondary }} className="inline text-xs">
                                    {cookie.name}
                                </p>
                            </div>
                            <div className="flex justify-between gap-6">
                                <p style={{ color: style.textSecondary }} className="inline text-xs">
                                    {getLabel('details', 'cookieDuration', config)}
                                </p>
                                <p style={{ color: style.textSecondary }} className="inline text-xs">
                                    {cookie.duration} {getUnit(cookie.duration, cookie.unit, config)}
                                </p>
                            </div>
                            <div className="flex justify-between gap-6 ">
                                <p style={{ color: style.textSecondary }} className="inline text-xs">
                                    {getLabel('details', 'cookieAccessors', config)}
                                </p>
                                <p style={{ color: style.textSecondary }} className="inline text-xs">
                                    {(cookie.accessors || [provider.name]).join(', ')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </details>
        </div>
    )
}
