# BugFix.es Node Module

This is the simplest way of using BugFix.es with Node

## Replace console.LOGLEVEL with the BugFix.es version
````javascript
    console.log("message")
    BugFixes.log("message")
````

Or you can do it with the object method
````javascript
    // Pure Object
    new BugFixes({
        message: "message",
        logLevel: bugFixes.LOG
    })

    // Mixed Object
    new BugFixes('message', bugFixes.LOG)
````

## If you have a BugFix.es API
You can either put the key and secret into your environment settings
````
    BUGFIXES_KEY = <key>
    BUGFIXES_SECRET = <secret>
    BUGFIXES_ID = <app_id>
````

Or you can do it in the function call (not recommended)
````javascript
    new BugFixes({
        message: <message>,
        logLevel: <logLevel>,
        key: <key>,
        secret: <secret>,
        id: <app_id>
    })
````

# Log Levels
````
    BugFixes.LOG = BugFixes.log() = console.log()
    BugFixes.INFO = BugFixes.info() = console.info()
    BugFixes.ERROR = BugFixes.error() = console.error()
````

# General Functions
These are general functions that we have found quite useful
````
    const bugFunctions = BugFixes.functions

    or
    const bugFunctions = require('bugfixes/functions)
````

## Check If Defined
````
    let tester = null
    if (!bugFunctions.checkIfDefined(tester)) {
        console.log("Tester is not defined")
    }
````

## Error
````
    res.json(bugFunctions.error(200, 'Error Description'))
````
Result
````
    {
        code: 200,
        message: 'Error Description'
        type: 'Error'
    }
````

## Result
````
    res.json(bugFunctions.result(200, 'Success Message'))
````
Result
````
    {
        code: 200,
        message: 'Success Message',
        type: 'Success'
    }
````

## Lambda Results
````
  return callback(null, bugFunctions.lambdaResult(200, {data: 'stuff'}))
````
Result
````
  {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: '{"code": 100, "message": {"data": "stuff"}, "type": "Success"}',
    isBase64Encoded: false
  }
````

## Lambda Error
````
  return callback(bugFunctions.lambdaError(200, {data: 'stuff'})
````
Result
````
  {
    statusCode :200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: '{"code": 200, "message": {"data": "stuff"}, "type": "Error"}',
    isBase64Encoded: false
  }
````
