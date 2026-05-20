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
   * @param options.onOpenUrl - Callback for when Transact opens an external URL
   */
  transact: ({
    config,
    container = undefined,
    environmentOverride = undefined,
    onInteraction = undefined,
    onDataRequest = undefined,
    onFinish = undefined,
    onClose = undefined,
    onOpenUrl = undefined
  } = {}) => {
    config = config || {}
    onInteraction = onInteraction || function () {}
    onDataRequest = onDataRequest || function () {}
    onFinish = onFinish || function () {}
    onClose = onClose || function () {}
    onOpenUrl = onOpenUrl || undefined

    const origin = environmentOverride || 'https://transact.atomicfi.com'
    const { publicToken, ...transactConfig } = config
    const handshakeId = _generateHandshakeId()

    if (!container) {
      document.body.style.overflow = 'hidden'
    }

    let iframeElement = document.createElement('iframe')
    iframeElement.setAttribute('allow', 'web-share; clipboard-write;')
    const productType = config.operation || config.product || 'Atomic'
    iframeElement.setAttribute('title', `${productType} Interface`)
    iframeElement.setAttribute('aria-label', `${productType} Interface`)

    iframeElement.src = `${origin}/initialize/${btoa(
      JSON.stringify({
        inSdk: true,
        platform: {
          name: 'browser',
          sdkVersion: '__VERSION__',
          systemVersion: `${navigator.platform}-${
            navigator.vendor ?? 'unknown'
          }`
        },
        ...transactConfig,
        ...(publicToken ? { deferPublicToken: true } : {})
      })
    )}#hId=${handshakeId}`

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

    let mountTarget
    if (container) {
      mountTarget = document.querySelector(container)
      if (!mountTarget) {
        throw new Error(`No container found for "${container}"`)
      }
    } else {
      mountTarget = document.body
    }

    atomicIframeEventListener = _handleIFrameEvent({
      origin,
      iframeElement,
      publicToken,
      handshakeId,
      onInteraction,
      onDataRequest,
      onFinish,
      onClose,
      onOpenUrl
    })
    window.addEventListener('message', atomicIframeEventListener)
    mountTarget.appendChild(iframeElement)

    return {
      close: () => _removeTransact()
    }
  }
}

function _handleIFrameEvent({
  origin,
  iframeElement,
  publicToken,
  handshakeId,
  onInteraction,
  onFinish,
  onClose,
  onDataRequest,
  onOpenUrl
}) {
  return (event) => {
    if (origin !== event.origin) return
    if (!event.source || event.source !== iframeElement.contentWindow) return

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
        if (onOpenUrl && typeof onOpenUrl === 'function') {
          onOpenUrl({ url: payload.url })
        } else {
          const url = new URL(payload.url)

          if ('https:' === url.protocol) window.open(payload.url, '_blank')
        }
        break
      case 'atomic-transact-request-public-token':
        iframeElement.contentWindow?.postMessage(
          {
            event: 'sdk-atomic-transact-public-token',
            payload: { publicToken, handshakeId }
          },
          origin
        )
        publicToken = undefined
        break
      default:
        console.log('Unhandled postMessage Event', eventName)
    }
  }
}

function _generateHandshakeId() {
  const buf = new Uint8Array(8)
  crypto.getRandomValues(buf)
  return Array.from(buf)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function _removeTransact() {
  const iframeElement = document.querySelector('#atomic-transact-iframe')

  window.removeEventListener('message', atomicIframeEventListener)
  atomicIframeEventListener = undefined
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
