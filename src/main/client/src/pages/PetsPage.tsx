import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { ErrorHandler } from '../components/ErrorHandler'
import { Loader } from '../components/Loader'
import { PetMedicalRecordsSection } from '../components/medical/PetMedicalRecordsSection'
import { PetCard } from '../components/PetCard'
import { PetForm } from '../components/PetForm'
import { ProtectedHeader } from '../components/ProtectedHeader'
import { Button } from '../components/ui/Button'
import { PetVisitsSection } from '../components/visits/PetVisitsSection'
import { VisitBookingForm } from '../components/visits/VisitBookingForm'
import { useAuth } from '../context/AuthContext'
import { useAuthFetch } from '../hooks/useAuthFetch'
import type { Pet, Visit } from '../utils/types'

export function PetsPage() {
	const { accessToken, user } = useAuth()
	const { json } = useAuthFetch()
	const [pets, setPets] = useState<Pet[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [isCreating, setIsCreating] = useState(false)
	const [editingPet, setEditingPet] = useState<Pet | null>(null)
	const [isBookingVisit, setIsBookingVisit] = useState(false)
	const [visitsRefreshKey, setVisitsRefreshKey] = useState(0)

	useEffect(() => {
		if (!accessToken) {
			setIsLoading(false)
			setError('Missing access token. Please log in again.')
			return
		}

		const controller = new AbortController()

		const loadPets = async () => {
			setIsLoading(true)
			setError(null)

			try {
				const data = await json<Pet[]>('/api/pets/me')

				setPets(data)
			} catch (err) {
				if (err instanceof DOMException && err.name === 'AbortError') {
					return
				}

				console.error('Unexpected error while loading pets', err)
				const message = 'Unexpected error while loading pets.'
				setError(message)
				toast.error(message)
			} finally {
				setIsLoading(false)
			}
		}

		void loadPets()

		return () => {
			controller.abort()
		}
	}, [accessToken, json])

	const handleCancelForm = () => {
		setIsCreating(false)
		setEditingPet(null)
	}

	const handleSavedPet = (saved: Pet) => {
		setPets((prev) => {
			const exists = prev.some((p) => p.id === saved.id)
			if (exists) {
				return prev.map((p) => (p.id === saved.id ? saved : p))
			}
			return [...prev, saved]
		})
		setIsCreating(false)
		setEditingPet(null)
	}

	const handleVisitBooked = (_visit: Visit) => {
		setIsBookingVisit(false)
		setVisitsRefreshKey((prev) => prev + 1)
	}

	const handleDeletePet = async (pet: Pet) => {
		if (!accessToken) {
			toast.error('Missing access token. Please log in again.')
			return
		}

		const confirmed = window.confirm(
			`Are you sure you want to delete ${pet.name}? This action cannot be undone.`
		)

		if (!confirmed) {
			return
		}

		try {
			await json<void>(`/api/pets/${pet.id}`, { method: 'DELETE' })

			setPets((prev) => prev.filter((p) => p.id !== pet.id))

			setEditingPet((current) =>
				current && current.id === pet.id ? null : current
			)
			setIsCreating(false)

			toast.success('Pet deleted successfully.')
		} catch (error) {
			console.error('ErrorHandler while deleting pet', error)
			toast.error('Unexpected error while deleting pet.')
		}
	}

	return (
		<div className='page-container'>
			<ProtectedHeader
				user={user}
				title='My Pets'
				description='Here you can see and manage all pets assigned to your account.'
			>
				<div className='flex flex-wrap gap-2'>
					<Button
						variant='primary'
						type='button'
						onClick={() => {
							setEditingPet(null)
							setIsCreating(true)
							setIsBookingVisit(false)
						}}
						disabled={isCreating || !!editingPet || isBookingVisit}
					>
						Add new pet
					</Button>

					<Button
						variant='secondary'
						type='button'
						onClick={() => {
							setIsBookingVisit(true)
							setIsCreating(false)
							setEditingPet(null)
						}}
						disabled={
							pets.length === 0 ||
							isCreating ||
							!!editingPet ||
							isBookingVisit
						}
					>
						Book visit
					</Button>
				</div>
			</ProtectedHeader>

			<div className='page-content'>
				{(isCreating || editingPet) && (
					<PetForm
						mode={editingPet ? 'edit' : 'create'}
						initialPet={editingPet ?? undefined}
						onCancel={handleCancelForm}
						onSaved={handleSavedPet}
					/>
				)}

				{isBookingVisit && !isLoading && !error && pets.length > 0 && (
					<VisitBookingForm
						pets={pets}
						onBooked={handleVisitBooked}
						onCancel={() => setIsBookingVisit(false)}
					/>
				)}

				{isLoading && <Loader message='Loading your pets...' />}

				{!isLoading && error && <ErrorHandler message={error} />}

				{!isLoading && !error && pets.length === 0 && (
					<div className='rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm'>
						<p>You do not have any pets registered yet.</p>
						<p className='mt-1'>
							Use the button above to add your first pet.
						</p>
					</div>
				)}

				{!isLoading && !error && pets.length > 0 && (
					<div className='grid gap-4 md:grid-cols-2 mb-10'>
						{pets.map((pet) => (
							<PetCard
								key={pet.id}
								pet={pet}
								onEdit={() => {
									setIsCreating(false)
									setIsBookingVisit(false)
									setEditingPet(pet)
								}}
								onDelete={() => {
									void handleDeletePet(pet)
								}}
							>
								<PetVisitsSection
									key={`${visitsRefreshKey}-${pet.id}`}
									pet={pet}
								/>
								<PetMedicalRecordsSection pet={pet} />
							</PetCard>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
