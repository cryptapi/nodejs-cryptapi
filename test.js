const CryptAPI = require('./index')
const test = require('node:test')

const callbackUrl = 'https://webhook.site/fc6e4031-66e7-45ef-9b9c-b6101958478dsa1'

test('Test requesting service info', async (t) => {
    const info = await CryptAPI.getInfo()
    console.log(info)
    if (info === null) throw new Error('fail')
})

test('Test requesting coin info', async (t) => {
    const info = await CryptAPI.getInfo('btc')
    console.log(info)
    if (info === null) throw new Error('fail')
})

test('Test requesting supported cryptocurrencies', async (t) => {
    const _r = await CryptAPI.getSupportedCoins()

    if (_r === null) throw new Error('fail')
})

test('Test generating address', async (t) => {
    const ca = new CryptAPI('polygon_usdt', '0xA6B78B56ee062185E405a1DDDD18cE8fcBC4395d', callbackUrl, {
        order_id: 12345,
    }, {
        multi_chain: 1,
        convert: 1
    })

    const address = await ca.getAddress()
    console.log(address)
    if (address === null) throw new Error('fail')
})

test('Test getting logs', async (t) => {
    const ca = new CryptAPI('polygon_matic', '0xA6B78B56ee062185E405a1DDDD18cE8fcBC4395d', callbackUrl, {
        order_id: 12345,
    }, {
        convert: 1,
        multi_chain: 1,
    })

    const logs = await ca.checkLogs()
    console.log(logs)
    if (logs === null) throw new Error('fail')
})


test('Test getting QrCode', async (t) => {
    const ca = new CryptAPI('polygon_matic', '0xA6B78B56ee062185E405a1DDDD18cE8fcBC4395d', callbackUrl, {}, {
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
    const estimate = await CryptAPI.getEstimate('polygon_matic',1, 'default')
    console.log(estimate)
    if (estimate === null) throw new Error('fail')
})

test('Test getting getConvert', async (t) => {
    const convert = await CryptAPI.getConvert('polygon_matic', 300,'USD')
    console.log(convert)
    if (convert === null) throw new Error('fail')
})
