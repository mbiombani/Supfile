const BugFunctions = {
  checkIfDefined: (attribute) => {
    let returnState = true

    // not defined
    if (typeof attribute === 'undefined') {
      returnState = null
    }

    // already null, but make sure
    if (attribute === null) {
      returnState = null
    }

    return returnState
  },

  _returnObj: (code, message, type) => {
    return {
      code: code,
      message: message,
      type: type
    }
  },

  result: (code, message) => {
    return BugFunctions._returnObj(code, message, 'Success')
  },

  error: (code, message) => {
    return BugFunctions._returnObj(code, message, 'Error')
  },

  defaultError: (code) => {
    return BugFunctions.error(code, 'Unexpected Error')
  },

  createVerify: (name, email, id) => {
    const uuid = require('uuid/v5')

    const verifyString = JSON.stringify({
      name: name,
      email: email
    })

    return uuid(verifyString, id)
  },

  lambdaResult: (code, message) => {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(BugFunctions.result(code, message)),
      isBase64Encoded: false
    }
  },

  lambdaError: (code, message) => {
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(BugFunctions.error(code, message)),
      isBase64Encoded: false
    }
  },

  Logger: (error, req, res, next) => {
    const BugFixes = require('../index')

    if (BugFunctions.checkIfDefined(error.stack)) {
      BugFixes.error(error.stack)
    } else {
      BugFixes.error(error)
    }

    if (typeof next === 'function') {
      return next(error)
    }

    return true
  }
}

module.exports = BugFunctions
