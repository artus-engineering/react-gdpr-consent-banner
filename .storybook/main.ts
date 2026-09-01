import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
    stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
    addons: ['@storybook/addon-links', '@storybook/addon-docs', '@chromatic-com/storybook'],
    framework: {
        name: '@storybook/react-vite',
        options: {}
    },
    core: {
        disableTelemetry: true
    },
    async viteFinal(config) {
        const { default: tailwindcss } = await import('@tailwindcss/vite')
        const basePath = process.env.STORYBOOK_BASE_PATH
        config.plugins = config.plugins || []
        config.plugins.push(tailwindcss())
        if (basePath) {
            config.base = basePath
        }
        config.build = {
            ...config.build,
            chunkSizeWarningLimit: 1500
        }
        return config
    }
}
export default config
