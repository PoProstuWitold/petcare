import type * as React from 'react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { useAuthFetch } from '../hooks/useAuthFetch'
import type { Pet } from '../utils/types'
import { Button } from './ui/Button'

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

export function PetForm({ mode, initialPet, onCancel, onSaved }: PetFormProps) {
	const { accessToken, user } = useAuth()
	const { json } = useAuthFetch()
	const [isSubmitting, setIsSubmitting] = useState(false)

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
		} catch (error) {
			console.error('ErrorHandler while submitting pet form', error)
			toast.error('Unexpected error while saving pet.')
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
						className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200'
						placeholder='e.g. Luna'
						required
					/>
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
						className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200'
						required
					>
						<option value=''>Select species</option>
						{SPECIES_OPTIONS.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
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
						className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200'
					>
						{SEX_OPTIONS.map((option) => (
							<option key={option} value={option}>
								{option}
							</option>
						))}
					</select>
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
						className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200'
						placeholder='optional'
					/>
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
						className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200'
					/>
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
						className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200'
						placeholder='e.g. 2019'
						min={1900}
						max={new Date().getFullYear()}
					/>
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
						className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200'
						step='0.1'
						min='0'
						placeholder='optional'
					/>
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
						className='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200'
						rows={3}
						placeholder='Any important medical or behavioral notes...'
					/>
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
				<Button type='submit' variant='primary' disabled={isSubmitting}>
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
