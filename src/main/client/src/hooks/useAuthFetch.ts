import { useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { authHeaders, httpJson } from '../utils/http'

export function useAuthFetch() {
	const { accessToken } = useAuth()

	const json = useCallback(
		async <T>(input: RequestInfo | URL, init: RequestInit = {}) => {
			const merged: RequestInit = {
				...init,
				headers: {
					...authHeaders(accessToken || undefined),
					...(init.headers || {})
				}
			}
			return httpJson<T>(input, merged)
		},
		[accessToken]
	)

	return { json }
}
