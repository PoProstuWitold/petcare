import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	fetchMedicalRecordsForCurrentVet,
	type PageResponse
} from '../../api/medicalRecords'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import type { MedicalRecord } from '../../utils/types'
import { MedicalRecordCard } from '../medical/MedicalRecordCard'
import { Alert } from '../ui/Alert'
import { Pagination } from '../ui/Pagination'

function compareRecordDateTime(a: MedicalRecord, b: MedicalRecord): number {
	const aKey = `${a.visit.date}T${a.visit.startTime}`
	const bKey = `${b.visit.date}T${b.visit.startTime}`
	return aKey.localeCompare(bKey)
}

export function VetMedicalRecordsCard() {
	const { accessToken } = useAuth()
	const token = accessToken
	const [page, setPage] = useState(0)
	const [pageSize, setPageSize] = useState(20)
	const { data, loading, error } = useAsync<PageResponse<MedicalRecord>>(
		() =>
			token
				? fetchMedicalRecordsForCurrentVet(token, page, pageSize)
				: Promise.resolve({
						content: [],
						totalElements: 0,
						totalPages: 0,
						size: 0,
						number: 0
					}),
		[token, page, pageSize]
	)

	const [records, setRecords] = useState<MedicalRecord[]>([])
	useEffect(() => {
		setRecords(data?.content ?? [])
	}, [data])

	const handlePageChange = useCallback((newPage: number) => {
		setPage(newPage)
	}, [])

	const handlePageSizeChange = useCallback((newSize: number) => {
		setPageSize(newSize)
		setPage(0)
	}, [])

	const { upcoming, past } = useMemo(() => {
		const sorted = [...records].sort(compareRecordDateTime)
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const upcoming: MedicalRecord[] = []
		const past: MedicalRecord[] = []
		for (const r of sorted) {
			const d = new Date(`${r.visit.date}T00:00:00`)
			if (d >= today) {
				upcoming.push(r)
			} else {
				past.push(r)
			}
		}
		return { upcoming, past }
	}, [records])

	return (
		<section className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6'>
			<h2 className='text-lg font-semibold text-slate-900'>
				Medical Records
			</h2>
			<p className='mt-1 text-sm text-slate-600'>
				Browse medical records you have created for pets.
			</p>

			{loading && (
				<p className='mt-4 text-sm text-slate-600'>
					Loading medical records...
				</p>
			)}
			{!loading && error && (
				<Alert variant='error' className='mt-4'>
					{error}
				</Alert>
			)}
			{!loading && !error && records.length === 0 && (
				<p className='mt-4 text-sm text-slate-600'>
					No medical records created yet.
				</p>
			)}

			{!loading && !error && records.length > 0 && (
				<>
					<div className='flex flex-col gap-4 my-3'>
						{upcoming.length > 0 && (
							<div className='flex flex-col gap-4'>
								{upcoming.map((r) => (
									<MedicalRecordCard key={r.id} record={r} />
								))}
							</div>
						)}

						{past.length > 0 && (
							<div className='flex flex-col gap-4'>
								<p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
									Past (by visit date)
								</p>
								{past.map((r) => (
									<MedicalRecordCard key={r.id} record={r} />
								))}
							</div>
						)}
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
		</section>
	)
}
