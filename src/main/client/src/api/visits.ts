import type { Visit, VisitStatus } from '../utils/types'

const BASE_URL = '/api'

export type CreateVisitPayload = {
	vetProfileId: number
	date: string // YYYY-MM-DD
	startTime: string // HH:mm
	reason?: string
	notes?: string
}

export async function fetchPetVisits(
	petId: number,
	token: string
): Promise<Visit[]> {
	const res = await fetch(`${BASE_URL}/visits/by-pet/${petId}`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	})

	if (!res.ok) {
		throw new Error('Failed to load visits for pet')
	}

	const data = await res.json()
	return Array.isArray(data) ? data : []
}

export async function fetchVetVisitsForDate(
	vetProfileId: number,
	date: string,
	token: string
): Promise<Visit[]> {
	const res = await fetch(
		`${BASE_URL}/visits/by-vet/${vetProfileId}?date=${date}`,
		{
			headers: {
				Authorization: `Bearer ${token}`
			}
		}
	)

	if (!res.ok) {
		throw new Error('Failed to load visits for vet and date')
	}

	const data = await res.json()
	return Array.isArray(data) ? data : []
}

export async function createVisitForPet(
	petId: number,
	payload: CreateVisitPayload,
	token: string
): Promise<Visit> {
	const body = {
		petId,
		vetProfileId: payload.vetProfileId,
		date: payload.date,
		startTime: payload.startTime,
		reason: payload.reason,
		notes: payload.notes
	}

	const res = await fetch(`${BASE_URL}/visits`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify(body)
	})

	if (!res.ok) {
		const text = await res.text()
		throw new Error(
			`Failed to create visit: ${res.status} ${res.statusText} ${text}`
		)
	}

	return (await res.json()) as Visit
}

export async function updateVisitStatus(
	visitId: number,
	status: VisitStatus,
	token: string
): Promise<Visit> {
	const res = await fetch(`/api/visits/${visitId}/status`, {
		method: 'PATCH',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		body: JSON.stringify({ status })
	})

	if (!res.ok) {
		const text = await res.text()
		throw new Error(text || 'Failed to update visit status')
	}

	return (await res.json()) as Visit
}
