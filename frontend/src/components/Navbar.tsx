import { useState } from 'react'
import { RxCross2, RxHamburgerMenu } from 'react-icons/rx'
import { Link, NavLink } from 'react-router'

const navItems = [
	{ label: 'Home', to: '/' },
	{ label: 'Login', to: '/login' },
	{ label: 'Register', to: '/register' }
]

export function Navbar() {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<header className='border-b border-slate-200 bg-white/80 backdrop-blur'>
			<nav className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8'>
				{/* Logo */}
				<Link to='/' className='flex items-center gap-2'>
					<img
						src='/img/petcare.png'
						alt='PetCare logo'
						className='h-9 w-9 rounded-lg object-contain'
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
					<ul className='flex items-center gap-4 text-sm font-medium text-slate-700'>
						{navItems.map((item) => (
							<li key={item.to}>
								<NavLink
									to={item.to}
									className={({ isActive }) =>
										[
											'px-2 py-1 rounded-md transition-colors',
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
						<Link
							to='/#lmao'
							className='rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2'
						>
							Get started
						</Link>
					</div>
				</div>

				{/* Mobile menu button */}
				<button
					type='button'
					className='inline-flex items-center rounded-md p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500 md:hidden'
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
						<ul className='space-y-1 text-sm font-medium text-slate-700'>
							{navItems.map((item) => (
								<li key={item.to}>
									<NavLink
										to={item.to}
										onClick={() => setIsOpen(false)}
										className={({ isActive }) =>
											[
												'block rounded-md px-3 py-2',
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
							<Link
								to='/#lmao'
								onClick={() => setIsOpen(false)}
								className='w-full rounded-full bg-sky-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-sky-700'
							>
								Get started
							</Link>
						</div>
					</div>
				</div>
			)}
		</header>
	)
}
