const http = require('https')
const jwt = require('jsonwebtoken')

const Console = require('./console')

class Network {
  constructor () {
    this.path = '/v1/bug'
    this.address = 'https://api.bugfix.es'
  }

  set secret (secret) {
    this._secret = secret
  }
  get secret () {
    return this._secret
  }

  set key (key) {
    this._key = key
  }
  get key () {
    return this._key
  }

  set id (id) {
    this._id = id
  }
  get id () {
    return this._id
  }

  set payload (payload) {
    this._payload = payload
    this.message = payload
  }
  get payload () {
    return this._payload
  }

  set message (message) {
    this._message = jwt.sign(message, this.secret)
  }
  get message () {
    return this._message
  }

  set loglevel (loglevel) {
    this._loglevel = loglevel
  }
  get loglevel () {
    return this._loglevel
  }

  sendMessage () {
    const self = this

    const promise = new Promise((resolve, reject) => {
      let payLoad = {
        message: self.message,
        logLevel: self.loglevel
      }
      payLoad = JSON.stringify(payLoad)

      const options = {
        hostname: self.address,
        path: self.path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payLoad),
          'X-API-KEY': self.key,
          'X-API-ID': self.id
        }
      }

      const request = http.request(options, (res) => {
        res.on('error', (error) => {
          reject(Error(error))
        })
      })
      request.end(payLoad, 'utf8', resolve(true))
    })

    promise.then((result) => {
      const cons = new Console()
      cons.payload = 'Worked'
      cons.log()
    }, (error) => {
      const cons = new Console()
      cons.payload = error
      cons.error()
    })
  }
}

module.exports = Network
