export function VisitCard({ title }: { title: string }) {
	return (
		<div className='relative rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-lg backdrop-blur-sm'>
			<p className='text-xs font-semibold uppercase tracking-wide text-sky-700'>
				{title}
			</p>

			<div className='mt-4 space-y-4 text-sm'>
				<div className='flex items-center justify-between'>
					<div>
						<p className='font-semibold text-slate-900'>Sara</p>
						<p className='text-xs text-slate-500'>
							Dog · Female · 3 years
						</p>
					</div>
					<span className='rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700'>
						Confirmed
					</span>
				</div>

				<div className='grid grid-cols-2 gap-3 text-xs text-slate-600'>
					<div>
						<p className='font-medium text-slate-800'>
							Veterinarian
						</p>
						<p>System Veterinarian</p>
					</div>
					<div>
						<p className='font-medium text-slate-800'>Date</p>
						<p>2025-11-10 · 14:30</p>
					</div>
					<div>
						<p className='font-medium text-slate-800'>Reason</p>
						<p>Annual check-up & vaccines</p>
					</div>
					<div>
						<p className='font-medium text-slate-800'>Room</p>
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
	)
}
