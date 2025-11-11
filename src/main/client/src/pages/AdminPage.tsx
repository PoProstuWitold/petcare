import { ManageMedicalRecords } from '../components/admin/ManageMedicalRecords'
import { ManagePets } from '../components/admin/ManagePets'
import { ManageUsers } from '../components/admin/ManageUsers'
import { ManageVisits } from '../components/admin/ManageVisits'
import { ProtectedHeader } from '../components/ProtectedHeader'
import { useAuth } from '../context/AuthContext'

export function AdminPage() {
	const { user, accessToken } = useAuth()

	if (!user || !accessToken) {
		return <div>Backs to login</div>
	}

	return (
		<div className='page-container'>
			<ProtectedHeader
				user={user}
				title={'Admin Panel'}
				description={'Manage PetCare system settings and users.'}
			/>
			<div className='page-content'>
				<ManageUsers />
				<ManagePets />
				<ManageVisits />
				<ManageMedicalRecords />
			</div>
		</div>
	)
}
