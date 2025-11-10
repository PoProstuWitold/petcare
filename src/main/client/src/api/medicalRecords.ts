import { authHeaders, httpJson } from '../utils/http'
import type { MedicalRecord, MedicalRecordForm } from '../utils/types'

const BASE_URL = '/api/medical-records'

export async function fetchMedicalRecordsForPet(
	petId: number,
	token: string
): Promise<MedicalRecord[]> {
	return httpJson<MedicalRecord[]>(`${BASE_URL}/by-pet/${petId}`, {
		headers: authHeaders(token)
	})
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
	token: string
): Promise<MedicalRecord[]> {
	return httpJson<MedicalRecord[]>(`${BASE_URL}/me`, {
		headers: authHeaders(token)
	})
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
