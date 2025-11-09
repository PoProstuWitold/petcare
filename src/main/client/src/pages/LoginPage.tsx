import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'

type LoginFormValues = {
	username: string
	password: string
}

export function LoginPage() {
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [serverError, setServerError] = useState<string | null>(null)
	const navigate = useNavigate()
	const { login } = useAuth()

	const {
		register,
		handleSubmit,
		formState: { errors }
	} = useForm<LoginFormValues>({
		defaultValues: {
			username: '',
			password: ''
		}
	})

	const onSubmit = async (values: LoginFormValues) => {
		setIsSubmitting(true)
		setServerError(null)

		try {
			await login({
				username: values.username,
				password: values.password
			})

			// TODO: możesz tu dodać logikę zależną od roli
			// np. jeśli ADMIN => /admin, jeśli VET => /vet itd.
			toast.success('Login successful')
			navigate('/', { replace: true })
		} catch (error) {
			toast.error('Login failed')
			console.error('Login failed', error)
			setServerError('Invalid username or password')
		} finally {
			setIsSubmitting(false)
		}
	}

	return (
		<div className='page-container flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8'>
			<div className='w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8'>
				<div className='mb-6 text-center'>
					<h1 className='text-xl font-semibold text-slate-900'>
						Sign in
					</h1>
					<p className='mt-1 text-sm text-slate-600'>
						Access your PetCare account to manage pets and
						appointments.
					</p>
				</div>

				<form
					className='space-y-4'
					onSubmit={handleSubmit(onSubmit)}
					noValidate
				>
					{serverError && (
						<p className='rounded-md bg-red-50 px-3 py-2 text-xs text-red-700'>
							{serverError}
						</p>
					)}

					<div className='space-y-1.5'>
						<label
							htmlFor='username'
							className='block text-sm font-medium text-slate-800'
						>
							Username
						</label>
						<input
							id='username'
							type='text'
							className='block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
							placeholder='Your username'
							{...register('username', {
								required: 'username is required'
							})}
						/>
						{errors.username && (
							<p className='text-xs text-red-600'>
								{errors.username.message}
							</p>
						)}
					</div>

					<div className='space-y-1.5'>
						<label
							htmlFor='password'
							className='block text-sm font-medium text-slate-800'
						>
							Password
						</label>
						<input
							id='password'
							type='password'
							autoComplete='current-password'
							className='block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200'
							placeholder='Your password'
							{...register('password', {
								required: 'Password is required',
								minLength: {
									value: 6,
									message:
										'Password must be at least 6 characters'
								}
							})}
						/>
						{errors.password && (
							<p className='text-xs text-red-600'>
								{errors.password.message}
							</p>
						)}
					</div>

					<button
						type='submit'
						disabled={isSubmitting}
						className='mt-2 flex w-full items-center justify-center rounded-full bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-70'
					>
						{isSubmitting ? 'Signing in...' : 'Sign in'}
					</button>
				</form>

				<p className='mt-4 text-center text-xs text-slate-600'>
					Do not have an account yet?{' '}
					<Link
						to='/register'
						className='font-semibold text-sky-700 hover:text-sky-800'
					>
						Create one
					</Link>
					.
				</p>
			</div>
		</div>
	)
}
