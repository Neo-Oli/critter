import { Critter } from './critter.ts'
const help = `
critter - a terminal pet

Usage: critter [options] [command]

With no command, show your critter's current state.

Commands:
    new       Create a new critter, replacing your current pet
    feed      Give it a meal; feeding when full can make it stuffed
    clean     Wash it and stop health loss from dirtiness
    medicine  Restore health; it still needs food and cleaning
    play      Cheer it up; playing while tired is less effective
    sleep     Let it rest for two hours
    stop      Stop the current action

Options:
    -h, --help           Show this help and exit
    -n, --no-nerd-fonts  Use Unicode icons instead of Nerd Font icons

Daily care: about four meals, two sleeps, three plays, and one cleaning.

Examples:
    critter new
    critter
    critter -n feed
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
