import { authHeaders, httpJson } from '../utils/http'
import type { MedicalRecord, MedicalRecordForm } from '../utils/types'

const BASE_URL = '/api/medical-records'

export type PageResponse<T> = {
	content: T[]
	totalElements: number
	totalPages: number
	size: number
	number: number
}

export async function fetchMedicalRecordsForPet(
	petId: number,
	token: string,
	page = 0,
	size = 20
): Promise<PageResponse<MedicalRecord>> {
	const response = await httpJson<
		MedicalRecord[] | PageResponse<MedicalRecord>
	>(`${BASE_URL}/by-pet/${petId}?page=${page}&size=${size}`, {
		headers: authHeaders(token)
	})
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
		return response as PageResponse<MedicalRecord>
	}
	return {
		content: [],
		totalElements: 0,
		totalPages: 0,
		size: 0,
		number: 0
	}
}

export async function createMedicalRecord(
	payload: MedicalRecordForm,
	token: string
): Promise<MedicalRecord> {
	return httpJson<MedicalRecord>(`${BASE_URL}`, {
		method: 'POST',
		headers: authHeaders(token),
		body: JSON.stringify(payload)
	})
}

export async function fetchMedicalRecordsForCurrentVet(
	token: string,
	page = 0,
	size = 20
): Promise<PageResponse<MedicalRecord>> {
	const response = await httpJson<
		MedicalRecord[] | PageResponse<MedicalRecord>
	>(`${BASE_URL}/me?page=${page}&size=${size}`, {
		headers: authHeaders(token)
	})
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
		return response as PageResponse<MedicalRecord>
	}
	return {
		content: [],
		totalElements: 0,
		totalPages: 0,
		size: 0,
		number: 0
	}
}

export async function fetchMedicalRecordByVisit(
	visitId: number,
	token: string
): Promise<MedicalRecord | null> {
	try {
		return await httpJson<MedicalRecord>(
			`${BASE_URL}/by-visit/${visitId}`,
			{
				headers: authHeaders(token)
			}
		)
	} catch (_e) {
		return null
	}
}
