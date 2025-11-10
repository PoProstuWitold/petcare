import type { Visit } from './types.ts'

export const mockVisit: Visit = {
	pet: {
		birthYear: 2022,
		birthDate: new Date(2022, 5, 15).toISOString().split('T')[0],
		breed: 'Golden Retriever',
		name: 'Sara',
		notes: 'Loves to play fetch',
		sex: 'FEMALE',
		ownerFullName: 'Default User',
		ownerId: 1,
		species: 'DOG',
		weight: 9.8,
		id: 1
	},
	reason: 'Regular check-up and vaccination.',
	vetFullName: 'System Veterinarian',
	notes: 'No additional notes.',
	date: new Date().toISOString().split('T')[0],
	status: 'CONFIRMED',
	vetProfileId: 1,
	vetUserId: 1,
	id: 1,
	startTime: '10:00',
	endTime: '10:30'
}
