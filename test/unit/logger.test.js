/*
 * Tests for Error Logger
 */

const _ = require('lodash')
const should = require('chai').should()
const Joi = require('@hapi/joi')
const config = require('../common/testConfig')
const errorLogger = require('../../index')

const debugLogger = errorLogger(config)
const noKafkaLogger = errorLogger({ POST_KAFKA_ERROR_ENABLED: false })
const infoLogger = errorLogger({ LOG_LEVEL: 'info', POST_KAFKA_ERROR_ENABLED: false })

describe('Logger Unit Tests', () => {
  const infoLogs = []
  const debugLogs = []
  const errorLogs = []
  const originalLoggingMethod = [{}, {}, {}]

  before(() => {
    let loggers = [debugLogger, noKafkaLogger, infoLogger]
    for (let i = 0; i < 3; i++) {
      let logger = loggers[i]

      originalLoggingMethod[i].info = logger.info
      originalLoggingMethod[i].debug = logger.debug
      originalLoggingMethod[i].error = logger.error

      logger.info = (message) => {
        infoLogs.push(message)
      }

      logger.debug = (message) => {
        debugLogs.push(message)
      }

      logger.error = async (message) => {
        if (typeof message === 'string') {
          errorLogs.push(message)
        } else {
          errorLogs.push(message.toString())
        }
        await originalLoggingMethod[i].error(message)
      }
    }
  })

  beforeEach(() => {
    // clear logs
    infoLogs.length = 0
    debugLogs.length = 0
    errorLogs.length = 0
  })

  describe('error method test', () => {
    it('error method invoked by debug level logger, log a string', async () => {
      await debugLogger.error('This is a message')
      should.equal(errorLogs.length, 1)
      should.equal(errorLogs[0], 'This is a message')
    })

    it('error method invoked by debug level logger, log an error', async () => {
      await debugLogger.error(new Error('This is an error'))
      should.equal(errorLogs.length, 1)
      should.equal(errorLogs[0], 'Error: This is an error')
      should.equal(infoLogs.length, 1)
      should.equal(infoLogs[0], `Sending Kafka event to topic ${config.KAFKA_ERROR_TOPIC}`)
    })

    it('error method invoked by no kafka logger, log an error', async () => {
      await noKafkaLogger.error(new Error('This is an error'))
      should.equal(errorLogs.length, 1)
      should.equal(errorLogs[0], 'Error: This is an error')
      should.equal(infoLogs.length, 0)
    })
  })

  describe('logFullError method test', () => {
    it('logFullError method invoked by debug level logger, no error object passing', async () => {
      await debugLogger.logFullError()
      should.equal(errorLogs.length, 0)
    })

    it('logFullError method invoked by debug level logger, only error object passing', async () => {
      await debugLogger.logFullError(new Error('This is an error for testing logFullError'))
      should.equal(errorLogs.length, 2)
      should.equal(errorLogs[0].startsWith('Error: This is an error for testing logFullError'), true)
      should.equal(infoLogs.length, 1)
      should.equal(infoLogs[0], `Sending Kafka event to topic ${config.KAFKA_ERROR_TOPIC}`)
    })

    it('logFullError method invoked by no kafka logger', async () => {
      await debugLogger.logFullError(new Error('This is an error for testing logFullError'), 'test-method')
      should.equal(errorLogs.length, 3)
      should.equal(errorLogs[0], `Error happened in test-method`)
      should.equal(errorLogs[1].startsWith('Error: This is an error for testing logFullError'), true)
      should.equal(infoLogs.length, 1)
      should.equal(infoLogs[0], `Sending Kafka event to topic ${config.KAFKA_ERROR_TOPIC}`)
    })
  })

  const addFunction = async (a, b) => { return a + b }
  addFunction.schema = {
    a: Joi.number().integer().min(0).required(),
    b: Joi.number().integer().min(0).required()
  }

  const testService = {
    add: addFunction,
    noReturn: async () => {},
    throwError: async () => { throw new Error('test') },
    returnLongArray: async () => {
      const ret = []
      for (let i = 0; i < 50; i++) {
        ret.push(i)
      }
      return { ret }
    }
  }

  describe('decorateWithLogging method test', () => {
    it('decorateWithLogging method invoked by debug level logger', async () => {
      const service = _.clone(testService)
      debugLogger.decorateWithLogging(service)
      await service.add(1, 2)
      should.equal(debugLogs.length, 6)
      should.equal(debugLogs[0], 'ENTER add')
      should.equal(debugLogs[1], 'input arguments')
      should.equal(debugLogs[2], '{ a: 1, b: 2 }')
      should.equal(debugLogs[3], 'EXIT add')
      should.equal(debugLogs[4], 'output arguments')
      should.equal(debugLogs[5], '3')
    })

    it('decorateWithLogging method invoked by debug level logger, return long array', async () => {
      const service = _.clone(testService)
      debugLogger.decorateWithLogging(service)
      await service.returnLongArray()
      should.equal(debugLogs.length, 4)
      should.equal(debugLogs[0], 'ENTER returnLongArray')
      should.equal(debugLogs[1], 'EXIT returnLongArray')
      should.equal(debugLogs[2], 'output arguments')
      should.equal(debugLogs[3], `{ ret: 'Array(50)' }`)
    })

    it('decorateWithLogging method invoked by debug level logger, no return result', async () => {
      const service = _.clone(testService)
      debugLogger.decorateWithLogging(service)
      await service.noReturn()
      should.equal(debugLogs.length, 2)
      should.equal(debugLogs[0], 'ENTER noReturn')
      should.equal(debugLogs[1], 'EXIT noReturn')
    })

    it('decorateWithLogging method invoked by debug level logger, throw error', async () => {
      const service = _.clone(testService)
      debugLogger.decorateWithLogging(service)
      try {
        await service.throwError()
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(errorLogs.length, 3)
        should.equal(errorLogs[0], 'Error happened in throwError')
        should.equal(errorLogs[1].startsWith('Error: test'), true)
        should.equal(infoLogs.length, 1)
        should.equal(infoLogs[0], `Sending Kafka event to topic ${config.KAFKA_ERROR_TOPIC}`)
      }
    })

    it('decorateWithLogging method invoked by info level logger, no debug logs', async () => {
      const service = _.clone(testService)
      infoLogger.decorateWithLogging(service)
      await service.add(1, 2)
      should.equal(debugLogs.length, 0)
    })
  })

  describe('decorateWithValidators method test', () => {
    it('decorateWithValidators method invoked by debug level logger, throw errors', async () => {
      const service = _.clone(testService)
      debugLogger.decorateWithValidators(service)
      try {
        await service.add(1, 'abc')
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.isJoi, true)
        should.equal(err.name, 'ValidationError')
        should.equal(err.details[0].message, `"b" must be a number`)
      }
    })

    it('decorateWithValidators method invoked by no kafka logger, no errors', async () => {
      const service = _.clone(testService)
      noKafkaLogger.decorateWithValidators(service)
      try {
        await service.add(1, '2')
      } catch (err) {
        throw new Error('should not throw error here')
      }
    })
  })

  describe('buildService method test', () => {
    it('buildService method invoked by debug level logger, throw errors', async () => {
      const service = _.clone(testService)
      debugLogger.buildService(service)
      try {
        await service.add(1, 'abc')
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.isJoi, true)
        should.equal(err.name, 'ValidationError')
        should.equal(err.details[0].message, `"b" must be a number`)
        should.equal(debugLogs.length, 3)
        should.equal(debugLogs[0], 'ENTER add')
        should.equal(debugLogs[1], 'input arguments')
        should.equal(debugLogs[2], `{ a: 1, b: 'abc' }`)
        should.equal(errorLogs.length, 3)
        should.equal(errorLogs[0], `Error happened in add`)
        should.equal(errorLogs[1].includes(`"b" must be a number`), true)
        should.equal(infoLogs.length, 1)
        should.equal(infoLogs[0], `Sending Kafka event to topic ${config.KAFKA_ERROR_TOPIC}`)
      }
    })

    it('buildService method invoked by no kafka logger, throw errors no message sent', async () => {
      const service = _.clone(testService)
      noKafkaLogger.buildService(service)
      try {
        await service.add(1, 'abc')
        throw new Error('should not throw error here')
      } catch (err) {
        should.equal(err.isJoi, true)
        should.equal(err.name, 'ValidationError')
        should.equal(err.details[0].message, `"b" must be a number`)
        should.equal(debugLogs.length, 3)
        should.equal(debugLogs[0], 'ENTER add')
        should.equal(debugLogs[1], 'input arguments')
        should.equal(debugLogs[2], `{ a: 1, b: 'abc' }`)
        should.equal(errorLogs.length, 3)
        should.equal(errorLogs[0], `Error happened in add`)
        should.equal(errorLogs[1].includes(`"b" must be a number`), true)
        should.equal(infoLogs.length, 0)
      }
    })

    it('buildService method invoked by info level logger', async () => {
      const service = _.clone(testService)
      infoLogger.buildService(service)
      await service.add(1, '2')
      should.equal(debugLogs.length, 0)
    })

    it('buildService method invoked by debug level logger', async () => {
      const service = _.clone(testService)
      debugLogger.buildService(service)
      await service.add(1, 2)
      should.equal(debugLogs[0], 'ENTER add')
      should.equal(debugLogs[1], 'input arguments')
      should.equal(debugLogs[2], '{ a: 1, b: 2 }')
      should.equal(debugLogs[3], 'EXIT add')
      should.equal(debugLogs[4], 'output arguments')
      should.equal(debugLogs[5], '3')
    })
  })
})
