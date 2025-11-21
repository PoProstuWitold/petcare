import { Spinner } from './ui/Spinner'

export function Loader({ message }: { message?: string }) {
	return (
		<div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-center gap-3'>
			<Spinner size='md' />
			<p className='text-sm text-slate-600'>{message ?? 'Loading...'}</p>
		</div>
	)
}
