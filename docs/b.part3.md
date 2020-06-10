TDD, BDD in Node JS - Part Three
===

In part two we set our environment. For part three let's talk to our PM and to our customer so we, as a team can understand what type of features the customer wants to get done. We will use Gherkin as natural language to try and achieve this.

You will learn:

- Gherkin as a tool to create acceptance criteria
- importance of communication between customer and PM
- Black box testing or to "stop caring about the implementation"
- Match Gherkin steps with Cucumber JS
- Use TDD to write Validators

# Writing features
The customer needs a backend app that integrates other API's from third parties, but we need more specificity from the customer, in order to be in the same page, this is what the customer, my PM and I agreed on doing.

```gherkin
Feature: Stores
  As a consumer of the API,
  I want to be able to perform CRUD operations on stores endpoints

  Scenario: Successfully get a list of stores near me
    Given request headers
      | content-type | application/json |
    When I make a "GET" request to "stores"
    Then I receive a 200 status code response
    And every element on "body" property has "interface"
      | metadata | object |
      | data     | array  |
    And "body.data" property has more than 1 element
    And every element on "body.data" property has "interface"
      | type        | string |
      | description | string |
      | location    | string |
      | distance    | number |
    And every element on "body.data" property has "restrictions"
      | property | operator  | value |
      | distance | less than | 200   |
```

As you can see it is very specific and maybe a little bit technical, so somebody could say that you lose readability using tables, but... why not? if you think about it, we need to design a backend, and a backend is always going to be more lower level. With this approach we are going to sleep better at night, and that is a very good reason!

# Step implementation

we have some generic steps to implement, here they are:

```js
defineStep('request headers', async function (table) {})
defineStep('I make a {string} request to {string}', async function (method, endpoint) {})
defineStep('I receive a {int} status code response', async function (status) {})
defineStep('every element on {string} property has {string}', async function (property, option, table) {})
defineStep('{string} property has more than {int} element', async function (property, number) {})

```

If you check terminal that is executing the watch command you will see that creating the structure of the steps passed the tests. This is because `cucumber` will only tell that a step failed when inside that step there was an exception throwing.

Let's start implementing the steps:

```js
defineStep('request headers', async function (table) {
  this.headers = table.rowsHash() // we will format the headers and store it in world namespace for further use
})
```


For the step that says `I make a "GET" request to "stores"` we are going to actually make a request to our `stores` endpoint.

Firstly, let's install an http customer

`npm i -S got`

```js
const got = require('got')

defineStep('I make a {string} request to {string}', async function (method, endpoint) {
  const headers = this.headers // get headers previously saved to the world store
  const uri = new URL(endpoint, 'localhost:3000') // Compose URL with WHATWG URL API
  const options = { headers, method } // Create request options

  // save the response in the world namespace and parse the body
  this.response = await got(uri, options) 
  this.response.body = JSON.parse(get(this.response, 'body', '{}'))
})
```
At this point you should an error like:

```
RequestError: connect ECONNREFUSED 127.0.0.1:3000
```

That is totally normal, because we started testing our endpoint, and it does not exist yet!

Nevertheless, in BDD we don't care about implementation details, let's keep trying to implement those steps:

```js
const { deepStrictEqual } = require('assert')

defineStep('I receive a {int} status code response', async function (status) {
  const actual = this.response.statusCode
  const expected = status
  deepStrictEqual(actual, expected)
  
  /*
    It will throw if the response status code is different than 200 for the scenario we are testing.
    But you could reuse this step for any expected status
  */
})
```

As you can see, using the expected status as a variable is making this step highly reusable for other scenarios.

For the next one it is better to install a traverser like lodash get to access deep properties:

`npm i -S lodash.get`

```js
defineStep('every element on {string} property has {string}', async function (property, option, table) {
  const propFromResponse = get(this.response, property, {})

  if (option === 'interface') {
    const model = table.rowsHash() // to format a table of 2 columns
    const actual = isValidInterface(model, propFromResponse)
    const expected = true
    deepStrictEqual(actual, expected)
  }
})
```
As you can see we need to validate that the expected interface is correct. In order to do that we are going to need a function that I called `isValidInterface`, so let's TDD that function!


# Apply TDD not only for production code

