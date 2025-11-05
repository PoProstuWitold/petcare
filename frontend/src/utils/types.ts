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
