import { BrowserRouter, Route, Routes } from 'react-router'
import { ToastContainer } from 'react-toastify'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { AdminPage } from './pages/AdminPage.tsx'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { NotFoundPage } from './pages/NotFoundPage.tsx'
import { PetsPage } from './pages/PetsPage.tsx'
import { RegisterPage } from './pages/RegisterPage'
import { StatusPage } from './pages/StatusPage.tsx'
import { UserProfilePage } from './pages/UserProfilePage.tsx'
import { VetPage } from './pages/VetPage.tsx'
import { ProtectedRoute } from './utils/ProtectedRoute.tsx'

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
