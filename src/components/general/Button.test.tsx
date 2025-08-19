import { render } from '@testing-library/react'
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

    it('should match the snapshot', () => {
        const { container } = render(<Button onClick={jest.fn()} text={text} />)
        expect(container).toMatchSnapshot()
    })

    it('should use the configured text and background color', () => {
        useStyleMock.mockReturnValue({
            ...DefaultTheme,
            textPrimary: '#abc',
            bgPrimary: '#def'
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

    it('should call the onClick function when clicked', () => {
        const onClick = jest.fn()
        const { container } = render(<Button onClick={onClick} text={text} />)

        container.querySelector('button')?.click()
        expect(onClick).toHaveBeenCalledTimes(1)
    })
})
