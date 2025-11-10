import { type ReactNode, useLayoutEffect, useRef, useState } from 'react'

interface CollapsibleProps {
	open: boolean
	children: ReactNode
	id?: string
	className?: string
	durationMs?: number
}

// Subtle height animation using max-height. Measures content to avoid hardcoded values.
export function Collapsible({
	open,
	children,
	id,
	className = '',
	durationMs = 300
}: CollapsibleProps) {
	const innerRef = useRef<HTMLDivElement>(null)
	const [contentHeight, setContentHeight] = useState<number>(0)

	useLayoutEffect(() => {
		if (innerRef.current) {
			setContentHeight(innerRef.current.scrollHeight)
		}
	}, [])

	// If closed set maxHeight to 0, if open to measured height (fallback large value if 0)
	const maxHeight = open ? contentHeight || 9999 : 0

	return (
		<div
			id={id}
			aria-hidden={!open}
			className={`overflow-hidden transition-[max-height] ease-in-out ${open ? 'mt-4' : ''} ${className}`}
			style={{ maxHeight, transitionDuration: `${durationMs}ms` }}
		>
			<div ref={innerRef}>{children}</div>
		</div>
	)
}
