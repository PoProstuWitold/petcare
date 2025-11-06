import { useState } from 'react'
import { RxCross2, RxHamburgerMenu } from 'react-icons/rx'
import { Link, NavLink } from 'react-router'
import { useAuth } from '../context/AuthContext'

type Role = 'USER' | 'VET' | 'ADMIN'

type NavItem = {
	label: string
	to: string
	requiresAuth?: boolean
	requiresRole?: Role[]
}

const navItems: NavItem[] = [
	{ label: 'Home', to: '/' },
	// public status page
	{
		label: 'Status',
		to: '/status'
	},
	{
		label: 'My Pets',
		to: '/pets',
		requiresAuth: true,
		requiresRole: ['USER', 'VET', 'ADMIN']
	},
	{
		label: 'Vet Panel',
		to: '/vet',
		requiresAuth: true,
		requiresRole: ['VET', 'ADMIN']
	},
	{
		label: 'Admin',
		to: '/admin',
		requiresAuth: true,
		requiresRole: ['ADMIN']
	}
]

// shared styles
const navLinkBase =
	'inline-flex items-center rounded-full px-3 py-2 text-sm font-medium transition-colors'
const navLinkActive = 'bg-sky-50 text-sky-700'
const navLinkInactive = 'text-slate-700 hover:text-sky-700 hover:bg-slate-50'

const pillGreeting =
	'inline-flex items-center rounded-full bg-slate-800 px-3 py-2 text-xs sm:text-sm font-medium text-white'

const buttonBase =
	'inline-flex items-center justify-center rounded-full px-3 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2'

const buttonPrimary = `${buttonBase} bg-sky-600 text-white shadow-sm hover:bg-sky-700`

const buttonSecondary = `${buttonBase} border border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50`

const buttonGhost = `${buttonBase} border border-transparent text-slate-700 hover:text-sky-700 hover:bg-slate-50 shadow-none focus-visible:ring-sky-500`

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
		if (item.requiresRole && item.requiresRole.length > 0) {
			return item.requiresRole.some((role) => hasRole(role))
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
				<div className='hidden items-center gap-3 md:flex'>
					<ul className='flex items-center gap-2'>
						{visibleNavItems.map((item) => (
							<li key={item.to}>
								<NavLink
									to={item.to}
									className={({ isActive }) =>
										[
											navLinkBase,
											isActive
												? navLinkActive
												: navLinkInactive
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
								{user?.username ? (
									<Link
										to={`/u/${encodeURIComponent(
											user.username
										)}`}
										className={pillGreeting}
									>
										Hello,&nbsp;
										<span className='font-semibold'>
											{user.fullName}
										</span>
									</Link>
								) : (
									<span className={pillGreeting}>
										Hello,&nbsp;
										<span className='font-semibold'>
											{user?.fullName}
										</span>
									</span>
								)}
								<button
									type='button'
									onClick={logout}
									className={buttonSecondary}
								>
									Logout
								</button>
							</>
						) : (
							<>
								<Link to='/login' className={buttonGhost}>
									Login
								</Link>
								<Link to='/register' className={buttonPrimary}>
									Register
								</Link>
							</>
						)}
					</div>
				</div>

				{/* Mobile menu button */}
				<button
					type='button'
					className='inline-flex items-center rounded-full px-3 py-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 md:hidden'
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
						<ul className='space-y-1'>
							{visibleNavItems.map((item) => (
								<li key={item.to}>
									<NavLink
										to={item.to}
										onClick={() => setIsOpen(false)}
										className={({ isActive }) =>
											[
												navLinkBase,
												'w-full justify-start',
												isActive
													? navLinkActive
													: navLinkInactive
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
									{user?.username ? (
										<Link
											to={`/u/${encodeURIComponent(
												user.username
											)}`}
											onClick={() => setIsOpen(false)}
											className={`${pillGreeting} justify-center`}
										>
											Hello,&nbsp;
											<span className='font-semibold'>
												{user.fullName}
											</span>
										</Link>
									) : (
										<span
											className={`${pillGreeting} justify-center`}
										>
											Hello,&nbsp;
											<span className='font-semibold'>
												{user?.fullName}
											</span>
										</span>
									)}
									<button
										type='button'
										onClick={() => {
											logout()
											setIsOpen(false)
										}}
										className={`${buttonSecondary} w-full justify-center`}
									>
										Log out
									</button>
								</>
							) : (
								<>
									<Link
										to='/login'
										onClick={() => setIsOpen(false)}
										className={`${buttonGhost} w-full justify-center`}
									>
										Login
									</Link>
									<Link
										to='/register'
										onClick={() => setIsOpen(false)}
										className={`${buttonPrimary} w-full justify-center`}
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
