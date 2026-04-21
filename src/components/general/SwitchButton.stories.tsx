import type { Meta, StoryObj } from '@storybook/react'
import { DefaultTheme } from '../../themes'
import { SwitchButton } from './SwitchButton'

const meta: Meta<typeof SwitchButton> = {
    title: 'General/SwitchButton',
    component: SwitchButton,
    id: 'general-switchbutton',
    parameters: {
        layout: 'centered'
    },
    args: {
        name: 'example-switch',
        screenReaderLabel: 'Example switch',
        bgTrue: DefaultTheme.primaryColor,
        bgFalse: DefaultTheme.bgSecondary,
        onToggle: () => undefined
    }
}

export default meta

type Story = StoryObj<typeof SwitchButton>

export const Off: Story = {
    args: {
        toggled: false
    }
}

export const On: Story = {
    args: {
        toggled: true
    }
}

export const Disabled: Story = {
    args: {
        toggled: false,
        disabled: true
    }
}
