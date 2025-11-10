import type { ReactNode } from 'react'

export type AlertVariant = 'info' | 'success' | 'error' | 'warning'

const classes: Record<AlertVariant, string> = {
	info: 'border-sky-200 bg-sky-50 text-sky-800',
	success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
	error: 'border-red-200 bg-red-50 text-red-800',
	warning: 'border-amber-200 bg-amber-50 text-amber-800'
}

export function Alert({
	variant = 'info',
	children,
	className = ''
}: {
	variant?: AlertVariant
	children: ReactNode
	className?: string
}) {
	return (
		<div
			className={`rounded-xl border px-4 py-3 text-sm ${classes[variant]} ${className}`}
		>
			{children}
		</div>
	)
}
