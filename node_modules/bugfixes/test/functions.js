/* global describe, it */
'use strict'

const BugFunctions = require('../index').functions
const expect = require('chai').expect

describe('BugFunction Tests', () => {
  it('should return error', (done) => {
    const error = BugFunctions.error(10, 'tester')

    expect(error).to.be.an('object')
    expect(error).to.have.property('code').to.be.equal(10)
    expect(error).to.have.property('message').to.be.equal('tester')
    expect(error).to.have.property('type').to.be.equal('Error')

    done()
  })

  it('should return success', (done) => {
    const result = BugFunctions.result(10, 'tester')

    expect(result).to.be.an('object')
    expect(result).to.have.property('code').to.be.equal(10)
    expect(result).to.have.property('message').to.be.equal('tester')
    expect(result).to.have.property('type').to.be.equal('Success')

    done()
  })

  it('should give unexpected', (done) => {
    const unexpected = BugFunctions.defaultError(10)

    expect(unexpected).to.be.an('object')
    expect(unexpected).to.have.property('code').to.be.equal(10)
    expect(unexpected).to.have.property('message').to.be.equal('Unexpected Error')
    expect(unexpected).to.have.property('type').to.be.equal('Error')

    done()
  })

  it('should give verify', (done) => {
    const verifyPreExist = '0ea08f24-7945-53ae-bb48-294b3980dd26'
    const verifyResult = BugFunctions.createVerify('tester', 'tester@tester.tester', '144b182b-1384-498c-b124-f204ec212e27')

    expect(verifyResult).to.be.a('string')
    expect(verifyResult).to.equal(verifyPreExist)

    done()
  })

  it('should return lambda success', (done) => {
    const result = BugFunctions.lambdaResult(10, 'result')

    expect(result).to.be.an('object')
    expect(result).to.have.property('body')

    let resultObj = JSON.parse(result.body)
    expect(resultObj).to.have.property('code').to.be.equal(10)
    expect(resultObj).to.have.property('type').to.be.equal('Success')

    done()
  })

  it('should return lambda failure', (done) => {
    const result = BugFunctions.lambdaError(10, 'result')

    expect(result).to.be.an('object')
    expect(result).to.have.property('body')

    let resultObj = JSON.parse(result.body)
    expect(resultObj).to.have.property('code').to.be.equal(10)
    expect(resultObj).to.have.property('type').to.be.equal('Error')

    done()
  })
})
