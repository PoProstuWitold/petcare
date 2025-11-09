import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import type { VetTimeOff, VetTimeOffForm } from '../../utils/types'

export function VetTimeOffCard() {
	const { accessToken } = useAuth()
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [items, setItems] = useState<VetTimeOff[]>([])
	const [form, setForm] = useState<VetTimeOffForm>({
		startDate: '',
		endDate: '',
		reason: ''
	})

	useEffect(() => {
		if (!accessToken) return
		let cancelled = false

		async function loadTimeOff() {
			setLoading(true)
			setError(null)
			setSuccess(null)

			try {
				const res = await fetch('/api/vets/me/time-off', {
					headers: { Authorization: `Bearer ${accessToken}` }
				})

				if (!res.ok) {
					new Error('Failed to load time-off entries')
				}

				const data: VetTimeOff[] = await res.json()
				if (cancelled) return

				setItems(data)
				// biome-ignore lint: no need
			} catch (err: any) {
				if (!cancelled) {
					setError(err.message || 'Failed to load time-off entries')
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		loadTimeOff()
		return () => {
			cancelled = true
		}
	}, [accessToken])

	function updateFormField<K extends keyof VetTimeOffForm>(
		field: K,
		value: VetTimeOffForm[K]
	) {
		setForm((prev) => ({ ...prev, [field]: value }))
	}

	async function handleCreate(e: React.FormEvent) {
		e.preventDefault()
		if (!accessToken) return

		if (!form.startDate || !form.endDate) {
			setError('Start date and end date are required.')
			return
		}

		setSaving(true)
		setError(null)
		setSuccess(null)

		try {
			const res = await fetch('/api/vets/me/time-off', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					startDate: form.startDate,
					endDate: form.endDate,
					reason: form.reason || null
				})
			})

			if (!res.ok) {
				new Error('Failed to create time-off entry')
			}

			const created: VetTimeOff = await res.json()
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
			const res = await fetch(`/api/vets/me/time-off/${id}`, {
				method: 'DELETE',
				headers: { Authorization: `Bearer ${accessToken}` }
			})

			if (!res.ok && res.status !== 204) {
				new Error('Failed to delete time-off entry')
			}

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
				<div className='mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800'>
					{error}
				</div>
			)}

			{success && (
				<div className='mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800'>
					{success}
				</div>
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
							Reason (optional)
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
						<button
							type='submit'
							disabled={saving}
							className='inline-flex items-center rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-70'
						>
							{saving ? 'Adding...' : 'Add'}
						</button>
					</div>
				</form>

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
											? item.startDate
											: `${item.startDate} – ${item.endDate}`}
									</p>
									{item.reason && (
										<p className='text-xs text-slate-600'>
											{item.reason}
										</p>
									)}
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
