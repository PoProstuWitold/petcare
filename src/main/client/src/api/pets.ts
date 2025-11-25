import { authHeaders, httpJson } from '../utils/http'
import type { Pet } from '../utils/types'

const BASE_URL = '/api/pets'

export type PageResponse<T> = {
	content: T[]
	totalElements: number
	totalPages: number
	size: number
	number: number
}

export async function fetchPetsByOwner(
	ownerId: number,
	token: string,
	page = 0,
	size = 4
): Promise<PageResponse<Pet>> {
	const response = await httpJson<Pet[] | PageResponse<Pet>>(
		`${BASE_URL}/owner/${ownerId}?page=${page}&size=${size}`,
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
		return response as PageResponse<Pet>
	}
	return {
		content: [],
		totalElements: 0,
		totalPages: 0,
		size: 0,
		number: 0
	}
}
