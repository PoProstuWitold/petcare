import { useCallback, useEffect, useRef, useState } from 'react'

export function useAsync<T>(
	fn: () => Promise<T>,
	deps: unknown[] = [],
	options: { immediate?: boolean } = { immediate: true }
) {
	const [data, setData] = useState<T | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState<boolean>(options.immediate !== false)
	const mounted = useRef(true)

	const execute = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const result = await fn()
			if (mounted.current) setData(result)
			return result
			// biome-ignore lint: no unnecessary-catch
		} catch (e: any) {
			if (mounted.current) setError(e?.message ?? 'Unexpected error')
			throw e
		} finally {
			if (mounted.current) setLoading(false)
		}
		// biome-ignore lint: no unnecessary-catch
	}, deps)

	useEffect(() => {
		mounted.current = true
		if (options.immediate !== false) {
			void execute()
		}
		return () => {
			mounted.current = false
		}
		// biome-ignore lint: no unnecessary-catch
	}, deps)

	return { data, error, loading, execute }
}
