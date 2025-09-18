import {Args, Command, Flags} from '@oclif/core'
import * as fs from 'fs-extra'
import {join} from 'node:path'
import prompts from 'prompts'

export default class Create extends Command {
  static readonly args = {
    projectName: Args.string({
      description: 'Name of the new project',
      required: true,
    }),
  }
static readonly description = 'Create a new TypeScript monorepo project'
static readonly examples = [
    '<%= config.bin %> <%= command.id %> my-project',
  ]
static readonly flags = {
    yes: Flags.boolean({
      char: 'y',
      default: false,
      description: 'Skip confirmation prompt',
    }),
  }
private readonly templatesDir = join(__dirname, '..', '..', 'templates', 'project-base')

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Create)
    const {projectName} = args

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
        if (!flags.yes) {
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
            this.log('Operation cancelled.')
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

        this.log('Directory contents cleared.')
      }
    } else if (!isCurrentDir && // Only ask for confirmation for new directories (if not using -y flag)
      !flags.yes) {
        const response = await prompts({
          initial: true,
          message: `Create new project "${projectName}" in ${targetDir}?`,
          name: 'value',
          type: 'confirm',
        })

        if (!response.value) {
          this.log('Operation cancelled.')
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

      this.log(`✅ Successfully created project in ${displayName}`)

      if (isCurrentDir) {
        this.log('\nNext steps:')
        this.log('  npm install')
        this.log('  npm run build')
      } else {
        this.log('\nNext steps:')
        this.log(`  cd ${projectName}`)
        this.log('  npm install')
        this.log('  npm run build')
      }
    } catch (error) {
      this.error(`Failed to create project: ${error}`)
    }
  }
}
