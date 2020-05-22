const test = require('tape')
const { isValidInterface, substituteOperators, complyWith } = require('../../app/validators')

test('isValidInterface() should take an interface model and an input object and check for type matching', function ({ deepEqual, end }) {
  const model = {
    a: 'string',
    b: 'object',
    c: 'boolean',
    d: 'number',
    e: 'array'
  }
  const data = {
    a: 'foo',
    b: {},
    c: true,
    d: 2,
    e: []
  }
  const actual = isValidInterface(data, model)
  const expected = true
  deepEqual(actual, expected)
  end()
})

test('isValidInterface() should take an interface model and an input Array and check for type matching for each element', function ({ deepEqual, end }) {
  const model = {
    a: 'string',
    b: 'object',
    c: 'boolean',
    d: 'number',
    e: 'array'
  }
  const data = [{
    a: 'foo',
    b: {},
    c: true,
    d: 2,
    e: []
  }, {
    a: 'bar',
    b: {},
    c: true,
    d: 2,
    e: []
  }]
  const actual = isValidInterface(data, model)
  const expected = true
  deepEqual(actual, expected)
  end()
})

test('complyWith() should take an input object and some restrictions and check that the input complies with those', function ({ deepEqual, end }) {
  const restrictions = [{ property: 'distance', operator: 'less than', value: '200' }]
  const data = {
    distance: 100
  }
  const actual = complyWith(data, restrictions)
  const expected = true
  deepEqual(actual, expected)
  end()
})

test('substituteOperators() should map operator property with the correct method', function ({ deepEqual, end }) {
  const restrictions = [{ property: 'distance', operator: 'less than', value: '200' }]
  const restriction = substituteOperators(restrictions)[0]

  {
    const actual = restriction.operator(1, 2)
    const expected = true
    deepEqual(actual, expected)
  }

  {
    const actual = restriction.operator(2, 2)
    const expected = false
    deepEqual(actual, expected)
  }
  {
    const actual = restriction.operator(3, 2)
    const expected = false
    deepEqual(actual, expected)
  }

  end()
})
