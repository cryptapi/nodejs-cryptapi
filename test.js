const CryptAPI = require('./index')
const test = require('node:test')

const callbackUrl = 'https://webhook.site/58abc808-8bf6-4dad-8097-7bc364915f46'

test('Test requesting service info', async (t) => {
    const info = await CryptAPI.getInfo()
    console.log(info)
    if (info === null) throw new Error('fail')
})

test('Test requesting coin info', async (t) => {
    const info = await CryptAPI.getInfo('sol_sol')
    console.log(info)
    if (info === null) throw new Error('fail')
})

test('Test requesting supported cryptocurrencies', async (t) => {
    const _r = await CryptAPI.getSupportedCoins()

    if (_r === null) throw new Error('fail')
})

test('Test generating address', async (t) => {
    const ca = new CryptAPI('sol_sol', 'DSo1MN64SWBCNR7dQKP2bkQnXMhXeFYFSqgJAMQL9kw5', callbackUrl, {
        order_id: 123457,
    }, {
        multi_token: 1,
        convert: 1
    })

    const address = await ca.getAddress()
    if (address === null) throw new Error('fail')
})

test('Test getting logs', async (t) => {
    const ca = new CryptAPI('polygon_pol', '0xA6B78B56ee062185E405a1DDDD18cE8fcBC4395d', callbackUrl, {
        order_id: 12345,
    }, {
        convert: 1,
        multi_token: 1,
    })

    const logs = await ca.checkLogs()
    if (logs === null) throw new Error('fail')
})


test('Test getting QrCode', async (t) => {
    const ca = new CryptAPI('polygon_pol', '0xA6B78B56ee062185E405a1DDDD18cE8fcBC4395d', callbackUrl, {}, {
        convert: 1,
        multi_chain: 1,
    })

    /**
     * First is important to run getAddress otherwise the remaining requests won't function
     */
    await ca.getAddress()

    const qrCode = await ca.getQrcode(1, 300)
    console.log(qrCode)
    if (qrCode === null) throw new Error('fail')
})

test('Test getting getEstimate', async (t) => {
    const estimate = await CryptAPI.getEstimate('polygon_pol',1, 'default')
    console.log(estimate)
    if (estimate === null) throw new Error('fail')
})

test('Test getting getConvert', async (t) => {
    const convert = await CryptAPI.getConvert('polygon_pol', 300,'USD')
    console.log(convert)
    if (convert === null) throw new Error('fail')
})
