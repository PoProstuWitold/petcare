import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { ErrorHandler } from '../components/ErrorHandler'
import { Loader } from '../components/Loader'
import { PetCard } from '../components/PetCard'
import { PetForm } from '../components/PetForm'
import { ProtectedHeader } from '../components/ProtectedHeader'
import { useAuth } from '../context/AuthContext'
import type { Pet } from '../utils/types'

export function PetsPage() {
	const { accessToken, user } = useAuth()
	const [pets, setPets] = useState<Pet[]>([])
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const [isCreating, setIsCreating] = useState(false)
	const [editingPet, setEditingPet] = useState<Pet | null>(null)

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
				const response = await fetch('/api/pets/me', {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${accessToken}`
					},
					signal: controller.signal
				})

				if (!response.ok) {
					let message = 'Failed to load pets.'

					try {
						const body = await response.json()
						if (body && typeof body.message === 'string') {
							message = body.message
						}
					} catch {
						// ignore JSON parse errors
					}

					setError(message)
					toast.error(message)
					return
				}

				const data = (await response.json()) as Pet[]
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
	}, [accessToken])

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
			const response = await fetch(`/api/pets/${pet.id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			})

			if (!response.ok && response.status !== 204) {
				let message = 'Failed to delete pet.'

				try {
					const body = await response.json()
					if (body && typeof body.message === 'string') {
						message = body.message
					}
				} catch {
					// ignore JSON parse errors
				}

				toast.error(message)
				return
			}

			setPets((prev) => prev.filter((p) => p.id !== pet.id))

			// If we were editing this pet, close the form
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
				<button
					type='button'
					onClick={() => {
						setEditingPet(null)
						setIsCreating(true)
					}}
					className='rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60'
					disabled={isCreating || !!editingPet}
				>
					Add new pet
				</button>
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
					<div className='grid gap-4 md:grid-cols-2'>
						{pets.map((pet) => (
							<PetCard
								key={pet.id}
								pet={pet}
								onEdit={() => {
									setIsCreating(false)
									setEditingPet(pet)
								}}
								onDelete={() => {
									void handleDeletePet(pet)
								}}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	)
}
