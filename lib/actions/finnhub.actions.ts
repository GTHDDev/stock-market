'use server'

import { getDateRange, validateArticle, formatArticle } from '@/lib/utils'
import { POPULAR_STOCK_SYMBOLS } from '@/lib/constants'
import { cache } from 'react'

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1'
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || ''

async function fetchJSON<T>(
	url: string,
	revalidateSeconds?: number
): Promise<T> {
	const parsedUrl = new URL(url)

	if (
		parsedUrl.protocol !== 'https:' ||
		parsedUrl.hostname !== 'finnhub.io' ||
		!parsedUrl.pathname.startsWith('/api/v1')
	) {
		throw new Error(`Unauthorized or invalid Finnhub URL: ${url}`)
	}

	const options: RequestInit & { next?: { revalidate?: number } } =
		revalidateSeconds
			? { cache: 'force-cache', next: { revalidate: revalidateSeconds } }
			: { cache: 'no-store' }

	const res = await fetch(url, options)
	if (!res.ok) {
		const text = await res.text().catch(() => '')
		throw new Error(`Fetch failed ${res.status}: ${text}`)
	}
	return (await res.json()) as T
}

export { fetchJSON }

export async function getNews(
	symbols?: string[]
): Promise<MarketNewsArticle[]> {
	try {
		const range = getDateRange(5)
		const token = FINNHUB_API_KEY
		if (!token) {
			throw new Error('FINNHUB API key is not configured')
		}
		const cleanSymbols = Array.from(
			new Set((symbols || []).map((s) => s?.trim().toUpperCase()))
		)
			.filter((s): s is string => Boolean(s))
			.slice(0, 12)

		const maxArticles = 6

		// If we have symbols, try to fetch company news per symbol and round-robin select
		if (cleanSymbols.length > 0) {
			const perSymbolArticles = new Map<string, RawNewsArticle[]>()

			await Promise.all(
				cleanSymbols.map(async (sym) => {
					try {
						const url = new URL(`${FINNHUB_BASE_URL}/company-news`)
						url.searchParams.set('symbol', sym)
						url.searchParams.set('from', range.from)
						url.searchParams.set('to', range.to)
						url.searchParams.set('token', token)

						const articles = await fetchJSON<RawNewsArticle[]>(
							url.toString(),
							300
						)
						perSymbolArticles.set(sym, (articles || []).filter(validateArticle))
					} catch (e) {
						const safeSym = sym.replace(/[\r\n]/g, '')
						console.error('Error fetching company news for', safeSym, e)
						perSymbolArticles.set(sym, [])
					}
				})
			)

			const collected: MarketNewsArticle[] = []
			// Round-robin up to 6 picks
			for (let round = 0; round < maxArticles; round++) {
				for (const sym of cleanSymbols) {
					const list = perSymbolArticles.get(sym) || []
					if (list.length === 0) continue
					const article = list.shift()
					if (!article || !validateArticle(article)) {
						perSymbolArticles.set(sym, list)
						continue
					}
					collected.push(formatArticle(article, true, sym, round))
					perSymbolArticles.set(sym, list)
					if (collected.length >= maxArticles) break
				}
				if (collected.length >= maxArticles) break
			}

			if (collected.length > 0) {
				// Sort by datetime desc
				collected.sort((a, b) => (b.datetime || 0) - (a.datetime || 0))
				return collected.slice(0, maxArticles)
			}
			// If none collected, fall through to general news
		}

		// General market news fallback or when no symbols provided
		const generalUrl = new URL(`${FINNHUB_BASE_URL}/news`)
		generalUrl.searchParams.set('category', 'general')
		generalUrl.searchParams.set('token', token)
		const general = await fetchJSON<RawNewsArticle[]>(
			generalUrl.toString(),
			300
		)

		const seen = new Set<string>()
		const unique: RawNewsArticle[] = []
		for (const art of general || []) {
			if (!validateArticle(art)) continue
			const key = `${art.id}-${art.url}-${art.headline}`
			if (seen.has(key)) continue
			seen.add(key)
			unique.push(art)
			if (unique.length >= 20) break // cap early before final slicing
		}

		const formatted = unique
			.slice(0, maxArticles)
			.map((a, idx) => formatArticle(a, false, undefined, idx))
		return formatted
	} catch (err) {
		console.error('getNews error:', err)
		throw new Error('Failed to fetch news')
	}
}

export const searchStocks = cache(
	async (query?: string): Promise<StockWithWatchlistStatus[]> => {
		try {
			const token = FINNHUB_API_KEY
			if (!token) {
				// If no token, log and return empty to avoid throwing per requirements
				console.error(
					'Error in stock search:',
					new Error('FINNHUB API key is not configured')
				)
				return []
			}

			const trimmed = typeof query === 'string' ? query.trim() : ''

			let results: FinnhubSearchResult[] = []

			if (!trimmed) {
				// Fetch top 10 popular symbols' profiles
				const top = POPULAR_STOCK_SYMBOLS.slice(0, 10)
				const profiles = await Promise.all(
					top.map(async (sym) => {
						try {
							const url = new URL(`${FINNHUB_BASE_URL}/stock/profile2`)
							url.searchParams.set('symbol', sym)
							url.searchParams.set('token', token)
							// Revalidate every hour
							const profile = await fetchJSON<FinnhubStockProfile>(
								url.toString(),
								3600
							)
							return { sym, profile }
						} catch (e) {
							console.error('Error fetching profile2 for', sym, e)
							return { sym, profile: null }
						}
					})
				)

				results = profiles
					.map(({ sym, profile }) => {
						const symbol = sym.toUpperCase()
						const name: string | undefined =
							profile?.name || profile?.ticker || undefined
						const exchange: string | undefined = profile?.exchange || undefined
						if (!name) return undefined
						const r: FinnhubSearchResultInternal = {
							symbol,
							description: name,
							displaySymbol: symbol,
							type: 'Common Stock'
						}
						// We don't include exchange in FinnhubSearchResult type, so carry via mapping later using profile
						// To keep pipeline simple, attach exchange via closure map stage
						// We'll reconstruct exchange when mapping to final type
						r.__exchange = exchange // internal only
						return r
					})
					.filter((x): x is FinnhubSearchResultInternal => Boolean(x))
			} else {
				const url = new URL(`${FINNHUB_BASE_URL}/search`)
				url.searchParams.set('q', trimmed)
				url.searchParams.set('token', token)
				const data = await fetchJSON<FinnhubSearchResponse>(
					url.toString(),
					1800
				)
				results = Array.isArray(data?.result) ? data.result : []
			}

			const mapped: StockWithWatchlistStatus[] = results
				.map((r) => {
					const upper = (r.symbol || '').toUpperCase()
					const name = r.description || upper
					const exchange = (r as FinnhubSearchResultInternal).__exchange || 'US'
					const type = r.type || 'Stock'
					const item: StockWithWatchlistStatus = {
						symbol: upper,
						name,
						exchange,
						type,
						isInWatchlist: false
					}
					return item
				})
				.slice(0, 15)

			return mapped
		} catch (err) {
			console.error('Error in stock search:', err)
			return []
		}
	}
)
