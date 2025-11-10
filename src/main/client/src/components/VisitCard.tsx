import { useState } from 'react'
import type { Visit, VisitStatus } from '../utils/types.ts'

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

function getStatusPillClasses(status: VisitStatus | undefined): string {
	const base =
		'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset'

	switch (status) {
		case 'SCHEDULED':
			return `${base} bg-sky-200 text-sky-700 ring-sky-200`
		case 'CONFIRMED':
			return `${base} bg-emerald-200 text-emerald-700 ring-emerald-200`
		case 'COMPLETED':
			return `${base} bg-slate-900 text-slate-50 ring-slate-900/10`
		case 'CANCELLED':
			return `${base} bg-rose-200 text-rose-700 ring-rose-200`
		default:
			return `${base} bg-slate-200 text-slate-700 ring-slate-200`
	}
}

const btnBase =
	'inline-flex items-center justify-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-semibold tracking-tight ' +
	'cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ' +
	'focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-60'

const btnPrimary =
	`${btnBase} bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md ` +
	'active:translate-y-px active:shadow-sm'

const btnGhost =
	`${btnBase} border border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-50 hover:border-slate-400 ` +
	'hover:shadow-md active:bg-slate-100 active:translate-y-px'

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
						<span className={getStatusPillClasses(visit.status)}>
							{visit.status}
						</span>
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
							<button
								type='button'
								onClick={handleStartEdit}
								className={btnGhost}
							>
								Edit status
							</button>
						)}

						{enableStatusEditing && isEditingStatus && (
							<>
								<button
									type='button'
									onClick={handleSaveStatus}
									className={btnPrimary}
								>
									Save status
								</button>
								<button
									type='button'
									onClick={handleCancelEdit}
									className={btnGhost}
								>
									Cancel
								</button>
							</>
						)}

						{onCreateMedicalRecord && (
							<button
								type='button'
								onClick={onCreateMedicalRecord}
								className={btnGhost}
							>
								Create medical record
							</button>
						)}

						{onViewPetDetails && (
							<button
								type='button'
								onClick={onViewPetDetails}
								className={btnGhost}
							>
								View pet details
							</button>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
