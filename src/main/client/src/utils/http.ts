export interface HttpError extends Error {
	status?: number
	body?: unknown
	code?: string
}

let httpErrorInterceptor: ((err: HttpError) => void) | null = null
let unauthorizedHandler: ((err: HttpError) => void) | null = null
let unauthorizedNotified = false

export function setHttpErrorInterceptor(fn: ((err: HttpError) => void) | null) {
	httpErrorInterceptor = fn
}

export function setUnauthorizedHandler(fn: ((err: HttpError) => void) | null) {
	unauthorizedHandler = fn
	unauthorizedNotified = false
}

async function parseBody(res: Response) {
	const text = await res.text()
	if (!text) return undefined
	try {
		return JSON.parse(text)
	} catch {
		return text
	}
}

function normalizeMessage(status: number, body: unknown): string {
	if (!body) return `Request failed with status ${status}`
	if (typeof body === 'string') return body
	if (typeof body === 'object') {
		// biome-ignore lint: no unnecessary-catch
		const anyBody = body as any
		if (typeof anyBody.message === 'string' && anyBody.message.trim())
			return anyBody.message
		if (typeof anyBody.error === 'string' && anyBody.error.trim())
			return anyBody.error
	}
	return `Request failed with status ${status}`
}

export async function httpJson<T>(
	input: RequestInfo | URL,
	init: RequestInit = {}
): Promise<T> {
	const res = await fetch(input, init)
	if (!res.ok) {
		const body = await parseBody(res)
		const err: HttpError = new Error(normalizeMessage(res.status, body))
		err.status = res.status
		err.body = body

		if (res.status === 401 || res.status === 403) {
			if (!unauthorizedNotified) {
				unauthorizedNotified = true
				try {
					unauthorizedHandler?.(err)
				} catch {}
			}
			throw err
		}

		try {
			httpErrorInterceptor?.(err)
		} catch {}
		throw err
	}

	// Success path: allow empty bodies (e.g., 204 No Content) without JSON.parse
	if (res.status === 204 || res.status === 205) {
		return undefined as T
	}
	const text = await res.text()
	if (!text) {
		return undefined as T
	}
	try {
		return JSON.parse(text) as T
	} catch {
		// As a fallback, return raw text
		return text as unknown as T
	}
}

export function authHeaders(token?: string): HeadersInit {
	return {
		'Content-Type': 'application/json',
		...(token ? { Authorization: `Bearer ${token}` } : {})
	}
}
