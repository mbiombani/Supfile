const AWS = require('aws-sdk')
const BugFixes = require('bugfixes')

const dataFunctions = {
  createTable: (callback) => {
    AWS.config.update({
      region: process.env.AWS_DYNAMO_REGION,
      credentials: new AWS.Credentials({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      })
    })
    const dynamo = new AWS.DynamoDB({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: new AWS.Endpoint(process.env.AWS_DYNAMO_ENDPOINT)
    })

    dynamo.describeTable({
      TableName: process.env.AWS_DYNAMO_TABLE_ACCOUNT
    }, (error, result) => {
      if (error && error.statusCode === 400) {
        dynamo.createTable({
          TableName: process.env.AWS_DYNAMO_TABLE_ACCOUNT,
          AttributeDefinitions: [{
              AttributeName: 'email',
              AttributeType: 'S'
          }],
          KeySchema: [{
            KeyType: 'HASH',
            AttributeName: 'email'
          }],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }, (error, result) => {
          if (error) {
            BugFixes.error('Account Table Error', 'Create', error)

            if (error.statusCode) {
              return callback(error)
            }

            return callback(null, {
              success: true
            })
          }
        })
      } else {
        return callback(error)
      }
    })
  },

  removeAll: (callback) => {
    AWS.config.update({
      region: process.env.AWS_DYNAMO_REGION,
      credentials: new AWS.Credentials({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      })
    })
    const dynamo = new AWS.DynamoDB({
      apiVersion: process.env.AWS_DYNAMO_VERSION,
      endpoint: new AWS.Endpoint(process.env.AWS_DYNAMO_ENDPOINT)
    })
    dynamo.describeTable({
      TableName: process.env.AWS_DYNAMO_TABLE_ACCOUNT
    }, (error, result) => {
      if (error) {
        return callback(error)
      }

      dynamo.deleteTable({
        TableName: process.env.AWS_DYNAMO_TABLE_ACCOUNT
      }, (error, result) => {
        if (error) {
          BugFixes.error('Account Table Error', 'Delete', error)

          return callback(error)
        }

        return callback(null, {
          success: true
        })
      })
    })
  }
}

module.exports = dataFunctions