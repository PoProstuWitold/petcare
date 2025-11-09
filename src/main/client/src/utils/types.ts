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
	petId: number
	petName: string
	vetProfileId: number
	vetFullName: string
	date: string // ISO date: YYYY-MM-DD
	startTime: string // HH:mm[:ss]
	endTime: string // HH:mm[:ss]
	status: VisitStatus
	reason?: string | null
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
