import type {
	VetProfile,
	VetScheduleEntry,
	VetTimeOff,
	Visit
} from '../utils/types'

const BASE_URL = '/api'

export async function fetchVets(token: string): Promise<VetProfile[]> {
	const res = await fetch(`${BASE_URL}/vets`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	})

	if (!res.ok) {
		throw new Error('Failed to load vets')
	}

	const data = await res.json()
	return Array.isArray(data) ? data : []
}

export async function fetchVetSchedule(
	vetProfileId: number,
	token: string
): Promise<VetScheduleEntry[]> {
	const res = await fetch(`${BASE_URL}/vets/${vetProfileId}/schedule`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	})

	if (!res.ok) {
		throw new Error('Failed to load vet schedule')
	}

	const data = await res.json()
	return Array.isArray(data) ? data : []
}

export async function fetchVetTimeOff(
	vetProfileId: number,
	token: string
): Promise<VetTimeOff[]> {
	const res = await fetch(`${BASE_URL}/vets/${vetProfileId}/time-off`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	})

	if (!res.ok) {
		throw new Error('Failed to load vet time-off')
	}

	const data = await res.json()
	return Array.isArray(data) ? data : []
}

export async function fetchVisitsForCurrentVet(
	token: string
): Promise<Visit[]> {
	const res = await fetch(`${BASE_URL}/visits/me`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	})

	if (!res.ok) {
		throw new Error('Failed to load vet visits')
	}

	return (await res.json()) as Visit[]
}
