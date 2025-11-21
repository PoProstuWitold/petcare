import type { ReactNode } from 'react'
import { Button } from './Button'

interface ConfirmationDialogProps {
	isOpen: boolean
	title: string
	message: string
	confirmLabel?: string
	cancelLabel?: string
	onConfirm: () => void
	onCancel: () => void
	variant?: 'danger' | 'warning'
}

export function ConfirmationDialog({
	isOpen,
	title,
	message,
	confirmLabel = 'Confirm',
	cancelLabel = 'Cancel',
	onConfirm,
	onCancel,
	variant = 'danger'
}: ConfirmationDialogProps) {
	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
			<div className='w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg'>
				<h3 className='text-lg font-semibold text-slate-900'>{title}</h3>
				<p className='mt-2 text-sm text-slate-600'>{message}</p>
				<div className='mt-6 flex gap-3 justify-end'>
					<Button variant='ghost' onClick={onCancel}>
						{cancelLabel}
					</Button>
					<Button
						variant={variant}
						onClick={onConfirm}
					>
						{confirmLabel}
					</Button>
				</div>
			</div>
		</div>
	)
}

