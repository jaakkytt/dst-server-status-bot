export enum SeasonName {
	Spring = 'Spring',
	Summer = 'Summer',
	Autumn = 'Autumn',
	Winter = 'Winter',
}

export enum SeasonIcon {
	Spring = '🌸',
	Summer = '☀️',
	Autumn = '🍂',
	Winter = '❄️',
}

export interface Season {
	name: SeasonName;
	icon: SeasonIcon;
}

export const Spring: Season = {
    name: SeasonName.Spring,
    icon: SeasonIcon.Spring,
}

export const Summer: Season = {
    name: SeasonName.Summer,
    icon: SeasonIcon.Summer,
}

export const Autumn: Season = {
    name: SeasonName.Autumn,
    icon: SeasonIcon.Autumn,
}

export const Winter: Season = {
    name: SeasonName.Winter,
    icon: SeasonIcon.Winter,
}

export interface SeasonState {
	season: Season,
	currentDay: number,
	totalDays: number
}

const seasons: Season[] = [Autumn, Winter, Spring, Summer]

export function getSeasonFrom(name: string): Season {
    const matchingSeason = seasons.find(season => season.name.toLowerCase() === name.toLowerCase())
    if (matchingSeason) {
        return matchingSeason
    }

    console.warn(`Unrecognized season "${name}" encountered, falling back to Autumn`)
    return Autumn
}
