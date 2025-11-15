import { BrowserRouter, Route, Routes, useSearchParams } from 'react-router'
import { ToastContainer } from 'react-toastify'
import { Footer } from './components/Footer'
import { MedicalRecordForm } from './components/medical/MedicalRecordForm'
import { Navbar } from './components/Navbar'
import { AdminPage } from './pages/AdminPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PetsPage } from './pages/PetsPage'
import { RegisterPage } from './pages/RegisterPage'
import { StatusPage } from './pages/StatusPage'
import { UserProfilePage } from './pages/UserProfilePage'
import { VetPage } from './pages/VetPage'
import { ProtectedRoute } from './utils/ProtectedRoute'

function NewMedicalRecordPage() {
	const [params] = useSearchParams()
	const visitIdStr = params.get('visitId')
	const visitId = visitIdStr ? Number(visitIdStr) : Number.NaN
	if (!visitId || Number.isNaN(visitId)) {
		return (
			<div className='page-container'>
				<p className='text-sm text-rose-600'>
					Missing or invalid visitId.
				</p>
			</div>
		)
	}
	return (
		<div className='page-container'>
			<div className='page-content my-10'>
				<MedicalRecordForm
					visitId={visitId}
					onCreated={() => {
						window.history.back()
					}}
				/>
			</div>
		</div>
	)
}

function App() {
	return (
		<BrowserRouter>
			<div className='min-h-screen flex flex-col bg-slate-50 text-slate-900'>
				<Navbar />
				<main className='flex-1'>
					<Routes>
						<Route path='/' element={<HomePage />} />
						<Route path='/login' element={<LoginPage />} />
						<Route path='/register' element={<RegisterPage />} />
						<Route path='/status' element={<StatusPage />} />
						<Route
							path='/u/:username'
							element={<UserProfilePage />}
						/>
						{/* Protected Routes */}
						{/* ADMIN - only admins */}
						<Route
							element={
								<ProtectedRoute allowedRoles={['ADMIN']} />
							}
						>
							<Route path='/admin' element={<AdminPage />} />
						</Route>
						{/* VET - vets & admins */}
						<Route
							element={
								<ProtectedRoute
									allowedRoles={['VET', 'ADMIN']}
								/>
							}
						>
							<Route path='/vet' element={<VetPage />} />
							<Route
								path='/vet/medical-records/new'
								element={<NewMedicalRecordPage />}
							/>
						</Route>
						{/* USER - any role; just need to be authenticated */}
						<Route
							path='/pets'
							element={
								<ProtectedRoute
									allowedRoles={['USER', 'VET', 'ADMIN']}
								/>
							}
						>
							<Route path='/pets' element={<PetsPage />} />
						</Route>
						{/* Fallback for unknown routes */}
						<Route path='*' element={<NotFoundPage />} />
					</Routes>
				</main>
				<Footer />
			</div>
			<ToastContainer />
		</BrowserRouter>
	)
}

export default App
