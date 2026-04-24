const IOS_SWITCH_TRACK_ON = '#34c759'
const IOS_SWITCH_TRACK_OFF = '#8e8e93'
const IOS_SWITCH_TRACK_OFF_BORDER = '#636366'
const IOS_SWITCH_KNOB = '#ffffff'

interface IToggleButtonProps {
    readonly toggled: boolean
    readonly onToggle: (enabled: boolean) => void
    readonly name: string
    readonly screenReaderLabel?: string
    readonly disabled?: boolean
}

export function SwitchButton({ toggled, onToggle, disabled, screenReaderLabel, name }: IToggleButtonProps) {
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
                border: 0,
                padding: 0,
                appearance: 'none',
                background: 'transparent',
                boxShadow: 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: 1,
                overflow: 'visible',
                verticalAlign: 'middle'
            }}
        >
            <span
                aria-hidden="true"
                data-testid="react-gdpr-cookie-consent-switch-track"
                style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '9999px',
                    border: `2px solid ${toggled ? IOS_SWITCH_TRACK_ON : IOS_SWITCH_TRACK_OFF_BORDER}`,
                    backgroundColor: toggled ? IOS_SWITCH_TRACK_ON : IOS_SWITCH_TRACK_OFF,
                    boxShadow: toggled
                        ? '0 1px 3px rgba(0, 0, 0, 0.2)'
                        : 'inset 0 0 0 1px rgba(0, 0, 0, 0.18), 0 1px 3px rgba(0, 0, 0, 0.22)',
                    transition: 'background-color 200ms ease-in-out, border-color 200ms ease-in-out',
                    pointerEvents: 'none'
                }}
            />
            <span
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    zIndex: 1,
                    top: 2,
                    left: toggled ? 22 : 2,
                    height: '20px',
                    width: '20px',
                    borderRadius: '9999px',
                    backgroundColor: IOS_SWITCH_KNOB,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
                    transition: 'left 200ms ease-in-out',
                    pointerEvents: 'none'
                }}
            />
        </button>
    )
}
