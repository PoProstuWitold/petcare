import type * as React from 'react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { useAuthFetch } from '../hooks/useAuthFetch'
import type { Pet } from '../utils/types'
import { Button } from './ui/Button'
import { Spinner } from './ui/Spinner'

const SPECIES_OPTIONS = [
	'DOG',
	'CAT',
	'RABBIT',
	'GUINEA_PIG',
	'HAMSTER',
	'BIRD',
	'TURTLE',
	'FERRET',
	'OTHER'
] as const

const SEX_OPTIONS = ['UNKNOWN', 'MALE', 'FEMALE'] as const

type PetFormMode = 'create' | 'edit'

interface PetFormProps {
	mode: PetFormMode
	initialPet?: Pet
	onCancel?: () => void
	onSaved?: (pet: Pet) => void
}

interface PetFormState {
	name: string
	species: string
	sex: string
	breed: string
	birthDate: string
	birthYear: string
	weight: string
	notes: string
}

// Helper function to parse validation errors from API response
// Format: "field: message, field2: message2"
function parseValidationErrors(errorMessage: string): Record<string, string> {
	const errors: Record<string, string> = {}

	// Split by comma and parse each "field: message" pair
	const parts = errorMessage.split(',').map((s) => s.trim())

	for (const part of parts) {
		const colonIndex = part.indexOf(':')
		if (colonIndex > 0) {
			const field = part.substring(0, colonIndex).trim()
			const message = part.substring(colonIndex + 1).trim()
			if (field && message) {
				errors[field] = message
			}
		}
	}

	return errors
}

