const { Atomic, Product } = require('../index')
const { pick } = require('lodash')

describe('JavaScript SDK', () => {
  const mocks = {}
  let iframeElement

  beforeEach(() => {
    navigator = {
      platform: 'ios',
      vendor: 'mac'
    }

    mocks.documentAppendChild = jest.fn()
    mocks.elementSetAttribute = jest.fn()
    iframeElement = {
      setAttribute: mocks.elementSetAttribute,
      style: {}
    }
    mocks.documentCreateElement = jest.fn().mockReturnValue(iframeElement)
    mocks.windowAddEventListener = jest.fn()

    document = {
      body: { style: {}, appendChild: mocks.documentAppendChild },
      createElement: mocks.documentCreateElement
    }
    window = {
      addEventListener: mocks.windowAddEventListener
    }
  })

  it('should initialize the sdk', () => {
    Atomic.transact({
      config: {
        publicToken: '6e93549e-3571-4f57-b0f7-77b7cb0b5e48',
        tasks: [{ product: Product.DEPOSIT }]
      }
    })

    expect(mocks.documentAppendChild).toHaveBeenCalled()
    expect(iframeElement.setAttribute.mock.calls).toMatchSnapshot()
    expect(pick(iframeElement, ['style', 'src', 'id'])).toMatchSnapshot()
  })

  it('should initialize inside of a container', () => {
    // TODO
  })

  it('should responsd to Transact events', () => {
    // TODO
  })

  it('should be able to manually close the session', () => {
    // TODO
  })
})
