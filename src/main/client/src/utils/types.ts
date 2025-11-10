export type Pet = {
	id: number
	ownerId: number
	ownerFullName: string
	name: string
	species: string
	sex?: string | null
	breed?: string | null
	birthDate?: string | null
	birthYear?: number | null
	weight?: number | null
	notes?: string | null
}

export type VetSpecialization =
	| 'GENERAL_PRACTICE'
	| 'SURGERY'
	| 'DENTISTRY'
	| 'EXOTIC_ANIMALS'
	| 'DERMATOLOGY'
	| 'CARDIOLOGY'

export type DayOfWeek =
	| 'MONDAY'
	| 'TUESDAY'
	| 'WEDNESDAY'
	| 'THURSDAY'
	| 'FRIDAY'
	| 'SATURDAY'
	| 'SUNDAY'

export type VetProfileResponse = {
	id: number
	userId: number
	fullName: string
	username: string
	email: string
	bio: string | null
	acceptsNewPatients: boolean
	averageVisitLengthMinutes: number
	specializations: VetSpecialization[]
}

export type VetProfileForm = {
	bio: string
	acceptsNewPatients: boolean
	averageVisitLengthMinutes: number
	specializations: VetSpecialization[]
}

export type VetScheduleEntry = {
	dayOfWeek: DayOfWeek
	startTime: string
	endTime: string
	slotLengthMinutes: number
}

export type VetTimeOff = {
	id: number
	startDate: string
	endDate: string
	reason: string | null
}

export type VetTimeOffForm = {
	startDate: string
	endDate: string
	reason: string
}
export type VisitStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'CONFIRMED'

export type Visit = {
	id: number
	pet: Pet
	vetProfileId: number
	vetUserId: number
	vetFullName: string
	date: string
	startTime: string
	endTime: string
	status: VisitStatus
	reason: string | null
	notes?: string | null
}

export type VetProfile = {
	id: number
	userId: number
	fullName: string
	username: string
	email: string
	bio: string | null
	acceptsNewPatients: boolean
	averageVisitLengthMinutes: number
	specializations: string[]
}

export type MedicalRecord = {
	id: number
	pet: Pet
	vetProfile: VetProfileResponse
	visit: Visit
	title?: string | null
	diagnosis?: string | null
	treatment?: string | null
	prescriptions?: string | null
	notes?: string | null
	createdAt: string
}

export type MedicalRecordForm = {
	visitId: number
	title?: string
	diagnosis?: string
	treatment?: string
	prescriptions?: string
	notes?: string
}
