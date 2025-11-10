import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState
} from 'react'
import {
	authHeaders,
	httpJson,
	setHttpErrorInterceptor,
	setUnauthorizedHandler
} from '../utils/http'

export type Role = 'USER' | 'VET' | 'ADMIN'

export interface AuthUser {
	id: number
	fullName: string
	email: string
	username: string
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
		username: data.username,
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
			const data = await httpJson<MeResponse>('/api/auth/me', {
				headers: authHeaders(accessToken)
			})
			return mapMeToAuthUser(data)
		},
		[]
	)

	const login = useCallback(
		async (payload: LoginPayload) => {
			const tokens = await httpJson<AuthTokensResponse>(
				'/api/auth/login',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(payload)
				}
			)

			const user = await fetchCurrentUser(tokens.accessToken)

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
		} catch (error) {
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
				// biome-ignore lint: no unnecessary-catch
			} catch (error: any) {
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

	useEffect(() => {
		setUnauthorizedHandler(() => {
			logout()
		})
		setHttpErrorInterceptor((err) => {
			if (err.status && (err.status === 401 || err.status === 403)) {
				// handled by unauthorized handler
				return
			}
		})
		return () => {
			setUnauthorizedHandler(null)
			setHttpErrorInterceptor(null)
		}
	}, [logout])

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
