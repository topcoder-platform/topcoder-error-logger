/*
 * Setting up Mock for all tests
 */

const config = require('../common/testConfig')
const URL = require('url')
const nock = require('nock')
const prepare = require('mocha-prepare')

prepare(function (done) {
  const authUrl = URL.parse(config.AUTH0_URL)
  const busUrl = URL.parse(`${config.BUSAPI_URL}/bus/events`)

  nock(/.com/)
    .persist()
    .post(authUrl.path)
    .reply(200, { access_token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJyb2xlcyI6WyJBZG1pbmlzdHJhdG9yIl0sImlzcyI6Imh0dHBzOi8vYXBpLnRvcGNvZGVyLmNvbSIsImhhbmRsZSI6IlRvbnlKIiwiZXhwIjo1NTUzMDE5OTI1OSwidXNlcklkIjoiNDA0MzMyODgiLCJpYXQiOjE1MzAxOTg2NTksImVtYWlsIjoiYWRtaW5AdG9wY29kZXIuY29tIiwianRpIjoiYzNhYzYwOGEtNTZiZS00NWQwLThmNmEtMzFmZTk0Yjk1NjFjIn0.pIHUtMwIV07ZgfaUk9916X49rgjKclM9kzQP419LBo0' })
    .post(busUrl.path)
    .reply(204)

  done()
}, function (done) {
  // called after all test completes (regardless of errors)
  nock.cleanAll()
  done()
})
