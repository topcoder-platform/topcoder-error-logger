# Topcoder Error Logger

Topcoder Error Logger

## How to use this Module

1. Include the module in package.json as follows

    ```bash
    "topcoder-error-logger": "topcoder-platform/topcoder-error-logger.git"
    ```

2. Create an instance of this wrapper with the configuration variables listed below

    ```javascript
    const errorLogger = require('topcoder-error-logger')
    const logger = errorLogger(_.pick(config,
          ['LOG_LEVEL', 'AUTH0_URL', 'AUTH0_AUDIENCE', 'TOKEN_CACHE_TIME',
            'AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET', 'BUSAPI_URL',
            'KAFKA_ERROR_TOPIC', 'AUTH0_PROXY_SERVER_URL', 'KAFKA_MESSAGE_ORIGINATOR',
            'POST_KAFKA_ERROR_ENABLED', 'LENGTH_OF_ARRAY_TO_HIDE']))
    ```

    **Configuration / Environment variables:**

    - LOG_LEVEL: the log level, default is 'debug' if not passing
    - AUTH0_URL: the auth0 url
    - AUTH0_AUDIENCE: the auth0 audience
    - TOKEN_CACHE_TIME: the token cache time, it is optional field.
    - AUTH0_CLIENT_ID: the auth0 client id, used as credential
    - AUTH0_CLIENT_SECRET: the auth0 client secret, used as credential
    - BUSAPI_URL: the Topcoder bus api base url.
    - KAFKA_ERROR_TOPIC: the error topic used when posting Kafka event
    - KAFKA_MESSAGE_ORIGINATOR: the Kafka message originator
    - AUTH0_PROXY_SERVER_URL: the auth0 proxy server url, it is optional field.
    - POST_KAFKA_ERROR_ENABLED: the boolean flag indicate whether posting error to Kafka or logging on console, default is false if not passing (logging on console)
    - LENGTH_OF_ARRAY_TO_HIDE: the length of array type parameter to be hided during logging, it is optional field.

3. `logFullError` and `error` function in this module will return a promise, Handling promises is at the caller end. Call the functions with appropriate arguments. Other functions are normal function.

E.g.

```javascript
logger
  .error('this is an message')
  .then(() => {})
  .catch(err => console.log(err))

await logger.error(new Error('this is an error'))

await logFullError(new Error('this is an error'), 'testMethod')

const addFunction = async (a, b) => { return a + b }
addFunction.schema = {
  a: Joi.number().integer().min(0).required(),
  b: Joi.number().integer().min(0).required()
}
const service = {
  add: addFunction
}

logger.buildService(service)

await service.add(1, 2)
```

Refer `index.js` for the list of available functions

## Documentation for logging methods

Method | Description
------------- | -------------
[**error**](docs/logger.md#error) | log error, post Kafka event if enabled
[**logFullError**](docs/logger.md#logFullError) | log full error, post Kafka event if enabled
[**decorateWithLogging**](docs/logger.md#decorateWithLogging) | decorate method with logging
[**decorateWithValidators**](docs/logger.md#decorateWithValidators) | decorate method with Joi validator
[**buildService**](docs/logger.md#buildService) | build service, for each method in service it will be decorated with logging and Joi validator

## Authorization

The Error Logger internally generates a **JWT token using Auth0 credentials** which is used during posting Kafka message to remote server

## Running tests

Following environment variables need to be set up before running the tests

```bash
- TEST_LOG_LEVEL
- TEST_AUTH0_URL
- TEST_TOKEN_CACHE_TIME
- TEST_AUTH0_CLIENT_ID
- TEST_AUTH0_CLIENT_SECRET
- TEST_AUTH0_AUDIENCE
- TEST_BUSAPI_URL
- TEST_KAFKA_ERROR_TOPIC
- TEST_POST_KAFKA_ERROR_ENABLED
- TEST_KAFKA_MESSAGE_ORIGINATOR
```

Refer to Step # 2 in [this section](#how-to-use-this-module) to learn more about the configuration variables.

To run the tests alone, execute the command

```bash
npm run test
```
```bash
npm run e2e
```

To run tests with coverage report, execute the command

```bash
npm run cov
```
```bash
npm run e2e-cov
```
