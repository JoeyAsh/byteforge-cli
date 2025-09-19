import * as fs from 'fs-extra'
import {execSync} from 'node:child_process'
import {join} from 'node:path'
import prompts from 'prompts'

export class AppCreator {
  public async createApp(appName: string): Promise<void> {
    // Check if we're in a monorepo project (look for apps directory or package.json with workspaces)
    const appsDir = join(process.cwd(), 'apps')
    const packageJsonPath = join(process.cwd(), 'package.json')

    let isMonorepo = false
    if (await fs.pathExists(packageJsonPath)) {
      try {
        const packageJson = await fs.readJson(packageJsonPath)
        isMonorepo = packageJson.workspaces && Array.isArray(packageJson.workspaces)
      } catch {
        // Ignore JSON parse errors
      }
    }

    if (!isMonorepo && !await fs.pathExists(appsDir)) {
      throw new Error('This command should be run from the root of a monorepo project. No apps directory or workspace configuration found.')
    }

    const appDir = join(appsDir, appName)

    // Check if app already exists
    if (await fs.pathExists(appDir)) {
      const files = await fs.readdir(appDir)
      if (files.length > 0) {
        const response = await prompts({
          initial: false,
          message: `App "${appName}" already exists and is not empty. Delete contents and recreate?`,
          name: 'value',
          type: 'confirm',
        })

        if (!response.value) {
          console.log('Operation cancelled.')
          return
        }

        // Delete existing app contents
        await fs.remove(appDir)
      }
    }

    try {
      // Ensure apps directory exists
      await fs.ensureDir(appsDir)

      console.log(`Creating React app "${appName}" with Vite + TypeScript...`)

      // Use npm create vite to create the app with React + TypeScript template
      const createCommand = `npm create vite@latest ${appName} -- --template react-ts`

      console.log(`Running: ${createCommand}`)

      execSync(createCommand, {
        cwd: appsDir,
        stdio: 'inherit',
      })

      // Update the created app's package.json to have a proper name for the monorepo
      const appPackageJsonPath = join(appDir, 'package.json')
      if (await fs.pathExists(appPackageJsonPath)) {
        const appPackageJson = await fs.readJson(appPackageJsonPath)
        appPackageJson.name = `@${await this.getWorkspaceName()}/${appName}`
        await fs.writeJson(appPackageJsonPath, appPackageJson, {spaces: 2})
      }

      // Install additional packages: React Router, MUI, and Redux Toolkit
      console.log('\nInstalling additional packages...')
      await this.installAdditionalPackages(appDir)

      console.log(`✅ Successfully created app "${appName}" in apps/${appName}`)
      console.log('\nNext steps:')
      console.log(`  cd apps/${appName}`)
      console.log('  npm install')
      console.log('  npm run dev')

    } catch (error) {
      throw new Error(`Failed to create app: ${error}`)
    }
  }

  private async addAliasesToMonorepoConfigs(packageName: string, type: 'apps' | 'libs'): Promise<void> {
    const monorepoRoot = process.cwd()

    // Update tsconfig.base.json with new alias
    await this.updateTsConfigPaths(monorepoRoot, packageName, type)

    // Update vite.config.base.ts with new alias
    await this.updateViteConfigAliases(monorepoRoot, packageName, type)
  }

  private async configureAppForMonorepo(appDir: string): Promise<void> {
    const appName = appDir.split(/[/\\]/).pop()!

    try {
      // 1. Remove ESLint configuration from the app (use monorepo ESLint)
      console.log('Removing app-specific ESLint configuration...')
      await this.removeEslintConfig(appDir)

      // 2. Update tsconfig.json to extend from monorepo base
      console.log('Updating TypeScript configuration...')
      await this.updateTsConfig(appDir)

      // 3. Replace Vite configuration with template version
      console.log('Updating Vite configuration...')
      await this.updateViteConfigFromTemplate(appDir)

      // 4. Replace src folder with template version
      console.log('Replacing src folder with template...')
      await this.replaceSrcWithTemplate(appDir)

      // 5. Update monorepo configurations with aliases
      console.log('Adding aliases to monorepo configurations...')
      await this.addAliasesToMonorepoConfigs(appName, 'apps')

      console.log('✅ App configured for monorepo successfully!')

    } catch (error) {
      console.warn(`⚠️  Warning: Failed to configure some monorepo settings: ${error}`)
    }
  }

