import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.tsx'

const root = document.getElementById('root')

if (!root) throw new Error('Failed to find the root element')

createRoot(root).render(
	<StrictMode>
		<AuthProvider>
			<App />
		</AuthProvider>
	</StrictMode>
)
