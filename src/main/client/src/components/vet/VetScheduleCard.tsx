import type * as React from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { useAuthFetch } from '../../hooks/useAuthFetch'
import { DAY_OPTIONS, normalizeTimeForInput } from '../../utils/constants'
import type { DayOfWeek, VetScheduleEntry } from '../../utils/types'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'

const DAY_ORDER: Record<DayOfWeek, number> = {
	MONDAY: 0,
	TUESDAY: 1,
	WEDNESDAY: 2,
	THURSDAY: 3,
	FRIDAY: 4,
	SATURDAY: 5,
	SUNDAY: 6
}

function sortSchedule(entries: VetScheduleEntry[]): VetScheduleEntry[] {
	return [...entries].sort(
		(a, b) => DAY_ORDER[a.dayOfWeek] - DAY_ORDER[b.dayOfWeek]
	)
}

export function VetScheduleCard() {
	const { accessToken } = useAuth()
	const { json } = useAuthFetch()
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [schedule, setSchedule] = useState<VetScheduleEntry[]>([])

	const {
		data,
		loading,
		error: loadError,
		execute
	} = useAsync<VetScheduleEntry[]>(
		() => json<VetScheduleEntry[]>('/api/vets/me/schedule'),
		[accessToken]
	)

	useEffect(() => {
		if (!data) return
		const normalized = data.map((entry) => ({
			...entry,
			startTime: normalizeTimeForInput(entry.startTime),
			endTime: normalizeTimeForInput(entry.endTime)
		}))
		setSchedule(sortSchedule(normalized))
	}, [data])

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
			return sortSchedule(next)
		})
	}

	function addRow() {
		setSchedule((prev) => {
			const usedDays = new Set(prev.map((r) => r.dayOfWeek))
			const freeDay = DAY_OPTIONS.find(
				(opt) => !usedDays.has(opt.value as DayOfWeek)
			)

			if (!freeDay) return prev

			const next: VetScheduleEntry[] = [
				...prev,
				{
					dayOfWeek: freeDay.value as DayOfWeek,
					startTime: '09:00',
					endTime: '13:00',
					slotLengthMinutes: 30
				}
			]

			return sortSchedule(next)
		})
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

			const updated = await json<VetScheduleEntry[]>(
				'/api/vets/me/schedule',
				{
					method: 'PUT',
					body: JSON.stringify(body)
				}
			)
			setSchedule(
				sortSchedule(
					updated.map((entry) => ({
						...entry,
						startTime: normalizeTimeForInput(entry.startTime),
						endTime: normalizeTimeForInput(entry.endTime)
					}))
				)
			)
			setSuccess('Schedule saved successfully.')
			await execute().catch(() => {})
			// biome-ignore lint: no need to narrow down type
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

			{loadError && (
				<Alert variant='error' className='mt-4'>
					{loadError}
				</Alert>
			)}

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

								{schedule.map((row, index) => {
									const usedDays = new Set(
										schedule
											.filter((_, i) => i !== index)
											.map((r) => r.dayOfWeek)
									)

									return (
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
															disabled={usedDays.has(
																opt.value as DayOfWeek
															)}
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
													value={
														row.slotLengthMinutes
													}
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
													onClick={() =>
														removeRow(index)
													}
													className='text-xs font-medium text-red-600 hover:text-red-700'
												>
													Remove
												</button>
											</td>
										</tr>
									)
								})}
							</tbody>
						</table>
					</div>

					<div className='flex justify-between'>
						<Button type='button' variant='ghost' onClick={addRow}>
							Add working block
						</Button>

						<Button
							type='submit'
							variant='primary'
							disabled={saving}
						>
							{saving ? 'Saving...' : 'Save schedule'}
						</Button>
					</div>
				</form>
			)}
		</section>
	)
}
