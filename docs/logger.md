# Error Logger

Method | Description
------------- | -------------
[**error**](logger.md#error) | log error, post Kafka event if enabled
[**logFullError**](logger.md#logFullError) | log full error, post Kafka event if enabled
[**decorateWithLogging**](logger.md#decorateWithLogging) | decorate method with logging
[**decorateWithValidators**](logger.md#decorateWithValidators) | decorate method with Joi validator
[**buildService**](logger.md#buildService) | build service, for each method in service it will be decorated with logging and Joi validator

<a name="error"></a>
# **error**
> error(obj)

log error, post Kafka event if enable

### Example
```javascript
const errorLogger = require('topcoder-error-logger')
const logger = errorLogger(_.pick(config,
      ['LOG_LEVEL', 'AUTH0_URL', 'AUTH0_AUDIENCE', 'TOKEN_CACHE_TIME',
        'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET', 'BUSAPI_URL',
        'KAFKA_ERROR_TOPIC', 'AUTH0_PROXY_SERVER_URL', 'KAFKA_MESSAGE_ORIGINATOR',
        'POST_KAFKA_ERROR_ENABLED', 'LENGTH_OF_ARRAY_TO_HIDE']))

// Promise model
logger
  .error('this is an message')
  .then(() => {})
  .catch(err => console.log(err))

// Async / await model
await logger.error(new Error('this is an error'))
```

### Parameters

Name | Type | Description
------------- | ------------- | -------------
 **obj** | Object or String| the error object or error message

### Return type

null

<a name="logFullError"></a>
# **logFullError**
> logFullError(err, signature)

log full error, post Kafka event if enabled

### Example
```javascript
const errorLogger = require('topcoder-error-logger')
const logger = errorLogger(_.pick(config,
      ['LOG_LEVEL', 'AUTH0_URL', 'AUTH0_AUDIENCE', 'TOKEN_CACHE_TIME',
        'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET', 'BUSAPI_URL',
        'KAFKA_ERROR_TOPIC', 'AUTH0_PROXY_SERVER_URL', 'KAFKA_MESSAGE_ORIGINATOR',
        'POST_KAFKA_ERROR_ENABLED', 'LENGTH_OF_ARRAY_TO_HIDE']))

// Promise model
logger
  .logFullError(new Error('this is an error'), 'testMethod')
  .then(() => {})
  .catch(err => console.log(err))

// Async / await model
await logger.logFullError(new Error('this is an error'))
```

### Parameters

Name | Type | Description
------------- | ------------- | -------------
 **err** | Object| the error object or error message
 **signature** | String| the method signature

### Return type

null

<a name="decorateWithLogging"></a>
# **decorateWithLogging**
> decorateWithLogging(service)

decorate method with logging

### Example
```javascript
const errorLogger = require('topcoder-error-logger')
const logger = errorLogger(_.pick(config,
      ['LOG_LEVEL', 'AUTH0_URL', 'AUTH0_AUDIENCE', 'TOKEN_CACHE_TIME',
        'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET', 'BUSAPI_URL',
        'KAFKA_ERROR_TOPIC', 'AUTH0_PROXY_SERVER_URL', 'KAFKA_MESSAGE_ORIGINATOR',
        'POST_KAFKA_ERROR_ENABLED', 'LENGTH_OF_ARRAY_TO_HIDE']))

const addFunction = async (a, b) => { return a + b }
addFunction.schema = {
  a: Joi.number().integer().min(0).required(),
  b: Joi.number().integer().min(0).required()
}
const service = {
  add: addFunction
}

logger.decorateWithLogging(service)
```

### Parameters

Name | Type | Description
------------- | ------------- | -------------
 **service** | Object| a service module contain several methods

### Return type

null

<a name="decorateWithValidators"></a>
# **decorateWithValidators**
> decorateWithValidators(service)

decorate method with Joi validator

### Example
```javascript
const errorLogger = require('topcoder-error-logger')
const logger = errorLogger(_.pick(config,
      ['LOG_LEVEL', 'AUTH0_URL', 'AUTH0_AUDIENCE', 'TOKEN_CACHE_TIME',
        'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET', 'BUSAPI_URL',
        'KAFKA_ERROR_TOPIC', 'AUTH0_PROXY_SERVER_URL', 'KAFKA_MESSAGE_ORIGINATOR',
        'POST_KAFKA_ERROR_ENABLED', 'LENGTH_OF_ARRAY_TO_HIDE']))

const addFunction = async (a, b) => { return a + b }
addFunction.schema = {
  a: Joi.number().integer().min(0).required(),
  b: Joi.number().integer().min(0).required()
}
const service = {
  add: addFunction
}

logger.decorateWithValidators(service)
```

### Parameters

Name | Type | Description
------------- | ------------- | -------------
 **service** | Object| a service module contain several methods

### Return type

null

<a name="buildService"></a>
# **buildService**
> buildService(service)

build service, for each method in service it will be decorated with logging and Joi validator

### Example
```javascript
const errorLogger = require('topcoder-error-logger')
const logger = errorLogger(_.pick(config,
      ['LOG_LEVEL', 'AUTH0_URL', 'AUTH0_AUDIENCE', 'TOKEN_CACHE_TIME',
        'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET', 'BUSAPI_URL',
        'KAFKA_ERROR_TOPIC', 'AUTH0_PROXY_SERVER_URL', 'KAFKA_MESSAGE_ORIGINATOR',
        'POST_KAFKA_ERROR_ENABLED', 'LENGTH_OF_ARRAY_TO_HIDE']))

const addFunction = async (a, b) => { return a + b }
addFunction.schema = {
  a: Joi.number().integer().min(0).required(),
  b: Joi.number().integer().min(0).required()
}
const service = {
  add: addFunction
}

logger.buildService(service)
```

### Parameters

Name | Type | Description
------------- | ------------- | -------------
 **service** | Object| a service module contain several methods

### Return type

null
