import { ProtectedHeader } from '../components/ProtectedHeader'
import { VetProfileCard } from '../components/vet/VetProfileCard'
import { VetScheduleCard } from '../components/vet/VetScheduleCard'
import { VetTimeOffCard } from '../components/vet/VetTimeOffCard'
import { VetVisitsCard } from '../components/vet/VetVisitsCard'
import { useAuth } from '../context/AuthContext'

export function VetPage() {
	const { user, accessToken } = useAuth()

	if (!user || !accessToken) {
		return <div>Redirecting to login...</div>
	}

	const isVet = user.roles?.includes('VET')

	if (!isVet) {
		return (
			<div className='page-container'>
				<ProtectedHeader
					user={user}
					title='Vet Panel'
					description='Access to this page is restricted to users with the VET role.'
				/>
			</div>
		)
	}

	return (
		<div className='page-container'>
			<ProtectedHeader
				user={user}
				title='Vet Panel'
				description='Manage your profile, schedule, and time off.'
			/>
			<div className='page-content space-y-6'>
				<VetVisitsCard />
				<VetProfileCard />
				<VetScheduleCard />
				<VetTimeOffCard />
			</div>
		</div>
	)
}
