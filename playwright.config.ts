import { defineConfig, devices } from '@playwright/test'

const PORT = Number(process.env.STORYBOOK_PORT ?? 6007)

export default defineConfig({
    testDir: 'tests/visual',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 2 : undefined,
    reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
    timeout: 30_000,
    expect: {
        toHaveScreenshot: {
            maxDiffPixelRatio: 0.01,
            animations: 'disabled',
            caret: 'hide',
            scale: 'css'
        }
    },
    use: {
        baseURL: `http://127.0.0.1:${PORT}`,
        locale: 'en-GB',
        timezoneId: 'UTC',
        colorScheme: 'light',
        viewport: { width: 1280, height: 800 },
        trace: 'retain-on-failure'
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        }
    ],
    webServer: {
        command: `pnpm exec http-server storybook-static -p ${PORT} -s -c-1 --no-dotfiles`,
        port: PORT,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000
    }
})
