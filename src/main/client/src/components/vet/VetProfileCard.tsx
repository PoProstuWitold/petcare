import type * as React from 'react'
import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useAsync } from '../../hooks/useAsync'
import { useAuthFetch } from '../../hooks/useAuthFetch'
import { ALL_SPECIALIZATIONS } from '../../utils/constants'
import type {
	VetProfileForm,
	VetProfileResponse,
	VetSpecialization
} from '../../utils/types'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'

export function VetProfileCard() {
	const { accessToken } = useAuth()
	const { json } = useAuthFetch()
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [_profileInfo, setProfileInfo] = useState<VetProfileResponse | null>(
		null
	)
	const [form, setForm] = useState<VetProfileForm | null>(null)

	const {
		data,
		loading,
		error: loadError,
		execute
	} = useAsync<VetProfileResponse>(
		() => json<VetProfileResponse>('/api/vets/me/profile'),
		[accessToken]
	)

	useEffect(() => {
		if (data) {
			setProfileInfo(data)
			setForm({
				bio: data.bio ?? '',
				acceptsNewPatients: data.acceptsNewPatients,
				averageVisitLengthMinutes: data.averageVisitLengthMinutes ?? 30,
				specializations: data.specializations ?? []
			})
		}
	}, [data])

	useEffect(() => {
		if (!accessToken) return
		let cancelled = false

		async function loadProfile() {
			try {
				await execute().catch(() => {})
				// biome-ignore lint: no need
			} catch (err: any) {
				if (!cancelled) {
					setError(err.message || 'Failed to load vet profile')
				}
			}
		}

		loadProfile()
		return () => {
			cancelled = true
		}
	}, [accessToken, execute])

	function updateField<K extends keyof VetProfileForm>(
		field: K,
		value: VetProfileForm[K]
	) {
		if (!form) return
		setForm({ ...form, [field]: value })
	}

	function toggleSpecialization(spec: VetSpecialization) {
		if (!form) return
		const exists = form.specializations.includes(spec)
		const next = exists
			? form.specializations.filter((s) => s !== spec)
			: [...form.specializations, spec]

		setForm({ ...form, specializations: next })
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (!form || !accessToken) return

		setSaving(true)
		setError(null)
		setSuccess(null)

		try {
			const updated = await json<VetProfileResponse>(
				'/api/vets/me/profile',
				{
					method: 'PUT',
					body: JSON.stringify({
						bio: form.bio,
						acceptsNewPatients: form.acceptsNewPatients,
						averageVisitLengthMinutes:
							form.averageVisitLengthMinutes || 30,
						specializations: form.specializations
					})
				}
			)

			setProfileInfo(updated)
			setForm({
				bio: updated.bio ?? '',
				acceptsNewPatients: updated.acceptsNewPatients,
				averageVisitLengthMinutes:
					updated.averageVisitLengthMinutes ?? 30,
				specializations: updated.specializations ?? []
			})
			setSuccess('Profile saved successfully.')
			await execute().catch(() => {})
			// biome-ignore lint: no need
		} catch (err: any) {
			setError(err.message || 'Failed to save vet profile')
		} finally {
			setSaving(false)
		}
	}

	return (
		<section className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6'>
			<h2 className='text-lg font-semibold text-slate-900'>
				Vet Profile
			</h2>
			<p className='mt-1 text-sm text-slate-600'>
				These details are visible to clients when they browse vets.
			</p>

			{loading && (
				<p className='mt-4 text-sm text-slate-600'>
					Loading profile...
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

			{!loading && form && (
				<form onSubmit={handleSubmit} className='mt-4 space-y-4'>
					<div>
						<label
							htmlFor='bio'
							className='block text-sm font-medium text-slate-700'
						>
							Bio
						</label>
						<textarea
							name='bio'
							className='mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500'
							rows={3}
							value={form.bio}
							onChange={(e) => updateField('bio', e.target.value)}
							placeholder='Short description of your experience, main areas of interest, etc.'
						/>
					</div>

					<div className='grid gap-4 sm:grid-cols-2'>
						<div>
							<span className='block text-sm font-medium text-slate-700'>
								Accepting new patients
							</span>
							<div className='mt-2 flex items-center gap-3'>
								<button
									type='button'
									onClick={() =>
										updateField('acceptsNewPatients', true)
									}
									className={`rounded-full border px-3 py-1 text-xs font-medium ${
										form.acceptsNewPatients
											? 'border-emerald-300 bg-emerald-100 text-emerald-800'
											: 'border-slate-300 bg-slate-100 text-slate-700'
									}`}
								>
									Yes
								</button>
								<button
									type='button'
									onClick={() =>
										updateField('acceptsNewPatients', false)
									}
									className={`rounded-full border px-3 py-1 text-xs font-medium ${
										!form.acceptsNewPatients
											? 'border-red-300 bg-red-100 text-red-800'
											: 'border-slate-300 bg-slate-100 text-slate-700'
									}`}
								>
									No
								</button>
							</div>
						</div>

						<div>
							<label
								htmlFor='averageVisitLengthMinutes'
								className='block text-sm font-medium text-slate-700'
							>
								Average visit length (minutes)
							</label>
							<input
								name='averageVisitLengthMinutes'
								type='number'
								min={5}
								max={240}
								className='mt-1 block w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-sky-500'
								value={form.averageVisitLengthMinutes ?? 30}
								onChange={(e) =>
									updateField(
										'averageVisitLengthMinutes',
										Number(e.target.value) || 0
									)
								}
							/>
						</div>
					</div>

					<div>
						<span className='block text-sm font-medium text-slate-700'>
							Specializations
						</span>
						<p className='mt-1 text-xs text-slate-500'>
							Choose the areas you want to be visible to clients.
						</p>
						<div className='mt-2 flex flex-wrap gap-2'>
							{ALL_SPECIALIZATIONS.map((spec) => {
								const selected = form.specializations.includes(
									spec.value
								)
								return (
									<button
										key={spec.value}
										type='button'
										onClick={() =>
											toggleSpecialization(spec.value)
										}
										className={`rounded-full border px-3 py-1 text-xs font-medium ${
											selected
												? 'border-sky-300 bg-sky-100 text-sky-800'
												: 'border-slate-300 bg-slate-100 text-slate-700'
										}`}
									>
										{spec.label}
									</button>
								)
							})}
						</div>
					</div>

					<div className='flex justify-end'>
						<Button
							type='submit'
							variant='primary'
							disabled={saving}
						>
							{saving ? 'Saving...' : 'Save profile'}
						</Button>
					</div>
				</form>
			)}
		</section>
	)
}
