interface IToggleButtonProps {
    readonly toggled: boolean
    readonly onToggle: (enabled: boolean) => void
    readonly name: string
    readonly bgTrue?: string
    readonly bgFalse?: string
    readonly screenReaderLabel?: string
    readonly disabled?: boolean
}

export function SwitchButton({
    toggled,
    onToggle,
    disabled,
    screenReaderLabel,
    name,
    bgTrue,
    bgFalse
}: IToggleButtonProps) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={toggled}
            aria-label={screenReaderLabel || name}
            disabled={disabled}
            onClick={() => !disabled && onToggle(!toggled)}
            data-testid="react-gdpr-cookie-consent-switch-button"
            style={{
                position: 'relative',
                display: 'inline-block',
                height: '24px',
                width: '44px',
                flexShrink: 0,
                borderRadius: '9999px',
                border: 'none',
                padding: 0,
                backgroundColor: toggled ? bgTrue : bgFalse,
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
                transition: 'background-color 200ms ease-in-out',
                verticalAlign: 'middle'
            }}
        >
            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 2,
                    left: toggled ? 22 : 2,
                    height: '20px',
                    width: '20px',
                    borderRadius: '9999px',
                    backgroundColor: '#ffffff',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                    transition: 'left 200ms ease-in-out',
                    pointerEvents: 'none'
                }}
            />
        </button>
    )
}
