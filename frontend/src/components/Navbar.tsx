import { useState } from 'react'
import { RxCross2, RxHamburgerMenu } from 'react-icons/rx'
import { Link, NavLink } from 'react-router'
import { useAuth } from '../context/AuthContext'

type Role = 'USER' | 'VET' | 'ADMIN'

type NavItem = {
	label: string
	to: string
	requiresAuth?: boolean
	requiresRole?: Role
}

const navItems: NavItem[] = [
	{ label: 'Home', to: '/' },
	{ label: 'My Pets', to: '/pets', requiresAuth: true, requiresRole: 'USER' },
	{ label: 'Vet Panel', to: '/vet', requiresAuth: true, requiresRole: 'VET' },
	{ label: 'Admin', to: '/admin', requiresAuth: true, requiresRole: 'ADMIN' }
]

export function Navbar() {
	const [isOpen, setIsOpen] = useState(false)
	const { user, isAuthenticated, hasRole, logout } = useAuth()

	const visibleNavItems = navItems.filter((item) => {
		if (!item.requiresAuth) {
			return true
		}
		if (!isAuthenticated) {
			return false
		}
		if (item.requiresRole) {
			return hasRole(item.requiresRole)
		}
		return true
	})

	return (
		<header className='border-b border-slate-200 bg-white/80 backdrop-blur'>
			<nav className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8'>
				{/* Logo */}
				<Link to='/' className='flex items-center gap-2'>
					<img
						src='/img/petcare.png'
						alt='PetCare logo'
						className='h-10 w-10 rounded-full object-contain'
					/>
					<div className='flex flex-col leading-tight'>
						<span className='text-lg font-semibold tracking-tight text-slate-900'>
							PetCare
						</span>
						<span className='text-xs text-slate-500'>
							Veterinary visits made simple
						</span>
					</div>
				</Link>

				{/* Desktop nav */}
				<div className='hidden items-center gap-6 md:flex'>
					<ul className='flex items-center gap-4 font-medium text-slate-700'>
						{visibleNavItems.map((item) => (
							<li key={item.to}>
								<NavLink
									to={item.to}
									className={({ isActive }) =>
										[
											'px-3 py-2 rounded-full transition-colors',
											isActive
												? 'text-sky-700 bg-sky-50'
												: 'text-slate-700 hover:text-sky-700 hover:bg-slate-50'
										].join(' ')
									}
								>
									{item.label}
								</NavLink>
							</li>
						))}
					</ul>

					<div className='flex items-center gap-3'>
						{isAuthenticated ? (
							<>
								<span className='text-xs text-white bg-slate-700 px-3 py-2 rounded-full'>
									Hello,{' '}
									<span className='font-semibold'>
										{user?.fullName}
									</span>
								</span>
								<button
									type='button'
									onClick={logout}
									className='cursor-pointer border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-full'
								>
									Logout
								</button>
							</>
						) : (
							<>
								<Link
									to='/login'
									className='font-medium text-slate-700 hover:text-sky-700'
								>
									Login
								</Link>
								<Link
									to='/register'
									className='px-3 py-2 rounded-full bg-sky-600 font-semibold text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2'
								>
									Register
								</Link>
							</>
						)}
					</div>
				</div>

				{/* Mobile menu button */}
				<button
					type='button'
					className='inline-flex items-center px-3 py-2 rounded-full text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 md:hidden'
					onClick={() => setIsOpen((prev) => !prev)}
					aria-expanded={isOpen}
					aria-label='Toggle navigation'
				>
					<span className='sr-only'>Open main menu</span>
					{isOpen ? (
						<RxCross2 className='h-6 w-6' />
					) : (
						<RxHamburgerMenu className='h-6 w-6' />
					)}
				</button>
			</nav>

			{/* Mobile menu */}
			{isOpen && (
				<div className='border-t border-slate-200 bg-white md:hidden'>
					<div className='mx-auto max-w-6xl px-4 py-3 sm:px-6 lg:px-8'>
						<ul className='space-y-1 font-medium text-slate-700'>
							{visibleNavItems.map((item) => (
								<li key={item.to}>
									<NavLink
										to={item.to}
										onClick={() => setIsOpen(false)}
										className={({ isActive }) =>
											[
												'block px-3 py-2 rounded-full',
												isActive
													? 'text-sky-700 bg-sky-50'
													: 'text-slate-700 hover:text-sky-700 hover:bg-slate-50'
											].join(' ')
										}
									>
										{item.label}
									</NavLink>
								</li>
							))}
						</ul>

						<div className='mt-3 flex flex-col gap-2'>
							{isAuthenticated ? (
								<>
									<span className='text-center text-white bg-slate-700 px-3 py-2 rounded-full'>
										Hello,{' '}
										<span className='font-semibold'>
											{user?.fullName}
										</span>
									</span>
									<button
										type='button'
										onClick={() => {
											logout()
											setIsOpen(false)
										}}
										className='w-full px-3 py-2 rounded-fullborder border-slate-200 bg-white text-center font-semibold text-slate-800 shadow-sm hover:bg-slate-50'
									>
										Log out
									</button>
								</>
							) : (
								<>
									<Link
										to='/login'
										onClick={() => setIsOpen(false)}
										className='w-full px-3 py-2 rounded-full border border-slate-200 bg-white text-center font-semibold text-slate-800 shadow-sm hover:bg-slate-50'
									>
										Login
									</Link>
									<Link
										to='/register'
										onClick={() => setIsOpen(false)}
										className='w-full px-3 py-2 rounded-full bg-sky-600 text-center font-semibold text-white shadow-sm hover:bg-sky-700'
									>
										Register
									</Link>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</header>
	)
}
