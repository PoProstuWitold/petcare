import type { ReactNode } from 'react'

export function StatusPill({
	color,
	children
}: {
	color: string
	children: ReactNode
}) {
	return (
		<span
			className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${color}`}
		>
			{children}
		</span>
	)
}

export const visitStatusColor: Record<string, string> = {
	SCHEDULED: 'bg-sky-200 text-sky-700 ring-sky-200',
	CONFIRMED: 'bg-emerald-200 text-emerald-700 ring-emerald-200',
	COMPLETED: 'bg-slate-900 text-slate-50 ring-slate-900/10',
	CANCELLED: 'bg-rose-200 text-rose-700 ring-rose-200',
	DEFAULT: 'bg-slate-200 text-slate-700 ring-slate-200'
}
