import { useEffect } from 'react'
import { Loader } from '../components/Loader'
import { ProtectedHeader } from '../components/ProtectedHeader'
import { Alert } from '../components/ui/Alert'
import { useAsync } from '../hooks/useAsync'
import { useAuthFetch } from '../hooks/useAuthFetch'

type HealthStatus = {
	timestamp: string
	details?: {
		uptime_ms?: number
		db?: string
	}
	status: string
}

function formatDuration(ms?: number): string {
	if (ms == null) {
		return 'Unknown'
	}

	const totalSeconds = Math.floor(ms / 1000)
	const days = Math.floor(totalSeconds / (24 * 3600))
	const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600)
	const minutes = Math.floor((totalSeconds % 3600) / 60)
	const seconds = totalSeconds % 60

	const parts: string[] = []
	if (days) parts.push(`${days}d`)
	if (hours) parts.push(`${hours}h`)
	if (minutes) parts.push(`${minutes}m`)
	if (seconds || parts.length === 0) parts.push(`${seconds}s`)

	return parts.join(' ')
}

function getStatusColor(status: string): string {
	// Simple mapping for main status badge
	if (status.toUpperCase() === 'UP') {
		return 'bg-emerald-100 text-emerald-800 border-emerald-300'
	}
	if (status.toUpperCase() === 'DOWN') {
		return 'bg-rose-100 text-rose-800 border-rose-300'
	}
	return 'bg-slate-100 text-slate-800 border-slate-300'
}

export function StatusPage() {
	const { json } = useAuthFetch()
	const {
		data: health,
		loading,
		error,
		execute
	} = useAsync<HealthStatus>(
		() => json<HealthStatus>('/api/status/health'),
		[]
	)

	useEffect(() => {
		const id = setInterval(() => {
			void execute()
		}, 15000)
		return () => clearInterval(id)
	}, [execute])

	const status = health?.status ?? 'DOWN'
	const dbStatus = health?.details?.db ?? 'DOWN'
	const uptime = formatDuration(health?.details?.uptime_ms)
	const timestamp = health?.timestamp
		? new Date(health.timestamp).toLocaleString()
		: 'Down'

	return (
		<main className='page-container'>
			<ProtectedHeader
				title='Application Status'
			>
				<span
					className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(
						status
					)}`}
				>
					<span
						className={`h-2 w-2 rounded-full ${
							status.toUpperCase() === 'UP'
								? 'bg-emerald-500'
								: status.toUpperCase() === 'DOWN'
									? 'bg-rose-500'
									: 'bg-slate-400'
						}`}
					/>
					{status.toUpperCase()}
				</span>
			</ProtectedHeader>
			<div className='page-content'>
				{loading && <Loader message='Loading status...' />}
				{error && !loading && <Alert variant='error'>{error}</Alert>}

				{!loading && !error && health && (
					<section className='grid gap-4 sm:grid-cols-3'>
						<article className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
							<h2 className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
								Uptime
							</h2>
							<p className='mt-2 text-lg font-semibold text-slate-900'>
								{uptime}
							</p>
							<p className='mt-1 text-xs text-slate-500'>
								Based on <code>details.uptime_ms</code>
							</p>
						</article>

						<article className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
							<h2 className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
								Database
							</h2>
							<p className='mt-2 text-lg font-semibold text-slate-900'>
								{dbStatus}
							</p>
							<p className='mt-1 text-xs text-slate-500'>
								Value from <code>details.db</code>
							</p>
						</article>

						<article className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
							<h2 className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
								Last check
							</h2>
							<p className='mt-2 text-sm font-medium text-slate-900'>
								{timestamp}
							</p>
							<p className='mt-1 text-xs text-slate-500'>
								Raw: <code>{health.timestamp}</code>
							</p>
						</article>
					</section>
				)}
			</div>
		</main>
	)
}
