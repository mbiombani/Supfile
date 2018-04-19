/* global context */
const functions = require('../functions')

class Console {
  constructor () {
    // Console or context
    if (functions.checkIfDefined(console)) {
      this.console = console
    } else if (functions.checkIfDefined(context)) {
      this.console = context
    }
  }

  set icon (icon) {
    this._icon = icon
  }
  get icon () {
    return this._icon
  }

  set payload (payload) {
    this._payload = payload
  }
  get payload () {
    return this._payload
  }

  log () {
    this.icon = '\u2111'
    this.console.log(this.icon, this.payload)

    return this
  }

  error () {
    this.icon = '\u2206'
    this.console.error(this.icon, this.payload)

    return this
  }

  info () {
    this.icon = '\u203c'
    this.console.info(this.icon, this.payload)

    return this
  }
}

module.exports = Console
