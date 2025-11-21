import { useEffect, useState } from 'react'
import {
	FaClipboardList,
	FaClock,
	FaFileMedical,
	FaNotesMedical,
	FaPaw,
	FaPills,
	FaStickyNote,
	FaSyringe,
	FaUser,
	FaUserMd
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import { createMedicalRecord } from '../../api/medicalRecords'
import { useAuth } from '../../context/AuthContext'
import { formatDateTimePl } from '../../utils/date'
import { authHeaders, httpJson } from '../../utils/http'
import type {
	MedicalRecordForm as MedicalRecordPayload,
	Visit
} from '../../utils/types'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { Spinner } from '../ui/Spinner'
import { StatusPill, visitStatusColor } from '../ui/StatusPill'

interface Props {
	visitId: number
	onCreated?: () => void
	defaultTitle?: string
}

export function MedicalRecordForm({ visitId, onCreated, defaultTitle }: Props) {
	const { accessToken } = useAuth()
	const [form, setForm] = useState<MedicalRecordPayload>({
		visitId,
		title: defaultTitle
	})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [visit, setVisit] = useState<Visit | null>(null)

	useEffect(() => {
		if (!accessToken) return
		httpJson<Visit>(`/api/visits/${visitId}`, {
			headers: authHeaders(accessToken)
		})
			.then(setVisit)
			.catch(() => {})
	}, [accessToken, visitId])

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target
		setForm((f) => ({ ...f, [name]: value }))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!accessToken) return
		setError(null)
		// Client-side validation for visit status
		if (
			!visit ||
			(visit.status !== 'COMPLETED' && visit.status !== 'CONFIRMED')
		) {
			setError(
				'Medical record can be created only for confirmed or completed visits'
			)
			return
		}
		setLoading(true)
		try {
			await createMedicalRecord(form, accessToken)
			toast.success('Medical record created successfully')
			// Call onCreated callback to refresh data instead of hard refresh
			onCreated?.()
		} catch (err: unknown) {
			// Extract error message from API response
			let msg = 'Failed to create medical record'
			if (err instanceof Error) {
				const httpError = err as any
				if (httpError.body?.message) {
					msg = httpError.body.message
				} else if (err.message) {
					msg = err.message
				}
			}
			setError(msg)
			toast.error(msg)
		} finally {
			setLoading(false)
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className='space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'
		>
			<h2 className='text-lg font-semibold'>Create Medical Record</h2>

			{/* Context Section */}
			{visit && (
				<section className='rounded-xl border border-slate-200 bg-slate-50/70 backdrop-blur-sm p-4 space-y-4'>
					<header className='flex items-center gap-2'>
						<span className='inline-flex items-center rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-700'>
							CONTEXT
						</span>
						<h3 className='text-sm font-semibold text-slate-800'>
							Visit / Pet / Owner / Vet
						</h3>
					</header>
					<div className='grid grid-cols-2 gap-4 text-xs'>
						<div className='flex flex-col gap-1'>
							<p className='font-medium text-slate-800 flex items-center gap-1'>
								<FaPaw className='text-slate-500' /> Pet
							</p>
							<p className='text-slate-700'>
								{visit.pet.name} · {visit.pet.species}
							</p>
						</div>
						<div className='flex flex-col gap-1'>
							<p className='font-medium text-slate-800 flex items-center gap-1'>
								<FaUser className='text-slate-500' /> Owner
							</p>
							<p className='text-slate-700'>
								{visit.pet.ownerFullName}
							</p>
						</div>
						<div className='flex flex-col gap-1'>
							<p className='font-medium text-slate-800 flex items-center gap-1'>
								<FaUserMd className='text-slate-500' />{' '}
								Veterinarian
							</p>
							<p className='text-slate-700'>
								{visit.vetFullName}
							</p>
						</div>
						<div className='flex flex-col gap-1'>
							<p className='font-medium text-slate-800 flex items-center gap-1'>
								<FaClock className='text-slate-500' /> Date &
								Time
							</p>
							<p className='text-slate-700'>
								{formatDateTimePl(visit.date, visit.startTime)}
							</p>
						</div>
					</div>
					<div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-xs'>
						<div className='flex flex-col gap-1'>
							<p className='font-medium text-slate-800 flex items-center gap-1'>
								<FaClipboardList className='text-slate-500' />
								Status
							</p>
							<p className='text-slate-700'>
								<StatusPill
									color={
										visitStatusColor[visit.status] ||
										visitStatusColor.DEFAULT
									}
								>
									{visit.status}
								</StatusPill>
							</p>
						</div>
						<div className='flex flex-col gap-1'>
							<p className='font-medium text-slate-800 flex items-center gap-1'>
								<FaClipboardList className='text-slate-500' />
								Reason
							</p>
							<p className='text-slate-700'>
								{visit.reason || '—'}
							</p>
						</div>
					</div>
					{visit.notes && (
						<div className='flex flex-col gap-1 text-xs'>
							<p className='font-medium text-slate-800 flex items-center gap-1'>
								<FaClipboardList className='text-slate-500' />{' '}
								Visit Notes
							</p>
							<p className='text-slate-600'>{visit.notes}</p>
						</div>
					)}
				</section>
			)}

			{/* Medical Record Details Section */}
			<section className='space-y-4 rounded-xl border border-sky-200 bg-sky-50/60 p-4'>
				<header className='flex items-center gap-2'>
					<span className='inline-flex items-center rounded-full bg-sky-200 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-sky-800'>
						MEDICAL RECORD
					</span>
					<h3 className='text-sm font-semibold text-sky-900'>
						Record Details
					</h3>
				</header>
				{error && <Alert variant='error'>{error}</Alert>}
				<div className='grid gap-4 md:grid-cols-2'>
					<div className='flex flex-col gap-1'>
						<label
							htmlFor='record-title'
							className='text-xs font-medium flex items-center gap-1'
						>
							<FaFileMedical className='text-sky-600' /> Record
							Title
						</label>
						<input
							id='record-title'
							name='title'
							value={form.title || ''}
							onChange={handleChange}
							placeholder='e.g. Post-surgery follow-up'
							aria-describedby='desc-title'
							className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
						/>
						<p
							id='desc-title'
							className='mt-1 text-[11px] text-slate-600 leading-snug pl-2 border-l border-slate-200'
						>
							Short name summarizing the record.
						</p>
					</div>
					<div className='flex flex-col gap-1'>
						<label
							htmlFor='record-diagnosis'
							className='text-xs font-medium flex items-center gap-1'
						>
							<FaNotesMedical className='text-sky-600' />{' '}
							Diagnosis
						</label>
						<input
							id='record-diagnosis'
							name='diagnosis'
							value={form.diagnosis || ''}
							onChange={handleChange}
							placeholder='e.g. Conjunctivitis'
							aria-describedby='desc-diagnosis'
							className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
						/>
						<p
							id='desc-diagnosis'
							className='mt-1 text-[11px] text-slate-600 leading-snug pl-2 border-l border-slate-200'
						>
							Clinical diagnosis or suspected condition.
						</p>
					</div>
					<div className='flex flex-col gap-1'>
						<label
							htmlFor='record-treatment'
							className='text-xs font-medium flex items-center gap-1'
						>
							<FaSyringe className='text-sky-600' /> Treatment
						</label>
						<input
							id='record-treatment'
							name='treatment'
							value={form.treatment || ''}
							onChange={handleChange}
							placeholder='e.g. Saline eye rinsing'
							aria-describedby='desc-treatment'
							className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
						/>
						<p
							id='desc-treatment'
							className='mt-1 text-[11px] text-slate-600 leading-snug pl-2 border-l border-slate-200'
						>
							Procedures performed or care instructions.
						</p>
					</div>
					<div className='flex flex-col gap-1'>
						<label
							htmlFor='record-prescriptions'
							className='text-xs font-medium flex items-center gap-1'
						>
							<FaPills className='text-sky-600' /> Prescriptions
						</label>
						<input
							id='record-prescriptions'
							name='prescriptions'
							value={form.prescriptions || ''}
							onChange={handleChange}
							placeholder='e.g. Dexa eye drops – 2x daily for 5 days'
							aria-describedby='desc-prescriptions'
							className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
						/>
						<p
							id='desc-prescriptions'
							className='mt-1 text-[11px] text-slate-600 leading-snug pl-2 border-l border-slate-200'
						>
							List medications with dosage and duration.
						</p>
					</div>
				</div>
				<div className='flex flex-col gap-1'>
					<label
						htmlFor='record-notes'
						className='text-xs font-medium flex items-center gap-1'
					>
						<FaStickyNote className='text-sky-600' /> Additional
						Notes
					</label>
					<textarea
						id='record-notes'
						name='notes'
						value={form.notes || ''}
						onChange={handleChange}
						rows={4}
						placeholder='e.g. Monitor redness, re-check in 7 days'
						aria-describedby='desc-notes'
						className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
					/>
					<p
						id='desc-notes'
						className='mt-1 text-[11px] text-slate-600 leading-snug pl-2 border-l border-slate-200'
					>
						Any owner guidance or internal remarks.
					</p>
				</div>
				<div className='flex gap-2 pt-1'>
					<Button type='submit' variant='primary' disabled={loading} className='flex items-center gap-2'>
						{loading && <Spinner size='sm' className='border-white border-t-transparent' />}
						Create
					</Button>
					<Button
						type='button'
						variant='ghost'
						onClick={() => onCreated?.()}
						disabled={loading}
					>
						Cancel
					</Button>
				</div>
			</section>
		</form>
	)
}
