export const now = () => Math.round(Date.now() / 1000)
export const minute = 60
export const hour = minute * 60
export const day = hour * 24
export const duration = (seconds: number) => {
    const units = [
        ['year', 31536000],
        ['day', 86400],
        ['hour', 3600],
        ['minute', 60],
        ['second', 1],
    ] as const

    const [unit, size] = units.find(([, size]) => seconds >= size) ?? units[4]
    const count = Math.floor(seconds / size)

    return `${count} ${unit}${count === 1 ? '' : 's'}`
}
