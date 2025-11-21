import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	FaCalendarAlt,
	FaClipboardList,
	FaEdit,
	FaNotesMedical,
	FaPaw,
	FaPlus,
	FaSync,
	FaTrash,
	FaUserMd
} from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { authHeaders, httpJson } from '../../utils/http'
import type { Pet, Visit, VisitStatus } from '../../utils/types'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { ConfirmationDialog } from '../ui/ConfirmationDialog'

// Remove VisitExtended alias

type FormMode = 'CREATE' | 'EDIT'

type VisitFormState = {
	petId: string
	vetProfileId: string
	date: string
	startTime: string
	reason: string
	notes: string
	status: VisitStatus
}

const STATUS_OPTIONS: VisitStatus[] = [
	'SCHEDULED',
	'CONFIRMED',
	'COMPLETED',
	'CANCELLED'
]

export function ManageVisits() {
	const { accessToken } = useAuth()
	const [visits, setVisits] = useState<Visit[]>([])
	const [pets, setPets] = useState<Pet[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [refreshing, setRefreshing] = useState(false)
	const [formMode, setFormMode] = useState<FormMode>('CREATE')
	const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null)
	const [submitting, setSubmitting] = useState(false)
	const [filterPetId, setFilterPetId] = useState<string>('')
	const [visitToDelete, setVisitToDelete] = useState<Visit | null>(null)
	const [filterVetProfileId, setFilterVetProfileId] = useState<string>('')

	const [form, setForm] = useState<VisitFormState>({
		petId: '',
		vetProfileId: '',
		date: '',
		startTime: '',
		reason: '',
		notes: '',
		status: 'SCHEDULED'
	})

	const canSubmit = useMemo(
		() =>
			form.petId &&
			form.vetProfileId &&
			form.date &&
			form.startTime &&
			form.reason.trim(),
		[form.petId, form.vetProfileId, form.date, form.startTime, form.reason]
	)

	const loadVisits = useCallback(async () => {
		if (!accessToken) return
		setLoading(true)
		setError(null)
		try {
			// Basic listing: if filter by pet use by-pet endpoint else if vet+date maybe we could call by-vet; fallback: aggregated by all pets (loop pets) – for simplicity GET by each pet when filtered.
			let data: Visit[]
			if (filterPetId) {
				data = await httpJson<Visit[]>(
					`/api/visits/by-pet/${filterPetId}`,
					{ headers: authHeaders(accessToken) }
				)
			} else {
				const petList = await httpJson<Pet[]>('/api/pets', {
					headers: authHeaders(accessToken)
				})
				setPets(petList)
				const visitPromises = petList.map((p) =>
					httpJson<Visit[]>(`/api/visits/by-pet/${p.id}`, {
						headers: authHeaders(accessToken)
					}).catch(() => [] as Visit[])
				)
				const results = await Promise.all(visitPromises)
				data = results.flat()
			}
			// Optional vet filter
			if (filterVetProfileId) {
				data = data.filter(
					(v) => String(v.vetProfileId) === filterVetProfileId
				)
			}
			// Sort by date / startTime
			data.sort((a, b) =>
				(a.date + a.startTime).localeCompare(b.date + b.startTime)
			)
			setVisits(data)
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to load visits')
		} finally {
			setLoading(false)
		}
	}, [accessToken, filterPetId, filterVetProfileId])

	const loadPets = useCallback(async () => {
		if (!accessToken) return
		try {
			const data = await httpJson<Pet[]>('/api/pets', {
				headers: authHeaders(accessToken)
			})
			setPets(data)
		} catch {}
	}, [accessToken])

	useEffect(() => {
		if (!accessToken) return
		loadPets()
	}, [accessToken, loadPets])

	useEffect(() => {
		if (!accessToken) return
		loadVisits()
	}, [accessToken, loadVisits])

	function resetForm() {
		setForm({
			petId: '',
			vetProfileId: '',
			date: '',
			startTime: '',
			reason: '',
			notes: '',
			status: 'SCHEDULED'
		})
		setSelectedVisit(null)
	}

	function startCreate() {
		resetForm()
		setFormMode('CREATE')
	}

	function startEdit(v: Visit) {
		setSelectedVisit(v)
		setFormMode('EDIT')
		setForm({
			petId: String(v.pet.id),
			vetProfileId: String(v.vetProfileId),
			date: v.date,
			startTime: v.startTime,
			reason: v.reason || '',
			notes: v.notes || '',
			status: v.status
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

		const isEdit = formMode === 'EDIT' && selectedVisit

		try {
			if (isEdit) {
				// status update separate endpoint; reason/notes patch; we don't allow changing date/time/pet/vet in simple edit
				if (form.status !== selectedVisit?.status) {
					await httpJson<Visit>(
						`/api/visits/${selectedVisit?.id}/status`,
						{
							method: 'PATCH',
							headers: authHeaders(accessToken),
							body: JSON.stringify({ status: form.status })
						}
					)
				}
				await httpJson<Visit>(`/api/visits/${selectedVisit?.id}`, {
					method: 'PATCH',
					headers: authHeaders(accessToken),
					body: JSON.stringify({
						reason: form.reason || null,
						notes: form.notes || null
					})
				})
				setVisits((prev) =>
					prev.map((v) =>
						v.id === selectedVisit?.id
							? {
									...v,
									status: form.status,
									reason: form.reason,
									notes: form.notes
								}
							: v
					)
				)
			} else {
				// Create visit
				const payload = {
					petId: Number(form.petId),
					vetProfileId: Number(form.vetProfileId),
					date: form.date,
					startTime: form.startTime,
					reason: form.reason.trim(),
					notes: form.notes || null
				}
				const created = await httpJson<Visit>('/api/visits', {
					method: 'POST',
					headers: authHeaders(accessToken),
					body: JSON.stringify(payload)
				})
				setVisits((prev) => [created, ...prev])
			}
			startCreate()
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to save visit')
		} finally {
			setSubmitting(false)
		}
	}

	function handleDelete(v: Visit) {
		setVisitToDelete(v)
	}

	async function confirmDeleteVisit() {
		if (!visitToDelete || !accessToken) {
			setVisitToDelete(null)
			return
		}
		try {
			await httpJson<void>(`/api/visits/${visitToDelete.id}`, {
				method: 'DELETE',
				headers: authHeaders(accessToken)
			})
			setVisits((prev) => prev.filter((x) => x.id !== visitToDelete.id))
			setVisitToDelete(null)
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to delete visit')
		}
	}

	async function refresh() {
		setRefreshing(true)
		await loadVisits()
		setRefreshing(false)
	}

	const filteredPets = pets
	const petName = (petId?: number) => {
		if (!petId) return '—'
		const p = pets.find((x) => x.id === petId)
		return p ? p.name : `#${petId}`
	}

	return (
		<section className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 space-y-6'>
			<header className='flex flex-wrap items-center justify-between gap-3'>
				<div>
					<h2 className='text-lg font-semibold text-slate-900 flex items-center gap-2'>
						<FaCalendarAlt className='text-slate-500' /> Visits
					</h2>
					<p className='mt-1 text-sm text-slate-600'>
						Create, update status, modify reason/notes and delete
						visits.
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
						{' '}
						<FaSync className='mr-1' />{' '}
						{refreshing ? 'Refreshing...' : 'Refresh'}{' '}
					</Button>
					<Button type='button' small onClick={startCreate}>
						{' '}
						<FaPlus className='mr-1' /> New Visit{' '}
					</Button>
				</div>
			</header>

			{error && <Alert variant='error'>{error}</Alert>}

			{/* Filters */}
			<div className='flex flex-wrap gap-4 items-end'>
				<div className='flex flex-col gap-1'>
					<label
						htmlFor='filterPet'
						className='text-xs font-medium uppercase tracking-wide text-slate-600'
					>
						Filter by Pet
					</label>
					<select
						id='filterPet'
						value={filterPetId}
						onChange={(e) => setFilterPetId(e.target.value)}
						className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
					>
						<option value=''>All</option>
						{filteredPets.map((p) => (
							<option key={p.id} value={p.id}>
								{p.name}
							</option>
						))}
					</select>
				</div>
				<div className='flex flex-col gap-1'>
					<label
						htmlFor='filterVet'
						className='text-xs font-medium uppercase tracking-wide text-slate-600'
					>
						Filter by Vet Profile ID
					</label>
					<input
						id='filterVet'
						type='text'
						value={filterVetProfileId}
						onChange={(e) => setFilterVetProfileId(e.target.value)}
						className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
						placeholder='e.g. 3'
					/>
				</div>
				<Button type='button' variant='ghost' small onClick={refresh}>
					Apply
				</Button>
			</div>

			{/* Visits table */}
			<div className='overflow-x-auto rounded-lg border border-slate-200'>
				<table className='w-full text-left text-sm'>
					<thead className='bg-slate-50 text-slate-600 text-xs uppercase tracking-wide'>
						<tr>
							<th className='px-3 py-2'>ID</th>
							<th className='px-3 py-2'>Pet</th>
							<th className='px-3 py-2'>Date</th>
							<th className='px-3 py-2'>Start</th>
							<th className='px-3 py-2'>Reason</th>
							<th className='px-3 py-2'>Status</th>
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
									Loading visits...
								</td>
							</tr>
						)}
						{!loading && visits.length === 0 && (
							<tr>
								<td
									colSpan={7}
									className='px-3 py-4 text-center text-slate-500'
								>
									No visits found.
								</td>
							</tr>
						)}
						{!loading &&
							visits.map((v) => (
								<tr
									key={v.id}
									className='border-t border-slate-100 hover:bg-slate-50'
								>
									<td className='px-3 py-2 text-xs text-slate-500'>
										#{v.id}
									</td>
									<td className='px-3 py-2 font-medium text-slate-800 flex items-center gap-1'>
										<FaPaw className='text-slate-400' />{' '}
										{petName(v.pet.id)}
									</td>
									<td className='px-3 py-2'>{v.date}</td>
									<td className='px-3 py-2'>{v.startTime}</td>
									<td
										className='px-3 py-2 max-w-[180px] truncate'
										title={v.reason || ''}
									>
										{v.reason || '—'}
									</td>
									<td className='px-3 py-2'>
										<span className='rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-slate-700'>
											{v.status}
										</span>
									</td>
									<td className='px-3 py-2'>
										<div className='flex gap-2'>
											<Button
												type='button'
												variant='ghost'
												small
												onClick={() => startEdit(v)}
												title='Edit visit'
											>
												<FaEdit />
											</Button>
											<Button
												type='button'
												variant='danger'
												small
												onClick={() => handleDelete(v)}
												title='Delete visit'
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

			{/* Form */}
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
						disabled={!selectedVisit}
						onClick={() => setFormMode('EDIT')}
						className={`rounded-full px-3 py-1 border ${formMode === 'EDIT' ? 'bg-white text-slate-900 border-slate-300' : 'border-transparent text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed'}`}
					>
						Edit
					</button>
				</nav>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<h3 className='text-sm font-semibold text-slate-800 flex items-center gap-2'>
						{formMode === 'EDIT' ? 'Edit Visit' : 'Create Visit'}
					</h3>
					<div className='grid gap-4 sm:grid-cols-2'>
						{/* CREATE ONLY FIELDS */}
						{formMode === 'CREATE' && (
							<>
								<div className='flex flex-col gap-1'>
									<label
										htmlFor='petId'
										className='text-xs font-medium uppercase tracking-wide text-slate-600'
									>
										Pet
									</label>
									<select
										id='petId'
										name='petId'
										value={form.petId}
										onChange={handleChange}
										className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
										required
									>
										<option value=''>Select pet</option>
										{pets.map((p) => (
											<option key={p.id} value={p.id}>
												{p.name}
											</option>
										))}
									</select>
								</div>
								<div className='flex flex-col gap-1'>
									<label
										htmlFor='vetProfileId'
										className='text-xs font-medium uppercase tracking-wide text-slate-600'
									>
										Vet Profile ID
									</label>
									<input
										id='vetProfileId'
										name='vetProfileId'
										value={form.vetProfileId}
										onChange={handleChange}
										className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
										placeholder='e.g. 3'
										required
									/>
								</div>
								<div className='flex flex-col gap-1'>
									<label
										htmlFor='date'
										className='text-xs font-medium uppercase tracking-wide text-slate-600'
									>
										Date
									</label>
									<input
										id='date'
										type='date'
										name='date'
										value={form.date}
										onChange={handleChange}
										className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
										required
									/>
								</div>
								<div className='flex flex-col gap-1'>
									<label
										htmlFor='startTime'
										className='text-xs font-medium uppercase tracking-wide text-slate-600'
									>
										Start time
									</label>
									<input
										id='startTime'
										type='time'
										name='startTime'
										value={form.startTime}
										onChange={handleChange}
										className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
										required
									/>
								</div>
							</>
						)}

						<div className='flex flex-col gap-1 sm:col-span-2'>
							<label
								htmlFor='reason'
								className='text-xs font-medium uppercase tracking-wide text-slate-600 flex items-center gap-1'
							>
								<FaClipboardList className='text-slate-500' />{' '}
								Reason
							</label>
							<input
								id='reason'
								name='reason'
								value={form.reason}
								onChange={handleChange}
								className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
								placeholder='Short reason for visit'
								required
							/>
						</div>

						<div className='flex flex-col gap-1 sm:col-span-2'>
							<label
								htmlFor='notes'
								className='text-xs font-medium uppercase tracking-wide text-slate-600 flex items-center gap-1'
							>
								<FaNotesMedical className='text-slate-500' />{' '}
								Notes
							</label>
							<textarea
								id='notes'
								name='notes'
								value={form.notes}
								onChange={handleChange}
								className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
								rows={3}
								placeholder='Additional context...'
							/>
						</div>

						<div className='flex flex-col gap-1'>
							<label
								htmlFor='status'
								className='text-xs font-medium uppercase tracking-wide text-slate-600 flex items-center gap-1'
							>
								<FaUserMd className='text-slate-500' /> Status
							</label>
							<select
								id='status'
								name='status'
								value={form.status}
								onChange={handleChange}
								className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
							>
								{STATUS_OPTIONS.map((s) => (
									<option key={s} value={s}>
										{s}
									</option>
								))}
							</select>
						</div>
					</div>

					<div className='pt-2 flex gap-2'>
						<Button
							type='submit'
							disabled={!canSubmit || submitting}
						>
							{submitting
								? formMode === 'EDIT'
									? 'Saving...'
									: 'Creating...'
								: formMode === 'EDIT'
									? 'Save changes'
									: 'Create visit'}
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
				isOpen={visitToDelete !== null}
				title='Delete Visit'
				message={
					visitToDelete
						? `Delete visit #${visitToDelete.id}? This cannot be undone.`
						: ''
				}
				confirmLabel='Delete'
				cancelLabel='Cancel'
				onConfirm={confirmDeleteVisit}
				onCancel={() => setVisitToDelete(null)}
				variant='danger'
			/>
		</section>
	)
}
