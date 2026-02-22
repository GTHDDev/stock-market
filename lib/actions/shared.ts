import { Db } from 'mongodb'

/**
 * Resolves a userId (string) from an email by looking up the "user" collection.
 * Supports both custom 'id' field and MongoDB '_id' field.
 */
export async function resolveUserId(
	db: Db,
	email: string
): Promise<string | null> {
	if (!email) return null

	const user = await db
		.collection('user')
		.findOne<{ _id?: unknown; id?: string; email?: string }>({ email })

	if (!user) return null

	const userId = (user.id as string) || String(user._id || '')
	return userId || null
}
