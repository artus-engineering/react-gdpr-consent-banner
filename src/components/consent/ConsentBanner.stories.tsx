import type { Meta, StoryObj } from '@storybook/react'
import { withConsentProvider } from '../../../.storybook/decorators'
import { CookieConsentBanner } from './ConsentBanner'

const meta: Meta<typeof CookieConsentBanner> = {
    title: 'Consent/ConsentBanner',
    component: CookieConsentBanner,
    id: 'consent-consentbanner',
    decorators: [withConsentProvider],
    parameters: {
        layout: 'fullscreen',
        consent: { includeCookieBanner: false }
    }
}

export default meta

type Story = StoryObj<typeof CookieConsentBanner>

export const Collapsed: Story = {}

export const DetailsExpanded: Story = {
    play: async ({ canvasElement }) => {
        const root = canvasElement.ownerDocument ?? document
        const button = Array.from(root.querySelectorAll<HTMLButtonElement>('button')).find(
            b => b.textContent?.trim() === 'Show Details'
        )
        button?.click()
    }
}
