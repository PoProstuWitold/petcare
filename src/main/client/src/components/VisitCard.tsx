import { useEffect, useState } from 'react'
import {
	FaCheckCircle,
	FaChevronDown,
	FaClipboardList,
	FaClock,
	FaMapMarkerAlt,
	FaPaw,
	FaStickyNote,
	FaUser,
	FaUserMd
} from 'react-icons/fa'
import { fetchMedicalRecordByVisit } from '../api/medicalRecords'
import { useAuth } from '../context/AuthContext'
import type { Visit, VisitStatus } from '../utils/types.ts'
import { Button } from './ui/Button'
import {
	Card,
	CardActions,
	CardBody,
	CardDivider,
	InfoGrid,
	InfoItem
} from './ui/Card'
import { Collapsible } from './ui/Collapsible'
import { StatusPill, visitStatusColor } from './ui/StatusPill'

type VisitCardProps = {
	title?: string
	demo?: boolean
	visit: Visit
	enableStatusEditing?: boolean
	onStatusChangeRequest?: (newStatus: VisitStatus) => void
	onCreateMedicalRecord?: () => void
	onViewPetDetails?: () => void
}

function formatAge(
	birthDate?: string | null,
	birthYear?: number | null
): string | null {
	const now = new Date()
	let year: number | null = null
	let month = 0
	let day = 1
	if (birthDate) {
		const [y, m, d] = birthDate.split('-').map(Number)
		if (!Number.isNaN(y) && !Number.isNaN(m) && !Number.isNaN(d)) {
			year = y
			month = m - 1
			day = d
		}
	} else if (birthYear) {
		year = birthYear
	}
	if (year === null) return null
	const birth = new Date(year, month, day)
	let age = now.getFullYear() - birth.getFullYear()
	const mDiff = now.getMonth() - birth.getMonth()
	if (mDiff < 0 || (mDiff === 0 && now.getDate() < birth.getDate())) {
		age--
	}
	if (age <= 0) return '< 1 year'
	if (age === 1) return '1 year'
	return `${age} years`
}

function formatDatePl(date?: string, time?: string): string {
	if (!date || !date.includes('-')) {
		return '10.11.2025 · 14:30'
	}
	const [y, m, d] = date.split('-')
	const day = d?.padStart(2, '0')
	const month = m?.padStart(2, '0')
	const year = y
	const hour = time ? time.slice(0, 5) : '14:30'
	return `${day}.${month}.${year} · ${hour}`
}

