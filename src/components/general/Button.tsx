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
            style={{ color: style.buttonText, backgroundColor: style.buttonBg }}
            className={`hover:scale-105 px-3 py-2 md:w-max w-full text-sm rounded-lg 
            duration-300 font-medium ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={onClick}
        >
            {getLabel('buttons', text)}
        </button>
    )
}
