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
import type {
	Pet,
	VetProfile,
	VetScheduleEntry,
	VetTimeOff,
	Visit
} from '../../utils/types'

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

export function VisitBookingForm({
	pets,
	onBooked,
	onCancel
}: VisitBookingFormProps) {
	const { accessToken, user } = useAuth()
	const [vets, setVets] = useState<VetProfile[]>([])
	const [availableSlots, setAvailableSlots] = useState<Slot[]>([])
	const [loadingSlots, setLoadingSlots] = useState(false)
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

	const token = accessToken

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

	const dayOfWeekName = useMemo(() => {
		if (!form.date) return null
		const jsDay = new Date(`${form.date}T00:00:00`).getDay()
		const names = [
			'SUNDAY',
			'MONDAY',
			'TUESDAY',
			'WEDNESDAY',
			'THURSDAY',
			'FRIDAY',
			'SATURDAY'
		]
		return names[jsDay]
	}, [form.date])

	useEffect(() => {
		if (!token || !form.vetProfileId || !form.date || !dayOfWeekName) {
			setAvailableSlots([])
			setForm((prev) => ({ ...prev, startTime: '' }))
			return
		}

		;(async () => {
			setLoadingSlots(true)
			setError(null)

			try {
				const vetId = Number(form.vetProfileId)

				const [schedule, timeOff, visits] = await Promise.all([
					fetchVetSchedule(vetId, token),
					fetchVetTimeOff(vetId, token),
					fetchVetVisitsForDate(vetId, form.date, token)
				])

				const hasTimeOffThatDay = timeOff.some((period: VetTimeOff) => {
					return (
						form.date >= period.startDate &&
						form.date <= period.endDate
					)
				})

				if (hasTimeOffThatDay) {
					setAvailableSlots([])
					setForm((prev) => ({ ...prev, startTime: '' }))
					setLoadingSlots(false)
					return
				}

				const takenStarts = new Set(
					visits.map((v) => v.startTime.slice(0, 5))
				)

				const slots: Slot[] = []

				schedule
					.filter(
						(entry: VetScheduleEntry) =>
							entry.dayOfWeek === dayOfWeekName
					)
					.forEach((entry) => {
						const step = entry.slotLengthMinutes
						const toMinutes = (time: string) => {
							const [h, m] = time.split(':').map(Number)
							return h * 60 + m
						}

						let currentMinutes = toMinutes(
							entry.startTime.slice(0, 5)
						)
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
	}, [token, form.vetProfileId, form.date, dayOfWeekName])

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
			const message =
				err instanceof Error
					? err.message
					: 'Unexpected error while booking visit.'
			setError(message)
			toast.error(message)
		} finally {
			setIsSubmitting(false)
		}
	}

	const title = 'Book a new visit'

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
					<input
						id='date'
						type='date'
						name='date'
						value={form.date}
						onChange={handleChange}
						className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200'
						required
					/>
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
						disabled={loadingSlots || availableSlots.length === 0}
						className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200 disabled:cursor-not-allowed disabled:bg-slate-100'
						required
					>
						{loadingSlots && <option>Loading...</option>}
						{!loadingSlots && availableSlots.length === 0 && (
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
					<button
						type='button'
						onClick={onCancel}
						className='rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50'
						disabled={isSubmitting}
					>
						Cancel
					</button>
				)}
				<button
					type='submit'
					className='rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60'
					disabled={
						isSubmitting ||
						loadingSlots ||
						!form.petId ||
						!form.vetProfileId
					}
				>
					{isSubmitting ? 'Booking...' : 'Book visit'}
				</button>
			</div>
		</form>
	)
}
