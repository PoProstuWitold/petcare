import {
	type ChangeEvent,
	type FormEvent,
	useEffect,
	useMemo,
	useState
} from 'react'
import { toast } from 'react-toastify'
import { fetchVetSchedule, fetchVets, fetchVetTimeOff } from '../../api/vets'
import {
	type CreateVisitPayload,
	createVisitForPet,
	fetchVetVisitsForDate
} from '../../api/visits'
import { useAuth } from '../../context/AuthContext'
import { ALL_SPECIALIZATIONS } from '../../utils/constants.ts'
import type {
	DayOfWeek,
	Pet,
	VetProfile,
	VetScheduleEntry,
	VetTimeOff,
	Visit
} from '../../utils/types'
import { Button } from '../ui/Button'

type VisitBookingFormProps = {
	pets: Pet[]
	onBooked?(visit: Visit): void
	onCancel?(): void
}

type Slot = {
	value: string // "HH:mm"
	label: string
}

interface VisitFormState {
	petId: string
	vetProfileId: string
	date: string
	startTime: string
	reason: string
	notes: string
}

const DAYS_AHEAD = 90

const JS_DAY_TO_NAME: DayOfWeek[] = [
	'SUNDAY', // 0
	'MONDAY', // 1
	'TUESDAY', // 2
	'WEDNESDAY', // 3
	'THURSDAY', // 4
	'FRIDAY', // 5
	'SATURDAY' // 6
]

function toDateOnlyString(date: Date): string {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')
	return `${year}-${month}-${day}`
}

function computeAvailableDates(
	schedule: VetScheduleEntry[],
	timeOff: VetTimeOff[]
): string[] {
	if (!schedule.length) return []

	const allowedDays = new Set(schedule.map((e) => e.dayOfWeek))
	const today = new Date()
	today.setHours(0, 0, 0, 0)

	const result: string[] = []

	for (let i = 0; i < DAYS_AHEAD; i++) {
		const d = new Date(today)
		d.setDate(today.getDate() + i)
		const iso = toDateOnlyString(d)
		const dayName = JS_DAY_TO_NAME[d.getDay()]

		if (!allowedDays.has(dayName as DayOfWeek)) continue

		const isInTimeOff = timeOff.some(
			(period) => iso >= period.startDate && iso <= period.endDate
		)
		if (isInTimeOff) continue

		result.push(iso)
	}

	return result
}

