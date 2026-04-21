import type { Meta, StoryObj } from '@storybook/react'
import { withConsentProvider } from '../../../.storybook/decorators'
import { CookiePolicy } from './CookiePolicy'

const meta: Meta<typeof CookiePolicy> = {
    title: 'Cookies/CookiePolicy',
    component: CookiePolicy,
    id: 'cookies-cookiepolicy',
    decorators: [withConsentProvider],
    parameters: {
        layout: 'padded',
        consent: { includeCookieBanner: false, markBannerDismissed: true }
    }
}

export default meta

type Story = StoryObj<typeof CookiePolicy>

export const Default: Story = {}
