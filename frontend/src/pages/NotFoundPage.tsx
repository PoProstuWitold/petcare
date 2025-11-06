import { Link } from 'react-router'

export function NotFoundPage() {
	return (
		<main className='page-container items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
			<div className='mx-auto flex w-full max-w-xl flex-col items-center gap-6 text-center'>
				<div className='inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-lg font-medium uppercase tracking-wide text-sky-700'>
					<span className='mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-[10px]'>
						🐾
					</span>
					404 Not Found
				</div>

				<h1 className='text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl'>
					Oops, this page got lost.
				</h1>

				<p className='max-w-md text-sm text-slate-600 sm:text-base'>
					We could not find the page you were looking for. Maybe the
					link is incorrect or the page has been moved.
				</p>

				<div className='mt-2 flex flex-wrap items-center justify-center gap-3'>
					<Link
						to='/'
						className='inline-flex items-center justify-center rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2'
					>
						Go back home
					</Link>

					<Link
						to='/status'
						className='inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2'
					>
						Check system status
					</Link>
				</div>

				<div className='mt-6 inline-flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-left'>
					<div className='flex h-10 w-10 items-center justify-center rounded-full bg-white text-2xl'>
						🐕
					</div>
					<div className='text-xs text-slate-600 sm:text-sm'>
						<p className='font-medium text-slate-800'>Fun fact:</p>
						<p>
							Even our clinic dogs sometimes lose their toys. This
							page is probably in the same place.
						</p>
					</div>
				</div>
			</div>
		</main>
	)
}
