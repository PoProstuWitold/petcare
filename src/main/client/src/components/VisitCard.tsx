import { useEffect, useState } from 'react'
import { fetchMedicalRecordByVisit } from '../api/medicalRecords'
import { useAuth } from '../context/AuthContext'
import type { Visit, VisitStatus } from '../utils/types.ts'
import { Button } from './ui/Button'
import { StatusPill } from './ui/StatusPill'

type VisitCardProps = {
	title?: string
	demo?: boolean
	visit: Visit
	enableStatusEditing?: boolean
	onStatusChangeRequest?: (newStatus: VisitStatus) => void
	onCreateMedicalRecord?: () => void
	onViewPetDetails?: () => void
}

function formatAge(
	birthDate?: string | null,
	birthYear?: number | null
): string | null {
	const now = new Date()

	let year: number | null = null
	let month = 0
	let day = 1

	if (birthDate) {
		const [y, m, d] = birthDate.split('-').map(Number)
		if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
			year = y
			month = m - 1
			day = d
		}
	} else if (birthYear) {
		year = birthYear
	}

	if (year === null) return null

	const birth = new Date(year, month, day)
	let age = now.getFullYear() - birth.getFullYear()
	const mDiff = now.getMonth() - birth.getMonth()
	if (mDiff < 0 || (mDiff === 0 && now.getDate() < birth.getDate())) {
		age--
	}

	if (age <= 0) return '< 1 year'
	if (age === 1) return '1 year'
	return `${age} years`
}

function formatDatePl(date?: string, time?: string): string {
	if (!date || !date.includes('-')) {
		// fallback demo
		return '10.11.2025 · 14:30'
	}

	const [y, m, d] = date.split('-')
	const day = d?.padStart(2, '0')
	const month = m?.padStart(2, '0')
	const year = y

	const hour = time ? time.slice(0, 5) : '14:30'

	return `${day}.${month}.${year} · ${hour}`
}

function statusColor(status?: VisitStatus): string {
	switch (status) {
		case 'SCHEDULED':
			return 'bg-sky-200 text-sky-700 ring-sky-200'
		case 'CONFIRMED':
			return 'bg-emerald-200 text-emerald-700 ring-emerald-200'
		case 'COMPLETED':
			return 'bg-slate-900 text-slate-50 ring-slate-900/10'
		case 'CANCELLED':
			return 'bg-rose-200 text-rose-700 ring-rose-200'
		default:
			return 'bg-slate-200 text-slate-700 ring-slate-200'
	}
}

