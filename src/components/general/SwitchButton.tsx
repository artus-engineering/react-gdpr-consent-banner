import { Switch } from '@headlessui/react'

interface IToggleButtonProps {
    toggled: boolean
    onToggle: (enabled: boolean) => void
    name: string
    bgTrue?: string
    bgFalse?: string
    screenReaderLabel?: string
    disabled?: boolean
}

export function SwitchButton({ toggled, onToggle, disabled, screenReaderLabel, name, bgTrue, bgFalse }: IToggleButtonProps) {
    return (
        <div style={disabled ? { cursor: 'not-allowed', opacity: 0.5 } : {}}>
            <Switch
                name={name}
                checked={toggled}
                onChange={onToggle}
                disabled={disabled}
                style={{ backgroundColor: toggled ? bgTrue : bgFalse }}
                className={`relative my-auto inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent 
                    transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
                    ${disabled ? '' : 'cursor-pointer'}`}
                data-testid="react-gdpr-cookie-consent-switch-button"
            >
                {screenReaderLabel && <span className="sr-only">{screenReaderLabel}</span>}
                <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow 
                    ring-0 transition duration-200 ease-in-out
                    ${toggled ? 'translate-x-5' : 'translate-x-0'}`}
                />
            </Switch>
        </div>
    )
}
