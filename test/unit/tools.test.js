const test = require('tape')
const { pipe, lift, composeRequest, mapKeysWith, mapResponse, createResult, filterResponse, setWith, applyFilters } = require('../../app/tools')
const deepFreeze = require('deep-freeze')

test('async pipe', async function ({ deepEqual, end }) {
  const identity = value => value
  const addTwo = value => value + 2
  const multiplyByThree = value => value * 3
  const asyncMultiplyByTwo = value => Promise.resolve(value * 2)
  {
    const actual = await pipe(identity)(1)
    const expected = 1
    const msg = 'passing just identity should return unmodified value'
    deepEqual(actual, expected, msg)
  }
  {
    const actual = await pipe(identity, identity, identity)(1)
    const expected = 1
    const msg = 'passing identity n times should return unmodified value'
    deepEqual(actual, expected, msg)
  }
  {
    const actual = await pipe(addTwo, identity, multiplyByThree)(1)
    const expected = 9
    const msg = 'passing functions that do simple math operations'
    deepEqual(actual, expected, msg)
  }
  {
    const actual = await pipe(addTwo, identity, multiplyByThree)(1)
    const expected = multiplyByThree(identity(addTwo(1)))
    const msg = 'functions passed should be able to be composed and produce same output'
    deepEqual(actual, expected, msg)
  }
  {
    const actual = await pipe(addTwo, asyncMultiplyByTwo, multiplyByThree)(1)
    const expected = 18
    const msg = 'async step functions should unwrap their value and work in pipe in a monadic way'
    deepEqual(actual, expected, msg)
  }
  end()
})

test('composeRequest() should compose request options so they can be consumed by the GOT http client module ', async function ({ deepEqual, end }) {
  const config = {
    endpoint: 'foo',
    host: 'http://localhost:3333',
    method: 'GET',
    headers: { 'content-type': 'application/json' }
  }
  // composeRequest :: Payload -> Payload
  const actual = composeRequest(deepFreeze(lift(config)))
  const expected = {
    event: { body: {} },
    data: {
      config,
      request: {
        uri: new URL('foo', 'http://localhost:3333'),
        options: {
          method: 'GET',
          headers: { 'content-type': 'application/json' }
        }
      }
    },
    result: {}
  }
  deepEqual(actual, expected)
  end()
})

test('mapResponse() should map a given body response to the structure desired', async function ({ deepEqual, end }) {
  const payload = {
    data: {
      config: {
        contract: { x: 'a', y: 'b' }
      },
      response: {
        body: [
          { a: 1, b: 2 },
          { a: 3, b: 4 },
          { a: 5, b: 6 },
          { a: 7, b: 8, c: 9 }
        ]
      }
    }
  }
  const actual = mapResponse(deepFreeze(payload))
  const expected = {
    data: {
      config: {
        contract: { x: 'a', y: 'b' }
      },
      mappedResponse: [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 5, y: 6 },
        { x: 7, y: 8 }
      ],
      response: {
        body: [
          { a: 1, b: 2 },
          { a: 3, b: 4 },
          { a: 5, b: 6 },
          { a: 7, b: 8, c: 9 }
        ]
      }
    }
  }
  deepEqual(actual, expected, 'map only the elements according to give interface')
  end()
})

test('mapKeysWith() should map the keys of input object according to a template or contract', async function ({ deepEqual, end }) {
  const data = { a: 1, b: 2 }
  const contract = { x: 'a', y: 'b' }
  const actual = mapKeysWith(data, contract)
  const expected = { x: 1, y: 2 }
  deepEqual(actual, expected, '')
  end()
})

test('createResult() should produce a formatted structure to use as response', async function ({ deepEqual, end }) {
  const payload = {
    data: {
      mappedResponse: [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 5, y: 6 }
      ],
      response: {
        body: [
          { a: 1, b: 2 },
          { a: 3, b: 4 },
          { a: 5, b: 6 }
        ]
      }
    }
  }
  const actual = createResult(deepFreeze(payload))
  const expected = {
    data: {
      mappedResponse: [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 5, y: 6 }
      ],
      response: {
        body: [
          { a: 1, b: 2 },
          { a: 3, b: 4 },
          { a: 5, b: 6 }
        ]
      }
    },
    result: {
      data: [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 5, y: 6 }
      ],
      metadata: {}
    }
  }
  deepEqual(actual, expected, 'copy mappedResponse to result field and apply contract')
  end()
})

test('applyFilters() should apply filters to every element in the array passed', async function ({ deepEqual, end }) {
  const filters = [(element) => element.x < 4]
  const data = [
    { x: 1, y: 2 },
    { x: 3, y: 4 },
    { x: 5, y: 6 }
  ]
  const actual = applyFilters(filters)(deepFreeze(data))
  const expected = [
    { x: 1, y: 2 },
    { x: 3, y: 4 }
  ]
  deepEqual(actual, expected)
  end()
})

test('setWith() takes a path and a function', async function ({ deepEqual, end }) {
  const payload = {
    event: {
      body: '{"a": 1, "foo": "bar"}'
    }
  }
  const result = setWith('event.body', JSON.parse)(deepFreeze(payload))
  const actual = result.event.body
  const expected = { a: 1, foo: 'bar' }
  deepEqual(actual, expected, 'applies JSON.parse to the value assigned to that path')
  end()
})
