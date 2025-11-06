import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { DAY_OPTIONS, normalizeTimeForInput } from '../../utils/constants'
import type { VetScheduleEntry } from '../../utils/types'

export function VetScheduleCard() {
	const { accessToken } = useAuth()
	const [loading, setLoading] = useState(true)
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [schedule, setSchedule] = useState<VetScheduleEntry[]>([])

	useEffect(() => {
		if (!accessToken) return
		let cancelled = false

		async function loadSchedule() {
			setLoading(true)
			setError(null)
			setSuccess(null)

			try {
				const res = await fetch('/api/vets/me/schedule', {
					headers: { Authorization: `Bearer ${accessToken}` }
				})

				if (!res.ok) {
					new Error('Failed to load vet schedule')
				}

				const data: VetScheduleEntry[] = await res.json()
				if (cancelled) return

				setSchedule(
					data.map((entry) => ({
						...entry,
						startTime: normalizeTimeForInput(entry.startTime),
						endTime: normalizeTimeForInput(entry.endTime)
					}))
				)
				// biome-ignore lint: no need
			} catch (err: any) {
				if (!cancelled) {
					setError(err.message || 'Failed to load vet schedule')
				}
			} finally {
				if (!cancelled) setLoading(false)
			}
		}

		loadSchedule()
		return () => {
			cancelled = true
		}
	}, [accessToken])

	function updateRow(
		index: number,
		field: keyof VetScheduleEntry,
		value: string | number
	) {
		setSchedule((prev) => {
			const next = [...prev]
			const row = { ...next[index] }

			if (field === 'slotLengthMinutes') {
				row.slotLengthMinutes = Number(value) || 0
			} else if (field === 'dayOfWeek') {
				row.dayOfWeek = value as VetScheduleEntry['dayOfWeek']
			} else if (field === 'startTime') {
				row.startTime = value as string
			} else if (field === 'endTime') {
				row.endTime = value as string
			}

			next[index] = row
			return next
		})
	}

	function addRow() {
		setSchedule((prev) => [
			...prev,
			{
				dayOfWeek: 'MONDAY',
				startTime: '09:00',
				endTime: '13:00',
				slotLengthMinutes: 30
			}
		])
	}

	function removeRow(index: number) {
		setSchedule((prev) => prev.filter((_, i) => i !== index))
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (!accessToken) return

		setSaving(true)
		setError(null)
		setSuccess(null)

		try {
			const body = schedule.map((row) => ({
				dayOfWeek: row.dayOfWeek,
				startTime: row.startTime,
				endTime: row.endTime,
				slotLengthMinutes: row.slotLengthMinutes
			}))

			const res = await fetch('/api/vets/me/schedule', {
				method: 'PUT',
				headers: {
					Authorization: `Bearer ${accessToken}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(body)
			})

			if (!res.ok) {
				new Error('Failed to save schedule')
			}

			const updated: VetScheduleEntry[] = await res.json()
			setSchedule(
				updated.map((entry) => ({
					...entry,
					startTime: normalizeTimeForInput(entry.startTime),
					endTime: normalizeTimeForInput(entry.endTime)
				}))
			)
			setSuccess('Schedule saved successfully.')
			// biome-ignore lint: no need
		} catch (err: any) {
			setError(err.message || 'Failed to save schedule')
		} finally {
			setSaving(false)
		}
	}

	return (
		<section className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6'>
			<h2 className='text-lg font-semibold text-slate-900'>
				Weekly Schedule
			</h2>
			<p className='mt-1 text-sm text-slate-600'>
				These rules are used to generate available appointment slots.
			</p>

			{loading && (
				<p className='mt-4 text-sm text-slate-600'>
					Loading schedule...
				</p>
			)}

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

			{!loading && (
				<form onSubmit={handleSubmit} className='mt-4 space-y-4'>
					<div className='overflow-x-auto'>
						<table className='min-w-full divide-y divide-slate-200 text-sm'>
							<thead className='bg-slate-50'>
								<tr>
									<th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-600'>
										Day
									</th>
									<th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-600'>
										Start time
									</th>
									<th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-600'>
										End time
									</th>
									<th className='whitespace-nowrap px-3 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-600'>
										Slot length (min)
									</th>
									<th className='px-3 py-2' />
								</tr>
							</thead>
							<tbody className='divide-y divide-slate-100 bg-white'>
								{schedule.length === 0 && (
									<tr>
										<td
											colSpan={5}
											className='px-3 py-4 text-center text-xs text-slate-500'
										>
											No schedule entries yet. Add your
											first working block below.
										</td>
									</tr>
								)}

								{schedule.map((row, index) => (
									<tr key={`${row.dayOfWeek}-${index}`}>
										<td className='whitespace-nowrap px-3 py-2'>
											<select
												className='block w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500'
												value={row.dayOfWeek}
												onChange={(e) =>
													updateRow(
														index,
														'dayOfWeek',
														e.target.value
													)
												}
											>
												{DAY_OPTIONS.map((opt) => (
													<option
														key={opt.value}
														value={opt.value}
													>
														{opt.label}
													</option>
												))}
											</select>
										</td>

										<td className='whitespace-nowrap px-3 py-2'>
											<input
												type='time'
												className='block w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500'
												value={row.startTime}
												onChange={(e) =>
													updateRow(
														index,
														'startTime',
														e.target.value
													)
												}
											/>
										</td>

										<td className='whitespace-nowrap px-3 py-2'>
											<input
												type='time'
												className='block w-full rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500'
												value={row.endTime}
												onChange={(e) =>
													updateRow(
														index,
														'endTime',
														e.target.value
													)
												}
											/>
										</td>

										<td className='whitespace-nowrap px-3 py-2'>
											<input
												type='number'
												min={5}
												max={240}
												className='block w-24 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs text-slate-900 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500'
												value={row.slotLengthMinutes}
												onChange={(e) =>
													updateRow(
														index,
														'slotLengthMinutes',
														e.target.value
													)
												}
											/>
										</td>

										<td className='whitespace-nowrap px-3 py-2 text-right'>
											<button
												type='button'
												onClick={() => removeRow(index)}
												className='text-xs font-medium text-red-600 hover:text-red-700'
											>
												Remove
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<div className='flex justify-between'>
						<button
							type='button'
							onClick={addRow}
							className='inline-flex items-center rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-100'
						>
							Add working block
						</button>

						<button
							type='submit'
							disabled={saving}
							className='inline-flex items-center rounded-xl bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-70'
						>
							{saving ? 'Saving...' : 'Save schedule'}
						</button>
					</div>
				</form>
			)}
		</section>
	)
}
