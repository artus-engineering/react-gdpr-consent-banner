import type { Meta, StoryObj } from '@storybook/react'
import { withConsentProvider } from '../../../.storybook/decorators'
import { analyticsProvider, essentialProvider } from '../../test-utils/fixtures'
import { CookieCategoryComponent } from './CookieCategory'

const meta: Meta<typeof CookieCategoryComponent> = {
    title: 'Cookies/CookieCategory',
    component: CookieCategoryComponent,
    id: 'cookies-cookiecategory',
    decorators: [withConsentProvider],
    parameters: {
        layout: 'padded',
        consent: { includeCookieBanner: false, markBannerDismissed: true }
    },
    args: {
        handleCookieToggle: () => undefined
    }
}

export default meta

type Story = StoryObj<typeof CookieCategoryComponent>

export const Essential: Story = {
    args: {
        provider: essentialProvider,
        isEnabled: true
    }
}

export const Analytics: Story = {
    args: {
        provider: analyticsProvider,
        isEnabled: true
    }
}

export const AnalyticsDisabled: Story = {
    args: {
        provider: analyticsProvider,
        isEnabled: false
    }
}
