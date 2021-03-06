/*
 * Config for tests.
 */

const config = {
  LOG_LEVEL: process.env.TEST_LOG_LEVEL,
  AUTH0_URL: process.env.TEST_AUTH0_URL,
  TOKEN_CACHE_TIME: process.env.TEST_TOKEN_CACHE_TIME,
  AUTH0_CLIENT_ID: process.env.TEST_AUTH0_CLIENT_ID,
  AUTH0_CLIENT_SECRET: process.env.TEST_AUTH0_CLIENT_SECRET,
  AUTH0_AUDIENCE: process.env.TEST_AUTH0_AUDIENCE,
  BUSAPI_URL: process.env.TEST_BUSAPI_URL,
  KAFKA_ERROR_TOPIC: process.env.TEST_KAFKA_ERROR_TOPIC,
  POST_KAFKA_ERROR_ENABLED: process.env.TEST_POST_KAFKA_ERROR_ENABLED,
  KAFKA_MESSAGE_ORIGINATOR: process.env.TEST_KAFKA_MESSAGE_ORIGINATOR
}

module.exports = config
