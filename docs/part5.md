TDD, BDD in javascript - part five
===

In part 4 we implemented the necessary code to satisfy the assertions we made in the acceptance criteria we stipulated with the customer/PO and PM for that specific feature.

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

Another question that the PM can ask you is how granular the features should be. In my opinion, developers have to try to understand the business value or how the features and scenarios are presented. If they are presented in a way that would make the test very complex, you should talk to your PM to split those scenarios/features in smaller cases. Only experience can tell you what is the best approach.

It is a process to adapt to BDD, TDD, the benefits are huge, but there are going to be obstacles in our way. It could be inexperience from both business and dev parts, not understanding how to write features or something else.

> Try to make it simple and always do what is going to help you sleep at night

It is also a plus to have mentors that help you or the company on their way.

# About Refactoring

Rule of thumb about refactoring
> Whenever you need to attempt a refactor make sure you are pretty well covered with tests

A rookie mistake is to approach a refactor without tests.

How you make sure that doing modifications to a component or components does not affect the outcome? with manual testing? logging a couple things?

If you are a senior developer, then you know that you have to do the right thing and in my opinion with elegance and some philosophy behind.

> I test my code because I feel responsible for what I write

Whenever you ask yourself if you should do a test or not

> do what is going to help you sleep at night

With that said let's see what can we refactor in our code.

# Identify patterns

If we take a look at our code, we can see this pattern again and again, repeated:

```js
function doSomething (payload) {
  const newPayload = cloneDeep(payload) // cloning to avoid mutations on source
  const result = composeResult(newPayload) // doing something
  // set the result in a path
  return set(newPayload, 'my.path', result)
}
```

Also, the tests we designed due to that were like this:

```js
test('filterResponse() should apply filters specified in config object to mappedResponse', async function ({ deepEqual, end }) {
  const payload = {
    data: {
      config: {
        filters: [
          (element) => element.x < 4
        ]
      },
      mappedResponse: [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: 5, y: 6 }
      ]
    }
  }
  const result = filterResponse(deepFreeze(payload))
  const actual = result.data.mappedResponse
  const expected = [
    { x: 1, y: 2 },
    { x: 3, y: 4 }
  ]
  deepEqual(actual, expected)
  end()
})

```

the problem here is that we have to provide an entire payload structure, but we really don't need to do that if we create an abstraction like this

```js
setWith('my.path', applyFilters(filters))
```

`setWith :: (String, Array -> Array ) -> Payload -> Payload`

`setWith` has to return a function that takes a Payload type and returns the same type to comply with `pipe` rules

`applyFilters :: Array -> Array -> Array`

`applyFilters` takes an array of filters and returns a function that takes an array of values, process them applying the filters and returns the result array

The important abstraction is `setWith`. We could use it as a tool that gets a value and a function, and applies the function to the value.

Another example here:
```js
setWith('event.body', JSON.parse)
```
The result will be a payload with `event.body` parsed for that example

Let's design a test for `setWith`

```js
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
```

If we had passed an `identity` function instead of JSON.parse the implementation to make that test pass would be

```js
function setWith (path, modifier) {
  return payload => payload
}
```

Notice that the test can trick you sometimes. Passing the identity does not make sure that you have to apply it to pass the test. That is why we passed another function like JSON.parse. Nevertheless, if we pass the identity function it has to work too!

The code to pass the test

```js
function setWith (path, modifier) {
  return payload => {
    const newPayload = cloneDeep(payload)
    const data = get(newPayload, path)
    return set(newPayload, path, modifier(data))
  }
}
```

Powerful abstraction right?

It is time now that you try to refactor the code with this abstraction. Fix the tests accordingly.

The endpoint should look like this:

```js
  const { result } = await pipe(
    composeRequest,
    makeRequest,
    mapResponse,
    setWith('data.mappedResponse', applyFilters(config.filters)),
    createResult
  )(lift(config))
```

```js
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
```

Make the test pass and remove `filterResponse` function and tests after the integration test passes. As you can see, it is a clean process when you stand on the shoulders of giants.

```js
function applyFilters (filters) {
  return data => data.filter(element => filters.every(filter => filter(element)))
}
```


# Making abstractions might not be the best thing

Compare the two lines below

```js
setWith('data.mappedResponse', applyFilters(config.filters))
filterResponse
```

- `applyFilters` has a cleaner signature in my opinion, but it needs setWith as an adapter.
- `setWith` can be reused for a lot of functions
- `filterResponse` is simpler but has more magic underneath.

This is something that you should debate with your team. What would you do?

# BDD and environments

Our case just contemplates a development environment, but how hard would it be to refactor our BDD tests to be able to run in different environments?

Easy, use environment variables:

steps/generic.js
```js
defineStep('I make a {string} request to {string}', async function (method, endpoint) {
  const headers = this.headers
  const uri = new URL(endpoint, process.env.HOST)
  const options = { headers, method }
  this.response = await got(uri, options)
  this.response.body = JSON.parse(get(this.response, 'body', '{}'))
})
```

Easy right? now we just need to change the script in package. and pass `HOST=http://localhost:3000` or the domain pointing to production. There are several tools like `dotenv` that can help you here. Remember not to abuse on this.

> Adapting your production code to environment variables or adding branching it is an anti-pattern and should be avoided in most of cases

You can do the same exercise for our express app. Remember to spawn the child process passing the required environment variable.

Merge from lodash can help in that.

```
const ps = spawn(server.command, server.args)
{ env: merge(process.env, {HOST_EXTERNAL: 'http://localhost:3010' })
```

# Summary

Making abstractions is something that you should discuss with your team mates. Try to always maintain readability and keep a declarative style.

Identify patterns repeating again and again, but don't be too eager to make the abstraction too soon.

Refactoring should be made replacing small parts one by one and the code should have a good coverage already. New parts or abstractions should be implemented using TDD if new functions are added in the process to satisfy the refactor.

Using environment variables multiply the value of BDD, since you can execute your tests against different environments.

