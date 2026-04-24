import { render, screen } from '@testing-library/react'
import { SwitchButton } from './SwitchButton'

describe('SwitchButton', () => {
    const name = 'Test Switch Button'

    it('uses system green track when toggled on', () => {
        render(<SwitchButton name={name} onToggle={jest.fn()} toggled />)

        const switchButton = screen.getByRole('switch', { name })
        const switchTrack = screen.getByTestId('react-gdpr-cookie-consent-switch-track')
        expect(switchButton).toHaveAttribute('aria-checked', 'true')
        expect(switchTrack).toHaveStyle({ backgroundColor: 'rgb(52, 199, 89)' })
    })

    it('uses neutral gray track when toggled off', () => {
        render(<SwitchButton name={name} onToggle={jest.fn()} toggled={false} />)

        const switchButton = screen.getByRole('switch', { name })
        const switchTrack = screen.getByTestId('react-gdpr-cookie-consent-switch-track')
        expect(switchButton).toHaveAttribute('aria-checked', 'false')
        expect(switchTrack).toHaveStyle({ backgroundColor: 'rgb(142, 142, 147)' })
    })

    it('uses screen reader label when provided', () => {
        render(<SwitchButton name={name} onToggle={jest.fn()} toggled screenReaderLabel="Test Label" />)

        expect(screen.getByRole('switch', { name: 'Test Label' })).toBeInTheDocument()
    })

    it('is disabled when disabled prop is set', () => {
        render(<SwitchButton name={name} onToggle={jest.fn()} toggled disabled />)

        expect(screen.getByRole('switch', { name })).toBeDisabled()
    })
})