export function VisitBookingForm({
	pets,
	onBooked,
	onCancel
}: VisitBookingFormProps) {
	const { accessToken, user } = useAuth()
	const [vets, setVets] = useState<VetProfile[]>([])

	const [availableSlots, setAvailableSlots] = useState<Slot[]>([])
	const [availableDates, setAvailableDates] = useState<string[]>([])
	const [vetSchedule, setVetSchedule] = useState<VetScheduleEntry[]>([])
	const [vetTimeOffPeriods, setVetTimeOffPeriods] = useState<VetTimeOff[]>([])

	const [loadingSlots, setLoadingSlots] = useState(false)
	const [loadingMeta, setLoadingMeta] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const [form, setForm] = useState<VisitFormState>(() => ({
		petId: pets[0] ? String(pets[0].id) : '',
		vetProfileId: '',
		date: '',
		startTime: '',
		reason: '',
		notes: ''
	}))
	const selectedVet = useMemo(
		() => vets.find((v) => v.id === Number(form.vetProfileId)),
		[vets, form.vetProfileId]
	)

	const token = accessToken

	const dayOfWeekName = useMemo(() => {
		if (!form.date) return null
		const jsDay = new Date(`${form.date}T00:00:00`).getDay()
		return JS_DAY_TO_NAME[jsDay]
	}, [form.date])

	useEffect(() => {
		if (!token) return

		;(async () => {
			try {
				const vetsData = await fetchVets(token)
				setVets(vetsData)

				if (vetsData.length > 0) {
					setForm((prev) => ({
						...prev,
						vetProfileId:
							prev.vetProfileId || String(vetsData[0].id)
					}))
				}
			} catch (e) {
				console.error(e)
				setError('Could not load vets')
			}
		})()
	}, [token])

	useEffect(() => {
		if (!token || !form.vetProfileId) {
			setVetSchedule([])
			setVetTimeOffPeriods([])
			setAvailableDates([])
			setAvailableSlots([])
			setForm((prev) => ({ ...prev, date: '', startTime: '' }))
			return
		}

		;(async () => {
			setLoadingMeta(true)
			setError(null)

			try {
				const vetId = Number(form.vetProfileId)

				const [schedule, timeOff] = await Promise.all([
					fetchVetSchedule(vetId, token),
					fetchVetTimeOff(vetId, token)
				])

				setVetSchedule(schedule)
				setVetTimeOffPeriods(timeOff)

				const dates = computeAvailableDates(schedule, timeOff)
				setAvailableDates(dates)

				setAvailableSlots([])
				setForm((prev) => ({
					...prev,
					date: dates[0] ?? '',
					startTime: ''
				}))
			} catch (e) {
				console.error(e)
				setError('Could not load vet schedule')
				setVetSchedule([])
				setVetTimeOffPeriods([])
				setAvailableDates([])
				setAvailableSlots([])
				setForm((prev) => ({ ...prev, date: '', startTime: '' }))
			} finally {
				setLoadingMeta(false)
			}
		})()
	}, [token, form.vetProfileId])

	useEffect(() => {
		if (!token || !form.vetProfileId || !form.date) {
			setAvailableSlots([])
			setForm((prev) => ({ ...prev, startTime: '' }))
			return
		}

		if (availableDates.length && !availableDates.includes(form.date)) {
			setAvailableSlots([])
			setForm((prev) => ({ ...prev, startTime: '' }))
			return
		}

		if (!dayOfWeekName) {
			setAvailableSlots([])
			setForm((prev) => ({ ...prev, startTime: '' }))
			return
		}

		;(async () => {
			setLoadingSlots(true)
			setError(null)

			try {
				const vetId = Number(form.vetProfileId)

				const visits = await fetchVetVisitsForDate(
					vetId,
					form.date,
					token
				)

				const scheduleForDay = vetSchedule.filter(
					(entry) => entry.dayOfWeek === dayOfWeekName
				)

				if (scheduleForDay.length === 0) {
					setAvailableSlots([])
					setForm((prev) => ({ ...prev, startTime: '' }))
					setLoadingSlots(false)
					return
				}

				const hasTimeOffThatDay = vetTimeOffPeriods.some(
					(period) =>
						form.date >= period.startDate &&
						form.date <= period.endDate
				)

				if (hasTimeOffThatDay) {
					setAvailableSlots([])
					setForm((prev) => ({ ...prev, startTime: '' }))
					setLoadingSlots(false)
					return
				}

				const takenStarts = new Set(
					visits.map((v: Visit) => v.startTime.slice(0, 5))
				)

				const slots: Slot[] = []

				const toMinutes = (time: string) => {
					const [h, m] = time.split(':').map(Number)
					return h * 60 + m
				}

				scheduleForDay.forEach((entry) => {
					const step = entry.slotLengthMinutes
					let currentMinutes = toMinutes(entry.startTime.slice(0, 5))
					const endMinutes = toMinutes(entry.endTime.slice(0, 5))

					while (currentMinutes + step <= endMinutes) {
						const h = Math.floor(currentMinutes / 60)
							.toString()
							.padStart(2, '0')
						const m = (currentMinutes % 60)
							.toString()
							.padStart(2, '0')
						const value = `${h}:${m}`

						if (!takenStarts.has(value)) {
							// Exclude past times if date is today
							if (form.date === toDateOnlyString(new Date())) {
								const now = new Date()
								const slotDate = new Date(
									`${form.date}T${value}:00`
								)
								if (slotDate.getTime() <= now.getTime()) {
									currentMinutes += step
									continue
								}
							}
							slots.push({ value, label: value })
						}

						currentMinutes += step
					}
				})

				setAvailableSlots(slots)
				setForm((prev) => ({
					...prev,
					startTime: slots[0]?.value ?? ''
				}))
			} catch (e) {
				console.error(e)
				setError('Could not load available slots')
				setAvailableSlots([])
				setForm((prev) => ({ ...prev, startTime: '' }))
			} finally {
				setLoadingSlots(false)
			}
		})()
	}, [
		token,
		form.vetProfileId,
		form.date,
		dayOfWeekName,
		vetSchedule,
		vetTimeOffPeriods,
		availableDates
	])

	const handleChange = (
		event: ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = event.target
		setForm((prev) => ({ ...prev, [name]: value }))
	}

	if (!token || !user) {
		return (
			<div className='rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm sm:p-6'>
				You must be logged in to book a visit.
			</div>
		)
	}

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault()

		if (!form.petId) {
			toast.error('Pet is required.')
			return
		}
		if (!form.vetProfileId) {
			toast.error('Veterinarian is required.')
			return
		}
		if (!form.date) {
			toast.error('Date is required.')
			return
		}
		if (!form.startTime) {
			toast.error('Time is required.')
			return
		}

		const petId = Number(form.petId)
		const vetProfileId = Number(form.vetProfileId)
		if (Number.isNaN(petId) || Number.isNaN(vetProfileId)) {
			toast.error('Invalid pet or veterinarian selected.')
			return
		}

		const payload: CreateVisitPayload = {
			vetProfileId,
			date: form.date,
			startTime: form.startTime,
			reason: form.reason || undefined,
			notes: form.notes || undefined
		}

		setIsSubmitting(true)
		setError(null)

		try {
			const created = await createVisitForPet(petId, payload, token)

			if (onBooked) {
				onBooked(created)
			}

			toast.success('Visit booked successfully.')

			setForm((prev) => ({
				...prev,
				date: '',
				startTime: '',
				reason: '',
				notes: ''
			}))
			setAvailableSlots([])
		} catch (err) {
			console.error('Error while booking visit', err)
			// Extract error message from API response
			let message = 'Unexpected error while booking visit.'
			if (err instanceof Error) {
				const httpError = err as any
				if (httpError.body?.message) {
					message = httpError.body.message
				} else if (err.message) {
					message = err.message
				}
			}
			setError(message)
			toast.error(message)
		} finally {
			setIsSubmitting(false)
		}
	}

	const title = 'Book a new visit'

	const formatDateLabel = (iso: string) => {
		const d = new Date(`${iso}T00:00:00`)
		const dayName = JS_DAY_TO_NAME[d.getDay()]
		return `${new Date(iso).toLocaleDateString('pl-PL')} (${dayName})`
	}

	return (
		<form
			onSubmit={handleSubmit}
			className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6'
		>
			<h2 className='mb-4 text-lg font-semibold text-slate-900'>
				{title}
			</h2>

			{error && <p className='mb-3 text-sm text-red-600'>{error}</p>}

			<div className='grid gap-4 sm:grid-cols-3'>
				<div className='sm:col-span-1'>
					<label
						htmlFor='petId'
						className='block text-xs font-medium uppercase tracking-wide text-slate-700'
					>
						Pet
					</label>
					<select
						id='petId'
						name='petId'
						value={form.petId}
						onChange={handleChange}
						className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200'
						required
					>
						<option value=''>Select pet</option>
						{pets.map((pet) => (
							<option key={pet.id} value={pet.id}>
								{pet.name}
							</option>
						))}
					</select>
				</div>

				<div className='sm:col-span-1'>
					<label
						htmlFor='vetProfileId'
						className='block text-xs font-medium uppercase tracking-wide text-slate-700'
					>
						Veterinarian
					</label>
					<select
						id='vetProfileId'
						name='vetProfileId'
						value={form.vetProfileId}
						onChange={handleChange}
						className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200'
						required
					>
						<option value=''>Select vet</option>
						{vets.map((vet) => (
							<option key={vet.id} value={vet.id}>
								{vet.fullName}
							</option>
						))}
					</select>
				</div>

				<div className='sm:col-span-1'>
					<label
						htmlFor='date'
						className='block text-xs font-medium uppercase tracking-wide text-slate-700'
					>
						Date
					</label>
					<select
						id='date'
						name='date'
						value={form.date}
						onChange={handleChange}
						disabled={
							loadingMeta ||
							!form.vetProfileId ||
							availableDates.length === 0
						}
						className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-100'
						required
					>
						{!form.vetProfileId && (
							<option value=''>Select vet first</option>
						)}
						{form.vetProfileId &&
							!loadingMeta &&
							availableDates.length === 0 && (
								<option value=''>
									No available days for this vet
								</option>
							)}
						{form.vetProfileId &&
							loadingMeta &&
							availableDates.length === 0 && (
								<option value=''>Loading days...</option>
							)}
						{availableDates.length > 0 && (
							<>
								<option value=''>Select date</option>
								{availableDates.map((date) => (
									<option key={date} value={date}>
										{formatDateLabel(date)}
									</option>
								))}
							</>
						)}
					</select>
				</div>

				<div className='sm:col-span-1'>
					<label
						htmlFor='startTime'
						className='block text-xs font-medium uppercase tracking-wide text-slate-700'
					>
						Time
					</label>
					<select
						id='startTime'
						name='startTime'
						value={form.startTime}
						onChange={handleChange}
						disabled={
							loadingSlots ||
							availableSlots.length === 0 ||
							!form.date
						}
						className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-100'
						required
					>
						{!form.date && <option>Select date first</option>}
						{form.date && loadingSlots && (
							<option>Loading...</option>
						)}
						{form.date &&
							!loadingSlots &&
							availableSlots.length === 0 && (
								<option>No free slots that day</option>
							)}
						{!loadingSlots &&
							availableSlots.map((slot) => (
								<option key={slot.value} value={slot.value}>
									{slot.label}
								</option>
							))}
					</select>
					<p className='mt-1 text-[11px] text-slate-500'>
						Available hours are based on vet schedule, time off and
						already booked visits.
					</p>
				</div>

				<div className='sm:col-span-2'>
					<label
						htmlFor='reason'
						className='block text-xs font-medium uppercase tracking-wide text-slate-700'
					>
						Reason
					</label>
					<input
						required
						id='reason'
						type='text'
						name='reason'
						value={form.reason}
						onChange={handleChange}
						className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200'
						placeholder='e.g. vaccination, regular check-up...'
					/>
				</div>
				<div className='sm:col-span-3'>
					<span className='block text-xs font-medium uppercase tracking-wide text-slate-700'>
						Selected Veterinarian Specializations
					</span>
					<div className='mt-2 flex flex-wrap gap-2'>
						{selectedVet ? (
							ALL_SPECIALIZATIONS.map((spec) => {
								const selected =
									selectedVet?.specializations?.includes(
										spec.value
									) ?? false

								return (
									<span
										key={spec.value}
										className={`rounded-full border px-3 py-1 text-xs font-medium ${
											selected
												? 'border-sky-300 bg-sky-100 text-sky-800'
												: 'border-slate-300 bg-slate-100 text-slate-700'
										}`}
									>
										{spec.label}
									</span>
								)
							})
						) : (
							<p className='text-xs text-slate-500'>
								Select a veterinarian to see their
								specializations.
							</p>
						)}
					</div>
				</div>
				<div className='sm:col-span-3'>
					<label
						htmlFor='notes'
						className='block text-xs font-medium uppercase tracking-wide text-slate-700'
					>
						Notes for vet (optional)
					</label>
					<textarea
						id='notes'
						name='notes'
						value={form.notes}
						onChange={handleChange}
						className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200'
						rows={3}
						placeholder='Any important symptoms, medications, or recent changes...'
					/>
				</div>
			</div>

			<div className='mt-6 flex justify-end gap-3'>
				{onCancel && (
					<Button
						variant='ghost'
						type='button'
						onClick={onCancel}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
				)}
				<Button
					variant='secondary'
					type='submit'
					disabled={
						isSubmitting ||
						loadingSlots ||
						loadingMeta ||
						!form.petId ||
						!form.vetProfileId
					}
				>
					{isSubmitting ? 'Booking...' : 'Book visit'}
				</Button>
			</div>
		</form>
	)
}
