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

	// Measure on mount, when toggling, and when content resizes
	useLayoutEffect(() => {
		const el = innerRef.current
		if (!el) return

		const measure = () => setContentHeight(el.scrollHeight)
		measure()

		if (typeof ResizeObserver !== 'undefined') {
			const ro = new ResizeObserver(() => measure())
			ro.observe(el)
			return () => ro.disconnect()
		}

		const onResize = () => measure()
		window.addEventListener('resize', onResize)
		return () => window.removeEventListener('resize', onResize)
	}, [])

	// If closed set maxHeight to 0, if open to measured height (+ buffer to avoid clipping)
	const maxHeight = open ? (contentHeight > 0 ? contentHeight + 8 : 9999) : 0

	return (
		<div
			id={id}
			aria-hidden={!open}
			className={`overflow-hidden transition-[max-height] ease-in-out ${open ? 'mt-4' : ''} ${className}`}
			style={{
				maxHeight,
				transitionDuration: `${durationMs}ms`,
				willChange: 'max-height'
			}}
		>
			<div ref={innerRef} className='pb-1'>
				{children}
			</div>
		</div>
	)
}
