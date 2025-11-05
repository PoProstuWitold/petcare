import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState
} from 'react'
import { toast } from 'react-toastify'

export type Role = 'USER' | 'VET' | 'ADMIN'

export interface AuthUser {
	id: number
	fullName: string
	email: string
	roles: Role[]
}

interface AuthState {
	user: AuthUser | null
	accessToken: string | null
}

interface LoginPayload {
	username: string
	password: string
}

// response from /api/auth/login or /api/auth/register
interface AuthTokensResponse {
	accessToken: string
	tokenType: string // e.g., "Bearer"
}

// response from /api/auth/me
interface MeResponse {
	id: number
	fullName: string
	username: string
	email: string
	roles: string[]
}

interface AuthContextValue {
	user: AuthUser | null
	accessToken: string | null
	isAuthenticated: boolean
	login: (payload: LoginPayload) => Promise<void>
	logout: () => void
	hasRole: (role: Role) => boolean
	hasAnyRole: (roles: Role[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEY = 'petcare_auth'

function loadInitialState(): AuthState {
	if (typeof window === 'undefined') {
		return { user: null, accessToken: null }
	}

	try {
		const raw = window.localStorage.getItem(STORAGE_KEY)
		if (!raw) return { user: null, accessToken: null }

		return JSON.parse(raw) as AuthState
	} catch (error) {
		console.error('Failed to load auth state from localStorage', error)
		return { user: null, accessToken: null }
	}
}

function mapMeToAuthUser(data: MeResponse): AuthUser {
	return {
		id: data.id,
		fullName: data.fullName,
		email: data.email,
		roles: data.roles as Role[]
	}
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<AuthState>(() => loadInitialState())

	// Persist state in localStorage
	useEffect(() => {
		try {
			window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
		} catch (error) {
			console.error('Failed to save auth state to localStorage', error)
		}
	}, [state])

	// Helper to fetch current user using /api/auth/me
	const fetchCurrentUser = useCallback(
		async (accessToken: string): Promise<AuthUser> => {
			const response = await fetch('/api/auth/me', {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			})

			if (!response.ok) {
				throw new Error('Failed to load current user')
			}

			const data = (await response.json()) as MeResponse
			return mapMeToAuthUser(data)
		},
		[]
	)

	const login = useCallback(
		async (payload: LoginPayload) => {
			// 1. Get JWT from backend
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(payload)
			})

			if (!response.ok) {
				throw new Error('Invalid credentials or server error')
			}

			const tokens = (await response.json()) as AuthTokensResponse

			// 2. Fetch user profile using /api/auth/me
			const user = await fetchCurrentUser(tokens.accessToken)

			// 3. Save both in state
			setState({
				user,
				accessToken: tokens.accessToken
			})
		},
		[fetchCurrentUser]
	)

	const logout = useCallback(() => {
		setState({ user: null, accessToken: null })
		try {
			window.localStorage.removeItem(STORAGE_KEY)
			toast.success('Logged out successfully')
		} catch (error) {
			toast.error('Failed to log out properly')
			console.error('Failed to clear auth state', error)
		}
	}, [])

	const hasRole = useCallback(
		(role: Role) => !!state.user && state.user.roles?.includes(role),
		[state.user]
	)

	const hasAnyRole = useCallback(
		(roles: Role[]) =>
			!!state.user && roles.some((r) => state.user?.roles?.includes(r)),
		[state.user]
	)

	// On app load or refresh: if we have a token but no user, fetch /me
	useEffect(() => {
		if (!state.accessToken || state.user) return

		let cancelled = false

		;(async () => {
			try {
				if (!state.accessToken) return
				const user = await fetchCurrentUser(state.accessToken)
				if (!cancelled) {
					setState((prev) => ({
						...prev,
						user
					}))
				}
			} catch (error) {
				console.error('Failed to hydrate user from token', error)
				if (!cancelled) {
					setState({ user: null, accessToken: null })
					try {
						window.localStorage.removeItem(STORAGE_KEY)
					} catch (e) {
						console.error('Failed to clear auth storage', e)
					}
				}
			}
		})()

		return () => {
			cancelled = true
		}
	}, [state.accessToken, state.user, fetchCurrentUser])

	const value: AuthContextValue = useMemo(
		() => ({
			user: state.user,
			accessToken: state.accessToken,
			isAuthenticated: !!state.user && !!state.accessToken,
			login,
			logout,
			hasRole,
			hasAnyRole
		}),
		[state.user, state.accessToken, login, logout, hasRole, hasAnyRole]
	)

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
	const ctx = useContext(AuthContext)
	if (!ctx) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return ctx
}
