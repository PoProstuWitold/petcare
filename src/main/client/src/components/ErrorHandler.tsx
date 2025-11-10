import { Alert } from './ui/Alert'

export function ErrorHandler({ message }: { message?: string }) {
	return <Alert variant='error'>{message ?? 'An error occurred'}</Alert>
}
