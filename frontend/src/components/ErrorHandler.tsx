export function ErrorHandler({ message }: { message?: string }) {
	return (
		<div className='rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700'>
			<p>{message ?? 'An error occurred'}</p>
		</div>
	)
}
