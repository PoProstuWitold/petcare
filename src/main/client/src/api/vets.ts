import { authHeaders, httpJson } from '../utils/http'
import type {
	VetProfile,
	VetScheduleEntry,
	VetTimeOff,
	Visit
} from '../utils/types'

const BASE_URL = '/api'

export async function fetchVets(token: string): Promise<VetProfile[]> {
	return httpJson<VetProfile[]>(`${BASE_URL}/vets`, {
		headers: authHeaders(token)
	})
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
	return httpJson<Visit[]>(`${BASE_URL}/visits/me`, {
		headers: authHeaders(token)
	})
}
