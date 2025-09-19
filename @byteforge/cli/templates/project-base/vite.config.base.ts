import react from '@vitejs/plugin-react'
import {resolve} from 'node:path'
import {defineConfig} from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

// Helper function für Monorepo Aliases
const getMonorepoAliases = () => {
    const apps: string[] = []
    const libs: string[] = []
    const aliases: Record<string, string> = {}

    // Add aliases for apps
    for (const app of apps) {
        aliases[`@${app}`] = resolve(__dirname, `apps/${app}/src`)
        aliases[`@${app}/*`] = resolve(__dirname, `apps/${app}/src/*`)
    }

    // Add aliases for libs
    for (const lib of libs) {
        aliases[`@${lib}`] = resolve(__dirname, `libs/${lib}/src`)
        aliases[`@${lib}/*`] = resolve(__dirname, `libs/${lib}/src/*`)
    }

    return aliases
}

export const baseViteConfig = defineConfig({
    optimizeDeps: {
        // Will be dynamically updated when apps/libs are added
        include: []
    },
    plugins: [react(), tsconfigPaths()],
    resolve: {
        alias: {
            // Add all Monorepo Aliases
            ...getMonorepoAliases(),
        },
    }
})