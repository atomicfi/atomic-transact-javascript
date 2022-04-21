let iframeEventListener

/**
 * Atomic Product configuration
 * @type {{IDENTIFY: string, WITHHOLD: string, VERIFY: string, DEPOSIT: string}}
 */
exports.Product = {
  DEPOSIT: 'deposit',
  VERIFY: 'verify',
  IDENTIFY: 'identify',
  WITHHOLD: 'withhold'
}

/**
 * Atomic environment for Transact
 * @type {{SANDBOX: string, PRODUCTION: string}}
 */
exports.Environment = {
  PRODUCTION: 'https://transact.atomicfi.com',
  SANDBOX: 'https://transact-sandbox.atomicfi.com'
}

exports.Atomic = {
  /**
   * Launch the Transact experience
   * @param options - Options for launching Transact
   * @param options.config - Atomic config object to customize Transact - https://docs.atomicfi.com/reference/transact-sdk#sdk-parameters
   * @param options.environment - Atomic environment for Transact. Can be either Production or Sandbox.
   * @param options.onInteraction - Callback for when a user interacts with Transact
   * @param options.onDataRequest - Callback for when Transact requests additional data
   * @param options.onFinish - Callback for when Transact is finished
   * @param options.onClose - Callback for when Transact is closed
   */
  transact: ({
    container = undefined,
    config = {},
    environment = exports.Environment.PRODUCTION,
    environmentOverride,
    onInteraction = () => {},
    onDataRequest = () => {},
    onFinish = () => {},
    onClose = () => {}
  } = {}) => {
    if (!container) {
      document.body.style.overflow = 'hidden'
    }

    let iframeElement = document.createElement('iframe')

    iframeElement.src = `${
      environmentOverride || environment
    }/initialize/${btoa(
      JSON.stringify({
        inSdk: true,
        platform: {
          name: 'browser',
          version: '1.0.5'
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
      { bottom: '0' },
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
  }
  else {
    throw new Error(`No container found for "${container}"`) 
  }
}

  else {
      document.body.appendChild(iframeElement)
  }

    iframeEventListener = _handleIFrameEvent({
      onInteraction,
      onDataRequest,
      onFinish,
      onClose,
      iframeElement
    })
    window.addEventListener('message', iframeEventListener)

    return {
      close: () => _removeTransact({ iframeElement })
    }
  }
}

function _handleIFrameEvent({
  onInteraction,
  onFinish,
  onClose,
  onDataRequest,
  iframeElement
}) {
  return (event) => {
    const { payload, event: eventName } = event.data
    switch (eventName) {
      case 'atomic-transact-close':
        onClose(payload)
        _removeTransact({ iframeElement })
        break
      case 'atomic-transact-finish':
        onFinish(payload)
        _removeTransact({ iframeElement })
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

function _removeTransact({ iframeElement }) {
  window.removeEventListener('message', iframeEventListener)
  if (iframeElement.parentNode !== document.body) return
  document.body.style.removeProperty('overflow')
  document.body.removeChild(iframeElement)
}
