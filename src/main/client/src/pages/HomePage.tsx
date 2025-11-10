import { VisitCard } from '../components/VisitCard.tsx'
import { mockVisit } from '../utils/mocks.ts'

export function HomePage() {
	return (
		<div className='page-container'>
			<section className='mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:py-16 lg:px-8'>
				<div className='flex-1 flex flex-col items-center space-y-4 text-center sm:space-y-6 sm:items-start sm:text-left'>
					<p className='inline-flex rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-700 mx-auto sm:mx-0'>
						Welcome to PetCare
					</p>

					<h1 className='text-balance text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl'>
						Manage your pets&apos; health in one place
					</h1>

					<p className='max-w-xl text-balance text-sm text-slate-600 sm:text-base mx-auto sm:mx-0'>
						Keep track of visits, notes from your vet, and important
						info about each pet. PetCare helps you stay organised,
						so you can focus on what matters most – time together.
					</p>

					<ul className='mt-6 grid max-w-xl gap-3 text-sm text-slate-700 mx-auto place-items-center sm:mx-0 sm:grid-cols-2 sm:place-items-start'>
						<li className='flex items-center gap-2 justify-center sm:justify-start'>
							<span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700'>
								✓
							</span>
							<span>
								See and manage all of your pets in one friendly
								view.
							</span>
						</li>
						<li className='flex items-center gap-2 justify-center sm:justify-start'>
							<span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700'>
								✓
							</span>
							<span>
								Follow visits, diagnoses, and treatments over
								time.
							</span>
						</li>
						<li className='flex items-center gap-2 justify-center sm:justify-start'>
							<span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700'>
								✓
							</span>
							<span>
								Safe access for pet owners, vets, and clinic
								staff.
							</span>
						</li>
						<li className='flex items-center gap-2 justify-center sm:justify-start'>
							<span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-bold text-sky-700'>
								✓
							</span>
							<span>
								Clear, simple interface without unnecessary
								clutter.
							</span>
						</li>
					</ul>
				</div>

				<div className='mt-8 flex flex-1 justify-center lg:mt-0'>
					<div className='relative w-full max-w-md'>
						<div className='absolute -inset-4 rounded-3xl bg-sky-100/60 blur-xl' />
						<VisitCard
							demo
							title='Visit Card - Vet Preview'
							visit={mockVisit}
						/>
					</div>
				</div>
			</section>
			<section>
				<div className='mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-3 lg:px-8'>
					<div>
						<h2 className='text-base font-semibold text-slate-900'>
							Why <strong>PetCare</strong>?
						</h2>
						<p className='mt-2 text-sm text-slate-600'>
							PetCare focuses on what really matters: your pets,
							their visits, and how they feel - without confusing
							menus or extra steps.
						</p>
					</div>

					<div className='space-y-4 text-sm text-slate-700'>
						<h3 className='font-semibold text-slate-900'>
							For <strong>Pet Owners</strong>
						</h3>
						<ul className='space-y-2'>
							<li>
								• Check upcoming and past visits in seconds.
							</li>
							<li>
								• Save notes from your vet and track how your
								pet is doing.
							</li>
							<li>
								• Keep all pet profiles tidy and up to date.
							</li>
						</ul>
					</div>

					<div className='space-y-4 text-sm text-slate-700'>
						<h3 className='font-semibold text-slate-900'>
							For <strong>Vets & Clinics</strong>
						</h3>
						<ul className='space-y-2'>
							<li>
								• Quickly access pet profiles and visit history.
							</li>
							<li>
								• Manage appointments in a clean, role-based
								workspace.
							</li>
							<li>
								• Keep medical information structured, yet easy
								to update during a visit.
							</li>
						</ul>
					</div>
				</div>
			</section>
		</div>
	)
}
