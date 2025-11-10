import { authHeaders, httpJson } from '../utils/http'
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
	return httpJson<Visit[]>(`${BASE_URL}/visits/by-pet/${petId}`, {
		headers: authHeaders(token)
	})
}

export async function fetchVetVisitsForDate(
	vetProfileId: number,
	date: string,
	token: string
): Promise<Visit[]> {
	return httpJson<Visit[]>(
		`${BASE_URL}/visits/by-vet/${vetProfileId}?date=${date}`,
		{
			headers: authHeaders(token)
		}
	)
}

export async function createVisitForPet(
	petId: number,
	payload: CreateVisitPayload,
	token: string
): Promise<Visit> {
	return httpJson<Visit>(`${BASE_URL}/visits`, {
		method: 'POST',
		headers: authHeaders(token),
		body: JSON.stringify({ ...payload, petId })
	})
}

export async function updateVisitStatus(
	visitId: number,
	status: VisitStatus,
	token: string
): Promise<Visit> {
	return httpJson<Visit>(`${BASE_URL}/visits/${visitId}/status`, {
		method: 'PATCH',
		headers: authHeaders(token),
		body: JSON.stringify({ status })
	})
}
