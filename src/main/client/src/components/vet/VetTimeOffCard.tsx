import type * as React from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { useAuthFetch } from '../../hooks/useAuthFetch'
import type { VetTimeOff, VetTimeOffForm } from '../../utils/types'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'

export function VetTimeOffCard() {
	const { accessToken } = useAuth()
	const { json } = useAuthFetch()
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [items, setItems] = useState<VetTimeOff[]>([])
	const [form, setForm] = useState<VetTimeOffForm>({
		startDate: '',
		endDate: '',
		reason: ''
	})

	const {
		data,
		loading,
		error: loadError
	} = useAsync<VetTimeOff[]>(
		() => json<VetTimeOff[]>('/api/vets/me/time-off'),
		[accessToken]
	)

	useEffect(() => {
		if (data) setItems(data)
	}, [data])

	function updateFormField<K extends keyof VetTimeOffForm>(
		field: K,
		value: VetTimeOffForm[K]
	) {
		setForm((prev) => ({ ...prev, [field]: value }))
	}

	async function handleCreate(e: React.FormEvent) {
		e.preventDefault()
		if (!accessToken) return

		if (
			!form.startDate ||
			!form.endDate ||
			!form.reason ||
			form.reason.trim() === ''
		) {
			setError('Start date, end date and reason are required.')
			return
		}

		setSaving(true)
		setError(null)
		setSuccess(null)

		try {
			const created = await json<VetTimeOff>('/api/vets/me/time-off', {
				method: 'POST',
				body: JSON.stringify({
					startDate: form.startDate,
					endDate: form.endDate,
					reason: form.reason || null
				})
			})
			setItems((prev) => [...prev, created])
			setForm({ startDate: '', endDate: '', reason: '' })
			setSuccess('Time-off entry created.')
			// biome-ignore lint: no need
		} catch (err: any) {
			setError(err.message || 'Failed to create time-off entry')
		} finally {
			setSaving(false)
		}
	}

	async function handleDelete(id: number) {
		if (!accessToken) return
		setError(null)
		setSuccess(null)

		try {
			await json<void>(`/api/vets/me/time-off/${id}`, {
				method: 'DELETE'
			})

			setItems((prev) => prev.filter((item) => item.id !== id))
			setSuccess('Time-off entry deleted.')
			// biome-ignore lint: no need
		} catch (err: any) {
			setError(err.message || 'Failed to delete time-off entry')
		}
	}

	return (
		<section className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6'>
			<h2 className='text-lg font-semibold text-slate-900'>
				Time-off / Unavailability
			</h2>
			<p className='mt-1 text-sm text-slate-600'>
				Use this section to mark days when you are not available
				(vacation, conference, sick leave, etc.).
			</p>

			{error && (
				<Alert variant='error' className='mt-4'>
					{error}
				</Alert>
			)}

			{success && (
				<Alert variant='success' className='mt-4'>
					{success}
				</Alert>
			)}

			<div className='mt-4 space-y-4'>
				<form
					onSubmit={handleCreate}
					className='grid gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:grid-cols-[1fr,1fr,2fr,auto]'
				>
					<div>
						<label
							htmlFor='startDate'
							className='block text-xs font-medium text-slate-700'
						>
							Start date
						</label>
						<input
							name='startDate'
							type='date'
							className='mt-1 block w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'
							value={form.startDate}
							onChange={(e) =>
								updateFormField('startDate', e.target.value)
							}
						/>
					</div>

					<div>
						<label
							htmlFor='endDate'
							className='block text-xs font-medium text-slate-700'
						>
							End date
						</label>
						<input
							name='endDate'
							type='date'
							className='mt-1 block w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'
							value={form.endDate}
							onChange={(e) =>
								updateFormField('endDate', e.target.value)
							}
						/>
					</div>

					<div>
						<label
							htmlFor='reason'
							className='block text-xs font-medium text-slate-700'
						>
							Reason
						</label>
						<input
							name='reason'
							type='text'
							className='mt-1 block w-full rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'
							value={form.reason}
							onChange={(e) =>
								updateFormField('reason', e.target.value)
							}
							placeholder='Vacation, conference, sick leave...'
						/>
					</div>

					<div className='flex items-end justify-end'>
						<Button
							type='submit'
							variant='primary'
							disabled={saving}
						>
							{saving ? 'Adding...' : 'Add'}
						</Button>
					</div>
				</form>

				{loadError && (
					<Alert variant='error' className='mt-4'>
						{loadError}
					</Alert>
				)}

				{loading ? (
					<p className='text-sm text-slate-600'>
						Loading existing time-off entries...
					</p>
				) : items.length === 0 ? (
					<p className='text-sm text-slate-500'>
						No time-off entries yet.
					</p>
				) : (
					<ul className='divide-y divide-slate-100 text-sm'>
						{items.map((item) => (
							<li
								key={item.id}
								className='flex items-center justify-between gap-3 py-2'
							>
								<div>
									<p className='font-medium text-slate-900'>
										{item.startDate === item.endDate
											? new Date(
													item.startDate
												).toLocaleDateString('pl-PL')
											: `${new Date(item.startDate).toLocaleDateString('pl-PL')} – ${new Date(item.endDate).toLocaleDateString('pl-PL')}`}
									</p>
									<p className='text-xs text-slate-600'>
										{item.reason}
									</p>
								</div>
								<button
									type='button'
									onClick={() => handleDelete(item.id)}
									className='text-xs font-medium text-red-600 hover:text-red-700'
								>
									Delete
								</button>
							</li>
						))}
					</ul>
				)}
			</div>
		</section>
	)
}
