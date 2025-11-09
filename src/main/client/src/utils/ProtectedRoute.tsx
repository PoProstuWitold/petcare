import { Navigate, Outlet } from 'react-router'
import { type Role, useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
	allowedRoles?: Role[]
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
	const { isAuthenticated, hasAnyRole } = useAuth()

	if (!isAuthenticated) {
		return <Navigate to='/login' replace />
	}

	if (allowedRoles && allowedRoles.length > 0 && !hasAnyRole(allowedRoles)) {
		return <Navigate to='/' replace />
	}

	return <Outlet />
}
