import { useCallback, useState } from 'react'
import { fetchPetVisits, type PageResponse } from '../../api/visits'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import type { Pet, Visit } from '../../utils/types'
import { Alert } from '../ui/Alert'
import { Pagination } from '../ui/Pagination'
import { VisitCard } from '../VisitCard'

type PetVisitsSectionProps = {
	pet: Pet
}

export function PetVisitsSection({ pet }: PetVisitsSectionProps) {
	const { accessToken } = useAuth()
	const token = accessToken
	const [page, setPage] = useState(0)
	const [pageSize, setPageSize] = useState(20)
	const { data, loading, error } = useAsync<PageResponse<Visit>>(
		() =>
			token
				? fetchPetVisits(pet.id, token, page, pageSize)
				: Promise.resolve({
						content: [],
						totalElements: 0,
						totalPages: 0,
						size: 0,
						number: 0
					}),
		[token, pet.id, page, pageSize]
	)

	const visits = data?.content ?? []
	const visitCount = data?.totalElements ?? 0

	const [expanded, setExpanded] = useState(false)

	const handlePageChange = useCallback((newPage: number) => {
		setPage(newPage)
	}, [])

	const handlePageSizeChange = useCallback((newSize: number) => {
		setPageSize(newSize)
		setPage(0)
	}, [])

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

			{error && <Alert variant='error'>{error}</Alert>}

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
						<>
							<div className='mt-2 space-y-2'>
								{sortedVisits.map((visit) => (
									<VisitCard key={visit.id} visit={visit} />
								))}
							</div>
							{data && (
								<div className='mt-4'>
									<Pagination
										currentPage={data.number}
										totalPages={data.totalPages}
										pageSize={data.size}
										totalElements={data.totalElements}
										onPageChange={handlePageChange}
										onPageSizeChange={handlePageSizeChange}
									/>
								</div>
							)}
						</>
					)}
				</>
			)}
		</div>
	)
}