It is really funny that we keep testing and applying BDD and TDD to our flow, but yet, we did not write a single line for production code. Nevertheless, you can feel that we are setting a very solid base for our app consisting on making assertions and predictions on how are app should behave and respond (that is why it is called behavioral driven testing ).

unit/validators.test.js

```js
const test = require('tape')

test('isValidInterface() should take an interface model and an input object and check for type matching', function ({deepEqual, end}) {
  
})
```

I feel comfortable with that assertion for now, the signature is an easy solution, something like this:

`isValidInterface :: (Object, Object) -> Boolean`

Ok, let's keep going:

```js
const test = require('tape')

test('isValidInterface() should take an interface model and an input object and check for type matching, no arrays', function ({ deepEqual, end }) {
  const model = {
    a: 'string',
    b: 'object',
    c: 'boolean',
    d: 'number'
  }
  const data = {
    a: 'foo',
    b: {},
    c: true,
    d: 2
  }
  const actual = isValidInterface(data, model)
  const expected = true
  deepEqual(actual, expected)
  end()
})
```

It looks good, but the test is failing, `isValidInterface` is not defined.

Let's define `isValidInterface`

```
root
├── test
│   ├── integration
│   ├── mocks
│   └── unit
└── app
    └── validators.js
    
```

validators.js

```js
module.exports = {
  isValidInterface
}

function isValidInterface () {

}
```

and require it in the test like so:

validators.test.js

```js
const { isValidInterface } = require('../../app/validators')

```

The error that the test throws will look now like this:

```
operator: deepEqual
diff: "true" => "undefined"
```

Now, we have to implement the minimal code that will make the test to pass

```js
function isValidInterface (input, model) {
  const keys = Object.keys(input)

  const isValid = keys.every((key) => typeof input[key] === model[key])
  return isValid
}
```

This made the test pass, and we can refactor the code to make it more declarative:


```js
function isValidInterface (input, model) {
  return Object.keys(input).every(checkTypeWith(input, model))
}

function checkTypeWith (input, model) {
  return key => typeof input[key] === model[key]
}
```

Test is still passing, looks good, but what if we pass an array?

Let's create another test
```js
test('isValidInterface() should take an interface model and an input object and check for type matching, with arrays', function ({ deepEqual, end }) {
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
```
test fails, but that is ok. let's add the minimal solution for this test to pass

```js
function checkTypeWith (input, model) {
  return key => {
    if (/^array$/.test(model[key])) {
      return Array.isArray(input[key])
    } else {
      return typeof input[key] === model[key]
    }
  }
}
```

YAY, the test passed! but... it looks awful, I mean it looks like I'm talking to a computer here, also using `return` statements inside if-else statements give me shivers.

```js
function checkTypeWith (input, model) {
  return key => {
    const expectedType = model[key]
    return /^array$/.test(expectedType)
      ? Array.isArray(input[key])
      : typeof input[key] === model[key]
  }
}
```

I like this, but we can refactor our two tests into one. 

```js
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
```


# Back to our cucumber step

No we can add the dependency

steps/generic.js
```js
const { isValidInterface } = require('../../../app/validators')
```

Let's move on to another step

```js
const get = require('lodash.get')

defineStep('{string} property has more than {int} element', async function (property, number) {
  const propFromResponse = get(this.response, property, [])
  const actual = propFromResponse.length > number
  const expected = true
  deepStrictEqual(actual, expected)
})
```

That was easy right, making simple assertions using a traverser to access nested props and defaulting to a safe empty array. Although, defaulting here can be confusing, but we are going to leave it there.

Now, I'm noticing a variation for this step:

```gherkin
    And every element on "body.data" property has "interface"
      | type        | string |
      | description | string |
      | location    | string |
      | distance    | number |
```

What we did in the TDD example? we assumed that it was just an object as input, and this is ok, but our step is assuming that `body.data` is an object and not an array. It is the perfect time to fix that, but we need to decide, adapt our `isValidInterface` to accept arrays or modify our step.

yeah...let's do TDD (just in case) and write another test for our function.


# Always bet on TDD

Create a new test, be specific on what you write as description, it helps a lot to understand what is the functionality you are testing

```js
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
```

- see it fail
- implement minimal expression and see it pass
- refactor

Let's modify our function:

