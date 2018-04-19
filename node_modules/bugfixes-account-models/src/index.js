'use strict'

const AWS = require('aws-sdk')
const uuid = require('uuid/v5')
const BugFixes = require('bugfixes')
const requestPromise = require('request-promise')

const bugFunctions = BugFixes.functions

const dataLayer = require('./data')

class Account {
  constructor () {
    this.name = 'bugfixes'
  }

  set name (name) {
    this._name = name
  }
  get name () {
    return this._name
  }

  set email (email) {
    this._email = email
  }
  get email () {
    return this._email
  }

  set cellphone (cellphone) {
    this._cellphone = cellphone
  }
  get cellphone () {
    return this._cellphone
  }

  set countryCode (countryCode) {
    this._countryCode = countryCode
  }
  get countryCode () {
    return this._countryCode
  }

  set verify (verify) {
    this._verify = verify
  }
  get verify () {
    return this._verify
  }

  set authyId (authyId) {
    this._authyId = authyId
  }
  get authyId () {
    return this._authyId
  }

  set accountId (accountId) {
    this._accountId = accountId
  }
  get accountId () {
    return this._accountId
  }

  save (callback) {
    let self = this

    requestPromise({
      method: 'POST',
      uri: process.env.AUTHY_URL + '/users/new',
      headers: {
        'X-Authy-API-KEY': process.env.AUTHY_KEY
      },
      formData: {
        'user[email]': self.email,
        'user[cellphone]': self.cellphone,
        'user[country_code]': self.countryCode
      },
      json: true
    }).then((body) => {
      if (bugFunctions.checkIfDefined(body.success) && body.success === 'true') {
        AWS.config.update({
          region: process.env.AWS_DYNAMO_REGION
        })
        const dynamo = new AWS.DynamoDB.DocumentClient({
          apiVersion: process.env.AWS_DYNAMO_VERSION,
          endpoint: new AWS.Endpoint(process.env.AWS_DYNAMO_ENDPOINT)
        })

        let accountGen = uuid(process.env.ACCOUNT_GEN, uuid.DNS)
        let accountId = uuid(body.user.id + self.name + self.email, accountGen)

        const insertItem = {
          accountId: accountId,
          authyId: body.user.id,
          name: self.name,
          email: self.email
        }

        dynamo.put({
          TableName: process.env.AWS_DYNAMO_TABLE_ACCOUNT,
          Item: insertItem
        }, (error, result) => {
          if (error && error.statusCode) {
            throw new Error(error)
          }

          return callback(null, {
            id: insertItem.authyId,
            accountId: insertItem.accountId
          })
        })
      } else {
        let error = 'Failed to create account'

        throw new Error(error)
      }
    }).catch((err) => {
      BugFixes.error('Account Error', 'Save', err)

      return callback(err)
    })
  }

  verifyAccount (callback) {
    let self = this

    requestPromise({
      method: 'GET',
      uri: process.env.AUTHY_URL + '/verify/' + self.verify + '/' + self.authyId,
      headers: {
        'X-Authy-API-KEY': process.env.AUTHY_KEY
      },
      json: true
    }).then((body) => {
      if (bugFunctions.checkIfDefined(body.success) && body.success === 'true') {
        AWS.config.update({
          region: process.env.AWS_DYNAMO_REGION
        })
        const dynamo = new AWS.DynamoDB.DocumentClient({
          apiVersion: process.env.AWS_DYNAMO_VERSION,
          endpoint: new AWS.Endpoint(process.env.AWS_DYNAMO_ENDPOINT)
        })
        dynamo.get({
          TableName: process.env.AWS_DYNAMO_TABLE_ACCOUNT,
          Key: {
            email: self.email
          }
        }, (error, result) => {
          if (error && error.statusCode) {
            throw new Error(error)
          }

          if (result.Item) {
            return callback(null, {
              success: true,
              accountId: result.Item.accountId
            })
          } else {
            let error = 'No Result'

            throw new Error(error)
          }
        })
      } else {
        let error = 'Failed to verify account'

        throw new Error(error)
      }
    }).catch((err) => {
      BugFixes.error('Account Error', 'Verify', err)

      return callback(err)
    })
  }

