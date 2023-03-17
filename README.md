[<img src="https://i.imgur.com/IfMAa7E.png" width="300"/>](image.png)

# CryptAPI's NodeJS Library
NodeJS's implementation of CryptAPI's payment gateway

## Install

```console
npm install @cryptapi/api
```

## Usage

### Importing in your project file

```js
const CryptAPI = require('@cryptapi/api')
```

### Generating a new Address

```js
const ca = new CryptAPI(coin, myAddress, callbackUrl, params, cryptapiParams)

const address = await ca.getAddress()
```

Where:

* `coin` is the coin you wish to use, from CryptAPI's supported currencies (e.g 'btc', 'eth', 'erc20_usdt', ...).
* `myAddress` is your own crypto address, where your funds will be sent to.
* `callbackUrl` is the URL that will be called upon payment.
* `params` is any parameter you wish to send to identify the payment, such as `{orderId: 1234}`.
* `cryptapiParams` parameters that will be passed to CryptAPI _(check which extra parameters are available here: https://docs.cryptapi.io/#operation/create).
* `address` is the newly generated address, that you will show your users in order to receive payments.

### Getting notified when the user pays

> Once your customer makes a payment, CryptAPI will send a callback to your `callbackUrl`. This callback information is by default in ``GET`` but you can se it to ``POST`` by setting ``post: 1`` in ``cryptapiParams``. The parameters sent by CryptAPI in this callback can be consulted here: https://docs.cryptapi.io/#operation/confirmedcallbackget

### Checking the logs of a request

```js
const ca = new CryptAPI(coin, myAddress, callbackUrl, params, cryptapiParams)

const data = await ca.checkLogs()
```
> Same parameters as before, the ```data``` returned can b e checked here: https://docs.cryptapi.io/#operation/logs

### Generating a QR code

```js
const ca = new CryptAPI(coin, myAddress, callbackUrl, params, cryptapiParams)
    
const address = await ca.getAddress()

// ...

const qrCode = await ca.getQrcode(value, size)
```
For object creation, same parameters as before. You must first call ``getAddress` as this method requires the payment address to have been created.

For QR Code generation:

* ``value`` is the value requested to the user in the coin to which the request was done. **Optional**, can be empty if you don't wish to add the value to the QR Code.
* ``size`` Size of the QR Code image in pixels. Optional, leave empty to use the default size of 512.

> Response is an object with `qr_code` (base64 encoded image data) and `payment_uri` (the value encoded in the QR), see https://docs.cryptapi.io/#operation/qrcode for more information.

### Estimating transaction fees

```js
const fees = await CryptAPI.getEstimate(coin, addresses, priority)
```
Where: 
* ``coin`` is the coin you wish to check, from CryptAPI's supported currencies (e.g 'btc', 'eth', 'erc20_usdt', ...)
* ``addresses`` The number of addresses to forward the funds to. Optional, defaults to 1.
* ``priority`` Confirmation priority, (check [this](https://support.cryptapi.io/article/how-the-priority-parameter-works) article to learn more about it). Optional, defaults to ``default``.

> Response is an object with ``estimated_cost`` and ``estimated_cost_usd``, see https://docs.cryptapi.io/#operation/estimate for more information.

### Converting between coins and fiat

```js
const conversion = await CryptAPI.getConvert(coin, value, from)
```
Where:
* ``coin`` the target currency to convert to, from CryptAPI's supported currencies (e.g 'btc', 'eth', 'erc20_usdt', ...)
* ``value`` value to convert in `from`.
* ``from`` currency to convert from, FIAT or crypto.

> Response is an object with ``value_coin`` and ``exchange_rate``, see https://docs.cryptapi.io/#operation/convert for more information.

### Getting supported coins
```js
const supportedCoins = await CryptAPI.getSupportedCoins()
```

> Response is an array with all support coins.

## Help

Need help?  
Contact us @ https://cryptapi.io/contacts/


### Changelog

#### 1.0.0
* Initial Release

#### 1.0.1
* Minor fixes

#### 1.0.2
* Minor fixes