export function VisitCard({
	title,
	visit,
	demo = false,
	enableStatusEditing = false,
	onStatusChangeRequest,
	onCreateMedicalRecord,
	onViewPetDetails
}: VisitCardProps) {
	const [isEditingStatus, setIsEditingStatus] = useState(false)
	const [draftStatus, setDraftStatus] = useState<VisitStatus | undefined>(
		visit?.status
	)
	const { accessToken } = useAuth()
	const [medicalRecordExists, setMedicalRecordExists] =
		useState<boolean>(false)

	useEffect(() => {
		let ignore = false
		if (!accessToken || !visit?.id) return
		fetchMedicalRecordByVisit(visit.id, accessToken)
			.then((r) => {
				if (!ignore) setMedicalRecordExists(!!r)
			})
			.catch(() => {})
		return () => {
			ignore = true
		}
	}, [accessToken, visit?.id])

	const ageText = formatAge(visit.pet.birthDate, visit.pet.birthYear)

	const generatedMeta = [
		visit.pet.species,
		visit.pet.sex,
		ageText,
		`${visit.pet.weight} kg`
	]
		.filter(Boolean)
		.join(' · ')

	const displayDateTime = formatDatePl(visit?.date, visit?.startTime)
	const address = 'PetCare Clinic'

	const hasVetActions =
		enableStatusEditing ||
		typeof onCreateMedicalRecord === 'function' ||
		typeof onViewPetDetails === 'function'

	const handleStartEdit = () => {
		if (!visit) return
		setDraftStatus(visit.status)
		setIsEditingStatus(true)
	}

	const handleCancelEdit = () => {
		setIsEditingStatus(false)
		setDraftStatus(visit?.status)
	}

	const handleSaveStatus = () => {
		if (!visit || !draftStatus || !onStatusChangeRequest) return
		onStatusChangeRequest(draftStatus)
		setIsEditingStatus(false)
	}

	return (
		<div
			className={`relative rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm ${!demo ? 'shadow-lg backdrop-blur-md' : ''}`}
		>
			{title && (
				<p className='mb-4 text-xs font-semibold uppercase tracking-wide text-sky-700'>
					{title}
				</p>
			)}

			<div className='space-y-4 text-sm'>
				<div className='flex items-start justify-between gap-3'>
					<div>
						<p className='text-sm font-semibold text-slate-900'>
							{visit.pet.name}
						</p>
						<p className='text-xs text-slate-500'>
							{generatedMeta}
						</p>
					</div>

					{enableStatusEditing && isEditingStatus ? (
						<div className='flex items-center gap-2'>
							<select
								className='rounded-full border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'
								value={draftStatus}
								onChange={(e) =>
									setDraftStatus(
										e.target.value as VisitStatus
									)
								}
							>
								<option value='SCHEDULED'>SCHEDULED</option>
								<option value='CONFIRMED'>CONFIRMED</option>
								<option value='COMPLETED'>COMPLETED</option>
								<option value='CANCELLED'>CANCELLED</option>
							</select>
						</div>
					) : (
						<StatusPill color={statusColor(visit.status)}>
							{visit.status}
						</StatusPill>
					)}
				</div>

				<div className='grid grid-cols-2 gap-3 text-xs text-slate-600'>
					<div>
						<p className='font-medium text-slate-800'>Owner</p>
						<p>{visit.pet.ownerFullName}</p>
					</div>
					<div>
						<p className='font-medium text-slate-800'>
							General Pet Notes
						</p>
						<p>{visit.pet.notes || 'No notes'}</p>
					</div>
					<div>
						<p className='font-medium text-slate-800'>
							Veterinarian
						</p>
						<p>{visit.vetFullName}</p>
					</div>
					<div>
						<p className='font-medium text-slate-800'>
							Date & Time
						</p>
						<p>{displayDateTime}</p>
					</div>
					<div>
						<p className='font-medium text-slate-800'>Reason</p>
						<p>{visit.reason}</p>
					</div>
					<div>
						<p className='font-medium text-slate-800'>Address</p>
						<p>{address}</p>
					</div>
				</div>

				{visit?.notes && (
					<div className='text-xs'>
						<p className='font-medium text-slate-800'>
							Visit Notes
						</p>
						<p className='text-xs text-slate-600'>{visit.notes}</p>
					</div>
				)}

				{hasVetActions && visit && (
					<div className='mt-3 flex flex-wrap gap-2'>
						{enableStatusEditing && !isEditingStatus && (
							<Button
								type='button'
								variant='ghost'
								onClick={handleStartEdit}
							>
								Edit status
							</Button>
						)}

						{enableStatusEditing && isEditingStatus && (
							<>
								<Button
									type='button'
									variant='secondary'
									onClick={handleSaveStatus}
								>
									Save status
								</Button>
								<Button
									type='button'
									variant='ghost'
									onClick={handleCancelEdit}
								>
									Cancel
								</Button>
							</>
						)}

						{onCreateMedicalRecord && !medicalRecordExists && (
							<Button
								type='button'
								variant='ghost'
								onClick={onCreateMedicalRecord}
							>
								Create medical record
							</Button>
						)}

						{onCreateMedicalRecord && medicalRecordExists && (
							<span className='text-[10px] font-medium text-slate-500'>
								Record already created
							</span>
						)}

						{onViewPetDetails && (
							<Button
								type='button'
								variant='ghost'
								onClick={onViewPetDetails}
							>
								View pet details
							</Button>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
