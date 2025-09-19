import {Args, Command, Flags} from '@oclif/core'

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
    '<%= config.bin %> <%= command.id %> ./',
  ]
static readonly flags = {
    yes: Flags.boolean({
      char: 'y',
      default: false,
      description: 'Skip confirmation prompt',
    }),
  }

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Create)
    const {projectName} = args

    // Import the project creator using the index file
    const {ProjectCreator} = await import('../../lib/creators')
    const creator = new ProjectCreator()

    await creator.createProject(projectName, flags.yes)
  }
}
