import { Critter } from './critter.ts'
const help = `
Usage: critter [options] <action> [name]

Actions:
    new <name>
feed
clean

Options:
    -h, --help       Show help
`

const parseArgs = (args: string[]) => {
    if (args.includes('-h') || args.includes('--help')) {
        console.log(help)
        process.exit(0)
    }

    const [action, name, ...rest] = args

    if (!action) return { action: undefined, name: undefined }

    switch (action) {
    case 'new':
        if (!name) throw new Error('Missing name for action: new')
            if (rest.length) throw new Error(`Unexpected argument: ${rest[0]}`)
            return { action, name }

    case 'feed':
        case 'clean':
        if (name) throw new Error(`Unexpected argument: ${name}`)
            return { action, name: undefined }

    default:
        throw new Error(`Unknown action: ${action}`)
    }
}

export const cli = async () => {
    const args = parseArgs(process.argv.slice(2))
    console.log(args)
    const critter = new Critter({})
    // await saveState(critter)
    console.log(critter.state())
}
