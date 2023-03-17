/**
 * CryptAPI's NodeJS Library
 * @author CryptAPI <info@cryptapi.io>
 */
class CryptAPI {
    static #baseURL = 'https://api.cryptapi.io'

    constructor(coin, ownAddress, callbackUrl, parameters = {}, caParams = {}) {
        CryptAPI.getSupportedCoins().then(validCoins => {
            if (!validCoins.hasOwnProperty(coin)) {
                throw new Error('The cryptocurrency/token requested is not supported.')
            }
        })

        this.coin = coin
        this.ownAddress = ownAddress
        this.callbackUrl = callbackUrl
        this.parameters = parameters
        this.caParams = caParams
        this.paymentAddress = ''
    }

    /**
     * Gets all the supported cryptocurrencies and tokens from the API
     * @returns {Promise<{}|null>}
     */
    static async getSupportedCoins() {
        const info = await this.getInfo(null, true)

        if (!info) {
            return null
        }

        delete info['fee_tiers']

        const coins = {}

        for (const chain of Object.keys(info)) {
            const data = info[chain]
            const isBaseCoin = data.hasOwnProperty('ticker')

            if (isBaseCoin) {
                coins[chain] = data
            } else {
                const baseTicker = `${chain}_`
                Object.entries(data).forEach(([token, subData]) => {
                    coins[baseTicker + token] = subData
                })
            }
        }

        return coins
    }

    /**
     * Actually makes the request to the API returning the address.
     * It's necessary to run this before running the other non-static functions
     * @returns {Promise<*|null>}
     */
    async getAddress() {
        if (!this.coin || !this.callbackUrl || !this.ownAddress) {
            return null
        }

        let callbackUrl = new URL(this.callbackUrl)
        const parameters = this.parameters
    
        if (Object.entries(parameters).length > 0) {
            Object.entries(parameters).forEach(([k, v]) => callbackUrl.searchParams.append(k, v))
        }
        
        let params = {...this.caParams, ...{
                callback: encodeURI(callbackUrl.toString()),
                address: this.ownAddress,
            }}

        const response = await CryptAPI.#_request(this.coin, 'create', params)

        if (response.status === 'success') {
            const addressIn = response.address_in

            this.paymentAddress = addressIn
            return addressIn
        }

        return null
    }

    /**
     * Checks the logs related to a request.
     * (Can be used to check for callbacks)
     * @returns {Promise<any|null>}
     */
    async checkLogs() {
        if (!this.coin || !this.callbackUrl) {
            return null
        }

        let callbackUrl = new URL(this.callbackUrl)
        const parameters = this.parameters
    
        if (Object.entries(parameters).length > 0) {
            Object.entries(parameters).forEach(([k, v]) => callbackUrl.searchParams.append(k, v))
        }
    
        callbackUrl = encodeURI(callbackUrl.toString())
        
        const response = await CryptAPI.#_request(this.coin, 'logs', {
            callback: callbackUrl
        })

        if (response.status === 'success') {
            return response
        }

        return null
    }

    /**
     * Gets the QRCode for a payment.
     * @param value
     * @param size
     * @returns {Promise<any|null>}
     */
    async getQrcode(value = null, size = 512) {
        const params = {
            address: this.paymentAddress,
        }

        if (value) {
            params['value'] = value
        }

        params['size'] = size

        const response = await CryptAPI.#_request(this.coin, 'qrcode', params)

        if (response.status === 'success') {
            return response
        }

        return null
    }

    /**
     * Get information related to a cryptocurrency/token.
     * If coin=null it calls the /info/ endpoint returning general information
     * @param coin
     * @returns {Promise<any|null>}
     */
    static async getInfo(coin = null) {
        const params = {}

        if (!coin) {
            params['prices'] = 0
        }

        const response = await this.#_request(coin, 'info', params)

        if (!coin || response.status === 'success') {
            return response
        }

        return null
    }

    /**
     * Gets an estimate of the blockchain fees for the coin provided.
     * @param coin
     * @param addresses
     * @param priority
     * @returns {Promise<any|null>}
     */
    static async getEstimate(coin, addresses = 1, priority = 'default') {
        const response = await CryptAPI.#_request(coin, 'estimate', {
            addresses,
            priority,
        })

        if (response.status === 'success') {
            return response
        }

        return null
    }

    /**
     * This method allows you to easily convert prices from FIAT to Crypto or even between cryptocurrencies
     * @param coin
     * @param value
     * @param from
     * @returns {Promise<any|null>}
     */
    static async getConvert(coin, value, from) {
        let params = {
            value,
            from,
        }

        const response = await CryptAPI.#_request(coin, 'convert', params)

        if (response.status === 'success') {
            return response
        }

        return null
    }

    /**
     * Helper function to make a request to API
     * @param coin
     * @param endpoint
     * @param params
     * @returns {Promise<any>}
     */
    static async #_request(coin, endpoint, params = {}) {
        const url = coin ? new URL(`${this.#baseURL}/${coin.replace('_', '/')}/${endpoint}/`) : new URL(`${this.#baseURL}/${endpoint}/`)

        if (params) {
            Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
        }
        

        const fetchParams = {
            method: 'GET',
            headers: {
                referer: this.#baseURL
            },
            credentials: 'include'
        }

        const response = await fetch(url, fetchParams)
        return await response.json()
    }
}

module.exports = CryptAPI
