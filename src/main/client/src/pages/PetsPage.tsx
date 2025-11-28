import { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { fetchPetsByOwner, type PageResponse } from '../api/pets'
import { ErrorHandler } from '../components/ErrorHandler'
import { Loader } from '../components/Loader'
import { PetMedicalRecordsSection } from '../components/medical/PetMedicalRecordsSection'
import { PetCard } from '../components/PetCard'
import { PetForm } from '../components/PetForm'
import { PetImportExportPanel } from '../components/PetImportExportPanel'
import { ProtectedHeader } from '../components/ProtectedHeader'
import { Button } from '../components/ui/Button'
import { ConfirmationDialog } from '../components/ui/ConfirmationDialog'
import { Pagination } from '../components/ui/Pagination'
import { PetVisitsSection } from '../components/visits/PetVisitsSection'
import { VisitBookingForm } from '../components/visits/VisitBookingForm'
import { useAuth } from '../context/AuthContext'
import { useAsync } from '../hooks/useAsync'
import { useAuthFetch } from '../hooks/useAuthFetch'
import type { Pet, Visit } from '../utils/types'

export function PetsPage() {
	const { accessToken, user } = useAuth()
	const { json } = useAuthFetch()
	const [page, setPage] = useState(0)
	const [pageSize] = useState(4)
	const [pets, setPets] = useState<Pet[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [isCreating, setIsCreating] = useState(false)
	const [editingPet, setEditingPet] = useState<Pet | null>(null)
	const [isBookingVisit, setIsBookingVisit] = useState(false)
	const [visitsRefreshKey, setVisitsRefreshKey] = useState(0)
	const [petToDelete, setPetToDelete] = useState<Pet | null>(null)

	const {
		data: petsData,
		loading: petsLoading,
		error: petsError,
		execute: reloadPets
	} = useAsync<PageResponse<Pet>>(
		() =>
			accessToken && user?.id
				? fetchPetsByOwner(user.id, accessToken, page, pageSize)
				: Promise.resolve({
						content: [],
						totalElements: 0,
						totalPages: 0,
						size: 0,
						number: 0
					}),
		[accessToken, user?.id, page, pageSize]
	)

	useEffect(() => {
		if (petsData) {
			setPets(petsData.content)
			setIsLoading(false)
			setError(null)
		} else if (petsLoading) {
			setIsLoading(true)
			setError(null)
		} else if (petsError) {
			setError(petsError)
			setIsLoading(false)
			toast.error(petsError)
		}
	}, [petsData, petsLoading, petsError])

	const handlePageChange = useCallback((newPage: number) => {
		setPage(newPage)
	}, [])

	const handleCancelForm = () => {
		setIsCreating(false)
		setEditingPet(null)
	}

	const handleSavedPet = async (saved: Pet) => {
		// After saving, reload data from API to update pagination correctly
		const isNewPet = !pets.some((p) => p.id === saved.id)
		if (isNewPet) {
			// If it's a new pet, go to first page to show it
			if (page === 0) {
				await reloadPets().catch(() => {})
			} else {
				setPage(0)
			}
		} else {
			// If updating existing pet, just reload current page
			await reloadPets().catch(() => {})
		}
		setIsCreating(false)
		setEditingPet(null)
	}

	const handleVisitBooked = (_visit: Visit) => {
		setIsBookingVisit(false)
		setVisitsRefreshKey((prev) => prev + 1)
	}

	const handleDeletePet = (pet: Pet) => {
		setPetToDelete(pet)
	}

	const confirmDeletePet = async () => {
		if (!petToDelete || !accessToken) {
			setPetToDelete(null)
			return
		}

		try {
			await json<void>(`/api/pets/${petToDelete.id}`, {
				method: 'DELETE'
			})

			// After deletion, reload data from API to update pagination correctly
			await reloadPets().catch(() => {})

			setEditingPet((current) =>
				current && current.id === petToDelete.id ? null : current
			)
			setIsCreating(false)

			toast.success('Pet deleted successfully.')
			setPetToDelete(null)
			// biome-ignore lint: no needed
		} catch (error: any) {
			console.error('Error while deleting pet', error)
			// Extract error message from API response
			let errorMessage = 'Failed to delete pet.'
			if (error instanceof Error) {
				// biome-ignore lint: no need to narrow
				const httpError = error as any
				if (httpError.body?.message) {
					errorMessage = httpError.body.message
				} else if (error.message) {
					errorMessage = error.message
				}
			}
			toast.error(errorMessage)
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
				<PetImportExportPanel
					onImported={async () => {
						// After import, reload data from API to update pagination correctly
						// Go to first page to show newly imported pets
						if (page === 0) {
							// If already on page 0, reload data
							await reloadPets().catch(() => {})
						} else {
							// If on another page, go to page 0 (this will auto-reload)
							setPage(0)
						}
					}}
					disabled={isCreating || !!editingPet || isBookingVisit}
				/>
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
					<>
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
										handleDeletePet(pet)
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
						{petsData && (
							<div className='mb-10'>
								<Pagination
									currentPage={petsData.number}
									totalPages={petsData.totalPages}
									pageSize={petsData.size}
									totalElements={petsData.totalElements}
									onPageChange={handlePageChange}
								/>
							</div>
						)}
					</>
				)}
			</div>

			<ConfirmationDialog
				isOpen={petToDelete !== null}
				title='Delete Pet'
				message={
					petToDelete
						? `Are you sure you want to delete ${petToDelete.name}? This action cannot be undone.`
						: ''
				}
				confirmLabel='Delete'
				cancelLabel='Cancel'
				onConfirm={confirmDeletePet}
				onCancel={() => setPetToDelete(null)}
				variant='danger'
			/>
		</div>
	)
}
