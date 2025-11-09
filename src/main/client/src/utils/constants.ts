import type { DayOfWeek, VetSpecialization } from './types'

export const ALL_SPECIALIZATIONS: {
	value: VetSpecialization
	label: string
}[] = [
	{ value: 'GENERAL_PRACTICE', label: 'General Practice' },
	{ value: 'SURGERY', label: 'Surgery' },
	{ value: 'DENTISTRY', label: 'Dentistry' },
	{ value: 'EXOTIC_ANIMALS', label: 'Exotic Animals' },
	{ value: 'DERMATOLOGY', label: 'Dermatology' },
	{ value: 'CARDIOLOGY', label: 'Cardiology' }
]

export const DAY_OPTIONS: { value: DayOfWeek; label: string }[] = [
	{ value: 'MONDAY', label: 'Monday' },
	{ value: 'TUESDAY', label: 'Tuesday' },
	{ value: 'WEDNESDAY', label: 'Wednesday' },
	{ value: 'THURSDAY', label: 'Thursday' },
	{ value: 'FRIDAY', label: 'Friday' },
	{ value: 'SATURDAY', label: 'Saturday' },
	{ value: 'SUNDAY', label: 'Sunday' }
]

export function normalizeTimeForInput(
	value: string | null | undefined
): string {
	if (!value) return ''
	const parts = value.split(':')
	if (parts.length >= 2) {
		return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
	}
	return value
}
