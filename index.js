let atomicIframeEventListener

let atomicProduct = {
  DEPOSIT: 'deposit',
  VERIFY: 'verify',
  IDENTIFY: 'identify',
  WITHHOLD: 'withhold'
}

let atomicSDK = {
  /**
   * Launch the Transact experience
   * @param options - Options for launching Transact
   * @param options.config - Atomic config object to customize Transact - https://docs.atomicfi.com/reference/transact-sdk#sdk-parameters
   * @param options.onInteraction - Callback for when a user interacts with Transact
   * @param options.onDataRequest - Callback for when Transact requests additional data
   * @param options.onFinish - Callback for when Transact is finished
   * @param options.onClose - Callback for when Transact is closed
   */
  transact: ({
    config,
    container = undefined,
    environmentOverride = undefined,
    onInteraction = undefined,
    onDataRequest = undefined,
    onFinish = undefined,
    onClose = undefined
  } = {}) => {
    config = config || {}
    onInteraction = onInteraction || function () {}
    onDataRequest = onDataRequest || function () {}
    onFinish = onFinish || function () {}
    onClose = onClose || function () {}

    const origin = environmentOverride || 'https://transact.atomicfi.com'

    if (!container) {
      document.body.style.overflow = 'hidden'
    }

    let iframeElement = document.createElement('iframe')
    iframeElement.setAttribute('allow', 'web-share')
    const productType = config.operation || config.product || 'Atomic'
    iframeElement.setAttribute('title', `Atomic ${productType} Interface`)
    iframeElement.setAttribute('aria-label', `Atomic ${productType} Interface`)

    iframeElement.src = `${origin}/initialize/${btoa(
      JSON.stringify({
        inSdk: true,
        platform: {
          name: 'browser',
          sdkVersion: '3.0.4',
          systemVersion: `${navigator.platform}-${
            navigator.vendor ?? 'unknown'
          }`
        },
        ...config
      })
    )}`

    const baseStyles = [
      { width: '100%' },
      { height: '100%' },
      { 'z-index': '888888888' },
      { 'border-width': '0' },
      { 'overflow-x': 'hidden' },
      { 'overflow-y': 'auto' }
    ]

    const modalStyles = [
      { position: 'fixed' },
      { top: '0' },
      { left: '0' },
      { right: '0' },
      { bottom: '0' }
    ]

    const styles = [...baseStyles, ...(container ? [] : modalStyles)]

    iframeElement.id = 'atomic-transact-iframe'
    iframeElement.style.cssText = styles
      .map((style) =>
        Object.entries(style)
          .map(([key, value]) => `${key}: ${value}; `)
          .join('')
      )
      .join('')
      .trim()

    if (container) {
      const containerElement = document.querySelector(container)

      if (containerElement) {
        containerElement.appendChild(iframeElement)
      } else {
        throw new Error(`No container found for "${container}"`)
      }
    } else {
      document.body.appendChild(iframeElement)
    }

    atomicIframeEventListener = _handleIFrameEvent({
      origin,
      onInteraction,
      onDataRequest,
      onFinish,
      onClose
    })
    window.addEventListener('message', atomicIframeEventListener)

    return {
      close: () => _removeTransact()
    }
  }
}

function _handleIFrameEvent({
  origin,
  onInteraction,
  onFinish,
  onClose,
  onDataRequest
}) {
  return (event) => {
    if (origin !== event.origin) return

    const { payload, event: eventName } = event.data
    switch (eventName) {
      case 'atomic-transact-close':
        onClose(payload)
        _removeTransact()
        break
      case 'atomic-transact-finish':
        onFinish(payload)
        _removeTransact()
        break
      case 'atomic-transact-interaction':
        onInteraction(payload)
        break
      case 'atomic-transact-data-request':
        onDataRequest(payload)
        break
      case 'atomic-transact-open-url':
        window.open(payload.url, '_blank')
        break
      default:
        console.log('Unhandled postMessage Event', eventName)
    }
  }
}

function _removeTransact() {
  const iframeElement = document.querySelector('#atomic-transact-iframe')

  window.removeEventListener('message', atomicIframeEventListener)
  if (iframeElement?.parentNode !== document.body) return
  document.body.style.removeProperty('overflow')
  document.body.removeChild(iframeElement)
}

if (typeof exports !== 'undefined') {
  exports.Product = atomicProduct
  exports.Atomic = atomicSDK
} else {
  window.Product = atomicProduct
  window.Atomic = atomicSDK
}
