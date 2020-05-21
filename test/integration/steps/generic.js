const { defineStep } = require('cucumber')
const { deepStrictEqual } = require('assert')

defineStep('a variable set to {int}', async function (number) {
  this.variable = number
})
defineStep('I increment the variable by {int}', async function (number) {
  this.variable = this.variable + number
})
defineStep('the variable should contain {int}', async function (number) {
  const actual = this.variable
  const expected = number
  deepStrictEqual(actual, expected)
})
