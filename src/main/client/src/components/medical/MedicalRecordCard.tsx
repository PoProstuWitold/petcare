import { useState } from 'react'
import {
	FaChevronDown,
	FaClipboardList,
	FaFileMedical,
	FaNotesMedical,
	FaPills,
	FaStickyNote,
	FaSyringe,
	FaUser,
	FaUserMd
} from 'react-icons/fa'
import { formatDateTimePl } from '../../utils/date'
import type { MedicalRecord } from '../../utils/types'
import { Card, CardBody, CardDivider, SectionBadge } from '../ui/Card'
import { Collapsible } from '../ui/Collapsible'

type Props = {
	record: MedicalRecord
}

export function MedicalRecordCard({ record: r }: Props) {
	const ownerName = r.pet.ownerFullName || 'Unknown owner'
	const visitReason = r.visit.reason || '—'
	const visitNotes = r.visit.notes
	const recordNotes = r.notes
	const titleText = r.title || 'Medical Record'
	const dateTime = formatDateTimePl(r.visit.date, r.visit.startTime)
	const [isOpen, setIsOpen] = useState(false)

	return (
		<Card>
			<CardBody>
				{/* HEADER */}
				<header className='flex items-start justify-between gap-3'>
					<div className='flex items-center gap-2'>
						<button
							type='button'
							aria-expanded={isOpen}
							aria-controls={`medical-record-body-${r.id}`}
							onClick={() => setIsOpen((v) => !v)}
							className='inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50'
							title={isOpen ? 'Collapse' : 'Expand'}
						>
							<FaChevronDown
								className={`transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
							/>
						</button>
						<div className='space-y-1'>
							<h2 className='flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl'>
								<FaFileMedical className='text-sky-600' />{' '}
								{titleText}
							</h2>
							<p className='text-[11px] md:text-xs text-slate-500 font-medium'>
								{r.pet.name} · {r.pet.species} · {dateTime}
							</p>
						</div>
					</div>
					{/* No right-side element to keep alignment consistent with VisitCard */}
				</header>

				<Collapsible open={isOpen} id={`medical-record-body-${r.id}`}>
					<CardDivider />
					<section className='space-y-5'>
						<div className='flex items-center gap-2 flex-wrap'>
							<SectionBadge>CONTEXT</SectionBadge>
							<h3 className='text-base md:text-lg font-semibold text-slate-800'>
								Owner · Veterinarian · Reason
							</h3>
						</div>
						<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs md:text-sm'>
							<div className='flex flex-col gap-0.5'>
								<p className='flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600'>
									<FaUser className='text-slate-500' /> Owner
								</p>
								<p className='text-slate-800 font-medium'>
									{ownerName}
								</p>
							</div>
							<div className='flex flex-col gap-0.5'>
								<p className='flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600'>
									<FaUserMd className='text-slate-500' />{' '}
									Veterinarian
								</p>
								<p className='text-slate-800 font-medium'>
									{r.vetProfile.fullName}
								</p>
							</div>
							<div className='flex flex-col gap-0.5 sm:col-span-2'>
								<p className='flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600'>
									<FaClipboardList className='text-slate-500' />{' '}
									Reason
								</p>
								<p className='text-slate-800 font-medium line-clamp-3'>
									{visitReason}
								</p>
							</div>
							{visitNotes && (
								<div className='flex flex-col gap-0.5 sm:col-span-2'>
									<p className='flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600'>
										<FaClipboardList className='text-slate-500' />{' '}
										Visit Notes
									</p>
									<p className='text-slate-700 line-clamp-4'>
										{visitNotes}
									</p>
								</div>
							)}
						</div>
					</section>
					<CardDivider />
					<section className='space-y-5'>
						<div className='flex items-center gap-2 flex-wrap'>
							<SectionBadge tone='sky'>DETAILS</SectionBadge>
							<h3 className='text-base md:text-lg font-semibold text-sky-900'>
								Record Details
							</h3>
						</div>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm bg-sky-50/50 rounded-xl p-4 border border-sky-100'>
							<div className='flex flex-col gap-0.5'>
								<p className='flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700'>
									<FaNotesMedical className='text-sky-600' />{' '}
									Diagnosis
								</p>
								<p className='text-slate-800 font-medium line-clamp-4'>
									{r.diagnosis || '—'}
								</p>
							</div>
							<div className='flex flex-col gap-0.5'>
								<p className='flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700'>
									<FaSyringe className='text-sky-600' />{' '}
									Treatment
								</p>
								<p className='text-slate-800 font-medium whitespace-pre-line line-clamp-6'>
									{r.treatment || '—'}
								</p>
							</div>
							<div className='flex flex-col gap-0.5'>
								<p className='flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700'>
									<FaPills className='text-sky-600' />{' '}
									Prescriptions
								</p>
								<p className='text-slate-800 font-medium whitespace-pre-line line-clamp-6'>
									{r.prescriptions || '—'}
								</p>
							</div>
							<div className='flex flex-col gap-0.5'>
								<p className='flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-sky-700'>
									<FaStickyNote className='text-sky-600' />{' '}
									Record Notes
								</p>
								<p className='text-slate-800 font-medium whitespace-pre-line line-clamp-6'>
									{recordNotes || '—'}
								</p>
							</div>
						</div>
						<div className='flex justify-end pb-1'>
							<span className='rounded-full bg-slate-200 px-2 text-lg font-semibold tracking-wide text-slate-700'>
								ID #{r.id}
							</span>
						</div>
					</section>
				</Collapsible>
			</CardBody>
		</Card>
	)
}
