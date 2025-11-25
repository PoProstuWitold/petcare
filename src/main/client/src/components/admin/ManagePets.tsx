import { useCallback, useEffect, useMemo, useState } from 'react'
import { FaEdit, FaPaw, FaPlus, FaSync, FaTrash } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { authHeaders, httpJson } from '../../utils/http'
import type { Pet, User } from '../../utils/types'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { ConfirmationDialog } from '../ui/ConfirmationDialog'
import { Pagination } from '../ui/Pagination'
import { Spinner } from '../ui/Spinner'

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

type FormMode = 'CREATE' | 'EDIT'

type PetFormState = {
	ownerId: string
	name: string
	species: string
	sex: string
	breed: string
	birthDate: string
	birthYear: string
	weight: string
	notes: string
}

type PageResponse<T> = {
	content: T[]
	totalElements: number
	totalPages: number
	size: number
	number: number
}

export function ManagePets() {
	const { accessToken } = useAuth()
	const [page, setPage] = useState(0)
	const [pageSize, setPageSize] = useState(20)
	const [petsData, setPetsData] = useState<PageResponse<Pet> | null>(null)
	const [pets, setPets] = useState<Pet[]>([])
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(false)
	const [refreshing, setRefreshing] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [formMode, setFormMode] = useState<FormMode>('CREATE')
	const [selectedPet, setSelectedPet] = useState<Pet | null>(null)
	const [submitting, setSubmitting] = useState(false)
	const [petToDelete, setPetToDelete] = useState<Pet | null>(null)

	const [form, setForm] = useState<PetFormState>({
		ownerId: '',
		name: '',
		species: '',
		sex: '',
		breed: '',
		birthDate: '',
		birthYear: '',
		weight: '',
		notes: ''
	})

	const canSubmit = useMemo(
		() => form.ownerId && form.name.trim() && form.species,
		[form.ownerId, form.name, form.species]
	)

	const loadPets = useCallback(async () => {
		if (!accessToken) return
		setLoading(true)
		setError(null)
		try {
			const data = await httpJson<Pet[] | PageResponse<Pet>>(
				`/api/pets?page=${page}&size=${pageSize}`,
				{
					headers: authHeaders(accessToken)
				}
			)
			// Handle both Page and List responses
			if (Array.isArray(data)) {
				setPetsData({
					content: data,
					totalElements: data.length,
					totalPages: 1,
					size: data.length,
					number: 0
				})
				setPets(data)
			} else if (data && typeof data === 'object' && 'content' in data) {
				const pageData = data as PageResponse<Pet>
				setPetsData(pageData)
				setPets(pageData.content || [])
			} else {
				setPetsData({
					content: [],
					totalElements: 0,
					totalPages: 0,
					size: 0,
					number: 0
				})
				setPets([])
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to load pets')
		} finally {
			setLoading(false)
		}
	}, [accessToken, page, pageSize])

	const loadUsers = useCallback(async () => {
		if (!accessToken) return
		try {
			type PageResponse<T> = {
				content: T[]
				totalElements: number
				totalPages: number
				size: number
				number: number
			}
			const data = await httpJson<User[] | PageResponse<User>>(
				'/api/users',
				{
					headers: authHeaders(accessToken)
				}
			)
			// Handle both Page and List responses
			if (Array.isArray(data)) {
				setUsers(data)
			} else if (data && typeof data === 'object' && 'content' in data) {
				setUsers((data as PageResponse<User>).content || [])
			} else {
				setUsers([])
			}
		} catch (_e) {
			// keep silent here, owner dropdown will be empty
		}
	}, [accessToken])

	useEffect(() => {
		if (!accessToken) return
		loadPets()
	}, [accessToken, loadPets])

	useEffect(() => {
		if (!accessToken) return
		loadUsers()
	}, [accessToken, loadUsers])

	function resetForm() {
		setForm({
			ownerId: '',
			name: '',
			species: '',
			sex: '',
			breed: '',
			birthDate: '',
			birthYear: '',
			weight: '',
			notes: ''
		})
		setSelectedPet(null)
	}

	function startCreate() {
		resetForm()
		setFormMode('CREATE')
	}

	function startEdit(pet: Pet) {
		setSelectedPet(pet)
		setFormMode('EDIT')
		setForm({
			ownerId: String(pet.ownerId ?? ''),
			name: pet.name ?? '',
			species: pet.species ?? '',
			sex: pet.sex ?? '',
			breed: pet.breed ?? '',
			birthDate: pet.birthDate ?? '',
			birthYear: pet.birthYear ? String(pet.birthYear) : '',
			weight: pet.weight ? String(pet.weight) : '',
			notes: pet.notes ?? ''
		})
	}

	function handleChange(
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>
	) {
		const { name, value } = e.target
		setForm((prev) => ({ ...prev, [name]: value }))
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (!accessToken || !canSubmit) return
		setSubmitting(true)
		setError(null)

		const isEdit = formMode === 'EDIT' && selectedPet
		const url = isEdit ? `/api/pets/${selectedPet?.id}` : '/api/pets'
		const method = isEdit ? 'PUT' : 'POST'

		const payload = {
			ownerId: Number(form.ownerId),
			name: form.name.trim(),
			species: form.species,
			sex: form.sex || null,
			breed: form.breed || null,
			birthDate: form.birthDate || null,
			birthYear: form.birthYear ? Number(form.birthYear) : null,
			weight: form.weight ? Number(form.weight) : null,
			notes: form.notes || null
		}

		try {
			await httpJson<Pet>(url, {
				method,
				headers: authHeaders(accessToken),
				body: JSON.stringify(payload)
			})
			// Refresh full list to ensure consistency with server state
			await loadPets()
			startCreate()
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to save pet')
		} finally {
			setSubmitting(false)
		}
	}

	function handleDelete(pet: Pet) {
		setPetToDelete(pet)
	}

	async function confirmDeletePet() {
		if (!petToDelete || !accessToken) {
			setPetToDelete(null)
			return
		}
		try {
			await httpJson<void>(`/api/pets/${petToDelete.id}`, {
				method: 'DELETE',
				headers: authHeaders(accessToken)
			})
			// Refresh full list to ensure consistency with server state
			await loadPets()
			setPetToDelete(null)
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to delete pet')
		}
	}

	async function refresh() {
		setRefreshing(true)
		await loadPets()
		setRefreshing(false)
	}

	const ownerName = (ownerId?: number) => {
		if (!ownerId) return '—'
		const u = users.find((x) => x.id === ownerId)
		return u ? u.fullName : `#${ownerId}`
	}

	return (
		<section className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 space-y-6'>
			<header className='flex flex-wrap items-center justify-between gap-3'>
				<div>
					<h2 className='text-lg font-semibold text-slate-900 flex items-center gap-2'>
						<FaPaw className='text-slate-500' /> Pets
					</h2>
					<p className='mt-1 text-sm text-slate-600'>
						Create, update and remove pets. Use owner selection to
						assign pets.
					</p>
				</div>
				<div className='flex gap-2'>
					<Button
						type='button'
						variant='outline'
						small
						onClick={refresh}
						disabled={refreshing}
					>
						<FaSync className='mr-1' />{' '}
						{refreshing ? 'Refreshing...' : 'Refresh'}
					</Button>
					<Button type='button' small onClick={startCreate}>
						<FaPlus className='mr-1' /> New Pet
					</Button>
				</div>
			</header>

			{error && <Alert variant='error'>{error}</Alert>}

			<div className='overflow-x-auto rounded-lg border border-slate-200'>
				<table className='w-full text-left text-sm'>
					<thead className='bg-slate-50 text-slate-600 text-xs uppercase tracking-wide'>
						<tr>
							<th className='px-3 py-2'>ID</th>
							<th className='px-3 py-2'>Name</th>
							<th className='px-3 py-2'>Owner</th>
							<th className='px-3 py-2'>Species</th>
							<th className='px-3 py-2'>Sex</th>
							<th className='px-3 py-2'>Weight</th>
							<th className='px-3 py-2' />
						</tr>
					</thead>
					<tbody>
						{loading && (
							<tr>
								<td
									colSpan={7}
									className='px-3 py-4 text-center text-slate-500'
								>
									Loading pets...
								</td>
							</tr>
						)}
						{!loading && pets.length === 0 && (
							<tr>
								<td
									colSpan={7}
									className='px-3 py-4 text-center text-slate-500'
								>
									No pets found.
								</td>
							</tr>
						)}
						{!loading &&
							pets.map((p) => (
								<tr
									key={p.id}
									className='border-t border-slate-100 hover:bg-slate-50'
								>
									<td className='px-3 py-2 text-xs text-slate-500'>
										#{p.id}
									</td>
									<td className='px-3 py-2 font-medium text-slate-800'>
										{p.name}
									</td>
									<td className='px-3 py-2'>
										{ownerName(p.ownerId)}
									</td>
									<td className='px-3 py-2'>{p.species}</td>
									<td className='px-3 py-2'>
										{p.sex || '—'}
									</td>
									<td className='px-3 py-2'>
										{p.weight ? `${p.weight} kg` : '—'}
									</td>
									<td className='px-3 py-2'>
										<div className='flex gap-2'>
											<Button
												type='button'
												variant='ghost'
												small
												onClick={() => startEdit(p)}
												title='Edit pet'
											>
												<FaEdit />
											</Button>
											<Button
												type='button'
												variant='danger'
												small
												onClick={() => handleDelete(p)}
												title='Delete pet'
											>
												<FaTrash />
											</Button>
										</div>
									</td>
								</tr>
							))}
					</tbody>
				</table>
			</div>

			{petsData && (
				<div className='mt-4'>
					<Pagination
						currentPage={petsData.number}
						totalPages={petsData.totalPages}
						pageSize={petsData.size}
						totalElements={petsData.totalElements}
						onPageChange={setPage}
						onPageSizeChange={(size) => {
							setPageSize(size)
							setPage(0)
						}}
					/>
				</div>
			)}

			<div className='rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-6'>
				<nav className='flex flex-wrap gap-2 text-xs font-medium'>
					<button
						type='button'
						onClick={startCreate}
						className={`rounded-full px-3 py-1 border ${formMode === 'CREATE' ? 'bg-white text-slate-900 border-slate-300' : 'border-transparent text-slate-600 hover:text-slate-800'}`}
					>
						Create
					</button>
					<button
						type='button'
						disabled={!selectedPet}
						onClick={() => setFormMode('EDIT')}
						className={`rounded-full px-3 py-1 border ${formMode === 'EDIT' ? 'bg-white text-slate-900 border-slate-300' : 'border-transparent text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed'}`}
					>
						Edit
					</button>
				</nav>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<h3 className='text-sm font-semibold text-slate-800 flex items-center gap-2'>
						{formMode === 'EDIT' ? 'Edit Pet' : 'Create Pet'}
					</h3>
					<div className='grid gap-4 sm:grid-cols-2'>
						<div className='flex flex-col gap-1'>
							<label
								htmlFor='ownerId'
								className='text-xs font-medium uppercase tracking-wide text-slate-600'
							>
								Owner
							</label>
							<select
								id='ownerId'
								name='ownerId'
								value={form.ownerId}
								onChange={handleChange}
								className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
								required
							>
								<option value=''>Select owner</option>
								{users.map((u) => (
									<option key={u.id} value={u.id}>
										{u.fullName} ({u.username})
									</option>
								))}
							</select>
						</div>

						<div className='flex flex-col gap-1'>
							<label
								htmlFor='name'
								className='text-xs font-medium uppercase tracking-wide text-slate-600'
							>
								Name
							</label>
							<input
								id='name'
								name='name'
								value={form.name}
								onChange={handleChange}
								className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
								placeholder='e.g. Luna'
								required
							/>
						</div>

						<div className='flex flex-col gap-1'>
							<label
								htmlFor='species'
								className='text-xs font-medium uppercase tracking-wide text-slate-600'
							>
								Species
							</label>
							<select
								id='species'
								name='species'
								value={form.species}
								onChange={handleChange}
								className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
								required
							>
								<option value=''>Select species</option>
								{SPECIES_OPTIONS.map((s) => (
									<option key={s} value={s}>
										{s}
									</option>
								))}
							</select>
						</div>

						<div className='flex flex-col gap-1'>
							<label
								htmlFor='sex'
								className='text-xs font-medium uppercase tracking-wide text-slate-600'
							>
								Sex
							</label>
							<select
								id='sex'
								name='sex'
								value={form.sex}
								onChange={handleChange}
								className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
							>
								{SEX_OPTIONS.map((sx) => (
									<option key={sx} value={sx}>
										{sx}
									</option>
								))}
							</select>
						</div>

						<div className='flex flex-col gap-1'>
							<label
								htmlFor='breed'
								className='text-xs font-medium uppercase tracking-wide text-slate-600'
							>
								Breed
							</label>
							<input
								id='breed'
								name='breed'
								value={form.breed}
								onChange={handleChange}
								className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
								placeholder='optional'
							/>
						</div>

						<div className='flex flex-col gap-1'>
							<label
								htmlFor='birthDate'
								className='text-xs font-medium uppercase tracking-wide text-slate-600'
							>
								Birth date
							</label>
							<input
								id='birthDate'
								type='date'
								name='birthDate'
								value={form.birthDate}
								onChange={handleChange}
								className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
							/>
							<p className='mt-1 text-[11px] text-slate-500'>
								If unknown, you can specify only the year.
							</p>
						</div>

						<div className='flex flex-col gap-1'>
							<label
								htmlFor='birthYear'
								className='text-xs font-medium uppercase tracking-wide text-slate-600'
							>
								Birth year
							</label>
							<input
								id='birthYear'
								type='number'
								name='birthYear'
								value={form.birthYear}
								onChange={handleChange}
								className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
								placeholder='e.g. 2019'
								min={1900}
								max={new Date().getFullYear()}
							/>
						</div>

						<div className='flex flex-col gap-1'>
							<label
								htmlFor='weight'
								className='text-xs font-medium uppercase tracking-wide text-slate-600'
							>
								Weight (kg)
							</label>
							<input
								id='weight'
								type='number'
								name='weight'
								value={form.weight}
								onChange={handleChange}
								className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
								step='0.1'
								min='0'
								placeholder='optional'
							/>
						</div>

						<div className='sm:col-span-2 flex flex-col gap-1'>
							<label
								htmlFor='notes'
								className='text-xs font-medium uppercase tracking-wide text-slate-600'
							>
								Notes
							</label>
							<textarea
								id='notes'
								name='notes'
								value={form.notes}
								onChange={handleChange}
								className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
								rows={3}
								placeholder='Any important notes...'
							/>
						</div>
					</div>

					<div className='pt-2 flex gap-2'>
						<Button
							type='submit'
							disabled={!canSubmit || submitting}
							className='flex items-center gap-2'
						>
							{submitting && (
								<Spinner
									size='sm'
									className='border-white border-t-transparent'
								/>
							)}
							{submitting
								? formMode === 'EDIT'
									? 'Saving...'
									: 'Creating...'
								: formMode === 'EDIT'
									? 'Save changes'
									: 'Create pet'}
						</Button>
						<Button
							type='button'
							variant='ghost'
							onClick={startCreate}
							disabled={submitting}
						>
							Reset
						</Button>
					</div>
				</form>
			</div>

			<ConfirmationDialog
				isOpen={petToDelete !== null}
				title='Delete Pet'
				message={
					petToDelete
						? `Delete pet "${petToDelete.name}"? This cannot be undone.`
						: ''
				}
				confirmLabel='Delete'
				cancelLabel='Cancel'
				onConfirm={confirmDeletePet}
				onCancel={() => setPetToDelete(null)}
				variant='danger'
			/>
		</section>
	)
}
