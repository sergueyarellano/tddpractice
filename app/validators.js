const cloneDeep = require('lodash.clonedeep')

module.exports = {
  isValidInterface,
  substituteOperators,
  complyWith
}

function isValidInterface (input, model) {
  return Array.isArray(input)
    ? input.every(element => isObjectValidInterface(element, model))
    : isObjectValidInterface(input, model)
}

function isObjectValidInterface (input, model) {
  return Object.keys(input).every(checkTypeWith(input, model))
}

function checkTypeWith (input, model) {
  return key => {
    const expectedType = model[key]
    return /^array$/.test(expectedType)
      ? Array.isArray(input[key])
      : typeof input[key] === model[key] // eslint-disable-line
  }
}

function complyWith (input, restrictions) {
  const formattedRestrictions = substituteOperators(restrictions)
  return Array.isArray(input)
    ? input.every(element => formattedRestrictions.every(applyOperator(element)))
    : formattedRestrictions.every(applyOperator(input))
}

function applyOperator (input) {
  return restriction => {
    const value = input[restriction.property]
    const result = restriction.operator(value, restriction.value)
    return result
  }
}

function substituteOperators (restrictions) {
  const newRestrictions = cloneDeep(restrictions)
  // table hashes:  [ { property: 'distance', operator: 'less than', value: '200' } ]
  const operators = {
    'less than': (a, b) => Number(a) < Number(b)
  }
  return newRestrictions.map(substituteOperator(operators))
}

function substituteOperator (operators) {
  return restriction => {
    restriction.operator = operators[restriction.operator]
    return restriction
  }
}
