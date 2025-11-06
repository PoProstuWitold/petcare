import { useParams } from 'react-router'
import { ProtectedHeader } from '../components/ProtectedHeader'
import { useAuth } from '../context/AuthContext'

export function UserProfilePage() {
	const { username } = useParams<{ username: string }>()
	const { user, isAuthenticated } = useAuth()

	const isCurrentUser = isAuthenticated && user?.username === username

	return (
		<main className='page-container'>
			<ProtectedHeader
				title={username || ''}
				description={isCurrentUser ? 'This is your profile page.' : ''}
			/>
			<div className='page-content'>
				<section className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
					<h2 className='text-sm font-semibold text-slate-900'>
						Basic information
					</h2>
					<dl className='mt-3 space-y-2 text-sm text-slate-700'>
						<div className='flex gap-2'>
							<dt className='w-32 text-slate-500'>Full name</dt>
							<dd>{isCurrentUser ? user?.fullName : 'Hidden'}</dd>
						</div>
						<div className='flex gap-2'>
							<dt className='w-32 text-slate-500'>Email</dt>
							<dd>{isCurrentUser ? user?.email : 'Hidden'}</dd>
						</div>
						<div className='flex gap-2'>
							<dt className='w-32 text-slate-500'>Roles</dt>
							<dd>
								{isCurrentUser
									? user?.roles.join(', ')
									: 'Hidden'}
							</dd>
						</div>
					</dl>
				</section>
			</div>
		</main>
	)
}
