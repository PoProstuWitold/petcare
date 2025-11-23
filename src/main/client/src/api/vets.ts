import { authHeaders, httpJson } from '../utils/http'
import type {
	VetProfile,
	VetScheduleEntry,
	VetTimeOff,
	Visit
} from '../utils/types'

const BASE_URL = '/api'

type PageResponse<T> = {
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
	token: string
): Promise<Visit[]> {
	const response = await httpJson<Visit[] | PageResponse<Visit>>(
		`${BASE_URL}/visits/me`,
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
