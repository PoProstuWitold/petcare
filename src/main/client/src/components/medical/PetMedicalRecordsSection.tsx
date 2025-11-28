import { useCallback, useState } from 'react'
import {
	fetchMedicalRecordsForPet,
	type PageResponse
} from '../../api/medicalRecords'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import type { MedicalRecord, Pet } from '../../utils/types'
import { Pagination } from '../ui/Pagination'
import { MedicalRecordCard } from './MedicalRecordCard'

export function PetMedicalRecordsSection({ pet }: { pet: Pet }) {
	const { accessToken } = useAuth()
	const [page, setPage] = useState(0)
	const [pageSize, setPageSize] = useState(20)
	const { data, loading, error } = useAsync<PageResponse<MedicalRecord>>(
		() =>
			accessToken
				? fetchMedicalRecordsForPet(pet.id, accessToken, page, pageSize)
				: Promise.resolve({
						content: [],
						totalElements: 0,
						totalPages: 0,
						size: 0,
						number: 0
					}),
		[accessToken, pet.id, page, pageSize]
	)

	const records = data?.content ?? []
	const recordCount = data?.totalElements ?? 0

	const [expanded, setExpanded] = useState(false)

	const handlePageChange = useCallback((newPage: number) => {
		setPage(newPage)
	}, [])

	const handlePageSizeChange = useCallback((newSize: number) => {
		setPageSize(newSize)
		setPage(0)
	}, [])

	return (
		<div className='text-sm mt-4'>
			<div className='mb-2 flex items-center justify-between gap-2'>
				<h3 className='text-sm font-semibold uppercase tracking-wide text-slate-700'>
					Medical Records
				</h3>
				<span className='rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-700'>
					{loading ? 'Loading…' : `${recordCount} total`}
				</span>
			</div>
			{error && <p className='text-sm text-rose-600'>{error}</p>}
			{!loading && !error && recordCount === 0 && (
				<p className='text-sm text-slate-500'>
					No medical records for this pet.
				</p>
			)}
			{!loading && !error && recordCount > 0 && (
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
								{records.map((r) => (
									<MedicalRecordCard key={r.id} record={r} />
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
