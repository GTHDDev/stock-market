'use client'
import { useEffect, useRef } from 'react'

const useTradingViewWidget = (
	scriptUrl: string,
	config: Record<string, unknown>,
	height = 600
) => {
	const containerRef = useRef<HTMLDivElement | null>(null)

	useEffect(() => {
		// 1. Capturamos el nodo actual en una variable local
		const currentContainer = containerRef.current

		if (!currentContainer) return
		if (currentContainer.dataset.loaded) return

		const widget = document.createElement('div')
		widget.className = 'tradingview-widget-container__widget'
		widget.style.width = '100%'
		widget.style.height = `${height}px`
		currentContainer.replaceChildren(widget)

		const script = document.createElement('script')
		script.src = scriptUrl
		script.async = true
		script.textContent = JSON.stringify(config)

		currentContainer.appendChild(script)
		currentContainer.dataset.loaded = 'true'

		// 2. Usamos la variable local en el cleanup
		return () => {
			if (currentContainer) {
				currentContainer.innerHTML = ''
				delete currentContainer.dataset.loaded
			}
		}
	}, [scriptUrl, config, height])

	return containerRef
}

export default useTradingViewWidget
