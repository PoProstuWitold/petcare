import type { ReactNode } from 'react'

/*
 * Shared card primitives to unify layout & styling across Pet, Visit and MedicalRecord cards.
 */
export function Card({
	className = '',
	children
}: {
	className?: string
	children: ReactNode
}) {
	return (
		<div
			className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}
		>
			{children}
		</div>
	)
}

export function CardBody({
	className = '',
	children
}: {
	className?: string
	children: ReactNode
}) {
	return <div className={`p-5 space-y-5 ${className}`}>{children}</div>
}

export function SectionBadge({
	children,
	tone = 'slate'
}: {
	children: ReactNode
	tone?: 'slate' | 'sky' | 'emerald' | 'rose'
}) {
	const toneMap: Record<string, string> = {
		slate: 'bg-slate-200 text-slate-700',
		sky: 'bg-sky-200 text-sky-800',
		emerald: 'bg-emerald-200 text-emerald-800',
		rose: 'bg-rose-200 text-rose-800'
	}
	return (
		<span
			className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${toneMap[tone]}`}
		>
			{children}
		</span>
	)
}

export function InfoGrid({
	children,
	cols = 2,
	className = ''
}: {
	children: ReactNode
	cols?: 1 | 2 | 3
	className?: string
}) {
	const colClass =
		cols === 1 ? 'grid-cols-1' : cols === 2 ? 'grid-cols-2' : 'grid-cols-3'
	return (
		<div className={`grid ${colClass} gap-4 text-xs ${className}`}>
			{children}
		</div>
	)
}

export function InfoItem({
	icon,
	label,
	value,
	accent = false
}: {
	icon?: ReactNode
	label: ReactNode
	value: ReactNode
	accent?: boolean
}) {
	return (
		<div className='flex flex-col gap-1'>
			<p
				className={`font-medium flex items-center gap-1 ${accent ? 'text-sky-900' : 'text-slate-800'}`}
			>
				{icon} {label}
			</p>
			<p className='text-slate-700'>{value}</p>
		</div>
	)
}

export function CardDivider() {
	return <div className='border-t border-slate-200 my-2' />
}

export function CardActions({ children }: { children: ReactNode }) {
	return <div className='flex flex-wrap gap-2'>{children}</div>
}
