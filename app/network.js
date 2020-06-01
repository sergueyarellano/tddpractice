const get = require('lodash.get')
const set = require('lodash.set')
const cloneDeep = require('lodash.clonedeep')
const got = require('got')

module.exports = {
  makeRequest
}

async function makeRequest (payload) {
  const newPayload = cloneDeep(payload)
  const { uri, options } = get(newPayload, 'data.request')

  const response = await got(uri, options).json()
  return set(newPayload, 'data.response.body', response)
}
