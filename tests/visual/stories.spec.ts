import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, test } from '@playwright/test'

interface StorybookStoryEntry {
    readonly id: string
    readonly title: string
    readonly name: string
    readonly type: 'story' | 'docs'
    readonly tags?: readonly string[]
}

interface StorybookIndex {
    readonly entries: Record<string, StorybookStoryEntry>
}

const indexPath = join(process.cwd(), 'storybook-static', 'index.json')

function loadStories(): StorybookStoryEntry[] {
    const raw = readFileSync(indexPath, 'utf-8')
    const parsed = JSON.parse(raw) as StorybookIndex
    return Object.values(parsed.entries).filter(entry => entry.type === 'story')
}

const stories = loadStories()

test.describe('Storybook visual regression', () => {
    for (const story of stories) {
        test(`${story.title} - ${story.name} [${story.id}]`, async ({ page }) => {
            const errors: string[] = []
            page.on('pageerror', err => errors.push(err.message))

            await page.goto(`/iframe.html?viewMode=story&id=${encodeURIComponent(story.id)}`)

            await page.waitForFunction(
                () => {
                    const root = document.querySelector('#storybook-root')
                    return !!root && root.childNodes.length > 0
                },
                undefined,
                { timeout: 15_000 }
            )

            await page.evaluate(() => document.fonts?.ready)

            await page.waitForTimeout(200)

            expect(errors, `Page errors occurred while rendering ${story.id}`).toEqual([])

            await expect(page).toHaveScreenshot(`${story.id}.png`, { fullPage: true })
        })
    }
})
