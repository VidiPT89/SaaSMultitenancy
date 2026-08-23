export const hues = {
  ember: '#ff7a00',
  amber: '#ffaa00',
  paper: '#f4e6c8',
} as const

export type Hue = keyof typeof hues

export function hueFor(value: string): Hue {
  const keys = Object.keys(hues) as Hue[]
  const sum = [...value].reduce((total, char) => total + char.charCodeAt(0), 0)
  return keys[sum % keys.length] ?? 'ember'
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}
