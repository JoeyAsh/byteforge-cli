import {defineConfig} from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from '@vitejs/plugin-react'
import {resolve} from 'path'

// Helper function für Monorepo Aliases
const getMonorepoAliases = () => {
    const packages = ['shared-ui', 'utils']
    const aliases: Record<string, string> = {}

    for (const pkg of packages) {
        aliases[`@${pkg}`] = resolve(__dirname, `packages/${pkg}/src`)
        aliases[`@${pkg}/*`] = resolve(__dirname, `packages/${pkg}/src/*`)
    }

    return aliases
}

export const baseViteConfig = defineConfig({
    plugins: [react(), tsconfigPaths()],
    resolve: {
        alias: {
            // Füge alle Monorepo Aliases hinzu
            ...getMonorepoAliases(),
        },
    },
    optimizeDeps: {
        include: ['@shared-ui', '@utils']
    }
})