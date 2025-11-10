import { Link } from 'react-router'

export function Footer() {
	const year = new Date().getFullYear()

	return (
		<footer className='mt-auto bg-slate-700 text-white'>
			<div className='mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8'>
				<div className='flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between'>
					{/* Brand / copyright */}
					<div className='space-y-1 text-center sm:text-left'>
						<p className='text-base font-semibold tracking-tight'>
							PetCare
						</p>
						<p className='text-slate-300 text-sm'>
							&copy; {year} PetCare. All rights reserved. Built by
							Witold Zawada.
						</p>
					</div>

					{/* Divider on larger screens */}
					<div className='hidden h-10 w-px bg-slate-500 sm:block' />

					{/* Nav + address */}
					<div className='flex flex-col items-center gap-2 text-center sm:items-end sm:text-right'>
						<nav className='flex flex-wrap justify-center gap-3 sm:gap-4'>
							<a
								href='https://github.com/PoProstuWitold/petcare'
								target='_blank'
								rel='noreferrer'
								className='font-semibold text-slate-100 transition-colors hover:text-sky-200 text-sm'
							>
								Source Code
							</a>
							<Link
								to='/swagger-ui/index.html#'
								className='font-semibold text-slate-100 transition-colors hover:text-sky-200 text-sm'
							>
								Docs
							</Link>
							<Link
								to='/terms'
								className='font-semibold text-slate-100 transition-colors hover:text-sky-200 text-sm'
							>
								Terms of Service
							</Link>
							<Link
								to='/contact'
								className='font-semibold text-slate-100 transition-colors hover:text-sky-200 text-sm'
							>
								Contact
							</Link>
						</nav>

						<p className='text-sm text-slate-300'>
							PetCare Clinic · ul. Zwierzęcia 12, 20-400 Lublin,
							Poland
						</p>
					</div>
				</div>
			</div>
		</footer>
	)
}
