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
    -h, --help           Show help
    -n, --no-nerd-fonts  Don't use nerd font icons
`

const parseArgs = (args: string[]) => {
    if (args.includes('-h') || args.includes('--help')) {
        process.stdout.write(`${help}\n`)
        process.exit(0)
    }

    const noNerdFonts = args.includes('-n') || args.includes('--no-nerd-fonts')
    const [command] = args.filter(
        (arg) => arg !== '-n' && arg !== '--no-nerd-fonts',
    )

    if (!command) return { command: undefined, noNerdFonts }

    switch (command) {
        case 'clean':
        case 'feed':
        case 'medicine':
        case 'new':
        case 'play':
        case 'sleep':
        case 'stop':
            return { command, noNerdFonts }

        default:
            throw new Error(`Unknown command: ${command}`)
    }
}

export const cli = async () => {
    let args
    try {
        args = parseArgs(process.argv.slice(2))
    } catch (error) {
        process.stderr.write(
            `${error instanceof Error ? error.message : String(error)}\n`,
        )
        process.exit(7)
    }
    const { command, noNerdFonts } = args
    const critter = new Critter({ command })
    console.log(`${critter.plain({ noNerdFonts })}\n`)
    if (critter.error) {
        process.stderr.write(`${critter.error}\n`)
        process.exit(1)
    }
}
