import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import { Footer } from './components/Footer'
import { Navbar } from './components/Navbar'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'

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
						{/* Fallback for unknown routes */}
						<Route path='*' element={<Navigate to='/' replace />} />
					</Routes>
				</main>

				<Footer />
			</div>
		</BrowserRouter>
	)
}

export default App
