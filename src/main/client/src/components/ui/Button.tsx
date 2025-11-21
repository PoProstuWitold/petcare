import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type ButtonVariant =
	| 'primary'
	| 'secondary'
	| 'ghost'
	| 'danger'
	| 'warning'
	| 'outline'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: ButtonVariant
	children: ReactNode
	small?: boolean
}

const base =
	'inline-flex items-center justify-center gap-1 rounded-xl font-semibold tracking-tight cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-sky-500 disabled:cursor-not-allowed disabled:opacity-60'

const sizeMap: Record<string, string> = {
	default: 'px-3.5 py-1.5 text-xs',
	sm: 'px-2.5 py-1 text-[11px]'
}

function variantClasses(variant: ButtonVariant): string {
	switch (variant) {
		case 'primary':
			return 'bg-sky-600 text-white shadow-sm hover:bg-sky-700 hover:shadow-md active:translate-y-px active:shadow-sm'
		case 'secondary':
			return 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-md active:translate-y-px active:shadow-sm'
		case 'ghost':
			return 'border border-slate-300 bg-white text-slate-800 shadow-sm hover:bg-slate-50 hover:border-slate-400 hover:shadow-md active:bg-slate-100 active:translate-y-px'
		case 'danger':
			return 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 active:translate-y-px'
		case 'warning':
			return 'bg-amber-600 text-white shadow-sm hover:bg-amber-700 active:translate-y-px'
		case 'outline':
			return 'border border-sky-600 text-sky-700 bg-transparent hover:bg-sky-50'
		default:
			return ''
	}
}

export function Button({
	variant = 'primary',
	small,
	className = '',
	children,
	...rest
}: ButtonProps) {
	const size = small ? sizeMap.sm : sizeMap.default
	return (
		<button
			className={[base, size, variantClasses(variant), className].join(
				' '
			)}
			{...rest}
		>
			{children}
		</button>
	)
}
