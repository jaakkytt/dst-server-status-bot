export interface Player {
	username: string;
	character: string;
}

export function formatCharacterName(name: string) {
    if (name.toLowerCase() === 'wx-78') {
        return name.toUpperCase()
    }
    return name.charAt(0).toUpperCase() + name.slice(1)
}
