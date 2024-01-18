export enum Phase {
    Day = '☀️Day',
    Dusk = '🌄Dusk',
    Night = '🌙Night',
}

export function findPhase(name: string): Phase {
    const match = Object.values(Phase).find(
        (value) => value.toLowerCase().endsWith(name.toLowerCase()),
    )
    return match || Phase.Day
}
