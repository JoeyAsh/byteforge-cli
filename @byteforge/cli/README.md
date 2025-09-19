@byteforge/cli
=================

A powerful CLI for creating TypeScript monorepo projects with modern tooling


[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@byteforge/cli.svg)](https://npmjs.org/package/@byteforge/cli)
[![Downloads/week](https://img.shields.io/npm/dw/@byteforge/cli.svg)](https://npmjs.org/package/@byteforge/cli)

## Features

- 🚀 **Modern TypeScript Monorepo** - Create scalable monorepo projects with shared configurations
- ⚛️ **React Apps with Latest Stack** - Vite + React + TypeScript + React Router v7
- 🎨 **Material-UI Integration** - Pre-configured MUI with theming support
- 🗃️ **Redux Toolkit** - State management with modern Redux patterns
- 🔄 **Automatic Alias Management** - TypeScript and Vite path aliases auto-configured
- 📦 **Workspace Management** - Apps and libs with shared tooling (ESLint, TypeScript)
- 🛠️ **Developer Experience** - Hot reload, optimized builds, and comprehensive tooling

<!-- toc -->
* [Usage](#usage)
* [Quick Start](#quick-start)
* [Commands](#commands)
<!-- tocstop -->

# Usage
<!-- usage -->
```sh-session
$ npm install -g @byteforge/cli
$ bforge COMMAND
running command...
$ bforge (--version)
@byteforge/cli/0.0.0 win32-x64 node-v18.0.0
$ bforge --help [COMMAND]
USAGE
  $ bforge COMMAND
...
```
<!-- usagestop -->

# Quick Start

## Create a new monorepo project

```bash
# Create a new monorepo project
bforge create my-project

# Or create in current directory
bforge create ./
```

## Add a React app to your monorepo

```bash
# Navigate to your monorepo root
cd my-project

# Create a new React app with full stack
bforge create:app my-react-app
```

This automatically sets up:
- ⚛️ React 19 + TypeScript
- 🚀 Vite for fast development and builds
- 🎨 Material-UI v7 with theming
- 🗃️ Redux Toolkit v2 for state management
- 🧭 React Router v7 with Data API
- 🔧 ESLint integration with monorepo
- 📁 TypeScript path aliases (`@my-react-app/*`)

# Commands
<!-- commands -->
* [`bforge create PROJECTNAME`](#bforge-create-projectname)
* [`bforge create:app APPNAME`](#bforge-createapp-appname)
* [`bforge help [COMMAND]`](#bforge-help-command)

## `bforge create PROJECTNAME`

Create a new TypeScript monorepo project

```
USAGE
  $ bforge create PROJECTNAME [-y]

ARGUMENTS
  PROJECTNAME  Name of the new project

FLAGS
  -y, --yes  Skip confirmation prompt

DESCRIPTION
  Create a new TypeScript monorepo project with shared configurations for ESLint, TypeScript, and Vite.
  
  The generated project includes:
  - Workspace configuration for apps and libs
  - Shared TypeScript configuration (tsconfig.base.json)
  - Shared Vite configuration (vite.config.base.ts) 
  - ESLint configuration for the entire monorepo
  - Ready-to-use folder structure (apps/, libs/)

EXAMPLES
  $ bforge create my-awesome-project

  $ bforge create ./

  $ bforge create my-project --yes
```

## `bforge create:app APPNAME`

Create a new React app in the apps directory using Vite + React + TypeScript

```
USAGE
  $ bforge create:app APPNAME

ARGUMENTS
  APPNAME  Name of the new app

DESCRIPTION
  Create a new React app with modern tooling in an existing monorepo.
  
  This command must be run from the root of a monorepo project.
  
  The generated app includes:
  - React 19 + TypeScript setup
  - Vite for fast development and optimized builds  
  - Material-UI v7 with custom theme support
  - Redux Toolkit v2 for state management
  - React Router v7 with Data API
  - Pre-configured folder structure (pages/, routes/, store/, theme/)
  - Automatic TypeScript and Vite alias configuration
  - Integration with monorepo ESLint configuration

EXAMPLES
  $ bforge create:app my-dashboard
  
  $ bforge create:app user-portal
```

## `bforge help [COMMAND]`

Display help for bforge.

```
USAGE
  $ bforge help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for bforge.
```
<!-- commandsstop -->

## Project Structure

### Generated Monorepo Structure

```
my-project/
├── apps/                    # Application packages
│   └── my-app/
│       ├── src/
│       │   ├── pages/       # Page components
│       │   ├── routes/      # Router configuration  
│       │   ├── store/       # Redux store & slices
│       │   ├── theme/       # MUI theme configuration
│       │   ├── main.tsx     # App entry point
│       │   └── App.tsx      # Provider setup
│       ├── package.json     # App-specific dependencies
│       └── vite.config.ts   # Extends monorepo base
├── libs/                    # Shared library packages
├── package.json             # Workspace configuration
├── tsconfig.base.json       # Shared TypeScript config
├── vite.config.base.ts      # Shared Vite config  
└── eslint.config.mjs        # Monorepo ESLint config
```

### Generated React App Features

Each React app created with `bforge create:app` includes:

- **🏗️ Modern Architecture**: Clean separation of concerns with dedicated folders
- **🎨 UI Components**: Material-UI v7 with custom theming support
- **🗃️ State Management**: Redux Toolkit store with TypeScript support
- **🧭 Routing**: React Router v7 with Data API and type-safe routing
- **⚡ Fast Development**: Vite HMR with optimized dependency pre-bundling
- **🔧 Type Safety**: Full TypeScript support with path aliases
- **📦 Monorepo Integration**: Shared tooling and configurations

## Development Workflow

```bash
# Create a new monorepo
bforge create my-workspace
cd my-workspace

# Install dependencies
npm install

# Create multiple apps
bforge create:app admin-dashboard  
bforge create:app customer-portal
bforge create:app marketing-site

# Start development
cd apps/admin-dashboard
npm run dev
```

## Requirements

- Node.js 18.0.0 or higher
- npm 7.0.0 or higher (for workspace support)

## License

MIT
