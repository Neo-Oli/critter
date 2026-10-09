import { Critter } from './critter.ts'
const help = `
Usage: critter [options] <command>

Actions:
new
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

    const [command] = args

    if (!command) return { command: undefined }

    switch (command) {
        case 'new':
        case 'feed':
        case 'medicine':
        case 'clean':
        case 'play':
        case 'sleep':
        case 'stop':
            return { command }

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
    const { command } = args
    const critter = new Critter({ command })
    console.log(critter.state())
    if (critter.error) {
        console.error(critter.error)
        process.exit(1)
    }
}
