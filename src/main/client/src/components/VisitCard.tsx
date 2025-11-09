import type { Pet, Visit } from '../utils/types.ts'

type VisitCardProps = {
	title: string
	pet?: Pet
	visit?: Visit
	showButton?: boolean
	buttonLabel?: string
	onButtonClick?: () => void
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

export function VisitCard({
	title,
	pet,
	visit,
	showButton = true,
	buttonLabel = 'View full schedule',
	onButtonClick
}: VisitCardProps) {
	const ageText = formatAge(pet?.birthDate, pet?.birthYear)

	const generatedMeta = [pet?.species, pet?.sex, ageText]
		.filter(Boolean)
		.join(' · ')

	const displayPetName = pet?.name ?? 'Sara'
	const displayPetMeta = generatedMeta || 'Dog · Female · 3 years'
	const displayStatus = visit?.status ?? 'CONFIRMED'
	const displayVetName = visit?.vetFullName ?? 'System Veterinarian'
	const displayDateTime = formatDatePl(visit?.date, visit?.startTime)
	const displayReason =
		visit?.reason !== undefined
			? visit.reason || '—'
			: 'Annual check-up & vaccines'
	const address = 'PetCare Clinic'

	return (
		<div className='relative rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-lg backdrop-blur-sm'>
			<p className='text-xs font-semibold uppercase tracking-wide text-sky-700'>
				{title}
			</p>

			<div className='mt-4 space-y-4 text-sm'>
				<div className='flex items-center justify-between'>
					<div>
						<p className='font-semibold text-slate-900'>
							{displayPetName}
						</p>
						<p className='text-xs text-slate-500'>
							{displayPetMeta}
						</p>
					</div>
					<span className='rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700'>
						{displayStatus}
					</span>
				</div>

				<div className='grid grid-cols-2 gap-3 text-xs text-slate-600'>
					<div>
						<p className='font-medium text-slate-800'>
							Veterinarian
						</p>
						<p>{displayVetName}</p>
					</div>
					<div>
						<p className='font-medium text-slate-800'>Date</p>
						<p>{displayDateTime}</p>
					</div>
					<div>
						<p className='font-medium text-slate-800'>Reason</p>
						<p>{displayReason}</p>
					</div>
					<div>
						<p className='font-medium text-slate-800'>Address</p>
						<p>{address}</p>
					</div>
				</div>
				{visit?.notes && (
					<div className='text-xs'>
						<p className='font-medium text-slate-800'>Notes</p>
						<p className='text-xs text-slate-600'>{visit.notes}</p>
					</div>
				)}

				{showButton && (
					<button
						type='button'
						onClick={onButtonClick}
						className='mt-2 w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100'
					>
						{buttonLabel}
					</button>
				)}
			</div>
		</div>
	)
}
