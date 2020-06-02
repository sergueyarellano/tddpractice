const get = require('lodash.get')
const set = require('lodash.set')
const cloneDeep = require('lodash.clonedeep')
const mapKeys = require('lodash.mapkeys')
const invert = require('lodash.invert')

module.exports = {
  pipe,
  lift,
  composeRequest,
  mapKeysWith,
  mapResponse,
  createResult,
  applyFilters,
  setWith
}

function setWith (path, modifier) {
  return payload => {
    const newPayload = cloneDeep(payload)
    const data = get(newPayload, path)
    return set(newPayload, path, modifier(data))
  }
}

function applyFilters (filters) {
  return data => data.filter(element => filters.every(filter => filter(element)))
}

function createResult (payload) {
  const newPayload = cloneDeep(payload)
  const data = get(newPayload, 'data.mappedResponse')
  const result = {
    data,
    metadata: {}
  }
  return set(newPayload, 'result', result)
}

function mapResponse (payload) {
  const newPayload = cloneDeep(payload)
  const { contract } = get(newPayload, 'data.config', {})
  const { body } = get(newPayload, 'data.response')
  const result = Array.isArray(body)
    ? body.map(element => mapKeysWith(element, contract))
    : mapKeysWith(body, contract)
  return set(newPayload, 'data.mappedResponse', result)
}

function mapKeysWith (data, contract) {
  const contractProps = invert(contract)
  const mapped = mapKeys(data, function (value, key) {
    return contractProps[key]
  })
  delete mapped.undefined
  return mapped
}

function pipe (...fns) {
  return input => fns.reduce(async (previousOutput, fn) => fn(await previousOutput), input)
}

function lift (config = {}, body = {}) {
  return { event: { body }, data: { config }, result: {} }
}

function composeRequest (payload) {
  const newPayload = cloneDeep(payload)
  const { host, headers, method, endpoint } = get(payload, 'data.config', {})

  const requestOptions = {
    uri: new URL(endpoint, host),
    options: {
      headers,
      method
    }
  }
  return set(newPayload, 'data.request', requestOptions)
}
