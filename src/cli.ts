import { Critter } from './critter.ts'
const help = `
critter - a terminal pet

Usage: critter [options] [command]

With no command, show your critter's current state.

Commands:
    new       Create a new critter, replacing your current pet
    feed      Give it a meal
    clean     Wash it and stop health loss from dirtiness
    medicine  Restore health; it still needs food and cleaning
    play      Cheer it up; playing while tired is less effective
    sleep     Let it rest for two hours
    stop      Stop the current action
    dismiss   Dismiss the current alert

Options:
    -h, --help           Show this help and exit
    -n, --no-nerd-fonts  Use Unicode icons instead of Nerd Font icons
    -d, --debug           Show exact stat values
    -s, --short           Show only the current state
    -q, --quiet           Suppress all output

Daily care: about four meals, two sleeps, and three plays; clean whenever poo appears.

Examples:
    critter new
    critter
    critter -n feed
    critter -d
`

const parseArgs = (args: string[]) => {
    const quiet = args.some((arg) => ['--quiet', '-q'].includes(arg))
    if (args.some((arg) => ['--help', '-h'].includes(arg))) {
        if (!quiet) process.stdout.write(`${help}\n`)
        process.exit(0)
    }

    const noNerdFonts = args.some((arg) =>
        ['--no-nerd-fonts', '-n'].includes(arg),
    )
    const debug = args.some((arg) => ['--debug', '-d'].includes(arg))
    const shortOutput = args.some((arg) => ['--short', '-s'].includes(arg))
    const [command] = args.filter(
        (arg) =>
            ![
                '--debug',
                '--no-nerd-fonts',
                '--quiet',
                '--short',
                '-d',
                '-n',
                '-q',
                '-s',
            ].includes(arg),
    )

    if (!command)
        return { command: undefined, debug, noNerdFonts, quiet, shortOutput }

    switch (command) {
        case 'clean':
        case 'dismiss':
        case 'feed':
        case 'medicine':
        case 'new':
        case 'play':
        case 'sleep':
        case 'stop':
            return { command, debug, noNerdFonts, quiet, shortOutput }

        default:
            throw new Error(`Unknown command: ${command}`)
    }
}

export const cli = async () => {
    const argv = process.argv.slice(2)
    const quiet = argv.some((arg) => ['--quiet', '-q'].includes(arg))
    let args
    try {
        args = parseArgs(argv)
    } catch (error) {
        if (!quiet)
            process.stderr.write(
                `${error instanceof Error ? error.message : String(error)}\n`,
            )
        process.exit(7)
    }
    const {
        command,
        debug,
        noNerdFonts,
        quiet: quietOutput,
        shortOutput,
    } = args
    const critter = new Critter({ command })
    if (critter.error) {
        if (!quietOutput) process.stderr.write(`${critter.error}\n`)
        process.exit(1)
    }
    if (quietOutput) return
    if (shortOutput) {
        console.log(`${critter.short({ noNerdFonts })}\n`)
    } else {
        console.log(`${critter.plain({ debug, noNerdFonts })}\n`)
    }
}
