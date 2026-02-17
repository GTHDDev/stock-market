'use client'

import * as React from 'react'
import { Avatar as AvatarPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

/**
 * Avatar root component that wraps the Radix Avatar root and applies base styling and size variants.
 *
 * @param size - Controls the avatar's visual size; one of `'default'`, `'sm'`, or `'lg'`. Defaults to `'default'`.
 * @returns A React element rendering a configured AvatarPrimitive.Root with data-slot="avatar", a data-size attribute, and merged utility classes.
 */
function Avatar({
	className,
	size = 'default',
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> & {
	size?: 'default' | 'sm' | 'lg'
}) {
	return (
		<AvatarPrimitive.Root
			data-slot='avatar'
			data-size={size}
			className={cn(
				'group/avatar relative flex size-8 shrink-0 overflow-hidden rounded-full select-none data-[size=lg]:size-10 data-[size=sm]:size-6',
				className
			)}
			{...props}
		/>
	)
}

/**
 * Image element for the Avatar component.
 *
 * @returns A Radix Avatar Image element with the `data-slot="avatar-image"` attribute and square sizing classes applied.
 */
function AvatarImage({
	className,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
	return (
		<AvatarPrimitive.Image
			data-slot='avatar-image'
			className={cn('aspect-square size-full', className)}
			{...props}
		/>
	)
}

/**
 * Renders fallback content for an Avatar when the image is unavailable.
 *
 * @param className - Additional CSS classes to apply to the fallback container
 * @returns The configured AvatarPrimitive.Fallback element
 */
function AvatarFallback({
	className,
	...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
	return (
		<AvatarPrimitive.Fallback
			data-slot='avatar-fallback'
			className={cn(
				'bg-muted text-muted-foreground flex size-full items-center justify-center rounded-full text-sm group-data-[size=sm]/avatar:text-xs',
				className
			)}
			{...props}
		/>
	)
}

/**
 * Renders a corner badge for an avatar, positioned bottom-right and sized responsively.
 *
 * The element is a `span` with `data-slot="avatar-badge"` and its className merged with any provided `className`.
 *
 * @returns A `span` element used as a status/indicator badge for an avatar.
 */
function AvatarBadge({ className, ...props }: React.ComponentProps<'span'>) {
	return (
		<span
			data-slot='avatar-badge'
			className={cn(
				'bg-primary text-primary-foreground ring-background absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full ring-2 select-none',
				'group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden',
				'group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2',
				'group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2',
				className
			)}
			{...props}
		/>
	)
}

/**
 * Container that groups multiple avatars and visually overlaps them.
 *
 * @param className - Additional CSS classes to merge with the group's default styles
 * @returns A div element that lays out child avatars in a horizontal row with negative spacing for overlap and ring styling applied to contained avatar slots
 */
function AvatarGroup({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='avatar-group'
			className={cn(
				'*:data-[slot=avatar]:ring-background group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2',
				className
			)}
			{...props}
		/>
	)
}

/**
 * Renders a size-aware count badge positioned for an avatar group.
 *
 * @param className - Additional CSS classes to merge with the component's default styling
 * @returns A `div` element used as the avatar group count badge
 */
function AvatarGroupCount({
	className,
	...props
}: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot='avatar-group-count'
			className={cn(
				'bg-muted text-muted-foreground ring-background relative flex size-8 shrink-0 items-center justify-center rounded-full text-sm ring-2 group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3',
				className
			)}
			{...props}
		/>
	)
}

export {
	Avatar,
	AvatarImage,
	AvatarFallback,
	AvatarBadge,
	AvatarGroup,
	AvatarGroupCount
}