```js
function isValidInterface (input, model) {
  return Array.isArray(input)
    ? input.every(element => Object.keys(element).every(checkTypeWith(element, model)))
    : Object.keys(input).every(checkTypeWith(input, model))
}
```

It passed, but... looks repetitive right? refactor then

```js
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
      : typeof input[key] === model[key]
  }
}
```

Wow, looks really good. I like so much that following this process encourages developers to do the right thing:

- functional style
- good abstractions
- loosely coupled architecture
- Inversion of control (no side effects)

> Remember to add more test cases to try to break your functions, passing bad props, etc. It will force you to make decisions about error handling. Now it is time to prove yourself!

# Back to cucumber steps. Again!

There is just one thing left to implement, and at this point, it should be easy to implement. One variation, the `restrictions` case:

```js
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
```

The extra mapping methods, hashes and rows are provided by [cucumber](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/data_table_interface.md)

I think the signature of `complyWith` should be the same as the signature of `isValidInterface`, remember?

`complyWith :: (Object, Object) -> Boolean`

Let's TDD again to implement this method

# TDD is a discipline with high rewards

validators.test.js
```js
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
```

This is nice, but we have a problem, we are attacking the functionality from an incorrect perspective, because we have smaller problems we should solve first. How are we going to do it to substitute `less than` with something that makes sense? My Idea is that we could map over the restrictions and substitute `operator` prop with a matching function. Let's see what I'm talking about. Forget about the previous test, and start writing a new test:

```js
test('substituteOperators() should map operator property with the correct method', function ({ deepEqual, end }) {
  const restrictions = [{ property: 'distance', operator: 'less than', value: '200' }]
  const restriction = substituteOperators(restrictions)[0]

  {
    const actual = restriction.operator(1, 2) // Start with one assertion
    const expected = true
    deepEqual(actual, expected)
  }

  {
    const actual = restriction.operator(2, 2) // keep making assertions
    const expected = false
    deepEqual(actual, expected)
  }
  {
    const actual = restriction.operator(3, 2) // keep making assertions
    const expected = false
    deepEqual(actual, expected)
  }

  end()
})

```

> Remember to implement more cases or assertions. We checked only the first element, you should check at least 2 and make cases to handle errors.

My implementation for this would be:

```js
function substituteOperators (restrictions) {
  const operators = {
    'less than': (a, b) => a < b
  }
  return restrictions.map(restriction => {
    restriction.operator = operators[restriction.operator]
    return restriction
  })
}
```

But refactoring is the key to success:

```js
function substituteOperators (restrictions) {
  const operators = {
    'less than': (a, b) => a < b
  }
  return restrictions.map(substituteOperator(operators))
}

function substituteOperator (operators) {
  return restriction => {
    restriction.operator = operators[restriction.operator]
    return restriction
  }
}
```

let's go back to `complyWith` and start implementing, with the previous helper should be easier:

```js
function complyWith (input, restrictions) {
  const formattedRestrictions = substituteOperators(restrictions)
  return formattedRestrictions.every(applyOperator(input))
}

function applyOperator (input) {
  return restriction => {
    const value = input[restriction.property]
    return restriction.operator(value, restriction.value)
  }
}
```

And add a test case for input arrays

```js
function complyWith (input, restrictions) {
  const formattedRestrictions = substituteOperators(restrictions)
  return Array.isArray(input)
    ? input.every(element => formattedRestrictions.every(applyOperator(element)))
    : formattedRestrictions.every(applyOperator(input))
}
```

At first it is tough, but see what we have accomplished

- good coverage of your code
- feeling of having done a good job
- proof that you care about what you code

> Remember to implement cases for handling errors, but be careful, don't  make new abstractions that you don't need yet. Follow the process, it will tell you when to refactor, that's what you get with experience. First, write the test case. watch it fail, implement, watch it pass, refactor.


Lastly, require `complyWith` from your generic steps file.

# Summary

PM, customer and developer are in the same page when they talk and agreed on scenarios for specific features.

We implemented the steps for that specific scenario in cucumber, using TDD in the process to design validators and other helper functions.

We did not write a single line of production code to set up our integration tests, which proves the BDD principle of `black box` testing or not caring about implementation details.

In part four we will dive into production code using TDD and finally satisfying our BDD tests
