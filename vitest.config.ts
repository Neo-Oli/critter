import { readFileSync } from 'node:fs'
import { defineConfig } from 'vitest/config'

export default defineConfig({
    plugins: [
        {
            enforce: 'pre',
            load(id) {
                if (id.endsWith('.txt')) {
                    return `export default ${JSON.stringify(readFileSync(id, 'utf8'))}`
                }
            },
            name: 'text-sprites',
        },
    ],
    test: {
        clearMocks: true,
        environment: 'node',
        restoreMocks: true,
        testTimeout: 15000,
    },
})
