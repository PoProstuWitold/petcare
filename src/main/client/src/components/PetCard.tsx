import type { Pet } from '../utils/types'

interface PetCardProps {
	pet: Pet
	onEdit?: () => void
	onDelete?: () => void
}

export function PetCard({ pet, onEdit, onDelete }: PetCardProps) {
	const showActions = onEdit || onDelete

	return (
		<article className='flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5'>
			<div className='flex items-baseline justify-between gap-2'>
				<h2 className='text-lg font-semibold text-slate-900'>
					{pet.name}
				</h2>
				<p className='text-xs font-medium uppercase tracking-wide text-sky-700'>
					{pet.species}
					{pet.sex ? ` · ${pet.sex}` : ''}
				</p>
			</div>

			{pet.breed && (
				<p className='text-sm text-slate-700'>
					Breed:{' '}
					<span className='font-medium text-slate-900'>
						{pet.breed}
					</span>
				</p>
			)}

			<div className='grid grid-cols-2 gap-2 text-xs text-slate-600 sm:text-sm'>
				{pet.birthDate && (
					<div>
						<p className='font-medium text-slate-800'>Birth date</p>
						<p>{pet.birthDate}</p>
					</div>
				)}
				{!pet.birthDate && pet.birthYear && (
					<div>
						<p className='font-medium text-slate-800'>Birth year</p>
						<p>{pet.birthYear}</p>
					</div>
				)}
				{pet.weight && (
					<div>
						<p className='font-medium text-slate-800'>Weight</p>
						<p>{pet.weight} kg</p>
					</div>
				)}
				<div>
					<p className='font-medium text-slate-800'>Owner</p>
					<p>{pet.ownerFullName}</p>
				</div>
			</div>

			{pet.notes && (
				<div className='mt-2 rounded-md bg-slate-50 p-2 text-xs text-slate-700 sm:text-sm'>
					<p className='font-medium text-slate-800'>Notes</p>
					<p className='mt-0.5'>{pet.notes}</p>
				</div>
			)}

			{showActions && (
				<div className='mt-3 flex justify-end gap-2'>
					{onEdit && (
						<button
							type='button'
							onClick={onEdit}
							className='rounded-lg border border-sky-600 px-3 py-1.5 text-xs font-medium text-sky-700 hover:bg-sky-50'
						>
							Edit
						</button>
					)}
					{onDelete && (
						<button
							type='button'
							onClick={onDelete}
							className='rounded-lg border border-red-600 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50'
						>
							Delete
						</button>
					)}
				</div>
			)}
		</article>
	)
}
