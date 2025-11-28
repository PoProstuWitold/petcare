import { useCallback, useEffect, useMemo, useState } from 'react'
import {
	FaKey,
	FaPlus,
	FaSync,
	FaTrash,
	FaUserEdit,
	FaUsers
} from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { authHeaders, httpJson } from '../../utils/http'
import type {
	NewUserForm,
	PasswordChangePayload,
	Role,
	User
} from '../../utils/types'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { ConfirmationDialog } from '../ui/ConfirmationDialog'
import { Pagination } from '../ui/Pagination'

interface RoleToggleProps {
	value: Role[]
	onChange: (roles: Role[]) => void
}

const ALL_ROLES: Role[] = ['USER', 'VET', 'ADMIN']

function RoleSelector({ value, onChange }: RoleToggleProps) {
	const toggle = (role: Role) => {
		if (value.includes(role)) onChange(value.filter((r) => r !== role))
		else onChange([...value, role])
	}
	return (
		<div className='flex flex-wrap gap-2'>
			{ALL_ROLES.map((r) => {
				const active = value.includes(r)
				return (
					<button
						key={r}
						type='button'
						onClick={() => toggle(r)}
						className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${active ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'}`}
					>
						{r}
					</button>
				)
			})}
		</div>
	)
}

type FormMode = 'CREATE' | 'PASSWORD' | 'ROLES'

type PageResponse<T> = {
	content: T[]
	totalElements: number
	totalPages: number
	size: number
	number: number
}

export function ManageUsers() {
	const { accessToken } = useAuth()
	const [page, setPage] = useState(0)
	const [pageSize, setPageSize] = useState(20)
	const [usersData, setUsersData] = useState<PageResponse<User> | null>(null)
	const [users, setUsers] = useState<User[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [formMode, setFormMode] = useState<FormMode>('CREATE')
	const [selectedUser, setSelectedUser] = useState<User | null>(null)
	const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null)
	const [refreshing, setRefreshing] = useState(false)

	const [createForm, setCreateForm] = useState<NewUserForm>({
		username: '',
		email: '',
		fullName: '',
		password: '',
		roles: ['USER']
	})
	const [passwordForm, setPasswordForm] = useState<PasswordChangePayload>({
		newPassword: ''
	})
	const [rolesDraft, setRolesDraft] = useState<Role[]>(['USER'])
	const [submitting, setSubmitting] = useState(false)

	const canSubmitCreate = useMemo(
		() =>
			createForm.username.trim() &&
			createForm.email.trim() &&
			createForm.fullName.trim() &&
			createForm.password.length >= 6,
		[createForm]
	)

	const loadUsers = useCallback(async () => {
		if (!accessToken) return
		setLoading(true)
		setError(null)
		try {
			const data = await httpJson<User[] | PageResponse<User>>(
				`/api/users?page=${page}&size=${pageSize}`,
				{
					headers: authHeaders(accessToken)
				}
			)
			// Handle both Page and List responses
			if (Array.isArray(data)) {
				setUsersData({
					content: data,
					totalElements: data.length,
					totalPages: 1,
					size: data.length,
					number: 0
				})
				setUsers(data)
			} else if (data && typeof data === 'object' && 'content' in data) {
				const pageData = data as PageResponse<User>
				setUsersData(pageData)
				setUsers(pageData.content || [])
			} else {
				setUsersData({
					content: [],
					totalElements: 0,
					totalPages: 0,
					size: 0,
					number: 0
				})
				setUsers([])
			}
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to load users')
		} finally {
			setLoading(false)
		}
	}, [accessToken, page, pageSize])

	useEffect(() => {
		if (accessToken) loadUsers()
	}, [accessToken, loadUsers])

	function resetForms() {
		setCreateForm({
			username: '',
			email: '',
			fullName: '',
			password: '',
			roles: ['USER']
		})
		setPasswordForm({ newPassword: '' })
		setRolesDraft(['USER'])
		setSelectedUser(null)
	}

	async function handleCreate(e: React.FormEvent) {
		e.preventDefault()
		if (!canSubmitCreate || !accessToken) return
		setSubmitting(true)
		try {
			await httpJson<User>('/api/users', {
				method: 'POST',
				headers: authHeaders(accessToken),
				body: JSON.stringify(createForm)
			})
			resetForms()
			await loadUsers()
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to create user')
		} finally {
			setSubmitting(false)
		}
	}

	function handleDelete(id: number) {
		setUserIdToDelete(id)
	}

	async function confirmDeleteUser() {
		if (userIdToDelete === null || !accessToken) {
			setUserIdToDelete(null)
			return
		}
		try {
			await httpJson<void>(`/api/users/${userIdToDelete}`, {
				method: 'DELETE',
				headers: authHeaders(accessToken)
			})
			// Refresh full list to ensure consistency with server state
			await loadUsers()
			setUserIdToDelete(null)
		} catch (e) {
			if (e instanceof Error) {
				setError(e.message)
			} else {
				setError('Failed to delete user')
			}
		}
	}

	function startPasswordChange(u: User) {
		setSelectedUser(u)
		setPasswordForm({ newPassword: '' })
		setFormMode('PASSWORD')
	}
	async function submitPasswordChange(e: React.FormEvent) {
		e.preventDefault()
		if (!selectedUser || !passwordForm.newPassword || !accessToken) return
		setSubmitting(true)
		try {
			await httpJson<void>(`/api/users/${selectedUser.id}/password`, {
				method: 'PATCH',
				headers: authHeaders(accessToken),
				body: JSON.stringify(passwordForm)
			})
			resetForms()
		} catch (e) {
			setError(
				e instanceof Error ? e.message : 'Failed to change password'
			)
		} finally {
			setSubmitting(false)
		}
	}

	function startRoleEdit(u: User) {
		setSelectedUser(u)
		setRolesDraft(u.roles as Role[])
		setFormMode('ROLES')
	}
	async function submitRoles(e: React.FormEvent) {
		e.preventDefault()
		if (!selectedUser || !accessToken) return
		setSubmitting(true)
		try {
			await httpJson<void>(`/api/users/${selectedUser.id}/roles`, {
				method: 'PATCH',
				headers: authHeaders(accessToken),
				body: JSON.stringify(rolesDraft)
			})
			resetForms()
			await loadUsers()
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to update roles')
		} finally {
			setSubmitting(false)
		}
	}

	async function refresh() {
		setRefreshing(true)
		await loadUsers()
		setRefreshing(false)
	}

	return (
		<section className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 space-y-6'>
			<header className='flex flex-wrap items-center justify-between gap-3'>
				<div>
					<h2 className='text-lg font-semibold text-slate-900 flex items-center gap-2'>
						<FaUsers className='text-slate-500' /> Users
					</h2>
					<p className='mt-1 text-sm text-slate-600'>
						Create, modify and remove platform user accounts.
					</p>
				</div>
				<div className='flex gap-2'>
					<Button
						type='button'
						variant='outline'
						small
						onClick={refresh}
						disabled={refreshing}
					>
						<FaSync className='mr-1' />{' '}
						{refreshing ? 'Refreshing...' : 'Refresh'}
					</Button>
					<Button
						type='button'
						small
						onClick={() => {
							resetForms()
							setFormMode('CREATE')
						}}
					>
						<FaPlus className='mr-1' /> New User
					</Button>
				</div>
			</header>

			{error && <Alert variant='error'>{error}</Alert>}

			{/* Users table */}
			<div className='overflow-x-auto rounded-lg border border-slate-200'>
				<table className='w-full text-left text-sm'>
					<thead className='bg-slate-50 text-slate-600 text-xs uppercase tracking-wide'>
						<tr>
							<th className='px-3 py-2'>ID</th>
							<th className='px-3 py-2'>Username</th>
							<th className='px-3 py-2'>Full name</th>
							<th className='px-3 py-2'>Email</th>
							<th className='px-3 py-2'>Roles</th>
							<th className='px-3 py-2' />
						</tr>
					</thead>
					<tbody>
						{loading && (
							<tr>
								<td
									colSpan={6}
									className='px-3 py-4 text-center text-slate-500'
								>
									Loading users...
								</td>
							</tr>
						)}
						{!loading && users.length === 0 && (
							<tr>
								<td
									colSpan={6}
									className='px-3 py-4 text-center text-slate-500'
								>
									No users found.
								</td>
							</tr>
						)}
						{!loading &&
							users.map((u) => (
								<tr
									key={u.id}
									className='border-t border-slate-100 hover:bg-slate-50'
								>
									<td className='px-3 py-2 text-xs text-slate-500'>
										#{u.id}
									</td>
									<td className='px-3 py-2 font-medium text-slate-800'>
										{u.username}
									</td>
									<td className='px-3 py-2'>{u.fullName}</td>
									<td className='px-3 py-2'>{u.email}</td>
									<td className='px-3 py-2'>
										<div className='flex flex-wrap gap-1'>
											{u.roles.map((r) => (
												<span
													key={r}
													className='rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-slate-700'
												>
													{r}
												</span>
											))}
										</div>
									</td>
									<td className='px-3 py-2'>
										<div className='flex gap-2'>
											<Button
												type='button'
												variant='ghost'
												small
												onClick={() => startRoleEdit(u)}
												title='Edit roles'
											>
												<FaUserEdit />
											</Button>
											<Button
												type='button'
												variant='ghost'
												small
												onClick={() =>
													startPasswordChange(u)
												}
												title='Reset password'
											>
												<FaKey />
											</Button>
											<Button
												type='button'
												variant='danger'
												small
												onClick={() =>
													handleDelete(u.id)
												}
												title='Delete user'
											>
												<FaTrash />
											</Button>
										</div>
									</td>
								</tr>
							))}
					</tbody>
				</table>
			</div>

			{usersData && (
				<div className='mt-4'>
					<Pagination
						currentPage={usersData.number}
						totalPages={usersData.totalPages}
						pageSize={usersData.size}
						totalElements={usersData.totalElements}
						onPageChange={setPage}
						onPageSizeChange={(size) => {
							setPageSize(size)
							setPage(0)
						}}
					/>
				</div>
			)}

			{/* Forms */}
			<div className='rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-6'>
				<nav className='flex flex-wrap gap-2 text-xs font-medium'>
					<button
						type='button'
						onClick={() => {
							resetForms()
							setFormMode('CREATE')
						}}
						className={`rounded-full px-3 py-1 border ${formMode === 'CREATE' ? 'bg-white text-slate-900 border-slate-300' : 'border-transparent text-slate-600 hover:text-slate-800'}`}
					>
						Create
					</button>
					<button
						type='button'
						disabled={!selectedUser}
						onClick={() => setFormMode('ROLES')}
						className={`rounded-full px-3 py-1 border ${formMode === 'ROLES' ? 'bg-white text-slate-900 border-slate-300' : 'border-transparent text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed'}`}
					>
						Roles
					</button>
					<button
						type='button'
						disabled={!selectedUser}
						onClick={() => setFormMode('PASSWORD')}
						className={`rounded-full px-3 py-1 border ${formMode === 'PASSWORD' ? 'bg-white text-slate-900 border-slate-300' : 'border-transparent text-slate-600 hover:text-slate-800 disabled:opacity-40 disabled:cursor-not-allowed'}`}
					>
						Password
					</button>
				</nav>

				{formMode === 'CREATE' && (
					<form onSubmit={handleCreate} className='space-y-4'>
						<h3 className='text-sm font-semibold text-slate-800 flex items-center gap-2'>
							<FaPlus className='text-slate-500' /> New User
						</h3>
						<div className='grid gap-4 sm:grid-cols-2'>
							<div className='flex flex-col gap-1'>
								<label
									htmlFor='create-username'
									className='text-xs font-medium uppercase tracking-wide text-slate-600'
								>
									Username
								</label>
								<input
									id='create-username'
									value={createForm.username}
									onChange={(e) =>
										setCreateForm({
											...createForm,
											username: e.target.value
										})
									}
									className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
									required
								/>
							</div>
							<div className='flex flex-col gap-1'>
								<label
									htmlFor='create-email'
									className='text-xs font-medium uppercase tracking-wide text-slate-600'
								>
									Email
								</label>
								<input
									id='create-email'
									type='email'
									value={createForm.email}
									onChange={(e) =>
										setCreateForm({
											...createForm,
											email: e.target.value
										})
									}
									className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
									required
								/>
							</div>
							<div className='flex flex-col gap-1'>
								<label
									htmlFor='create-fullname'
									className='text-xs font-medium uppercase tracking-wide text-slate-600'
								>
									Full name
								</label>
								<input
									id='create-fullname'
									value={createForm.fullName}
									onChange={(e) =>
										setCreateForm({
											...createForm,
											fullName: e.target.value
										})
									}
									className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
									required
								/>
							</div>
							<div className='flex flex-col gap-1'>
								<label
									htmlFor='create-password'
									className='text-xs font-medium uppercase tracking-wide text-slate-600'
								>
									Password
								</label>
								<input
									id='create-password'
									type='password'
									value={createForm.password}
									minLength={6}
									onChange={(e) =>
										setCreateForm({
											...createForm,
											password: e.target.value
										})
									}
									className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
									required
								/>
							</div>
							<div className='flex flex-col gap-1 sm:col-span-2'>
								<fieldset>
									<legend className='text-xs font-medium uppercase tracking-wide text-slate-600'>
										Roles
									</legend>
									<RoleSelector
										value={createForm.roles}
										onChange={(roles) =>
											setCreateForm({
												...createForm,
												roles
											})
										}
									/>
								</fieldset>
							</div>
						</div>
						<div className='pt-2 flex gap-2'>
							<Button
								type='submit'
								disabled={!canSubmitCreate || submitting}
							>
								{submitting ? 'Creating...' : 'Create User'}
							</Button>
							<Button
								type='button'
								variant='ghost'
								onClick={() => resetForms()}
								disabled={submitting}
							>
								Reset
							</Button>
						</div>
					</form>
				)}

				{formMode === 'PASSWORD' && selectedUser && (
					<form onSubmit={submitPasswordChange} className='space-y-4'>
						<h3 className='text-sm font-semibold text-slate-800 flex items-center gap-2'>
							<FaKey className='text-slate-500' /> Change Password
							· {selectedUser.username}
						</h3>
						<div className='flex flex-col gap-1 max-w-sm'>
							<label
								htmlFor='new-password'
								className='text-xs font-medium uppercase tracking-wide text-slate-600'
							>
								New Password
							</label>
							<input
								id='new-password'
								type='password'
								value={passwordForm.newPassword}
								minLength={6}
								onChange={(e) =>
									setPasswordForm({
										newPassword: e.target.value
									})
								}
								className='rounded border border-slate-300 px-2 py-1 text-sm focus:border-sky-500 focus:ring-sky-500'
								required
							/>
						</div>
						<div className='pt-2 flex gap-2'>
							<Button
								type='submit'
								disabled={
									submitting || !passwordForm.newPassword
								}
							>
								{submitting ? 'Saving...' : 'Save Password'}
							</Button>
							<Button
								type='button'
								variant='ghost'
								onClick={() => resetForms()}
								disabled={submitting}
							>
								Cancel
							</Button>
						</div>
					</form>
				)}

				{formMode === 'ROLES' && selectedUser && (
					<form onSubmit={submitRoles} className='space-y-4'>
						<h3 className='text-sm font-semibold text-slate-800 flex items-center gap-2'>
							<FaUserEdit className='text-slate-500' /> Edit Roles
							· {selectedUser.username}
						</h3>
						<div className='flex flex-col gap-2'>
							<RoleSelector
								value={rolesDraft}
								onChange={setRolesDraft}
							/>
							<p className='text-[11px] text-slate-500'>
								Select one or more roles. Removing ADMIN will
								revoke all admin privileges immediately.
							</p>
						</div>
						<div className='pt-2 flex gap-2'>
							<Button type='submit' disabled={submitting}>
								{submitting ? 'Updating...' : 'Save Roles'}
							</Button>
							<Button
								type='button'
								variant='ghost'
								onClick={() => resetForms()}
								disabled={submitting}
							>
								Cancel
							</Button>
						</div>
					</form>
				)}
			</div>

			<ConfirmationDialog
				isOpen={userIdToDelete !== null}
				title='Delete User'
				message='Delete user? This cannot be undone.'
				confirmLabel='Delete'
				cancelLabel='Cancel'
				onConfirm={confirmDeleteUser}
				onCancel={() => setUserIdToDelete(null)}
				variant='danger'
			/>
		</section>
	)
}
