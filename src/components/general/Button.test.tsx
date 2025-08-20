import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as functions from '../../functions'
import * as hooks from '../../hooks'
import { DefaultTheme } from '../../themes'
import { ButtonSubSection, CookieConsentStyleWithDefaults, SectionKeys, TranslationSections } from '../../types'
import { Button } from './Button'

describe('Button', () => {
    let useStyleMock: jest.SpyInstance<CookieConsentStyleWithDefaults, []>
    let getLabelMock: jest.SpyInstance<string, [section: TranslationSections, key: SectionKeys<TranslationSections>], any>

    const text: ButtonSubSection = 'acceptAllCookies'
    const label = 'Accept all cookies'

    beforeEach(() => {
        useStyleMock = jest.spyOn(hooks, 'useStyle').mockReturnValue(DefaultTheme)
        getLabelMock = jest.spyOn(functions, 'getLabel').mockReturnValue(label)
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('should match the snapshot', () => {
        const { container } = render(<Button onClick={jest.fn()} text={text} />)
        expect(container).toMatchSnapshot()
    })

    it('should use the configured text and background color', () => {
        useStyleMock.mockReturnValue({
            ...DefaultTheme,
            buttonText: '#def',
            buttonBg: '#abc'
        })

        const { container } = render(<Button onClick={jest.fn()} text={text} />)

        expect(container.querySelector('button')?.style.color).toEqual('rgb(221, 238, 255)')
        expect(container.querySelector('button')?.style.backgroundColor).toEqual('rgb(170, 187, 204)')
    })

    it('should disable the button', () => {
        const { container } = render(<Button onClick={jest.fn()} text={text} disabled />)

        expect(container).toMatchSnapshot()
        expect(container.querySelector('button')?.disabled).toBe(true)
    })

    it('should call the onClick function when clicked', async () => {
        const user = userEvent.setup()
        const onClick = jest.fn()
        render(<Button onClick={onClick} text={text} />)

        const button = screen.getByRole('button')
        await user.click(button)
        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick when disabled', async () => {
        const user = userEvent.setup()
        const onClick = jest.fn()
        render(<Button onClick={onClick} text={text} disabled />)

        const button = screen.getByRole('button')
        await user.click(button)
        expect(onClick).not.toHaveBeenCalled()
    })

    it('should render with correct button type', () => {
        render(<Button onClick={jest.fn()} text={text} />)

        const button = screen.getByRole('button')
        expect(button).toHaveAttribute('type', 'button')
    })

    it('should apply correct CSS classes for enabled state', () => {
        render(<Button onClick={jest.fn()} text={text} />)

        const button = screen.getByRole('button')
        expect(button).toHaveClass('hover:scale-105', 'px-3', 'py-2', 'md:w-max', 'w-full', 'text-sm', 'rounded-lg', 'duration-300', 'font-medium', 'cursor-pointer')
        expect(button).not.toHaveClass('opacity-50', 'cursor-not-allowed')
    })

    it('should apply correct CSS classes for disabled state', () => {
        render(<Button onClick={jest.fn()} text={text} disabled />)

        const button = screen.getByRole('button')
        expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
        expect(button).not.toHaveClass('cursor-pointer')
    })

    it('should display the correct label text', () => {
        render(<Button onClick={jest.fn()} text={text} />)

        expect(screen.getByText(label)).toBeInTheDocument()
        expect(getLabelMock).toHaveBeenCalledWith('buttons', text)
    })

    it('should work with all button text types', () => {
        const buttonTypes: ButtonSubSection[] = ['acceptAllCookies', 'rejectAllNonNecessaryCookies', 'acceptSelectedCookies', 'showDetails', 'back']

        buttonTypes.forEach(buttonType => {
            const { unmount } = render(<Button onClick={jest.fn()} text={buttonType} />)
            expect(getLabelMock).toHaveBeenCalledWith('buttons', buttonType)
            unmount()
        })
    })

    it('should handle multiple rapid clicks correctly', async () => {
        const user = userEvent.setup()
        const onClick = jest.fn()
        render(<Button onClick={onClick} text={text} />)

        const button = screen.getByRole('button')
        await user.click(button)
        await user.click(button)
        await user.click(button)

        expect(onClick).toHaveBeenCalledTimes(3)
    })

    it('should handle different theme configurations', () => {
        const customTheme = {
            ...DefaultTheme,
            buttonText: '#ffffff',
            buttonBg: '#000000'
        }
        useStyleMock.mockReturnValue(customTheme)

        const { container } = render(<Button onClick={jest.fn()} text={text} />)

        expect(container.querySelector('button')?.style.color).toEqual('rgb(255, 255, 255)')
        expect(container.querySelector('button')?.style.backgroundColor).toEqual('rgb(0, 0, 0)')
    })

    it('should be accessible with proper ARIA attributes', () => {
        render(<Button onClick={jest.fn()} text={text} />)

        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
        expect(button).toHaveAttribute('type', 'button')
    })

    it('should handle empty label gracefully', () => {
        getLabelMock.mockReturnValue('')
        render(<Button onClick={jest.fn()} text={text} />)

        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
        expect(button.textContent).toBe('')
    })

    it('should maintain consistent styling across renders', () => {
        const { rerender } = render(<Button onClick={jest.fn()} text={text} />)

        const firstRender = screen.getByRole('button')
        const firstClasses = firstRender.className

        rerender(<Button onClick={jest.fn()} text={text} />)

        const secondRender = screen.getByRole('button')
        const secondClasses = secondRender.className

        expect(firstClasses).toBe(secondClasses)
    })

    it('should handle theme changes correctly', () => {
        const { rerender } = render(<Button onClick={jest.fn()} text={text} />)

        const initialButton = screen.getByRole('button')
        const initialColor = initialButton.style.color

        // Change theme
        useStyleMock.mockReturnValue({
            ...DefaultTheme,
            buttonText: '#ff0000'
        })

        rerender(<Button onClick={jest.fn()} text={text} />)

        const updatedButton = screen.getByRole('button')
        const updatedColor = updatedButton.style.color

        expect(initialColor).not.toBe(updatedColor)
        expect(updatedColor).toBe('rgb(255, 0, 0)')
    })
})
