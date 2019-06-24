/*
 * Index file
 */

const _ = require('lodash')
const joi = require('@hapi/joi')
const { LogLevels, MaxArrayLength } = require('./src/constants')

module.exports = (config) => {
  /**
   * The configuration object schema.
   * LOG_LEVEL: the log level, default is 'debug'
   * AUTH0_URL: the auth0 url
   * AUTH0_AUDIENCE: the auth0 audience
   * TOKEN_CACHE_TIME: the token cache time, it is optional field.
   * AUTH0_CLIENT_ID: the auth0 client id, used as credential
   * AUTH0_CLIENT_SECRET: the auth0 client secret, used as credential
   * BUSAPI_URL: the Topcoder bus api base url.
   * KAFKA_ERROR_TOPIC: the error topic used when posting Kafka event
   * KAFKA_MESSAGE_ORIGINATOR: the Kafka message originator
   * AUTH0_PROXY_SERVER_URL: the auth0 proxy server url, it is optional field.
   * POST_KAFKA_ERROR_ENABLED: the boolean flag indicate whether posting error to Kafka or logging on console, default is false(logging on console)
   * LENGTH_OF_ARRAY_TO_HIDE: the length of array type parameter to be hided during logging
   */
  const schema = joi.object().keys({
    LOG_LEVEL: joi.string().valid(_.keys(LogLevels)).default(LogLevels.Debug),
    AUTH0_URL: joi.when('POST_KAFKA_ERROR_ENABLED', {
      is: true,
      then: joi.string().uri().trim().required(),
      otherwise: joi.any()
    }),
    AUTH0_AUDIENCE: joi.when('POST_KAFKA_ERROR_ENABLED', {
      is: true,
      then: joi.string().uri().trim().required(),
      otherwise: joi.any()
    }),
    TOKEN_CACHE_TIME: joi.when('POST_KAFKA_ERROR_ENABLED', {
      is: true,
      then: joi.number().integer().min(0),
      otherwise: joi.any()
    }),
    AUTH0_CLIENT_ID: joi.when('POST_KAFKA_ERROR_ENABLED', {
      is: true,
      then: joi.string().required(),
      otherwise: joi.any()
    }),
    AUTH0_CLIENT_SECRET: joi.when('POST_KAFKA_ERROR_ENABLED', {
      is: true,
      then: joi.string().required(),
      otherwise: joi.any()
    }),
    BUSAPI_URL: joi.when('POST_KAFKA_ERROR_ENABLED', {
      is: true,
      then: joi.string().uri().trim().required(),
      otherwise: joi.any()
    }),
    KAFKA_ERROR_TOPIC: joi.when('POST_KAFKA_ERROR_ENABLED', {
      is: true,
      then: joi.string().required(),
      otherwise: joi.any()
    }),
    AUTH0_PROXY_SERVER_URL: joi.when('POST_KAFKA_ERROR_ENABLED', {
      is: true,
      then: joi.string(),
      otherwise: joi.any()
    }),
    KAFKA_MESSAGE_ORIGINATOR: joi.when('POST_KAFKA_ERROR_ENABLED', {
      is: true,
      then: joi.string().required(),
      otherwise: joi.any()
    }),
    POST_KAFKA_ERROR_ENABLED: joi.boolean().default(false),
    LENGTH_OF_ARRAY_TO_HIDE: joi.number().integer().min(0).default(MaxArrayLength)
  })

  // Normalized the arguments
  let normalized
  try {
    normalized = joi.attempt(config, schema)
  } catch (err) {
    throw new Error(err.details[0].message)
  }

  return require('./src/logger')(normalized)
}
