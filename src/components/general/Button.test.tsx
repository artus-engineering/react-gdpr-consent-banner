import { render, screen } from '@testing-library/react'
import { Button } from './Button'
import * as functions from '../../functions'
import * as hooks from '../../hooks'
import { DefaultTheme } from '../../themes'
import { ButtonSubSection } from '../../types'

describe('Button', () => {
    let getLabelMock: jest.SpyInstance
    let useStyleMock: jest.SpyInstance
    const label = 'Test Button Label'
    const text: ButtonSubSection = 'acceptAllCookies'

    beforeEach(() => {
        getLabelMock = jest.spyOn(functions, 'getLabel').mockReturnValue(label)
        useStyleMock = jest.spyOn(hooks, 'useStyle').mockReturnValue(DefaultTheme)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('should render button with correct text', () => {
        render(<Button onClick={jest.fn()} text={text} />)

        expect(screen.getByRole('button')).toBeInTheDocument()
        expect(screen.getByText(label)).toBeInTheDocument()
    })

    it('should call onClick when clicked', () => {
        const onClickMock = jest.fn()
        render(<Button onClick={onClickMock} text={text} />)

        screen.getByRole('button').click()

        expect(onClickMock).toHaveBeenCalledTimes(1)
    })

    it('should be disabled when disabled prop is true', () => {
        render(<Button onClick={jest.fn()} text={text} disabled={true} />)

        expect(screen.getByRole('button')).toBeDisabled()
    })

    it('should not be disabled when disabled prop is false', () => {
        render(<Button onClick={jest.fn()} text={text} disabled={false} />)

        expect(screen.getByRole('button')).not.toBeDisabled()
    })

    it('should not be disabled when disabled prop is not provided', () => {
        render(<Button onClick={jest.fn()} text={text} />)

        expect(screen.getByRole('button')).not.toBeDisabled()
    })

    it('should display the correct label text', () => {
        render(<Button onClick={jest.fn()} text={text} />)

        expect(screen.getByText(label)).toBeInTheDocument()
        expect(getLabelMock).toHaveBeenCalledWith('buttons', text, { lang: 'enUS' })
    })

    it('should work with all button text types', () => {
        const buttonTypes: ButtonSubSection[] = ['acceptAllCookies', 'rejectAllNonNecessaryCookies', 'acceptSelectedCookies', 'showDetails', 'back']

        buttonTypes.forEach(buttonType => {
            const { unmount } = render(<Button onClick={jest.fn()} text={buttonType} />)
            expect(getLabelMock).toHaveBeenCalledWith('buttons', buttonType, { lang: 'enUS' })
            unmount()
        })
    })
})
