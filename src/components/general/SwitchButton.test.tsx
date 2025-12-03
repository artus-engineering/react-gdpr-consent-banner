import { render } from '@testing-library/react'
import { SwitchButton } from './SwitchButton'

describe('SwitchButton', () => {
    const name = 'Test Switch Button'

    it('should match the snapshot with minimal configuration', () => {
        const { container } = render(<SwitchButton name={name} onToggle={jest.fn()} toggled />)
        expect(container).toMatchSnapshot()
    })

    it('should match the snapshot with screen reader label', () => {
        const { container } = render(
            <SwitchButton name={name} onToggle={jest.fn()} toggled screenReaderLabel="Test Label" />
        )
        expect(container).toMatchSnapshot()
    })

    it('should match the snapshot when not toggled', () => {
        const { container } = render(<SwitchButton name={name} onToggle={jest.fn()} toggled={false} />)
        expect(container).toMatchSnapshot()
    })

    it('should match the snapshot when disabled', () => {
        const { container } = render(<SwitchButton name={name} onToggle={jest.fn()} toggled disabled />)
        expect(container).toMatchSnapshot()
    })

    it('should use the provided background color when toggled', () => {
        const { getByTestId } = render(<SwitchButton name={name} onToggle={jest.fn()} toggled bgTrue="#abc" />)

        const switchButton = getByTestId('react-gdpr-cookie-consent-switch-button')
        expect(switchButton.style.backgroundColor).toEqual('rgb(170, 187, 204)')
    })

    it('should use the provided background color when not toggled', () => {
        const { getByTestId } = render(<SwitchButton name={name} onToggle={jest.fn()} toggled={false} bgFalse="#abc" />)

        const switchButton = getByTestId('react-gdpr-cookie-consent-switch-button')
        expect(switchButton.style.backgroundColor).toEqual('rgb(170, 187, 204)')
    })
})
