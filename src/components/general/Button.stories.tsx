import type { Meta, StoryObj } from '@storybook/react'
import { withConsentProvider } from '../../../.storybook/decorators'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
    title: 'General/Button',
    component: Button,
    id: 'general-button',
    decorators: [withConsentProvider],
    parameters: {
        layout: 'centered',
        consent: { includeCookieBanner: false }
    },
    args: {
        onClick: () => undefined
    }
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
    args: {
        text: 'acceptAllCookies'
    }
}

export const Secondary: Story = {
    args: {
        text: 'rejectAllNonNecessaryCookies'
    }
}

export const Disabled: Story = {
    args: {
        text: 'acceptSelectedCookies',
        disabled: true
    }
}
