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

type PageResponse<T> = {
	content: T[]
	totalElements: number
	totalPages: number
	size: number
	number: number
}

export async function fetchPetVisits(
	petId: number,
	token: string
): Promise<Visit[]> {
	const response = await httpJson<Visit[] | PageResponse<Visit>>(
		`${BASE_URL}/visits/by-pet/${petId}`,
		{
			headers: authHeaders(token)
		}
	)
	// Handle both Page and List responses
	if (Array.isArray(response)) {
		return response
	}
	if (response && typeof response === 'object' && 'content' in response) {
		return (response as PageResponse<Visit>).content || []
	}
	return []
}

export async function fetchVetVisitsForDate(
	vetProfileId: number,
	date: string,
	token: string
): Promise<Visit[]> {
	const response = await httpJson<Visit[] | PageResponse<Visit>>(
		`${BASE_URL}/visits/by-vet/${vetProfileId}?date=${date}`,
		{
			headers: authHeaders(token)
		}
	)
	// Handle both Page and List responses
	if (Array.isArray(response)) {
		return response
	}
	if (response && typeof response === 'object' && 'content' in response) {
		return (response as PageResponse<Visit>).content || []
	}
	return []
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
