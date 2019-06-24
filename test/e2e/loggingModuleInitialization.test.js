/*
 * Tests for Error Logger initialization.
 */

const _ = require('lodash')
const should = require('chai').should()
const config = require('../common/testConfig')
const errorLogger = require('../../index')

describe('Error Logger Initialization Tests', () => {
  const optionalConfig = ['LOG_LEVEL', 'POST_KAFKA_ERROR_ENABLED', 'TOKEN_CACHE_TIME', 'AUTH0_PROXY_SERVER_URL']
  for (const key in config) {
    if (!_.includes(optionalConfig, key)) {
      it(`Configuration ${key} is missing when enable sending Kafka message`, () => {
        const cfg = _.omit(_.cloneDeep(config), key)
        try {
          errorLogger(cfg)
          throw new Error('should not throw error here')
        } catch (err) {
          should.equal(err.message, `"${key}" is required`)
        }
      })
    }
  }

  it(`Successfully initialize Error Logger disable sending Kafka message`, () => {
    try {
      errorLogger({ POST_KAFKA_ERROR_ENABLED: false })
    } catch (err) {
      throw new Error('should not throw error here')
    }
  })

  it(`Configuration LOG_LEVEL is invalid`, () => {
    const cfg = _.cloneDeep(config)
    cfg['LOG_LEVEL'] = 'invalid'
    try {
      errorLogger(cfg)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.message, `"LOG_LEVEL" must be one of [error, warn, info, verbose, debug, silly]`)
    }
  })

  for (const key of ['AUTH0_URL', 'AUTH0_AUDIENCE', 'BUSAPI_URL']) {
    it(`Configuration ${key} is invalid, it should be valid uri`, () => {
      const cfg = _.cloneDeep(config)
      cfg[key] = 'invalid'
      try {
        errorLogger(cfg)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.message, `"${key}" must be a valid uri`)
      }
    })
  }

  for (const key of ['TOKEN_CACHE_TIME', 'LENGTH_OF_ARRAY_TO_HIDE']) {
    it(`Configuration ${key} is invalid, it should be number`, () => {
      const cfg = _.cloneDeep(config)
      cfg[key] = 'invalid'
      try {
        errorLogger(cfg)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.message, `"${key}" must be a number`)
      }
    })

    it(`Configuration ${key} is invalid, it should be an integer`, () => {
      const cfg = _.cloneDeep(config)
      cfg[key] = 123.45
      try {
        errorLogger(cfg)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.message, `"${key}" must be an integer`)
      }
    })

    it(`Configuration ${key} is invalid, it should not less than 0`, () => {
      const cfg = _.cloneDeep(config)
      cfg[key] = -1
      try {
        errorLogger(cfg)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.message, `"${key}" must be larger than or equal to 0`)
      }
    })
  }

  for (const key of ['AUTH0_CLIENT_ID', 'AUTH0_CLIENT_SECRET', 'KAFKA_ERROR_TOPIC', 'AUTH0_PROXY_SERVER_URL', 'KAFKA_MESSAGE_ORIGINATOR']) {
    it(`Configuration ${key} is invalid, it should be string`, () => {
      const cfg = _.cloneDeep(config)
      cfg[key] = true
      try {
        errorLogger(cfg)
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.message, `"${key}" must be a string`)
      }
    })
  }

  it(`Configuration POST_KAFKA_ERROR_ENABLED is invalid`, () => {
    const cfg = _.cloneDeep(config)
    cfg['POST_KAFKA_ERROR_ENABLED'] = 'invalid'
    try {
      errorLogger(cfg)
      throw new Error('should not throw error here')
    } catch (err) {
      should.equal(err.message, `"POST_KAFKA_ERROR_ENABLED" must be a boolean`)
    }
  })
})
