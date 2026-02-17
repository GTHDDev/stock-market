import Header from '@/components/Header'
import React from 'react'

/**
 * App root layout that renders the site header and wraps page content.
 *
 * @param children - The page content to be rendered inside the layout's container.
 * @returns The layout JSX element containing the Header and the wrapped `children`.
 */
export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<main className='min-h-screen text-gray-400'>
			<Header />
			<div className='container py-10'>{children}</div>
		</main>
	)
}