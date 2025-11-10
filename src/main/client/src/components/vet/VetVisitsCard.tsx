import { useEffect, useMemo, useState } from 'react'
import { fetchVisitsForCurrentVet } from '../../api/vets'
import { updateVisitStatus } from '../../api/visits'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import type { Visit, VisitStatus } from '../../utils/types'
import { Alert } from '../ui/Alert'
import { VisitCard } from '../VisitCard'

function compareDateTime(a: Visit, b: Visit): number {
	const aKey = `${a.date}T${a.startTime}`
	const bKey = `${b.date}T${b.startTime}`
	return aKey.localeCompare(bKey)
}

export function VetVisitsCard() {
	const { accessToken } = useAuth()
	const token = accessToken
	const { data, loading, error, execute } = useAsync<Visit[]>(
		() => (token ? fetchVisitsForCurrentVet(token) : Promise.resolve([])),
		[token]
	)
	const [visits, setVisits] = useState<Visit[]>([])
	useEffect(() => {
		setVisits(data ?? [])
	}, [data])
	const [_savingId, setSavingId] = useState<number | null>(null)

	const handleStatusChange = async (visit: Visit, newStatus: VisitStatus) => {
		if (!token) return
		setSavingId(visit.id)
		try {
			const updated = await updateVisitStatus(visit.id, newStatus, token)
			setVisits((prev) =>
				prev.map((v) => (v.id === updated.id ? updated : v))
			)
			// biome-ignore lint: no unnecessary-catch
		} catch (_e: any) {
			// rely on Alert below by triggering a reload for consistency
			await execute().catch(() => {})
		} finally {
			setSavingId(null)
		}
	}

	const { upcoming, past } = useMemo(() => {
		const sorted = [...visits].sort(compareDateTime)

		const today = new Date()
		today.setHours(0, 0, 0, 0)

		const upcoming: Visit[] = []
		const past: Visit[] = []

		for (const v of sorted) {
			const d = new Date(`${v.date}T00:00:00`)
			if (d >= today) {
				upcoming.push(v)
			} else {
				past.push(v)
			}
		}

		return { upcoming, past }
	}, [visits])

	return (
		<section className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6'>
			<h2 className='text-lg font-semibold text-slate-900'>Visits</h2>
			<p className='mt-1 text-sm text-slate-600'>
				Manage your upcoming and past vet visits.
			</p>

			{loading && (
				<p className='mt-4 text-sm text-slate-600'>Loading visits...</p>
			)}

			{!loading && error && (
				<Alert variant='error' className='mt-4'>
					{error}
				</Alert>
			)}

			{!loading && !error && visits.length === 0 && (
				<p className='mt-4 text-sm text-slate-600'>
					No visits booked yet.
				</p>
			)}

			{!loading && !error && visits.length > 0 && (
				<div className='flex flex-col gap-4 my-3'>
					{upcoming.length > 0 && (
						<div className='flex flex-col gap-4'>
							<p className='text-xs font-semibold uppercase tracking-wide text-emerald-700'>
								Upcoming
							</p>
							{upcoming.map((visit) => (
								<VisitCard
									key={visit.id}
									visit={visit}
									enableStatusEditing
									onStatusChangeRequest={(status) =>
										handleStatusChange(visit, status)
									}
									onCreateMedicalRecord={() => {
										window.location.href = `/vet/medical-records/new?visitId=${visit.id}`
									}}
									onViewPetDetails={() => {
										if (visit.pet?.id) {
											window.location.href = `/pets/${visit.pet.id}`
										}
									}}
								/>
							))}
						</div>
					)}

					{past.length > 0 && (
						<div className='flex flex-col gap-4 my-3'>
							<p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
								Past
							</p>
							{past.map((visit) => (
								<VisitCard
									key={visit.id}
									title='Past visit'
									visit={visit}
									enableStatusEditing
									onStatusChangeRequest={(status) =>
										handleStatusChange(visit, status)
									}
									onCreateMedicalRecord={() => {
										window.location.href = `/vet/medical-records/new?visitId=${visit.id}`
									}}
									onViewPetDetails={() => {
										if (visit.pet?.id) {
											window.location.href = `/pets/${visit.pet.id}`
										}
									}}
								/>
							))}
						</div>
					)}
				</div>
			)}
		</section>
	)
}
