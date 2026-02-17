import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combine multiple class values into a single Tailwind-merged class string.
 *
 * @param inputs - One or more `clsx`-compatible class values (strings, arrays, objects, etc.)
 * @returns A single class string with classes combined and Tailwind utility classes merged/deduplicated
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}