let iframeEventListener

exports.TransactURL = {
  PRODUCTION: 'https://transact.atomicfi.com',
  SANDBOX: 'https://transact-sandbox.atomicfi.com'
}

exports.transact = ({
  transactConfig = {},
  transactURL = exports.TransactURL.PRODUCTION,
  onInteraction = () => {},
  onDataRequest = () => {},
  onFinish = () => {},
  onClose = () => {}
} = {}) => {
  document.body.style.overflow = 'hidden'
  let iframeElement = document.createElement('iframe')

  iframeElement.src = `${transactURL}/initialize/${btoa(
    JSON.stringify({
      inSdk: true,
      ...transactConfig
    })
  )}`

  iframeElement.id = 'atomic-transact-iframe'
  iframeElement.style.cssText = styles
    .map((style) =>
      Object.entries(style)
        .map(([key, value]) => `${key}: ${value}; `)
        .join('')
    )
    .join('')
    .trim()

  document.body.appendChild(e)

  iframeEventListener = _handleIFrameEvent({
    onInteraction,
    onDataRequest,
    onFinish,
    onClose,
    iframeElement
  })
  window.addEventListener('message', iframeEventListener)
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
  document.body.style.removeProperty('overflow')
  document.body.removeChild(iframeElement)
}
