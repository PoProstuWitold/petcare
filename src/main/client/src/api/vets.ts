import { authHeaders, httpJson } from '../utils/http'
import type {
	VetProfile,
	VetScheduleEntry,
	VetTimeOff,
	Visit
} from '../utils/types'

const BASE_URL = '/api'

export type PageResponse<T> = {
	content: T[]
	totalElements: number
	totalPages: number
	size: number
	number: number
}

export async function fetchVets(token: string): Promise<VetProfile[]> {
	const response = await httpJson<VetProfile[] | PageResponse<VetProfile>>(
		`${BASE_URL}/vets`,
		{
			headers: authHeaders(token)
		}
	)
	// Handle both Page and List responses
	if (Array.isArray(response)) {
		return response
	}
	if (response && typeof response === 'object' && 'content' in response) {
		return (response as PageResponse<VetProfile>).content || []
	}
	return []
}

export async function fetchVetSchedule(
	vetProfileId: number,
	token: string
): Promise<VetScheduleEntry[]> {
	return httpJson<VetScheduleEntry[]>(
		`${BASE_URL}/vets/${vetProfileId}/schedule`,
		{ headers: authHeaders(token) }
	)
}

export async function fetchVetTimeOff(
	vetProfileId: number,
	token: string
): Promise<VetTimeOff[]> {
	return httpJson<VetTimeOff[]>(`${BASE_URL}/vets/${vetProfileId}/time-off`, {
		headers: authHeaders(token)
	})
}

export async function fetchVisitsForCurrentVet(
	token: string,
	page = 0,
	size = 20
): Promise<PageResponse<Visit>> {
	const response = await httpJson<Visit[] | PageResponse<Visit>>(
		`${BASE_URL}/visits/me?page=${page}&size=${size}`,
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
