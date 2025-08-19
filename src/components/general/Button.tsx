import { getLabel } from '../../functions'
import { useStyle } from '../../hooks'
import { ButtonSubSection } from '../../types'

interface IButtonProps {
    onClick: () => void
    text: ButtonSubSection
    disabled?: boolean
}

export function Button({ onClick, text, disabled = false }: IButtonProps) {
    const style = useStyle()
    return (
        <button
            type="button"
            disabled={disabled}
            style={{ color: style.bgPrimary, backgroundColor: style.textPrimary }}
            className={`hover:ngcc-tw-scale-105 ngcc-tw-text-primary-600 ngcc-tw-bg-primary-100 ngcc-tw-px-3 ngcc-tw-py-2 md:ngcc-tw-w-max ngcc-tw-w-full ngcc-tw-text-sm ngcc-tw-rounded-lg 
            ngcc-tw-duration-300 ngcc-tw-font-medium ${disabled ? 'ngcc-tw-opacity-50 ngcc-tw-cursor-not-allowed' : 'ngcc-tw-cursor-pointer'}`}
            onClick={onClick}
        >
            {getLabel('buttons', text)}
        </button>
    )
}
