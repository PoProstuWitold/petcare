import { type DragEventHandler, useState } from 'react'
import { FiDownload, FiUpload } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { useAuthFetch } from '../hooks/useAuthFetch'
import type { Pet } from '../utils/types'
import { Button } from './ui/Button'

// Add max file size and enums for validation
const MAX_IMPORT_FILE_SIZE_BYTES = 1_000_000 // ~1 MB
const ALLOWED_SPECIES: readonly string[] = [
	'DOG',
	'CAT',
	'RABBIT',
	'GUINEA_PIG',
	'HAMSTER',
	'BIRD',
	'TURTLE',
	'FERRET',
	'OTHER'
]
const ALLOWED_SEX: readonly string[] = ['MALE', 'FEMALE', 'UNKNOWN']

function normalizeEnum(value: unknown): string | null {
	if (typeof value !== 'string') return null
	return value
		.trim()
		.replace(/[-\s]+/g, '_')
		.toUpperCase()
}

function isIsoDate(value: unknown): boolean {
	return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isInteger(value: unknown): boolean {
	return typeof value === 'number' && Number.isInteger(value)
}

// Shape used for import/export (matches PetImportDto backend)
export type PetImport = {
	name: string
	species: string
	sex?: string | null
	breed?: string | null
	birthDate?: string | null
	birthYear?: number | null
	weight?: number | null
	notes?: string | null
}

interface Props {
	onImported: (pets: Pet[]) => void
	disabled?: boolean
}

export function PetImportExportPanel({ onImported, disabled }: Props) {
	const { json } = useAuthFetch()
	const { accessToken } = useAuth()
	const [isExporting, setIsExporting] = useState(false)
	const [isImporting, setIsImporting] = useState(false)
	const [isDragging, setIsDragging] = useState(false)

	const handleExport = async () => {
		if (!accessToken) {
			toast.error('Please log in again.')
			return
		}
		setIsExporting(true)
		try {
			const data = await json<PetImport[]>('/api/pets/me/export')
			const blob = new Blob([JSON.stringify(data, null, 2)], {
				type: 'application/json'
			})
			const url = URL.createObjectURL(blob)
			const a = document.createElement('a')
			a.href = url
			const ts = new Date().toISOString().split('T')[0]
			a.download = `pets-export-${ts}.json`
			document.body.appendChild(a)
			a.click()
			a.remove()
			URL.revokeObjectURL(url)
			toast.success(`Exported ${data.length} pets.`)
		} catch (err: unknown) {
			console.error('Failed to export pets', err)
			const message =
				err instanceof Error ? err.message : 'Failed to export pets'
			toast.error(message)
		} finally {
			setIsExporting(false)
		}
	}

	const handleImportFile = async (file: File) => {
		if (file.size > MAX_IMPORT_FILE_SIZE_BYTES) {
			toast.error('File too large (max 1 MB).')
			return
		}
		setIsImporting(true)
		try {
			const text = await file.text()
			let parsed: unknown
			try {
				parsed = JSON.parse(text)
			} catch {
				toast.error('Invalid import file.')
				return
			}
			if (!Array.isArray(parsed)) {
				toast.error('Invalid import file.')
				return
			}

			const errors: string[] = []
			const items: PetImport[] = []
			const currentYear = new Date().getFullYear()

			;(parsed as unknown[]).forEach((raw, idx) => {
				if (typeof raw !== 'object' || raw === null) {
					errors.push(`[${idx}] Item must be an object`)
					return
				}
				const obj = raw as Record<string, unknown>

				// name
				if (typeof obj.name !== 'string' || !obj.name.trim()) {
					errors.push(`[${idx}] name must be a non-empty string`)
				}
				if (typeof obj.name === 'string' && obj.name.length > 64) {
					errors.push(`[${idx}] name must be at most 64 characters`)
				}

				// species
				const normalizedSpecies = normalizeEnum(obj.species)
				if (
					!normalizedSpecies ||
					!ALLOWED_SPECIES.includes(normalizedSpecies)
				) {
					errors.push(
						`[${idx}] species must be one of: ${ALLOWED_SPECIES.join(', ')}`
					)
				}

				// sex (optional)
				let normalizedSex: string | null = null
				if (obj.sex != null) {
					normalizedSex = normalizeEnum(obj.sex)
					if (
						!normalizedSex ||
						!ALLOWED_SEX.includes(normalizedSex)
					) {
						errors.push(
							`[${idx}] sex must be one of: ${ALLOWED_SEX.join(', ')}`
						)
					}
				}

				// breed (optional)
				if (obj.breed != null) {
					if (typeof obj.breed !== 'string') {
						errors.push(`[${idx}] breed must be a string`)
					} else if (obj.breed.length > 64) {
						errors.push(
							`[${idx}] breed must be at most 64 characters`
						)
					}
				}

				// birthDate (optional)
				if (obj.birthDate != null) {
					if (!isIsoDate(obj.birthDate)) {
						errors.push(`[${idx}] birthDate must be YYYY-MM-DD`)
					}
				}

				// birthYear (optional)
				if (obj.birthYear != null) {
					if (!isInteger(obj.birthYear)) {
						errors.push(`[${idx}] birthYear must be an integer`)
					} else if (
						(obj.birthYear as number) < 1900 ||
						(obj.birthYear as number) > currentYear
					) {
						errors.push(
							`[${idx}] birthYear must be between 1900 and ${currentYear}`
						)
					}
				}

				// weight (optional)
				if (obj.weight != null) {
					if (typeof obj.weight !== 'number' || !(obj.weight > 0)) {
						errors.push(`[${idx}] weight must be a positive number`)
					}
				}

				// notes (optional)
				if (obj.notes != null) {
					if (typeof obj.notes !== 'string') {
						errors.push(`[${idx}] notes must be a string`)
					} else if (obj.notes.length > 512) {
						errors.push(
							`[${idx}] notes must be at most 512 characters`
						)
					}
				}

				// Only assemble item if no errors for this index
				const hadErrorsForItem = errors.some((e) =>
					e.startsWith(`[${idx}]`)
				)
				if (!hadErrorsForItem) {
					items.push({
						name: obj.name as string,
						species:
							(normalizedSpecies as string) ??
							(obj.species as string),
						sex: (normalizedSex as string | null) ?? null,
						breed: typeof obj.breed === 'string' ? obj.breed : null,
						birthDate:
							typeof obj.birthDate === 'string'
								? obj.birthDate
								: null,
						birthYear:
							typeof obj.birthYear === 'number'
								? obj.birthYear
								: null,
						weight:
							typeof obj.weight === 'number' ? obj.weight : null,
						notes: typeof obj.notes === 'string' ? obj.notes : null
					})
				}
			})

			if (errors.length > 0) {
				console.error('Import validation errors:', errors)
				const sample = errors.slice(0, 3).join('\n')
				toast.error(
					`Invalid import file. ${errors.length} issue(s) found.\n${sample}`
				)
				return
			}

			const created = await json<Pet[]>('/api/pets/me/import', {
				method: 'POST',
				body: JSON.stringify(items)
			})
			onImported(created)
			toast.success(`Imported ${created.length} pets.`)
		} catch (err: unknown) {
			console.error('Failed to import pets', err)
			const message =
				err instanceof Error ? err.message : 'Failed to import pets'
			toast.error(message)
		} finally {
			setIsImporting(false)
		}
	}

	const handleImportClick = () => {
		const input = document.createElement('input')
		input.type = 'file'
		input.accept = 'application/json'
		input.onchange = () => {
			const file = input.files?.[0]
			if (file) void handleImportFile(file)
		}
		input.click()
	}

	const handleDragOver: DragEventHandler<HTMLButtonElement> = (e) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(true)
	}
	const handleDragLeave: DragEventHandler<HTMLButtonElement> = (e) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(false)
	}
	const handleDrop: DragEventHandler<HTMLButtonElement> = (e) => {
		e.preventDefault()
		e.stopPropagation()
		setIsDragging(false)
		const file = e.dataTransfer.files?.[0]
		if (!file) return
		const isJson =
			file.type === 'application/json' ||
			file.name.toLowerCase().endsWith('.json')
		if (!isJson) {
			toast.error('Please drop a JSON file.')
			return
		}
		void handleImportFile(file)
	}

	return (
		<div className='flex flex-col gap-2 mt-2'>
			<div className='flex flex-wrap gap-2'>
				<Button
					type='button'
					variant='ghost'
					disabled={disabled || isExporting || isImporting}
					onClick={() => void handleExport()}
				>
					<FiDownload className='h-4 w-4' />
					<span>
						{isExporting ? 'Exporting…' : 'Export Pets (JSON)'}
					</span>
				</Button>
				<Button
					type='button'
					variant='ghost'
					disabled={disabled || isExporting || isImporting}
					onClick={handleImportClick}
				>
					<FiUpload className='h-4 w-4' />
					<span>
						{isImporting ? 'Importing…' : 'Import Pets (JSON)'}
					</span>
				</Button>
			</div>
			<button
				type='button'
				className={[
					'rounded-xl border-2 border-dashed p-3 text-xs transition-colors text-left',
					isDragging
						? 'border-emerald-500 bg-emerald-50'
						: 'border-slate-300 bg-white'
				].join(' ')}
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				aria-label='Drag & drop JSON file here to import'
			>
				<div className='text-slate-600'>
					Drag & drop JSON file here to import (max 1 MB).
				</div>
			</button>
		</div>
	)
}
