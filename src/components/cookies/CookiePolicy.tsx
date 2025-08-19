import { getLabel, getUnit } from '../../functions'
import { useCookieProvidersByCategory } from '../../hooks'
import { CookieCategory } from '../../types'

export function CookiePolicy() {
    const cookieProvidersByCategory = useCookieProvidersByCategory()

    return Object.entries(cookieProvidersByCategory).map(([category, providers]) => (
        <div key={category} className="ngcc-tw-mb-4 ngcc-tw-w-full ngcc-tw-relative">
            <h3 className="ngcc-tw-mb-4 ngcc-tw-mt-16 ngcc-tw-text-2xl ngcc-tw-font-bold">{getLabel('cookieCategories', category as CookieCategory)}</h3>
            <div className="ngcc-tw-grid ngcc-tw-gap-6">
                {providers.map(provider => (
                    <div className="ngcc-tw-max-w-full ngcc-tw-w-full ngcc-tw-overflow-auto" key={provider.id}>
                        <div className="ngcc-tw-mb-6">
                            <h4 className="ngcc-tw-text-lg ngcc-tw-font-semibold">{provider.name}</h4>
                            <p>
                                {provider.description} Mehr informationen dazu finden Sie in der{' '}
                                <a className="ngcc-tw-text-primary-500 ngcc-tw-underline" href={provider.dataProtectionLink}>
                                    Datenschutzerklärung von {provider.name}
                                </a>
                            </p>
                        </div>
                        <div className="ngcc-tw-overflow-auto">
                            <table className="ngcc-tw-table-fixed">
                                <thead>
                                    <tr className="ngcc-tw-font-semibold ngcc-tw-text-sm ngcc-tw-text-gray-900">
                                        <th className="ngcc-tw-w-[150px] ngcc-tw-min-w-[150px] ngcc-tw-text-left">{getLabel('details', 'cookieName')}</th>
                                        <th className="ngcc-tw-w-[150px] ngcc-tw-min-w-[150px] ngcc-tw-text-left">{getLabel('details', 'cookieDuration')}</th>
                                        <th className="ngcc-tw-w-[700px] ngcc-tw-min-w-[700px] ngcc-tw-text-left">{getLabel('details', 'cookiePurpose')}</th>
                                        <th className="ngcc-tw-w-[200px] ngcc-tw-min-w-[200px] ngcc-tw-text-left">{getLabel('details', 'cookieAccessors')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {provider.cookies.map(cookie => (
                                        <tr className="ngcc-tw-text-xs ngcc-tw-text-gray-600 ngcc-tw-border-t" key={cookie.name}>
                                            <td className="ngcc-tw-border-r ngcc-tw-p-2">{cookie.name}</td>
                                            <td className="ngcc-tw-border-r ngcc-tw-p-2">
                                                {cookie.duration} {getUnit(cookie.duration, cookie.unit)}
                                            </td>
                                            <td className="ngcc-tw-border-r ngcc-tw-p-2">{cookie.purpose}</td>
                                            <td className="ngcc-tw-p-2">{(cookie.accessors || [provider.name]).join(', ')}</td>
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
