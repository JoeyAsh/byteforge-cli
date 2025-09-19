import * as fs from 'fs-extra'
import {join} from 'node:path'
import prompts from 'prompts'

export class ProjectCreator {
  private readonly templatesDir = join(__dirname, '..', '..', '..', 'templates', 'project-base')

  public async createProject(projectName: string, skipConfirmation: boolean): Promise<void> {
    // Handle current directory case
    const isCurrentDir = projectName === './' || projectName === '.'
    const targetDir = isCurrentDir ? process.cwd() : join(process.cwd(), projectName)
    const displayName = isCurrentDir ? 'current directory' : projectName

    // Check if target directory exists and handle accordingly
    const targetExists = await fs.pathExists(targetDir)

    if (targetExists) {
      const files = await fs.readdir(targetDir)
      const filteredFiles = files.filter(file => !file.startsWith('.git') && file !== '.gitignore')

      if (filteredFiles.length > 0) {
        if (!skipConfirmation) {
          const message = isCurrentDir
            ? `Current directory is not empty. Delete all contents and initialize project?`
            : `Directory "${projectName}" is not empty. Delete all contents and initialize project?`

          const response = await prompts({
            initial: false,
            message,
            name: 'value',
            type: 'confirm',
          })

          if (!response.value) {
            console.log('Operation cancelled.')
            return
          }
        }

        // Delete all contents except .git and .gitignore
        await Promise.all(
          filteredFiles.map(async file => {
            const filePath = join(targetDir, file)
            await fs.remove(filePath)
          })
        )

        console.log('Directory contents cleared.')
      }
    } else if (!isCurrentDir && !skipConfirmation) {
      const response = await prompts({
        initial: true,
        message: `Create new project "${projectName}" in ${targetDir}?`,
        name: 'value',
        type: 'confirm',
      })

      if (!response.value) {
        console.log('Operation cancelled.')
        return
      }
    }

    try {
      // Create target directory (only if not current dir)
      if (!isCurrentDir) {
        await fs.ensureDir(targetDir)
      }

      // Copy template content
      await fs.copy(this.templatesDir, targetDir)

      // Update package.json with the project name
      const packageJsonPath = join(targetDir, 'package.json')
      if (await fs.pathExists(packageJsonPath)) {
        const packageJson = await fs.readJson(packageJsonPath)

        if (isCurrentDir) {
          // For current directory, use the folder name
          const currentDirName = process.cwd().split(/[/\\]/).pop() || 'my-project'
          packageJson.name = currentDirName.toLowerCase().replaceAll(/\s+/g, '-')
        } else {
          packageJson.name = projectName.toLowerCase().replaceAll(/\s+/g, '-')
        }

        await fs.writeJson(packageJsonPath, packageJson, {spaces: 2})
      }

      console.log(`✅ Successfully created project in ${displayName}`)

      if (isCurrentDir) {
        console.log('\nNext steps:')
        console.log('  npm install')
        console.log('  npm run build')
      } else {
        console.log('\nNext steps:')
        console.log(`  cd ${projectName}`)
        console.log('  npm install')
        console.log('  npm run build')
      }
    } catch (error) {
      throw new Error(`Failed to create project: ${error}`)
    }
  }
}