  private async getWorkspaceName(): Promise<string> {
    try {
      const packageJsonPath = join(process.cwd(), 'package.json')
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath)
        if (packageJson.name) {
          return packageJson.name.replace(/^@/, '').split('/')[0] || 'workspace'
        }
      }
    } catch {
      // Ignore errors
    }

    return 'workspace'
  }

  private async installAdditionalPackages(appDir: string): Promise<void> {
    try {
      // Install dependencies
      console.log('Installing dependencies...')
      execSync('npm install react-router @mui/material @emotion/react @emotion/styled @mui/icons-material @reduxjs/toolkit react-redux', {
        cwd: appDir,
        stdio: 'inherit',
      })

      // Install React Router types
      console.log('Installing dev dependencies...')
      execSync('npm install --save-dev @types/react-router @types/react-redux', {
        cwd: appDir,
        stdio: 'inherit',
      })

      console.log('✅ All additional packages installed successfully!')

      // Post-installation configuration
      console.log('\nConfiguring app for monorepo...')
      await this.configureAppForMonorepo(appDir)

    } catch (error) {
      console.warn(`⚠️  Warning: Failed to install some additional packages: ${error}`)
      console.log('You can install them manually later with:')
      console.log('  npm install react-router @mui/material @emotion/react @emotion/styled @mui/icons-material @reduxjs/toolkit react-redux')
      console.log('  npm install --save-dev @types/react-router @types/react-redux')
    }
  }

  private async removeEslintConfig(appDir: string): Promise<void> {
    const eslintConfigPath = join(appDir, 'eslint.config.js')

    if (await fs.pathExists(eslintConfigPath)) {
      await fs.remove(eslintConfigPath)
      console.log('  ✓ Removed eslint.config.js (using monorepo ESLint)')
    }

    // Also remove ESLint from package.json dependencies
    const packageJsonPath = join(appDir, 'package.json')
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath)

      // Remove ESLint related packages from devDependencies
      const eslintPackages = [
        'eslint',
        '@eslint/js',
        'eslint-plugin-react-hooks',
        'eslint-plugin-react-refresh',
        'typescript-eslint',
        'globals'
      ]

      if (packageJson.devDependencies) {
        for (const pkg of eslintPackages) {
          delete packageJson.devDependencies[pkg]
        }
      }

      // Remove lint script
      if (packageJson.scripts && packageJson.scripts.lint) {
        delete packageJson.scripts.lint
      }

      await fs.writeJson(packageJsonPath, packageJson, {spaces: 2})
      console.log('  ✓ Removed ESLint packages from package.json')
    }
  }

  private async replaceSrcWithTemplate(appDir: string): Promise<void> {
    const templateSrcPath = join(__dirname, '..', '..', '..', 'templates', 'react-app', 'src')
    const appSrcPath = join(appDir, 'src')

    if (await fs.pathExists(templateSrcPath)) {
      // Remove existing src folder
      if (await fs.pathExists(appSrcPath)) {
        await fs.remove(appSrcPath)
        console.log('  ✓ Removed existing src folder')
      }

      // Copy template src folder
      await fs.copy(templateSrcPath, appSrcPath)
      console.log('  ✓ Replaced src folder with template version')
    } else {
      console.log('  ⚠ Template src folder not found, keeping existing')
    }
  }

  private async updateTsConfig(appDir: string): Promise<void> {
    const tsConfigPath = join(appDir, 'tsconfig.json')

    if (await fs.pathExists(tsConfigPath)) {
      const newTsConfig = {
        "compilerOptions": {
          "outDir": "./dist"
        },
        "extends": "../../tsconfig.base.json",
        "include": [
          "src/**/*",
          "src/**/*.tsx"
        ],
        "references": []
      }

      await fs.writeJson(tsConfigPath, newTsConfig, {spaces: 2})
      console.log('  ✓ Updated tsconfig.json to extend monorepo base')
    }

    // Update tsconfig.app.json if it exists - handle JSON with comments
    const tsConfigAppPath = join(appDir, 'tsconfig.app.json')
    if (await fs.pathExists(tsConfigAppPath)) {
      try {
        // Read as text first to handle comments
        const tsConfigAppContent = await fs.readFile(tsConfigAppPath, 'utf8')
        // Remove JSON comments and parse
        const cleanedContent = tsConfigAppContent.replaceAll(/\/\*[\s\S]*?\*\//g, '').replaceAll(/\/\/.*$/gm, '')
        const tsConfigApp = JSON.parse(cleanedContent)

        tsConfigApp.extends = '../../tsconfig.base.json'
        await fs.writeJson(tsConfigAppPath, tsConfigApp, {spaces: 2})
        console.log('  ✓ Updated tsconfig.app.json to extend monorepo base')
      } catch {
        console.log('  ⚠ Skipped tsconfig.app.json update due to format issues')
      }
    }
  }

  private async updateTsConfigPaths(monorepoRoot: string, packageName: string, type: 'apps' | 'libs'): Promise<void> {
    const tsConfigBasePath = join(monorepoRoot, 'tsconfig.base.json')

    if (await fs.pathExists(tsConfigBasePath)) {
      const tsConfigBase = await fs.readJson(tsConfigBasePath)

      if (!tsConfigBase.compilerOptions.paths) {
        tsConfigBase.compilerOptions.paths = {}
      }

      // Add alias for the new package
      const aliasKey = `@${packageName}`
      const aliasPath = `./${type}/${packageName}/src`

      tsConfigBase.compilerOptions.paths[aliasKey] = [aliasPath]
      tsConfigBase.compilerOptions.paths[`${aliasKey}/*`] = [`${aliasPath}/*`]

      await fs.writeJson(tsConfigBasePath, tsConfigBase, {spaces: 2})
      console.log(`  ✓ Added alias @${packageName} to tsconfig.base.json`)
    }
  }

  private async updateViteConfigAliases(monorepoRoot: string, packageName: string, type: 'apps' | 'libs'): Promise<void> {
    const viteConfigBasePath = join(monorepoRoot, 'vite.config.base.ts')

    if (await fs.pathExists(viteConfigBasePath)) {
      let viteConfig = await fs.readFile(viteConfigBasePath, 'utf8')

      // Find the appropriate array (apps or libs) and add the new package
      const arrayRegex = new RegExp(`const ${type}: string\\[\\] = \\[(.*?)\\]`, 's')
      const match = viteConfig.match(arrayRegex)

      if (match) {
        const currentPackages = match[1]
          .split(',')
          .map(p => p.trim().replaceAll(/['"]/g, ''))
          .filter(p => p.length > 0)

        if (!currentPackages.includes(packageName)) {
          currentPackages.push(packageName)
          const newPackagesArray = currentPackages.map(p => `'${p}'`).join(', ')
          viteConfig = viteConfig.replace(arrayRegex, `const ${type}: string[] = [${newPackagesArray}]`)

          await fs.writeFile(viteConfigBasePath, viteConfig, 'utf8')
          console.log(`  ✓ Added alias @${packageName} to vite.config.base.ts (${type})`)
        }
      }
    }
  }

  private async updateViteConfigFromTemplate(appDir: string): Promise<void> {
    const templateViteConfigPath = join(__dirname, '..', '..', '..', 'templates', 'react-app', 'vite.config.ts')
    const appViteConfigPath = join(appDir, 'vite.config.ts')

    if (await fs.pathExists(templateViteConfigPath)) {
      await fs.copy(templateViteConfigPath, appViteConfigPath)
      console.log('  ✓ Updated vite.config.ts from template')
    } else {
      console.log('  ⚠ Template vite.config.ts not found, keeping existing')
    }
  }
}
