TDD, BDD in Node JS - Part Two
===

In part 1 of this series I wrote about some concerns to keep in mind and decisions we need to make before adding TDD, BDD to our workflow. In part 2 we are going to focus in setting up our environment.

You will learn:

- basic `Cucumber JS` setup for a Node project with BDD
- basic `Tape` setup to unit test your functions

# Set up

`npm i -D cucumber cucumber-pretty tape tap-nirvana`

After installing dependencies, create this directory structure:

```
test
├── integration
│   ├── features
│   │   └── sample.feature
│   ├── steps
│   │   └── generic.js
│   └── support
│       ├── hooks.js
│       └── world.js
└── unit
    └── sample.test.js
```

sample.feature
```gherkin
Feature: Simple maths
  In order to do maths
  As a developer
  I want to increment variables

  Scenario: easy maths
    Given a variable set to 1
    When I increment the variable by 1
    Then the variable should contain 2
```

Gherkin language is a high level language that anybody can use, like your PM or the customer. The idea here is to talk to them to write some features that will serve us as acceptance criteria and testing scenarios at the same time.

generic.js
```js
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

```

Each gherkin step has to be implemented in cucumber via defineStep or any of its aliases (Given, When, And, Then). I recommend just to use `defineStep` because you could end up using any step starting with a Given, When, And, Then.

When Cucumber runs your scenarios it will check first for matches in the steps folder and execute them in order.

hooks.js
```js
const { Before } = require('cucumber')

Before(async function (testCase) {
  // Will execute before all scenarios
})
```
We will leave hooks empty for now, but it will come in handy later on. Hooks will execute whatever we want before running all or specific scenarios.

world.js
```js
const { setWorldConstructor } = require('cucumber')

function CustomWorld () {}

setWorldConstructor(CustomWorld)
```

Cucumber has a global store at a `scenario` level that you can access via using `this` keyword in your steps. It is called world and you have to define it and set it as a constructor, even though it is empty.

sample.test.js
```js
const test = require('tape')

test('timing test', function (t) {
  t.plan(2)

  t.equal(typeof Date.now, 'function')
  var start = Date.now()

  setTimeout(function () {
    t.equal(Date.now() - start, 100)
  }, 100)
})

```

For unit testing we will be using tape, as it is the simplest and most reliable tool if you don't like magic. It generates TAP output. We don't need **nothing more** to unit test in node. Another great thing is that you don't need a runner to execute tests, just use the node command and provide a file path.


You should add the next npm scripts to package.json:

```json
  "scripts": {
    "test": "tape test/unit/*.test.js | tap-nirvana",
    "watch": "nodemon --exec \"npm run test\"",
    "e2e": "cucumber-js test/integration/features --require test/integration/steps --require test/integration/support -f node_modules/cucumber-pretty",
    "watch:e2e" : "nodemon -e feature --exec \"npm run e2e\""
  },

```

Let's run our suites in watch mode, so they will run with every change in our project
now, in one terminal:

`npm run watch`

and in another terminal:

`npm run watch:e2e`

Then we have everything set up with tests running in watch mode to start doing some TDD.

# Summary

We set up a cucumber js project with its typical structure, divided in:
- features written in Gherkin language
- steps that implement features specs
- support folder with hooks and world constructor

We also set up a sample unit test and started running our test suites in watch mode.

In part 3 we focus on BDD testing with a use case.
