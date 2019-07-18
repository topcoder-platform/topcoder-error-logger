/**
 * This module contains the winston logger configuration.
 */

const _ = require('lodash');
const Joi = require('@hapi/joi');
const util = require('util');
const getParams = require('get-parameter-names');
const { createLogger, format, transports } = require('winston');
const { LogLevels } = require('./constants');
const busApi = require('topcoder-bus-api-wrapper');

module.exports = config => {
  const logger = createLogger({
    level: config.LOG_LEVEL,
    transports: [
      new transports.Console({
        format: format.combine(format.colorize(), format.simple()),
      }),
    ],
  });

  let busApiClient;
  if (config.POST_KAFKA_ERROR_ENABLED) {
    busApiClient = busApi(
      _.pick(config, [
        'AUTH0_URL',
        'AUTH0_AUDIENCE',
        'TOKEN_CACHE_TIME',
        'AUTH0_CLIENT_ID',
        'AUTH0_CLIENT_SECRET',
        'BUSAPI_URL',
        'KAFKA_ERROR_TOPIC',
        'AUTH0_PROXY_SERVER_URL',
      ])
    );
  }

  /**
   * Send Kafka event message
   * @params {Object} payload the payload
   */
  async function postEvent(payload) {
    logger.info(`Sending Kafka event to topic ${config.KAFKA_ERROR_TOPIC}`);
    const message = {
      topic: config.KAFKA_ERROR_TOPIC,
      originator: config.KAFKA_MESSAGE_ORIGINATOR,
      timestamp: new Date().toISOString(),
      'mime-type': 'application/json',
      payload,
    };
    await busApiClient.postEvent(message);
  }

  /**
   * Remove invalid properties from the object and hide long arrays
   * @param {Object} obj the object
   * @returns {Object} the new object with removed properties
   * @private
   */
  const _sanitizeObject = obj => {
    try {
      return JSON.parse(
        JSON.stringify(obj, (name, value) => {
          if (
            _.isArray(value) &&
            value.length > config.LENGTH_OF_ARRAY_TO_HIDE
          ) {
            return `Array(${value.length})`;
          }
          return value;
        })
      );
    } catch (e) {
      return obj;
    }
  };

  /**
   * Convert array with arguments to object
   * @param {Array} params the name of parameters
   * @param {Array} arr the array with values
   * @returns {Object} the new object with all input parameters
   * @private
   */
  const _combineObject = (params, arr) => {
    const ret = {};
    _.each(arr, (arg, i) => {
      ret[params[i]] = arg;
    });
    return ret;
  };

  const originalError = logger.error;

  /**
   * Custom error method, override error logging method of winston logger.
   * @param {Object} obj the obj to be logged
   */
  logger.error = async obj => {
    if (obj && obj.message && obj.stack && config.POST_KAFKA_ERROR_ENABLED) {
      await postEvent({
        error: _.pick(obj, [
          'name',
          'message',
          'stack',
          'topic',
          'id',
          'submissionPhaseId',
          'resource',
          'originalTopic',
          'challengeId',
        ]),
      });
    }
    if (typeof obj === 'string') {
      originalError(obj);
    } else {
      originalError(obj.toString());
    }
  };

  /**
   * Log error details with signature
   * @param {Object} err the error
   * @param {String} signature the signature
   */
  logger.logFullError = async (err, signature) => {
    if (!err) {
      return;
    }
    if (err.message && err.stack && config.POST_KAFKA_ERROR_ENABLED) {
      await postEvent({ error: _.pick(err, ['name', 'message', 'stack']) });
    }
    if (signature) {
      await logger.error(`Error happened in ${signature}`);
    }
    await logger.error(util.inspect(err));
    if (!err.logged) {
      await logger.error(err.stack);
      err.logged = true;
    }
  };

  /**
   * Decorate all functions of a service and log debug information if DEBUG is enabled
   * @param {Object} service the service
   */
  logger.decorateWithLogging = service => {
    if (LogLevels[config.LOG_LEVEL] < LogLevels.debug) {
      return;
    }
    _.each(service, (method, name) => {
      const params = method.params || getParams(method);
      service[name] = async function() {
        logger.debug(`ENTER ${name}`);
        if (params.length > 0) {
          logger.debug('input arguments');
          const args = Array.prototype.slice.call(arguments);
          logger.debug(
            util.inspect(_sanitizeObject(_combineObject(params, args)))
          );
        }
        try {
          const result = await method.apply(this, arguments);
          logger.debug(`EXIT ${name}`);
          if (result !== null && result !== undefined) {
            logger.debug('output arguments');
            logger.debug(util.inspect(_sanitizeObject(result)));
          }
          return result;
        } catch (e) {
          await logger.logFullError(e, name);
          throw e;
        }
      };
    });
  };

  /**
   * Decorate all functions of a service and validate input values
   * and replace input arguments with sanitized result form Joi
   * Service method must have a `schema` property with Joi schema
   * @param {Object} service the service
   */
  logger.decorateWithValidators = function(service) {
    _.each(service, (method, name) => {
      if (!method.schema) {
        return;
      }
      const params = getParams(method);
      service[name] = async function() {
        const args = Array.prototype.slice.call(arguments);
        const value = _combineObject(params, args);
        const normalized = Joi.attempt(value, method.schema);

        const newArgs = [];
        // Joi will normalize values
        // for example string number '1' to 1
        // if schema type is number
        _.each(params, param => {
          newArgs.push(normalized[param]);
        });
        return method.apply(this, newArgs);
      };
      service[name].params = params;
    });
  };

  /**
   * Apply logger and validation decorators
   * @param {Object} service the service to wrap
   */
  logger.buildService = service => {
    logger.decorateWithValidators(service);
    logger.decorateWithLogging(service);
  };

  return logger;
};
