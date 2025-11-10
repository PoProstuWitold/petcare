import type { ReactNode } from 'react'
import {
	FaBirthdayCake,
	FaPaw,
	FaStickyNote,
	FaUser,
	FaWeight
} from 'react-icons/fa'
import type { Pet } from '../utils/types'
import { Button } from './ui/Button'
import {
	Card,
	CardActions,
	CardBody,
	CardDivider,
	InfoGrid,
	InfoItem
} from './ui/Card'

interface PetCardProps {
	pet: Pet
	onEdit?: () => void
	onDelete?: () => void
	children?: ReactNode
}

export function PetCard({ pet, onEdit, onDelete, children }: PetCardProps) {
	const showActions = onEdit || onDelete
	const birthDisplay = pet.birthDate
		? new Date(pet.birthDate).toLocaleDateString('pl-PL')
		: pet.birthYear
			? `Rok: ${pet.birthYear}`
			: '—'

	return (
		<Card className=''>
			<CardBody className='space-y-4'>
				<header className='flex items-start justify-between gap-2'>
					<h2 className='flex items-center gap-2 text-xl font-semibold tracking-tight text-slate-900 md:text-2xl'>
						<FaPaw className='text-slate-500' /> {pet.name}
					</h2>
					<p className='text-[11px] md:text-xs font-medium uppercase tracking-wide text-sky-700'>
						{pet.species}
						{pet.sex ? ` · ${pet.sex}` : ''}
					</p>
				</header>

				{pet.breed && (
					<p className='text-xs sm:text-sm text-slate-700'>
						<span className='font-medium text-slate-800'>
							Breed:
						</span>{' '}
						{pet.breed}
					</p>
				)}

				<InfoGrid className='text-xs sm:text-sm'>
					<InfoItem
						icon={<FaBirthdayCake className='text-slate-500' />}
						label='Birth'
						value={birthDisplay}
					/>
					{pet.weight && (
						<InfoItem
							icon={<FaWeight className='text-slate-500' />}
							label='Weight'
							value={`${pet.weight} kg`}
						/>
					)}
					<InfoItem
						icon={<FaUser className='text-slate-500' />}
						label='Owner'
						value={pet.ownerFullName}
					/>
					{pet.notes && (
						<InfoItem
							icon={<FaStickyNote className='text-slate-500' />}
							label='Notes'
							value={pet.notes}
						/>
					)}
				</InfoGrid>

				{children && (
					<div className='pt-2'>
						<CardDivider />
						<div className='pt-2'>{children}</div>
					</div>
				)}

				{showActions && (
					<div className='flex justify-end'>
						<CardActions>
							{onEdit && (
								<Button
									type='button'
									variant='outline'
									small
									onClick={onEdit}
								>
									Edit
								</Button>
							)}
							{onDelete && (
								<Button
									type='button'
									variant='danger'
									small
									onClick={onDelete}
								>
									Delete
								</Button>
							)}
						</CardActions>
					</div>
				)}
			</CardBody>
		</Card>
	)
}
