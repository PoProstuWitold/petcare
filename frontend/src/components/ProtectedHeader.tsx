interface ProtectedHeaderProps {
	user?: { fullName: string } | null
	title: string
	description: string
	children?: React.ReactNode
}

export function ProtectedHeader({
	user,
	title,
	description,
	children
}: ProtectedHeaderProps) {
	return (
		<div className='mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8'>
			<header className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
				<div>
					<h1 className='text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl'>
						{title}
					</h1>
					<p className='mt-1 text-sm text-slate-600'>{description}</p>
				</div>

				<div className='flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-4'>
					{user && (
						<p className='text-xs text-slate-500 sm:text-sm'>
							Signed in as{' '}
							<span className='font-medium text-slate-800'>
								{user.fullName}
							</span>
						</p>
					)}
					{children}
				</div>
			</header>
		</div>
	)
}
