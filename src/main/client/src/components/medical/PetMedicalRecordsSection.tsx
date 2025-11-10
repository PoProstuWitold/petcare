import { useEffect, useState } from 'react'
import { fetchMedicalRecordsForPet } from '../../api/medicalRecords'
import { useAuth } from '../../context/AuthContext'
import type { MedicalRecord, Pet } from '../../utils/types'
import { MedicalRecordCard } from './MedicalRecordCard'

export function PetMedicalRecordsSection({ pet }: { pet: Pet }) {
	const { accessToken } = useAuth()
	const [records, setRecords] = useState<MedicalRecord[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [expanded, setExpanded] = useState(false)

	useEffect(() => {
		let ignore = false
		if (!accessToken) return
		setLoading(true)
		setError(null)
		fetchMedicalRecordsForPet(pet.id, accessToken)
			.then((data) => {
				if (!ignore) setRecords(data)
			})
			.catch((e) => setError(e?.message || 'Failed to load records'))
			.finally(() => setLoading(false))
		return () => {
			ignore = true
		}
	}, [accessToken, pet.id])

	return (
		<div className='text-sm mt-4'>
			<div className='mb-2 flex items-center justify-between gap-2'>
				<h3 className='text-sm font-semibold uppercase tracking-wide text-slate-700'>
					Medical Records
				</h3>
				<span className='rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-slate-700'>
					{loading ? 'Loading…' : `${records.length} total`}
				</span>
			</div>
			{error && <p className='text-sm text-rose-600'>{error}</p>}
			{!loading && !error && records.length === 0 && (
				<p className='text-sm text-slate-500'>
					No medical records for this pet.
				</p>
			)}
			{!loading && !error && records.length > 0 && (
				<>
					<button
						type='button'
						onClick={() => setExpanded((v) => !v)}
						className='mt-1 text-sm font-semibold text-sky-700 hover:underline'
					>
						{expanded ? 'Hide' : 'Show'}
					</button>
					{expanded && (
						<div className='mt-2 space-y-2'>
							{records.map((r) => (
								<MedicalRecordCard key={r.id} record={r} />
							))}
						</div>
					)}
				</>
			)}
		</div>
	)
}
