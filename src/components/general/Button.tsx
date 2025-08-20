import { getLabel } from '../../functions'
import { useStyle } from '../../hooks'
import { ButtonSubSection, CookieConsentBannerConfigWithDefaults } from '../../types'

interface IButtonProps {
    onClick: () => void
    text: ButtonSubSection
    disabled?: boolean
    config?: CookieConsentBannerConfigWithDefaults
}

export function Button({ onClick, text, disabled = false, config }: IButtonProps) {
    const style = useStyle()
    const defaultConfig = { lang: 'enUS' as const }
    const buttonConfig = config || defaultConfig

    return (
        <button
            type="button"
            disabled={disabled}
            style={{ color: style.buttonText, backgroundColor: style.primaryColor }}
            className={`hover:scale-105 px-3 py-2 md:w-max w-full text-sm rounded-lg 
            duration-300 font-medium ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={onClick}
        >
            {getLabel('buttons', text, buttonConfig)}
        </button>
    )
}
