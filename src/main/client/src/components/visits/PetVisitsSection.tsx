import { useEffect, useState } from 'react'
import { fetchPetVisits } from '../../api/visits'
import { useAuth } from '../../context/AuthContext'
import type { Pet, Visit } from '../../utils/types'
import { VisitCard } from '../VisitCard'

type PetVisitsSectionProps = {
	pet: Pet
}

export function PetVisitsSection({ pet }: PetVisitsSectionProps) {
	const { accessToken } = useAuth()
	const [visits, setVisits] = useState<Visit[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [expanded, setExpanded] = useState(false)

	const token = accessToken

	useEffect(() => {
		if (!token) return

		;(async () => {
			setLoading(true)
			setError(null)
			try {
				const data = await fetchPetVisits(pet.id, token)
				setVisits(data)
			} catch (e) {
				console.error(e)
				setError('Could not load visits for this pet')
			} finally {
				setLoading(false)
			}
		})()
	}, [token, pet.id])

	const visitCount = visits.length

	const sortedVisits = [...visits].sort((a, b) => {
		const aKey = `${a.date}T${a.startTime}`
		const bKey = `${b.date}T${b.startTime}`
		return aKey.localeCompare(bKey)
	})

	return (
		<div className='text-sm'>
			<div className='mb-2 flex items-center justify-between gap-2'>
				<h3 className='text-sm font-semibold uppercase tracking-wide text-slate-700'>
					Visits
				</h3>
				<span className='rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-700'>
					{loading ? 'Loading…' : `${visitCount} total`}
				</span>
			</div>

			{error && <p className='text-sm text-red-600'>{error}</p>}

			{!loading && !error && visitCount === 0 && (
				<p className='text-sm text-slate-500'>
					No visits for this pet yet.
				</p>
			)}

			{!loading && !error && visitCount > 0 && (
				<>
					<button
						type='button'
						onClick={() => setExpanded((v) => !v)}
						className='mt-1 text-sm font-semibold text-sky-700 hover:underline'
					>
						{expanded ? 'Hide' : 'Show'}
					</button>

					{expanded && (
						<div className='mt-3 space-y-3'>
							{sortedVisits.map((visit) => (
								<VisitCard
									key={visit.id}
									title='Visit'
									pet={pet}
									visit={visit}
									showButton={false}
								/>
							))}
						</div>
					)}
				</>
			)}
		</div>
	)
}
