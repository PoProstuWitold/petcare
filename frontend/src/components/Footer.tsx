export function Footer() {
	const year = new Date().getFullYear()

	return (
		<footer className='border-t border-slate-200 bg-white'>
			<div className='mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8'>
				<p className='text-center sm:text-left'>
					&copy; {year} PetCare. All rights reserved. Witold Zawada
				</p>

				<div className='flex justify-center gap-4 text-xs sm:text-sm'>
					<button
						type='button'
						className='text-slate-500 hover:text-slate-800'
					>
						Privacy Policy
					</button>
					<button
						type='button'
						className='text-slate-500 hover:text-slate-800'
					>
						Terms of Service
					</button>
					<button
						type='button'
						className='text-slate-500 hover:text-slate-800'
					>
						Contact support
					</button>
				</div>
			</div>
		</footer>
	)
}
