import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	FaClipboardList,
	FaEdit,
	FaNotesMedical,
	FaPaw,
	FaPlus,
	FaSync,
	FaTrash
} from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { authHeaders, httpJson } from '../../utils/http'
import type { MedicalRecord, Pet } from '../../utils/types'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { ConfirmationDialog } from '../ui/ConfirmationDialog'

type RecordFormState = {
	visitId: string
	title: string
	diagnosis: string
	treatment: string
	prescriptions: string
	notes: string
}

export function ManageMedicalRecords() {
	const { accessToken } = useAuth()
	const [records, setRecords] = useState<MedicalRecord[]>([])
	const [pets, setPets] = useState<Pet[]>([])
	const [loading, setLoading] = useState(false)
	const [refreshing, setRefreshing] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const [filterPetId, setFilterPetId] = useState<string>('')
	const [filterVisitId, setFilterVisitId] = useState<string>('')

	const [submitting, setSubmitting] = useState(false)
	const [recordToDelete, setRecordToDelete] = useState<MedicalRecord | null>(null)
	const [form, setForm] = useState<RecordFormState>({
		visitId: '',
		title: '',
		diagnosis: '',
		treatment: '',
		prescriptions: '',
		notes: ''
	})
	const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(
		null
	)
	const [mode, setMode] = useState<'CREATE' | 'EDIT'>('CREATE')

	const canSubmit = useMemo(
		() => form.visitId.trim().length > 0,
		[form.visitId]
	)

	const loadPets = useCallback(async () => {
		if (!accessToken) return
		try {
			const data = await httpJson<Pet[]>('/api/pets', {
				headers: authHeaders(accessToken)
			})
			setPets(data)
		} catch {}
	}, [accessToken])

	const loadRecords = useCallback(async () => {
		if (!accessToken) return
		setLoading(true)
		setError(null)
		try {
			// Fetch all records once
			let list = await httpJson<MedicalRecord[]>('/api/medical-records', {
				headers: authHeaders(accessToken)
			})
			// Client-side filters
			if (filterVisitId) {
				list = list.filter((r) => String(r.visit.id) === filterVisitId)
			}
			if (filterPetId) {
				list = list.filter((r) => String(r.pet.id) === filterPetId)
			}
			// Sort newest first
			list.sort((a, b) =>
				(b.createdAt || '').localeCompare(a.createdAt || '')
			)
			setRecords(list)
		} catch (e) {
			setError(
				e instanceof Error
					? e.message
					: 'Failed to load medical records'
			)
		} finally {
			setLoading(false)
		}
	}, [accessToken, filterPetId, filterVisitId])

	useEffect(() => {
		if (!accessToken) return
		loadPets()
	}, [accessToken, loadPets])

	useEffect(() => {
		if (!accessToken) return
		loadRecords()
	}, [accessToken, loadRecords])

	function resetForm() {
		setForm({
			visitId: '',
			title: '',
			diagnosis: '',
			treatment: '',
			prescriptions: '',
			notes: ''
		})
	}

	function handleChange(
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) {
		const { name, value } = e.target
		setForm((prev) => ({ ...prev, [name]: value }))
	}

	function startEdit(r: MedicalRecord) {
		setSelectedRecord(r)
		setMode('EDIT')
		setForm({
			visitId: String(r.visit.id),
			title: r.title || '',
			diagnosis: r.diagnosis || '',
			treatment: r.treatment || '',
			prescriptions: r.prescriptions || '',
			notes: r.notes || ''
		})
	}
	function startCreate() {
		setSelectedRecord(null)
		setMode('CREATE')
		resetForm()
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (!accessToken || !canSubmit) return
		setSubmitting(true)
		setError(null)
		try {
			if (mode === 'EDIT' && selectedRecord) {
				const payloadUpdate = {
					title: form.title || null,
					diagnosis: form.diagnosis || null,
					treatment: form.treatment || null,
					prescriptions: form.prescriptions || null,
					notes: form.notes || null
				}
				await httpJson<MedicalRecord>(
					`/api/medical-records/${selectedRecord.id}`,
					{
						method: 'PATCH',
						headers: authHeaders(accessToken),
						body: JSON.stringify(payloadUpdate)
					}
				)
			} else {
				const payload = {
					visitId: Number(form.visitId),
					title: form.title || null,
					diagnosis: form.diagnosis || null,
					treatment: form.treatment || null,
					prescriptions: form.prescriptions || null,
					notes: form.notes || null
				}
				await httpJson<MedicalRecord>(
					'/api/medical-records',
					{
						method: 'POST',
						headers: authHeaders(accessToken),
						body: JSON.stringify(payload)
					}
				)
			}
			// Refresh full list to ensure consistency with server state
			await loadRecords()
			if (mode === 'EDIT') {
				startCreate()
			} else {
				resetForm()
			}
		} catch (e) {
			setError(
				e instanceof Error
					? e.message
					: 'Failed to create medical record'
			)
		} finally {
			setSubmitting(false)
		}
	}

	function handleDelete(r: MedicalRecord) {
		setRecordToDelete(r)
	}

	async function confirmDeleteRecord() {
		if (!recordToDelete || !accessToken) {
			setRecordToDelete(null)
			return
		}
		try {
			await httpJson<void>(`/api/medical-records/${recordToDelete.id}`, {
				method: 'DELETE',
				headers: authHeaders(accessToken)
			})
			// Refresh full list to ensure consistency with server state
			await loadRecords()
			if (selectedRecord && selectedRecord.id === recordToDelete.id) startCreate()
			setRecordToDelete(null)
		} catch (e) {
			setError(
				e instanceof Error
					? e.message
					: 'Failed to delete medical record'
			)
		}
	}

	const refresh = async () => {
		setRefreshing(true)
		await loadRecords()
		setRefreshing(false)
	}

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
						<FaNotesMedical className='text-slate-500' /> Medical
						Records
					</h2>
					<p className='mt-1 text-sm text-slate-600'>
						List and create medical records linked to visits.
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
					<Button type='button' small onClick={resetForm}>
						<FaPlus className='mr-1' /> New Record
					</Button>
				</div>
			</header>

			{error && <Alert variant='error'>{error}</Alert>}

			{/* Filters */}
			<div className='flex flex-wrap items-end gap-4'>
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
						{pets.map((p) => (
							<option key={p.id} value={p.id}>
								{p.name}
							</option>
						))}
					</select>
				</div>
				<div className='flex flex-col gap-1'>
					<label
						htmlFor='filterVisit'
						className='text-xs font-medium uppercase tracking-wide text-slate-600'
					>
						Find by Visit ID
					</label>
					<input
						id='filterVisit'
						type='text'
						value={filterVisitId}
						onChange={(e) => setFilterVisitId(e.target.value)}
						className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
						placeholder='e.g. 42'
					/>
				</div>
				<Button type='button' variant='ghost' small onClick={refresh}>
					Apply
				</Button>
			</div>

			{/* Records table */}
			<div className='overflow-x-auto rounded-lg border border-slate-200'>
				<table className='w-full text-left text-sm'>
					<thead className='bg-slate-50 text-slate-600 text-xs uppercase tracking-wide'>
						<tr>
							<th className='px-3 py-2'>ID</th>
							<th className='px-3 py-2'>Pet</th>
							<th className='px-3 py-2'>Visit</th>
							<th className='px-3 py-2'>Title</th>
							<th className='px-3 py-2'>Created</th>
							<th className='px-3 py-2'>Actions</th>
						</tr>
					</thead>
					<tbody>
						{loading && (
							<tr>
								<td
									colSpan={6}
									className='px-3 py-4 text-center text-slate-500'
								>
									Loading records...
								</td>
							</tr>
						)}
						{!loading && records.length === 0 && (
							<tr>
								<td
									colSpan={6}
									className='px-3 py-4 text-center text-slate-500'
								>
									No records found.
								</td>
							</tr>
						)}
						{!loading &&
							records.map((r) => (
								<tr
									key={r.id}
									className='border-t border-slate-100 hover:bg-slate-50'
								>
									<td className='px-3 py-2 text-xs text-slate-500'>
										#{r.id}
									</td>
									<td className='px-3 py-2 font-medium text-slate-800 flex items-center gap-1'>
										<FaPaw className='text-slate-400' />{' '}
										{petName(r.pet.id)}
									</td>
									<td className='px-3 py-2'>#{r.visit.id}</td>
									<td
										className='px-3 py-2 max-w-[220px] truncate'
										title={r.title || ''}
									>
										{r.title || '—'}
									</td>
									<td className='px-3 py-2 text-xs text-slate-500'>
										{r.createdAt?.replace('T', ' ') || '—'}
									</td>
									<td className='px-3 py-2'>
										<div className='flex gap-2'>
											<Button
												type='button'
												variant='ghost'
												small
												onClick={() => startEdit(r)}
												title='Edit record'
											>
												<FaEdit />
											</Button>
											<Button
												type='button'
												variant='danger'
												small
												onClick={() => handleDelete(r)}
												title='Delete record'
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

			{/* Create form */}
			<div className='rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-6'>
				<nav className='flex flex-wrap gap-2 text-xs font-medium'>
					<button
						type='button'
						onClick={startCreate}
						className={`rounded-full px-3 py-1 border ${mode === 'CREATE' ? 'bg-white text-slate-900 border-slate-300' : 'border-transparent text-slate-600 hover:text-slate-800'}`}
					>
						Create
					</button>
					<button
						type='button'
						disabled={!selectedRecord}
						onClick={() => setMode('EDIT')}
						className={`rounded-full px-3 py-1 border ${mode === 'EDIT' ? 'bg-white text-slate-900 border-slate-300' : 'border-transparent text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed'}`}
					>
						Edit
					</button>
				</nav>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<h3 className='text-sm font-semibold text-slate-800 flex items-center gap-2'>
						<FaClipboardList className='text-slate-500' />{' '}
						{mode === 'EDIT'
							? `Edit Medical Record #${selectedRecord?.id}`
							: 'New Medical Record'}
					</h3>
					<div className='grid gap-4 sm:grid-cols-2'>
						{mode === 'CREATE' && (
							<div className='flex flex-col gap-1'>
								<label
									htmlFor='visitId'
									className='text-xs font-medium uppercase tracking-wide text-slate-600'
								>
									Visit ID
								</label>
								<input
									id='visitId'
									name='visitId'
									value={form.visitId}
									onChange={handleChange}
									className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
									placeholder='e.g. 42'
									required
								/>
								<p className='text-[11px] text-slate-500'>
									Provide the visit identifier to which this
									record belongs.
								</p>
							</div>
						)}

						<div className='flex flex-col gap-1 sm:col-span-2'>
							<label
								htmlFor='title'
								className='text-xs font-medium uppercase tracking-wide text-slate-600'
							>
								Title
							</label>
							<input
								id='title'
								name='title'
								value={form.title}
								onChange={handleChange}
								className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
								placeholder='e.g. Post-op check'
							/>
						</div>

						<div className='flex flex-col gap-1'>
							<label
								htmlFor='diagnosis'
								className='text-xs font-medium uppercase tracking-wide text-slate-600'
							>
								Diagnosis
							</label>
							<input
								id='diagnosis'
								name='diagnosis'
								value={form.diagnosis}
								onChange={handleChange}
								className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
								placeholder='e.g. Otitis externa'
							/>
						</div>
						<div className='flex flex-col gap-1'>
							<label
								htmlFor='treatment'
								className='text-xs font-medium uppercase tracking-wide text-slate-600'
							>
								Treatment
							</label>
							<input
								id='treatment'
								name='treatment'
								value={form.treatment}
								onChange={handleChange}
								className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
								placeholder='e.g. Antibiotic drops 2x daily'
							/>
						</div>

						<div className='flex flex-col gap-1 sm:col-span-2'>
							<label
								htmlFor='prescriptions'
								className='text-xs font-medium uppercase tracking-wide text-slate-600'
							>
								Prescriptions
							</label>
							<textarea
								id='prescriptions'
								name='prescriptions'
								value={form.prescriptions}
								onChange={handleChange}
								className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
								rows={2}
								placeholder='e.g. Amoxicillin 20mg/kg for 7 days'
							/>
						</div>

						<div className='flex flex-col gap-1 sm:col-span-2'>
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
								placeholder='Additional notes for this record'
							/>
						</div>
					</div>

					<div className='pt-2 flex gap-2'>
						<Button
							type='submit'
							disabled={
								(!canSubmit && mode === 'CREATE') || submitting
							}
						>
							{submitting
								? mode === 'EDIT'
									? 'Saving...'
									: 'Creating...'
								: mode === 'EDIT'
									? 'Save changes'
									: 'Create record'}
						</Button>
						<Button
							type='button'
							variant='ghost'
							onClick={resetForm}
							disabled={submitting}
						>
							Reset
						</Button>
					</div>
				</form>
			</div>

			<ConfirmationDialog
				isOpen={recordToDelete !== null}
				title='Delete Medical Record'
				message={
					recordToDelete
						? `Delete medical record #${recordToDelete.id}? This cannot be undone.`
						: ''
				}
				confirmLabel='Delete'
				cancelLabel='Cancel'
				onConfirm={confirmDeleteRecord}
				onCancel={() => setRecordToDelete(null)}
				variant='danger'
			/>
		</section>
	)
}
