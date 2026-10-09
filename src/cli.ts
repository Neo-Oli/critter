import { Critter } from './critter.ts'
const help = `
Usage: critter [options] <command> [name]

Actions:
    new <name>
feed
clean
medicine
play
sleep
stop


Options:
    -h, --help       Show help
`

const parseArgs = (args: string[]) => {
    if (args.includes('-h') || args.includes('--help')) {
        console.log(help)
        process.exit(0)
    }

    const [command, name, ...rest] = args

    if (!command) return { command: undefined, name: undefined }

    switch (command) {
        case 'new':
            if (!name) throw new Error('Missing name for command: new')
            if (rest.length) throw new Error(`Unexpected argument: ${rest[0]}`)
            return { command, name }

        case 'feed':
        case 'medicine':
        case 'clean':
        case 'play':
        case 'sleep':
        case 'stop':
            if (name) throw new Error(`Unexpected argument: ${name}`)
            return { command, name: undefined }

        default:
            throw new Error(`Unknown command: ${command}`)
    }
}

export const cli = async () => {
    let args
    try {
        args = parseArgs(process.argv.slice(2))
    } catch (error) {
        console.error(error instanceof Error ? error.message : String(error))
        process.exit(7)
    }
    const { command, name } = args
    const critter = new Critter({ name, command })
    console.log(critter.state())
    if (critter.error) {
        console.error(critter.error)
        process.exit(1)
    }
}