export function PetForm({ mode, initialPet, onCancel, onSaved }: PetFormProps) {
	const { accessToken, user } = useAuth()
	const { json } = useAuthFetch()
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

	const [form, setForm] = useState<PetFormState>(() => ({
		name: initialPet?.name ?? '',
		species: initialPet?.species ?? '',
		sex: initialPet?.sex ?? '',
		breed: initialPet?.breed ?? '',
		birthDate: initialPet?.birthDate ?? '',
		birthYear: initialPet?.birthYear ? String(initialPet.birthYear) : '',
		weight: initialPet?.weight ? String(initialPet.weight) : '',
		notes: initialPet?.notes ?? ''
	}))

	if (!accessToken || !user) {
		return (
			<div className='rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm'>
				You must be logged in to manage pets.
			</div>
		)
	}

	const handleChange = (
		event: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) => {
		const { name, value } = event.target
		setForm((prev) => ({ ...prev, [name]: value }))
		// Clear field error when user starts typing
		if (fieldErrors[name]) {
			setFieldErrors((prev) => {
				const newErrors = { ...prev }
				delete newErrors[name]
				return newErrors
			})
		}
	}

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault()

		if (!form.name.trim()) {
			toast.error('Name is required.')
			return
		}
		if (!form.species) {
			toast.error('Species is required.')
			return
		}

		const isEdit = mode === 'edit'

		const payload = {
			ownerId: isEdit ? initialPet?.ownerId : user.id,
			name: form.name.trim(),
			species: form.species,
			sex: form.sex || null,
			breed: form.breed || null,
			birthDate: form.birthDate || null,
			birthYear: form.birthYear ? Number(form.birthYear) : null,
			weight: form.weight ? Number(form.weight) : null,
			notes: form.notes || null
		}

		const url = isEdit ? `/api/pets/${initialPet?.id}` : '/api/pets'
		const method = isEdit ? 'PUT' : 'POST'

		setIsSubmitting(true)
		setFieldErrors({}) // Clear previous errors

		try {
			const data = await json<Pet>(url, {
				method,
				body: JSON.stringify(payload)
			})

			if (onSaved) {
				onSaved(data)
			}

			toast.success(
				isEdit
					? 'Pet updated successfully.'
					: 'Pet created successfully.'
			)

			if (!isEdit) {
				// reset form after successful creation
				setForm({
					name: '',
					species: '',
					sex: '',
					breed: '',
					birthDate: '',
					birthYear: '',
					weight: '',
					notes: ''
				})
			}
			setFieldErrors({}) // Clear errors on success
		} catch (error) {
			console.error('Error while submitting pet form', error)
			// Extract error message from API response
			let errorMessage = 'Unexpected error while saving pet.'
			if (error instanceof Error) {
				// HttpError from httpJson has body.message or error.message
				// biome-ignore lint: no need to narrow
				const httpError = error as any
				if (httpError.body?.message) {
					errorMessage = httpError.body.message
				} else if (error.message) {
					errorMessage = error.message
				}
			}

			// Check if it's a validation error (400 Bad Request with field: message format)
			// biome-ignore lint: no need to narrow
			const httpError = error as any
			if (httpError.status === 400 && errorMessage.includes(':')) {
				// Parse validation errors and map to fields
				const validationErrors = parseValidationErrors(errorMessage)
				setFieldErrors(validationErrors)
				// Show toast with general message if there are multiple errors
				if (Object.keys(validationErrors).length > 1) {
					toast.error('Please fix the validation errors below')
				} else {
					toast.error(errorMessage)
				}
			} else {
				toast.error(errorMessage)
			}
		} finally {
			setIsSubmitting(false)
		}
	}

	const title = mode === 'edit' ? 'Edit pet' : 'Add new pet'

	return (
		<form
			onSubmit={handleSubmit}
			className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6'
		>
			<h2 className='mb-4 text-lg font-semibold text-slate-900'>
				{title}
			</h2>

			<div className='grid gap-4 sm:grid-cols-2'>
				<div className='sm:col-span-1'>
					<label
						htmlFor='name'
						className='block text-xs font-medium uppercase tracking-wide text-slate-700'
					>
						Name
					</label>
					<input
						type='text'
						name='name'
						value={form.name}
						onChange={handleChange}
						className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
							fieldErrors.name
								? 'border-red-300 focus:border-red-500 focus:ring-red-200'
								: 'border-slate-300 bg-white focus:border-sky-500 focus:ring-sky-200'
						}`}
						placeholder='e.g. Luna'
						required
					/>
					{fieldErrors.name && (
						<p className='mt-1 text-xs text-red-600'>
							{fieldErrors.name}
						</p>
					)}
				</div>

				<div className='sm:col-span-1'>
					<label
						htmlFor='species'
						className='block text-xs font-medium uppercase tracking-wide text-slate-700'
					>
						Species
					</label>
					<select
						name='species'
						value={form.species}
						onChange={handleChange}
						className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
							fieldErrors.species
								? 'border-red-300 focus:border-red-500 focus:ring-red-200'
								: 'border-slate-300 bg-white focus:border-sky-500 focus:ring-sky-200'
						}`}
						required
					>
						<option value=''>Select species</option>
						{SPECIES_OPTIONS.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
					{fieldErrors.species && (
						<p className='mt-1 text-xs text-red-600'>
							{fieldErrors.species}
						</p>
					)}
				</div>

				<div className='sm:col-span-1'>
					<label
						htmlFor='sex'
						className='block text-xs font-medium uppercase tracking-wide text-slate-700'
					>
						Sex
					</label>
					<select
						name='sex'
						value={form.sex}
						onChange={handleChange}
						className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
							fieldErrors.sex
								? 'border-red-300 focus:border-red-500 focus:ring-red-200'
								: 'border-slate-300 bg-white focus:border-sky-500 focus:ring-sky-200'
						}`}
					>
						{SEX_OPTIONS.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
					{fieldErrors.sex && (
						<p className='mt-1 text-xs text-red-600'>
							{fieldErrors.sex}
						</p>
					)}
				</div>

				<div className='sm:col-span-1'>
					<label
						htmlFor='breed'
						className='block text-xs font-medium uppercase tracking-wide text-slate-700'
					>
						Breed
					</label>
					<input
						type='text'
						name='breed'
						value={form.breed}
						onChange={handleChange}
						className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
							fieldErrors.breed
								? 'border-red-300 focus:border-red-500 focus:ring-red-200'
								: 'border-slate-300 bg-white focus:border-sky-500 focus:ring-sky-200'
						}`}
						placeholder='optional'
					/>
					{fieldErrors.breed && (
						<p className='mt-1 text-xs text-red-600'>
							{fieldErrors.breed}
						</p>
					)}
				</div>

				<div>
					<label
						htmlFor='birthDate'
						className='block text-xs font-medium uppercase tracking-wide text-slate-700'
					>
						Birth date
					</label>
					<input
						type='date'
						name='birthDate'
						value={form.birthDate}
						onChange={handleChange}
						className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
							fieldErrors.birthDate
								? 'border-red-300 focus:border-red-500 focus:ring-red-200'
								: 'border-slate-300 bg-white focus:border-sky-500 focus:ring-sky-200'
						}`}
					/>
					{fieldErrors.birthDate && (
						<p className='mt-1 text-xs text-red-600'>
							{fieldErrors.birthDate}
						</p>
					)}
					<p className='mt-1 text-[11px] text-slate-500'>
						If you do not know exact date, you can provide only year
						below.
					</p>
				</div>

				<div>
					<label
						htmlFor='birthYear'
						className='block text-xs font-medium uppercase tracking-wide text-slate-700'
					>
						Birth year
					</label>
					<input
						type='number'
						name='birthYear'
						value={form.birthYear}
						onChange={handleChange}
						className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
							fieldErrors.birthYear
								? 'border-red-300 focus:border-red-500 focus:ring-red-200'
								: 'border-slate-300 bg-white focus:border-sky-500 focus:ring-sky-200'
						}`}
						placeholder='e.g. 2019'
						min={1900}
						max={new Date().getFullYear()}
					/>
					{fieldErrors.birthYear && (
						<p className='mt-1 text-xs text-red-600'>
							{fieldErrors.birthYear}
						</p>
					)}
				</div>

				<div>
					<label
						htmlFor='weight'
						className='block text-xs font-medium uppercase tracking-wide text-slate-700'
					>
						Weight (kg)
					</label>
					<input
						type='number'
						name='weight'
						value={form.weight}
						onChange={handleChange}
						className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
							fieldErrors.weight
								? 'border-red-300 focus:border-red-500 focus:ring-red-200'
								: 'border-slate-300 bg-white focus:border-sky-500 focus:ring-sky-200'
						}`}
						step='0.1'
						min='0'
						placeholder='optional'
					/>
					{fieldErrors.weight && (
						<p className='mt-1 text-xs text-red-600'>
							{fieldErrors.weight}
						</p>
					)}
				</div>

				<div className='sm:col-span-2'>
					<label
						htmlFor='notes'
						className='block text-xs font-medium uppercase tracking-wide text-slate-700'
					>
						Notes
					</label>
					<textarea
						name='notes'
						value={form.notes}
						onChange={handleChange}
						className={`mt-1 w-full rounded-lg border px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 ${
							fieldErrors.notes
								? 'border-red-300 focus:border-red-500 focus:ring-red-200'
								: 'border-slate-300 bg-white focus:border-sky-500 focus:ring-sky-200'
						}`}
						rows={3}
						placeholder='Any important medical or behavioral notes...'
					/>
					{fieldErrors.notes && (
						<p className='mt-1 text-xs text-red-600'>
							{fieldErrors.notes}
						</p>
					)}
				</div>
			</div>

			<div className='mt-6 flex justify-end gap-3'>
				{onCancel && (
					<Button
						type='button'
						variant='ghost'
						onClick={onCancel}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
				)}
				<Button
					type='submit'
					variant='primary'
					disabled={isSubmitting}
					className='flex items-center gap-2'
				>
					{isSubmitting && (
						<Spinner
							size='sm'
							className='border-white border-t-transparent'
						/>
					)}
					{isSubmitting
						? mode === 'edit'
							? 'Saving...'
							: 'Creating...'
						: mode === 'edit'
							? 'Save changes'
							: 'Create pet'}
				</Button>
			</div>
		</form>
	)
}
