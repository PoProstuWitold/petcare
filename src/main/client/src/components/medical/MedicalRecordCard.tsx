import {
	FaClipboardList,
	FaClock,
	FaPaw,
	FaUser,
	FaUserMd
} from 'react-icons/fa'
import type { MedicalRecord } from '../../utils/types'

type Props = {
	record: MedicalRecord
}

export function MedicalRecordCard({ record: r }: Props) {
	const ownerName = r.pet.ownerFullName || 'Unknown owner'
	const visitReason = r.visit.reason || '—'
	const visitNotes = r.visit.notes
	const recordNotes = r.notes

	return (
		<div className='space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
			{/* CONTEXT SECTION */}
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
							{r.pet.name} · {r.pet.species}
						</p>
					</div>
					<div className='flex flex-col gap-1'>
						<p className='font-medium text-slate-800 flex items-center gap-1'>
							<FaUser className='text-slate-500' /> Owner
						</p>
						<p className='text-slate-700'>{ownerName}</p>
					</div>
					<div className='flex flex-col gap-1'>
						<p className='font-medium text-slate-800 flex items-center gap-1'>
							<FaUserMd className='text-slate-500' /> Veterinarian
						</p>
						<p className='text-slate-700'>
							{r.vetProfile.fullName}
						</p>
					</div>
					<div className='flex flex-col gap-1'>
						<p className='font-medium text-slate-800 flex items-center gap-1'>
							<FaClock className='text-slate-500' /> Date & Time
						</p>
						<p className='text-slate-700'>
							{r.visit.date} · {r.visit.startTime?.slice(0, 5)}
						</p>
					</div>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-xs'>
					<div className='flex flex-col gap-1'>
						<p className='font-medium text-slate-800 flex items-center gap-1'>
							<FaClipboardList className='text-slate-500' />{' '}
							Status
						</p>
						<p className='text-slate-700'>{r.visit.status}</p>
					</div>
					<div className='flex flex-col gap-1'>
						<p className='font-medium text-slate-800 flex items-center gap-1'>
							<FaClipboardList className='text-slate-500' />{' '}
							Reason
						</p>
						<p className='text-slate-700'>{visitReason}</p>
					</div>
				</div>
				{visitNotes && (
					<div className='flex flex-col gap-1 text-xs'>
						<p className='font-medium text-slate-800 flex items-center gap-1'>
							<FaClipboardList className='text-slate-500' /> Visit
							Notes
						</p>
						<p className='text-slate-600'>{visitNotes}</p>
					</div>
				)}
			</section>

			{/* MEDICAL RECORD SECTION */}
			<section className='space-y-4 rounded-xl border border-sky-200 bg-sky-50/60 p-4'>
				<header className='flex items-center gap-2'>
					<span className='inline-flex items-center rounded-full bg-sky-200 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-sky-800'>
						MEDICAL RECORD
					</span>
					<h3 className='text-sm font-semibold text-sky-900'>
						Details
					</h3>
				</header>
				<div className='grid grid-cols-2 gap-4 text-xs text-slate-700'>
					<div className='flex flex-col gap-1'>
						<p className='font-medium text-sky-900 flex items-center gap-1'>
							<FaClipboardList className='text-sky-600' /> Title
						</p>
						<p>{r.title || '—'}</p>
					</div>
					<div className='flex flex-col gap-1'>
						<p className='font-medium text-sky-900 flex items-center gap-1'>
							<FaClipboardList className='text-sky-600' />{' '}
							Diagnosis
						</p>
						<p>{r.diagnosis || '—'}</p>
					</div>
					<div className='flex flex-col gap-1'>
						<p className='font-medium text-sky-900 flex items-center gap-1'>
							<FaClipboardList className='text-sky-600' />{' '}
							Treatment
						</p>
						<p>{r.treatment || '—'}</p>
					</div>
					<div className='flex flex-col gap-1'>
						<p className='font-medium text-sky-900 flex items-center gap-1'>
							<FaClipboardList className='text-sky-600' />{' '}
							Prescriptions
						</p>
						<p>{r.prescriptions || '—'}</p>
					</div>
				</div>
				{recordNotes && (
					<div className='flex flex-col gap-1 text-xs'>
						<p className='font-medium text-sky-900 flex items-center gap-1'>
							<FaClipboardList className='text-sky-600' /> Record
							Notes
						</p>
						<p className='text-slate-600'>{recordNotes}</p>
					</div>
				)}
				<div className='flex justify-end'>
					<span className='rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-700'>
						ID #{r.id}
					</span>
				</div>
			</section>
		</div>
	)
}
