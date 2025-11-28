type PaginationProps = {
	currentPage: number
	totalPages: number
	pageSize: number
	totalElements: number
	onPageChange: (page: number) => void
	onPageSizeChange?: (size: number) => void
	pageSizeOptions?: number[]
}

export function Pagination({
	currentPage,
	totalPages,
	pageSize,
	totalElements,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions = [10, 20, 50, 100]
}: PaginationProps) {
	const startElement = currentPage * pageSize + 1
	const endElement = Math.min((currentPage + 1) * pageSize, totalElements)

	// Always show pagination if pageSizeChange is provided (to allow changing page size)
	// or if there are multiple pages
	if (totalPages <= 1 && !onPageSizeChange) {
		return null
	}

	return (
		<div className='flex flex-col gap-3'>
			<div className='flex items-center gap-2 text-sm text-slate-600'>
				<span>
					Showing {startElement} to {endElement} of {totalElements}{' '}
					results
				</span>
				{onPageSizeChange && (
					<>
						<span className='text-slate-400'>|</span>
						<select
							value={pageSize}
							onChange={(e) =>
								onPageSizeChange(Number(e.target.value))
							}
							className='rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500'
						>
							{pageSizeOptions.map((size) => (
								<option key={size} value={size}>
									{size} per page
								</option>
							))}
						</select>
					</>
				)}
			</div>

			{totalPages > 1 && (
				<div className='flex items-center gap-1'>
					<button
						type='button'
						onClick={() => onPageChange(0)}
						disabled={currentPage === 0}
						className='rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
					>
						First
					</button>
					<button
						type='button'
						onClick={() => onPageChange(currentPage - 1)}
						disabled={currentPage === 0}
						className='rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
					>
						Previous
					</button>

					<span className='px-3 py-1 text-xs text-slate-600'>
						Page {currentPage + 1} of {totalPages}
					</span>

					<button
						type='button'
						onClick={() => onPageChange(currentPage + 1)}
						disabled={currentPage >= totalPages - 1}
						className='rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
					>
						Next
					</button>
					<button
						type='button'
						onClick={() => onPageChange(totalPages - 1)}
						disabled={currentPage >= totalPages - 1}
						className='rounded-lg border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'
					>
						Last
					</button>
				</div>
			)}
		</div>
	)
}
