const { defineStep } = require('cucumber')
const { deepStrictEqual } = require('assert')
const got = require('got')
const get = require('lodash.get')
const { isValidInterface, complyWith } = require('../../../app/validators')

defineStep('request headers', async function (table) {
  this.headers = table.rowsHash()
})

defineStep('I make a {string} request to {string}', async function (method, endpoint) {
  const headers = this.headers
  const uri = new URL(endpoint, 'http://localhost:3000')
  const options = { headers, method }
  this.response = await got(uri, options)
  this.response.body = JSON.parse(get(this.response, 'body', '{}'))
})

defineStep('I receive a {int} status code response', async function (status) {
  const actual = this.response.statusCode
  const expected = status
  deepStrictEqual(actual, expected)
})

defineStep('every element on {string} property has {string}', async function (property, option, table) {
  const propFromResponse = get(this.response, property, {})

  if (option === 'interface') {
    const model = table.rowsHash() // to format a table of 2 columns
    const actual = isValidInterface(propFromResponse, model)
    const expected = true
    deepStrictEqual(actual, expected)
  } else if (option === 'restrictions') {
    // table hashes:  [ { property: 'distance', operator: 'less than', value: '200' } ]
    // table rows:  [ [ 'distance', 'less than', '200' ] ]
    const restrictions = table.hashes()
    const actual = complyWith(propFromResponse, restrictions)
    const expected = true
    deepStrictEqual(actual, expected)
  }
})

defineStep('{string} property has more than {int} element', async function (property, number) {
  const propFromResponse = get(this.response, property, [])
  const actual = propFromResponse.length > number
  const expected = true
  deepStrictEqual(actual, expected)
})
