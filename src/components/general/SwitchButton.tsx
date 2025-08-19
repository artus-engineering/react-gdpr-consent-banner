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
                className={`ngcc-tw-relative ngcc-tw-my-auto ngcc-tw-inline-flex ngcc-tw-h-6 ngcc-tw-w-11 ngcc-tw-flex-shrink-0 ngcc-tw-rounded-full ngcc-tw-border-2 ngcc-tw-border-transparent 
                    ngcc-tw-transition-colors ngcc-tw-duration-200 ngcc-tw-ease-in-out ngcc-tw-focus:outline-none ngcc-tw-focus:ring-2 ngcc-tw-focus:ring-green-500 ngcc-tw-focus:ring-offset-2
                    ${disabled ? '' : 'ngcc-tw-cursor-pointer'}`}
                data-testid="react-gdpr-cookie-consent-switch-button"
            >
                {screenReaderLabel && <span className="sr-only">{screenReaderLabel}</span>}
                <span
                    aria-hidden="true"
                    className={`ngcc-tw-pointer-events-none ngcc-tw-inline-block ngcc-tw-h-5 ngcc-tw-w-5 ngcc-tw-transform ngcc-tw-rounded-full ngcc-tw-bg-white ngcc-tw-shadow 
                    ngcc-tw-ring-0 ngcc-tw-transition ngcc-tw-duration-200 ngcc-tw-ease-in-out
                    ${toggled ? 'ngcc-tw-translate-x-5' : 'ngcc-tw-translate-x-0'}`}
                />
            </Switch>
        </div>
    )
}
