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

export type PageResponse<T> = {
	content: T[]
	totalElements: number
	totalPages: number
	size: number
	number: number
}

export async function fetchPetVisits(
	petId: number,
	token: string,
	page = 0,
	size = 20
): Promise<PageResponse<Visit>> {
	const response = await httpJson<Visit[] | PageResponse<Visit>>(
		`${BASE_URL}/visits/by-pet/${petId}?page=${page}&size=${size}`,
		{
			headers: authHeaders(token)
		}
	)
	// Handle both Page and List responses
	if (Array.isArray(response)) {
		return {
			content: response,
			totalElements: response.length,
			totalPages: 1,
			size: response.length,
			number: 0
		}
	}
	if (response && typeof response === 'object' && 'content' in response) {
		return response as PageResponse<Visit>
	}
	return {
		content: [],
		totalElements: 0,
		totalPages: 0,
		size: 0,
		number: 0
	}
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
