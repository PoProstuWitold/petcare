export function HomePage() {
	return (
		<div className='bg-gradient-to-b from-sky-50 to-slate-50'>
			<section className='mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:py-16 lg:px-8'>
				<div className='flex-1 space-y-6'>
					<p className='inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700'>
						Welcome to PetCare
					</p>

					<h1 className='text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl'>
						Manage your pets&apos; health in one place.
					</h1>

					<p className='max-w-xl text-balance text-sm text-slate-600 sm:text-base'>
						Book veterinary appointments, track medical records, and
						keep all your pets&apos; information organized. Designed
						for busy pet owners and vets who want a simple, clear
						overview.
					</p>

					<ul className='mt-4 grid gap-3 text-sm text-slate-700 sm:grid-cols-2'>
						<li className='flex items-start gap-2'>
							<span className='mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700'>
								✓
							</span>
							<span>View all of your pets in one dashboard.</span>
						</li>
						<li className='flex items-start gap-2'>
							<span className='mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700'>
								✓
							</span>
							<span>
								Track visits, diagnoses, and treatments over
								time.
							</span>
						</li>
						<li className='flex items-start gap-2'>
							<span className='mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700'>
								✓
							</span>
							<span>
								Simple role-based access for owners, vets, and
								admins.
							</span>
						</li>
						<li className='flex items-start gap-2'>
							<span className='mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700'>
								✓
							</span>
							<span>
								Built to integrate with the PetCare Spring Boot
								backend.
							</span>
						</li>
					</ul>
				</div>

				<div className='mt-8 flex flex-1 justify-center lg:mt-0'>
					<div className='relative w-full max-w-md'>
						<div className='absolute -inset-4 rounded-3xl bg-sky-100/60 blur-xl' />
						<div className='relative rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-lg backdrop-blur-sm'>
							<p className='text-xs font-semibold uppercase tracking-wide text-sky-700'>
								Example upcoming visit
							</p>

							<div className='mt-4 space-y-4 text-sm'>
								<div className='flex items-center justify-between'>
									<div>
										<p className='font-semibold text-slate-900'>
											Luna
										</p>
										<p className='text-xs text-slate-500'>
											Domestic cat · 3 years
										</p>
									</div>
									<span className='rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700'>
										Confirmed
									</span>
								</div>

								<div className='grid grid-cols-2 gap-3 text-xs text-slate-600'>
									<div>
										<p className='font-medium text-slate-800'>
											Vet
										</p>
										<p>Dr. Smith</p>
									</div>
									<div>
										<p className='font-medium text-slate-800'>
											Date
										</p>
										<p>2025-11-10 · 14:30</p>
									</div>
									<div>
										<p className='font-medium text-slate-800'>
											Reason
										</p>
										<p>Annual check-up & vaccines</p>
									</div>
									<div>
										<p className='font-medium text-slate-800'>
											Clinic
										</p>
										<p>PetCare Clinic · Room 2</p>
									</div>
								</div>

								<button
									type='button'
									className='mt-2 w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100'
								>
									View full schedule
								</button>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className='border-t border-slate-200 bg-white'>
				<div className='mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-3 lg:px-8'>
					<div>
						<h2 className='text-base font-semibold text-slate-900'>
							Why PetCare?
						</h2>
						<p className='mt-2 text-sm text-slate-600'>
							PetCare keeps the domain simple on purpose: pets,
							owners, vets, appointments, visits, and medical
							records – without unnecessary complexity.
						</p>
					</div>

					<div className='space-y-4 text-sm text-slate-700'>
						<h3 className='font-semibold text-slate-900'>
							For pet owners
						</h3>
						<ul className='space-y-2'>
							<li>
								• See upcoming and past visits for each pet.
							</li>
							<li>
								• Store notes from vets and track how your pet
								feels.
							</li>
							<li>• Keep all pet profiles in one place.</li>
						</ul>
					</div>

					<div className='space-y-4 text-sm text-slate-700'>
						<h3 className='font-semibold text-slate-900'>
							For vets & admins
						</h3>
						<ul className='space-y-2'>
							<li>
								• Access pet profiles and visit history quickly.
							</li>
							<li>
								• Manage appointments in a clear, role-based
								interface.
							</li>
							<li>
								• Keep medical information structured but easy
								to work with.
							</li>
						</ul>
					</div>
				</div>
			</section>
		</div>
	)
}
