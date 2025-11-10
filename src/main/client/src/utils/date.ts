export function formatDatePl(date?: string | null): string {
	if (!date || !date.includes('-')) return '—'
	const [y, m, d] = date.split('-')
	const day = d?.padStart(2, '0') || ''
	const month = m?.padStart(2, '0') || ''
	const year = y || ''
	if (!day || !month || !year) return '—'
	return `${day}.${month}.${year}`
}

export function formatDateTimePl(
	date?: string | null,
	time?: string | null
): string {
	const base = formatDatePl(date)
	const hhmm = time ? String(time).slice(0, 5) : ''
	return hhmm ? `${base} · ${hhmm}` : base
}
