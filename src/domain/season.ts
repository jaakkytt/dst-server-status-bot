export enum Season {
    Spring = '🌸Spring',
    Summer = '☀️Summer',
    Autumn = '🍂Autumn',
    Winter = '❄️Winter',
}

export interface SeasonState {
    season: Season,
    currentDay: number,
    totalDays: number
}

export function findSeason(name: string): Season {
    const match = Object.values(Season).find(
        (value) => value.toLowerCase().endsWith(name.toLowerCase()),
    )
    return match || Season.Autumn
}
