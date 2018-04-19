/* global describe, it, before, after */
require('dotenv').config()

const AWS = require('aws-sdk')
const BugFixes = require('bugfixes')
const mockyeah = require('mockyeah')

const expect = require('chai').expect

const Account = require('../src')

process.env.AWS_DYNAMO_ENDPOINT = 'http://docker.devel:8000'
process.env.AUTHY_URL = 'http://127.0.0.1:4001/protected/json'

const testObj = {
  id: process.env.TEST_ACCOUNT_ID,
  name: process.env.TEST_ACCOUNT_NAME,
  email: process.env.TEST_ACCOUNT_EMAIL,
  cellphone: process.env.TEST_ACCOUNT_CELLPHONE,
  countryCode: process.env.TEST_ACCOUNT_COUNTRY_CODE,
  verify: {
    valid: process.env.TEST_ACCOUNT_VERIFY_VALID,
    invalid: process.env.TEST_ACCOUNT_VERIFY_INVALID
  },
  dataId: 0
}

describe('Account Model', () => {
  before((done) => {
    const account = new Account()
    account.createTable((error, result) => {
      if (error) {
        BugFixes.error('Test Account Model', 'Create Table', error)
      }
    })
    done()
  })

  after((done) => {
    const account = new Account()
    account.removeAll((error, result) => {
      if (error) {
        BugFixes.error('Test Account Model', 'Remove All', error)
      }
    })
    done()
  })

  it('should create account', (done) => {
    mockyeah.post('/protected/json/users/new', {
      json: {
        message: 'User Created',
        user: {
          id: testObj.id
        },
        success: true
      }
    })

    let account = new Account()
    account.name = testObj.name
    account.email = testObj.email
    account.cellphone = testObj.cellphone
    account.countryCode = testObj.countryCode
    account.save((error, result) => {
      if (error) {
        done(Error(error))
      }

      expect(result).to.be.an('object')
      expect(result).to.have.property('accountId')

      testObj.dataId = result.accountId

      done()
    })
  })

  it('should verify account', (done) => {
    mockyeah.get('/protected/json/verify/' + testObj.verify.valid + '/' + testObj.id, {
      json: {
        message: 'Token is valid',
        token: 'is valid',
        success: true
      }
    })

    let account = new Account()
    account.email   = testObj.email
    account.verify  = testObj.verify.valid
    account.authyId = testObj.id
    account.verifyAccount((error, result) => {
      if (error) {
        done(Error(error))
      }

      expect(result).to.be.an('object')
      expect(result).to.have.property('success').to.be.equal(true)

      done()
    })
  })

  it('should return authyId', (done) => {
    let account = new Account()
    account.email = testObj.email
    account.getAuthyId((error, result) => {
      if (error) {
        done(Error(error))
      }

      expect(result).to.be.an('object')
      expect(result).to.have.property('authyId').to.be.equal(testObj.id)

      done()
    })
  })

  it('should login', (done) => {
    mockyeah.get('/protected/json/sms/' + testObj.id, {
      json: {
        message: 'Sent to device',
        cellphone: '+' + testObj.countryCode + testObj.cellphone,
        ignored: true,
        success: true
      }
    })

    let account = new Account()
    account.email = testObj.email
    account.login((error, result) => {
      if (error) {
        done(Error(error))
      }

      expect(result).to.be.an('object')
      expect(result).to.have.property('authyId').to.have.lengthOf.least(4)

      done()
    })
  })

  it('should get accountId from authyId', (done) => {
    let account = new Account()
    account.authyId = testObj.id
    account.getAccount((error, result) => {
      if (error) {
        done(Error(error))
      }

      expect(result).to.be.an('object')
      expect(result).to.have.property('accountId').to.be.equal(testObj.dataId)

      done()
    })
  })

  it('should verify account by ids', (done) => {
    let account = new Account()
    account.accountId = testObj.dataId
    account.authyId = testObj.id
    account.verifyAccountByIds((error, result) => {
      if (error) {
        done(Error(error))
      }

      expect(result).to.be.an('object')
      expect(result).to.have.property('success').to.be.equal(true)
      done()
    })
  })
})