export function VisitCard({
	title,
	visit,
	demo = false,
	enableStatusEditing = false,
	onStatusChangeRequest,
	onCreateMedicalRecord,
	onViewPetDetails
}: VisitCardProps) {
	const [isEditingStatus, setIsEditingStatus] = useState(false)
	const [draftStatus, setDraftStatus] = useState<VisitStatus | undefined>(
		visit?.status
	)
	const { accessToken } = useAuth()
	const [medicalRecordExists, setMedicalRecordExists] =
		useState<boolean>(false)
	const [isOpen, setIsOpen] = useState(false)

	useEffect(() => {
		let ignore = false
		if (!accessToken || !visit?.id) return
		fetchMedicalRecordByVisit(visit.id, accessToken)
			.then((r) => {
				if (!ignore) setMedicalRecordExists(!!r)
			})
			.catch(() => {})
		return () => {
			ignore = true
		}
	}, [accessToken, visit?.id])

	const ageText = formatAge(visit.pet.birthDate, visit.pet.birthYear)
	const metaParts = [
		visit.pet.species,
		visit.pet.sex,
		ageText,
		`${visit.pet.weight} kg`
	].filter(Boolean)
	const generatedMeta = metaParts.join(' · ')
	const displayDateTime = formatDatePl(visit?.date, visit?.startTime)
	const address = 'PetCare Clinic'

	const hasVetActions =
		enableStatusEditing ||
		typeof onCreateMedicalRecord === 'function' ||
		typeof onViewPetDetails === 'function'

	const handleStartEdit = () => {
		if (!visit) return
		setDraftStatus(visit.status)
		setIsEditingStatus(true)
	}
	const handleCancelEdit = () => {
		setIsEditingStatus(false)
		setDraftStatus(visit?.status)
	}
	const handleSaveStatus = () => {
		if (!visit || !draftStatus || !onStatusChangeRequest) return
		onStatusChangeRequest(draftStatus)
		setIsEditingStatus(false)
	}

	return (
		<Card className={`relative ${!demo ? 'shadow-sm' : ''}`}>
			<CardBody>
				{title && (
					<p className='mb-2 text-[11px] font-semibold uppercase tracking-wide text-sky-700'>
						{title}
					</p>
				)}

				<header className='flex items-start justify-between gap-3'>
					<div className='flex items-center gap-2'>
						<button
							type='button'
							aria-expanded={isOpen}
							aria-controls={`visit-body-${visit.id}`}
							onClick={() => setIsOpen((v) => !v)}
							className='inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 text-slate-600 hover:bg-slate-50'
							title={isOpen ? 'Collapse' : 'Expand'}
						>
							<FaChevronDown
								className={`transition-transform ${
									isOpen ? 'rotate-180' : 'rotate-0'
								}`}
							/>
						</button>
						<div>
							<h2 className='flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl'>
								<FaPaw className='text-slate-500' />{' '}
								{visit.pet.name}
							</h2>
							<p className='text-[11px] md:text-xs font-medium text-slate-500'>
								{generatedMeta}
							</p>
						</div>
					</div>
					{enableStatusEditing && isEditingStatus ? (
						<select
							className='rounded-full border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'
							value={draftStatus}
							onChange={(e) =>
								setDraftStatus(e.target.value as VisitStatus)
							}
						>
							<option value='SCHEDULED'>SCHEDULED</option>
							<option value='CONFIRMED'>CONFIRMED</option>
							<option value='COMPLETED'>COMPLETED</option>
							<option value='CANCELLED'>CANCELLED</option>
						</select>
					) : (
						<StatusPill
							color={
								visitStatusColor[visit.status] ||
								visitStatusColor.DEFAULT
							}
						>
							{visit.status}
						</StatusPill>
					)}
				</header>

				<Collapsible open={isOpen}>
					<div id={`visit-body-${visit.id}`} className='space-y-4'>
						<InfoGrid className='text-xs text-slate-600'>
							<InfoItem
								icon={<FaUser className='text-slate-500' />}
								label='Owner'
								value={visit.pet.ownerFullName}
							/>
							<InfoItem
								icon={
									<FaStickyNote className='text-slate-500' />
								}
								label='General Notes'
								value={visit.pet.notes || 'No notes'}
							/>
							<InfoItem
								icon={<FaUserMd className='text-slate-500' />}
								label='Veterinarian'
								value={visit.vetFullName}
							/>
							<InfoItem
								icon={<FaClock className='text-slate-500' />}
								label='Date & Time'
								value={displayDateTime}
							/>
							<InfoItem
								icon={
									<FaClipboardList className='text-slate-500' />
								}
								label='Reason'
								value={visit.reason}
							/>
							<InfoItem
								icon={
									<FaMapMarkerAlt className='text-slate-500' />
								}
								label='Address'
								value={address}
							/>
						</InfoGrid>

						{visit?.notes && (
							<div className='space-y-1 text-xs'>
								<p className='font-medium flex items-center gap-1 text-slate-800'>
									<FaStickyNote className='text-slate-500' />{' '}
									Visit Notes
								</p>
								<p className='text-slate-600'>{visit.notes}</p>
							</div>
						)}

						{hasVetActions && visit && (
							<div className='space-y-2'>
								<CardDivider />
								<CardActions>
									{enableStatusEditing &&
										!isEditingStatus && (
											<Button
												type='button'
												variant='ghost'
												onClick={handleStartEdit}
												small
											>
												Edit status
											</Button>
										)}
									{enableStatusEditing && isEditingStatus && (
										<>
											<Button
												type='button'
												variant='secondary'
												onClick={handleSaveStatus}
												small
											>
												Save status
											</Button>
											<Button
												type='button'
												variant='ghost'
												onClick={handleCancelEdit}
												small
											>
												Cancel
											</Button>
										</>
									)}
									{onCreateMedicalRecord &&
										!medicalRecordExists && (
											<Button
												type='button'
												variant='ghost'
												onClick={onCreateMedicalRecord}
												small
											>
												Create medical record
											</Button>
										)}
									{onCreateMedicalRecord &&
										medicalRecordExists && (
											<span className='inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200'>
												<FaCheckCircle className='text-emerald-600' />{' '}
												Record already created
											</span>
										)}
									{onViewPetDetails && (
										<Button
											type='button'
											variant='ghost'
											onClick={onViewPetDetails}
											small
										>
											View pet details
										</Button>
									)}
								</CardActions>
							</div>
						)}
					</div>
				</Collapsible>
			</CardBody>
		</Card>
	)
}