  getAccount (callback) {
    let self = this

    AWS.config.update({
      region: process.env.AWS_DYNAMO_REGION
    })
    const dynamo = new AWS.DynamoDB.DocumentClient({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: process.env.AWS_DYNAMO_ENDPOINT
    })
    dynamo.scan({
      TableName: process.env.AWS_DYNAMO_TABLE_ACCOUNT,
      ExpressionAttributeNames: {
        '#ID': 'accountId',
        '#AID': 'authyId'
      },
      ExpressionAttributeValues: {
        ':ID': self.authyId
      },
      FilterExpression: '#AID = :ID',
      ProjectionExpression: '#ID'
    }, (error, result) => {
      if (error) {
        BugFixes.error('Get Account', error)

        return callback(error)
      }

      return callback(null, {
        accountId: result.Items[0].accountId
      })
    })
  }

  verifyAccountByIds (callback) {
    let self = this

    AWS.config.update({
      region: process.env.AWS_DYNAMO_REGION
    })
    const dynamo = new AWS.DynamoDB.DocumentClient({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: new AWS.Endpoint(process.env.AWS_DYNAMO_ENDPOINT)
    })
    dynamo.scan({
      TableName: process.env.AWS_DYNAMO_TABLE_ACCOUNT,
      ExpressionAttributeNames: {
        "#AID": 'authyId',
        '#ID': 'accountId',
        '#N': 'name'
      },
      ExpressionAttributeValues: {
        ':AID': self.authyId,
        ':ID': self.accountId
      },
      FilterExpression: '#AID = :AID AND #ID = :ID',
      ProjectionExpression: '#N'
    }, (error, result) => {
      if (error && error.statusCode) {
        BugFixes.error('Account Error', 'Verify By IDs', error)

        return callback(error)
      }

      return callback(null, {
        success: true
      })
    })
  }

  login (callback) {
    let self = this

    AWS.config.update({
      region: process.env.AWS_DYNAMO_REGION
    })
    const dynamo = new AWS.DynamoDB.DocumentClient({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: new AWS.Endpoint(process.env.AWS_DYNAMO_ENDPOINT)
    })
    dynamo.get({
      TableName: process.env.AWS_DYNAMO_TABLE_ACCOUNT,
      Key: {
        email: self.email
      }
    }, (error, result) => {
      if (error && error.statusCode) {
        BugFixes.error('Account Error', 'Login', error)

        return callback(error)
      }

      if (result.Item) {
        let authyId = result.Item.authyId

        requestPromise({
          uri: process.env.AUTHY_URL + '/sms/' + authyId,
          headers: {
            'X-Authy-API-KEY': process.env.AUTHY_KEY
          },
          json: true
        }).then((body) => {
          if (bugFunctions.checkIfDefined(body.success) && body.success === 'true') {
            return callback(null, {
              success: true,
              message: 'Verify Code Sent',
              authyId: authyId
            })
          } else {
            let error = 'No Account'

            throw new Error(error)
          }
        }).catch((err) => {
          BugFixes.error('Account Error', 'Login', err)

          return callback(err)
        })
      }
    })
  }

  getAuthyId (callback) {
    let self = this

    AWS.config.update({
      region: process.env.AWS_DYNAMO_REGION
    })
    const dynamo = new AWS.DynamoDB.DocumentClient({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: new AWS.Endpoint(process.env.AWS_DYNAMO_ENDPOINT)
    })
    dynamo.get({
      TableName: process.env.AWS_DYNAMO_TABLE_ACCOUNT,
      Key: {
        email: self.email
      }
    }, (error, result) => {
      if (error && error.statusCode) {
        BugFixes.error('Account Error', 'Get AuthyId', error)

        return callback(error)
      }

      if (result.Item) {
        return callback(null, {
          success: true,
          authyId: result.Item.authyId
        })
      } else {
        return callback(null, {
          success: false,
          message: 'No Account'
        })
      }
    })
  }
}

Account.prototype.removeAll = dataLayer.removeAll
Account.prototype.createTable = dataLayer.createTable

module.exports = Account

