import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { ToastContainer } from 'react-toastify'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { AdminPage } from './pages/AdminPage.tsx'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { PetsPage } from './pages/PetsPage.tsx'
import { RegisterPage } from './pages/RegisterPage'
import { VetPage } from './pages/VetPage.tsx'

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
						<Route path='/admin' element={<AdminPage />} />
						<Route path='/vet' element={<VetPage />} />
						<Route path='/pets' element={<PetsPage />} />
						{/* Fallback for unknown routes */}
						<Route path='*' element={<Navigate to='/' replace />} />
					</Routes>
				</main>
				<Footer />
			</div>
			<ToastContainer />
		</BrowserRouter>
	)
}

export default App
