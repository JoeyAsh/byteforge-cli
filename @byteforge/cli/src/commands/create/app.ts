import {Args, Command} from '@oclif/core'

export default class CreateApp extends Command {
  static readonly args = {
    appName: Args.string({
      description: 'Name of the new app',
      required: true,
    }),
  }
static readonly description = 'Create a new React app in the apps directory using Vite + TypeScript'
static readonly examples = [
    '<%= config.bin %> <%= command.id %> my-react-app',
  ]
static readonly flags = {
    // No flags needed for app creation since it has its own workflow
  }

  public async run(): Promise<void> {
    const {args} = await this.parse(CreateApp)
    const {appName} = args

    // Import the app creator using the index file
    const {AppCreator} = await import('../../lib/creators')
    const creator = new AppCreator()

    await creator.createApp(appName)
  }
}
