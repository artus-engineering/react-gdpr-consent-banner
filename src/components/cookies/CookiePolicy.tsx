import { getLabel, getUnit, getLocalizedCookieText } from '../../functions'
import { useConfig, useCookieProvidersByCategory } from '../../hooks'
import { CookieCategory } from '../../types'

export function CookiePolicy() {
    const config = useConfig()
    const cookieProvidersByCategory = useCookieProvidersByCategory()

    return Object.entries(cookieProvidersByCategory).map(([category, providers]) => (
        <div key={category} className="mb-4 w-full relative">
            <h3 className="mb-4 mt-16 text-2xl font-bold">{getLabel('cookieCategories', category as CookieCategory, config)}</h3>
            <div className="grid gap-6">
                {providers.map(provider => (
                    <div className="max-w-full w-full overflow-auto" key={provider.id}>
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold">{provider.name}</h4>
                            <p>
                                {getLocalizedCookieText(provider.description)} {getLabel('details', 'moreInfoText', config)}{' '}
                                <a className="text-primary-500 underline" href={provider.dataProtectionLink}>
                                    {getLabel('details', 'privacyPolicyOf', config)} {provider.serviceProvider || provider.name}
                                </a>
                            </p>
                        </div>
                        <div className="overflow-auto">
                            <table className="table-fixed">
                                <thead>
                                    <tr className="font-semibold text-sm text-gray-900">
                                        <th className="w-[150px] min-w-[150px] text-left">{getLabel('details', 'cookieName', config)}</th>
                                        <th className="w-[150px] min-w-[150px] text-left">{getLabel('details', 'cookieDuration', config)}</th>
                                        <th className="w-[700px] min-w-[700px] text-left">{getLabel('details', 'cookiePurpose', config)}</th>
                                        <th className="w-[200px] min-w-[200px] text-left">{getLabel('details', 'cookieAccessors', config)}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {provider.cookies.map(cookie => (
                                        <tr className="text-xs text-gray-600 border-t" key={cookie.name}>
                                            <td className="border-r p-2">{cookie.name}</td>
                                            <td className="border-r p-2">
                                                {cookie.duration} {getUnit(cookie.duration, cookie.unit, config)}
                                            </td>
                                            <td className="border-r p-2">{getLocalizedCookieText(cookie.purpose)}</td>
                                            <td className="p-2">{(cookie.accessors || [provider.name]).join(', ')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    ))
}
