import { ProtectedHeader } from '../components/ProtectedHeader'
import { VetProfileCard } from '../components/vet/VetProfileCard'
import { VetScheduleCard } from '../components/vet/VetScheduleCard'
import { VetTimeOffCard } from '../components/vet/VetTimeOffCard'
import { useAuth } from '../context/AuthContext'

export function VetPage() {
	const { user, accessToken } = useAuth()

	if (!user || !accessToken) {
		return <div>Backs to login</div>
	}

	return (
		<div className='page-container'>
			<ProtectedHeader
				user={user}
				title={'Vet Panel'}
				description={'Manage your profile, schedule, and time off.'}
			/>
			<div className='page-content'>
				<VetProfileCard />
				<VetScheduleCard />
				<VetTimeOffCard />
			</div>
		</div>
	)
}
